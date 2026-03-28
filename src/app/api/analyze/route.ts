import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getAnalysis,
  updateAnalysisState,
  addMessages,
} from '@/lib/redis';
import {
  streamAnalysis,
  parseStateUpdate,
  mergeState,
  detectCommand,
} from '@/lib/anthropic';
import { ChatMessage } from '@/types';
import { nanoid } from 'nanoid';

export const maxDuration = 60; // Vercel function timeout

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { analysisId, message } = await req.json();

  if (!analysisId || !message) {
    return new Response('Missing fields', { status: 400 });
  }

  const analysis = await getAnalysis(analysisId);
  if (!analysis) {
    return new Response('Analysis not found', { status: 404 });
  }

  const userId = (session.user as { id?: string }).id!;
  if (analysis.userId !== userId) {
    return new Response('Forbidden', { status: 403 });
  }

  // Detect special commands
  const command = detectCommand(message);

  // Handle "state göster" command locally without calling Claude
  if (command === 'state_goster') {
    const encoder = new TextEncoder();
    const stateContent = `### 📋 Mevcut State\n\n\`\`\`json\n${JSON.stringify(analysis.state, null, 2)}\n\`\`\``;

    const userMsg: ChatMessage = {
      id: nanoid(), role: 'user', content: message, timestamp: Date.now(),
      module: analysis.state.meta.aktif_modul,
    };
    const assistantMsg: ChatMessage = {
      id: nanoid(), role: 'assistant', content: stateContent, timestamp: Date.now(),
      module: analysis.state.meta.aktif_modul,
    };
    await addMessages(analysisId, [userMsg, assistantMsg]);

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: stateContent })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    });
  }

  // For "tam_analiz" command, switch mode in state
  if (command === 'tam_analiz' && analysis.state.meta.mod === 'hizli') {
    analysis.state.meta.mod = 'tam';
    await updateAnalysisState(analysisId, analysis.state);
  }

  // Add user message
  const userMsg: ChatMessage = {
    id: nanoid(),
    role: 'user',
    content: message,
    timestamp: Date.now(),
    module: analysis.state.meta.aktif_modul,
  };

  // Create readable stream for SSE
  const encoder = new TextEncoder();
  let fullResponse = '';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Stream from Claude
        for await (const chunk of streamAnalysis(
          analysis.state,
          analysis.messages,
          message,
        )) {
          fullResponse += chunk;
          // Send chunk to client
          const data = JSON.stringify({ type: 'text', content: chunk });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }

        // Parse the full response for state updates
        const { text, stateUpdate, hasCheckpoint } =
          parseStateUpdate(fullResponse);

        // Build assistant message (store cleaned text)
        const assistantMsg: ChatMessage = {
          id: nanoid(),
          role: 'assistant',
          content: text,
          timestamp: Date.now(),
          module: analysis.state.meta.aktif_modul,
          checkpoint: hasCheckpoint,
        };

        // Save messages
        await addMessages(analysisId, [userMsg, assistantMsg]);

        // Merge and save state if updated
        if (stateUpdate) {
          const newState = mergeState(analysis.state, stateUpdate);
          await updateAnalysisState(analysisId, newState);

          // Also update analysis status if D module completed
          if (newState.meta.tamamlanan_moduller.includes('D')) {
            // Mark as completed (could also save to redis)
          }

          // Send state update to client
          const stateData = JSON.stringify({
            type: 'state_update',
            state: newState,
          });
          controller.enqueue(encoder.encode(`data: ${stateData}\n\n`));
        }

        // Send checkpoint signal
        if (hasCheckpoint) {
          const cpData = JSON.stringify({
            type: 'checkpoint',
            module: analysis.state.meta.aktif_modul,
          });
          controller.enqueue(encoder.encode(`data: ${cpData}\n\n`));
        }

        // Done
        const doneData = JSON.stringify({ type: 'done' });
        controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        const errData = JSON.stringify({
          type: 'error',
          content: 'Analiz sırasında bir hata oluştu. Tekrar deneyin.',
        });
        controller.enqueue(encoder.encode(`data: ${errData}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
