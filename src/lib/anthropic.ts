import Anthropic from '@anthropic-ai/sdk';
import { AnalysisState, ChatMessage } from '@/types';
import { buildSystemPrompt, getModuleContext } from './prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── Web Search Tool Definition ─────────────────────────
// Anthropic API'nin built-in web search aracı

const WEB_SEARCH_TOOL = {
  type: 'web_search_20250305' as const,
  name: 'web_search' as const,
  max_uses: 10,
};

// ─── Parse state updates from Claude's response ────────

export function parseStateUpdate(content: string): {
  text: string;
  stateUpdate: Partial<AnalysisState> | null;
  hasCheckpoint: boolean;
} {
  let text = content;
  let stateUpdate: Partial<AnalysisState> | null = null;
  const hasCheckpoint = content.includes('[CHECKPOINT]');

  // Extract state_update JSON block
  const stateMatch = content.match(/```state_update\s*([\s\S]*?)```/);
  if (stateMatch) {
    try {
      stateUpdate = JSON.parse(stateMatch[1].trim());
      text = text.replace(/```state_update\s*[\s\S]*?```/, '').trim();
    } catch (e) {
      console.error('Failed to parse state update:', e);
    }
  }

  // Clean up checkpoint marker from displayed text
  text = text.replace('[CHECKPOINT]', '').trim();

  return { text, stateUpdate, hasCheckpoint };
}

// ─── Merge state updates ────────────────────────────────

export function mergeState(
  current: AnalysisState,
  update: Partial<AnalysisState>,
): AnalysisState {
  return {
    meta: { ...current.meta, ...(update.meta || {}) },
    A_pazar: { ...current.A_pazar, ...(update.A_pazar || {}) },
    B_rekabet: { ...current.B_rekabet, ...(update.B_rekabet || {}) },
    C_strateji: { ...current.C_strateji, ...(update.C_strateji || {}) },
    D_final: { ...current.D_final, ...(update.D_final || {}) },
  };
}

// ─── Detect commands ────────────────────────────────────

export function detectCommand(message: string): string | null {
  const lower = message.toLowerCase().trim();
  const commands: Record<string, string[]> = {
    'hizli_analiz': ['hızlı analiz'],
    'tam_analiz': ['tam analiz'],
    'karsilastir': ['karşılaştır'],
    'devam': ['devam', 'devam et'],
    'state_goster': ['state göster'],
  };

  for (const [cmd, triggers] of Object.entries(commands)) {
    if (triggers.some((t) => lower === t || lower.startsWith(t))) {
      return cmd;
    }
  }
  return null;
}

// ─── Build message history for Claude ───────────────────

function buildMessages(
  history: ChatMessage[],
  newMessage: string,
): Array<{ role: 'user' | 'assistant'; content: string }> {
  // Take last ~20 messages for context (keep it within token limits)
  const recent = history.slice(-20);

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const msg of recent) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  messages.push({ role: 'user', content: newMessage });
  return messages;
}

// ─── Extract text from streaming response ───────────────
// Handles both regular text deltas and web search citation blocks

function extractTextFromContentBlock(event: any): string | null {
  if (event.type === 'content_block_delta') {
    if (event.delta.type === 'text_delta') {
      return event.delta.text;
    }
  }
  return null;
}

// ─── Streaming analysis with web search ─────────────────

export async function* streamAnalysis(
  state: AnalysisState,
  history: ChatMessage[],
  userMessage: string,
): AsyncGenerator<string> {
  const moduleContext = getModuleContext(state.meta.aktif_modul);
  const systemPrompt = buildSystemPrompt(state, moduleContext);
  const messages = buildMessages(history, userMessage);

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16384,
    system: systemPrompt,
    messages,
    tools: [WEB_SEARCH_TOOL],
  });

  for await (const event of stream) {
    const text = extractTextFromContentBlock(event);
    if (text) {
      yield text;
    }
  }
}

// ─── Non-streaming analysis (for simpler cases) ────────

export async function runAnalysis(
  state: AnalysisState,
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const moduleContext = getModuleContext(state.meta.aktif_modul);
  const systemPrompt = buildSystemPrompt(state, moduleContext);
  const messages = buildMessages(history, userMessage);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16384,
    system: systemPrompt,
    messages,
    tools: [WEB_SEARCH_TOOL],
  });

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('');
}
