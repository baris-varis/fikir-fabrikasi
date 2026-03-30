import Anthropic from '@anthropic-ai/sdk';
import { AnalysisState, ChatMessage } from '@/types';
import { buildSystemPrompt, getModuleContext } from './prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── Web Search Tool ────────────────────────────────────
// max_uses: 3 → web search daha hızlı bitiyor (Vercel 60s timeout)

const WEB_SEARCH_TOOL = {
  type: 'web_search_20250305',
  name: 'web_search',
  max_uses: 3,
} as unknown as Anthropic.Tool;

// ─── Parse state updates ────────────────────────────────

export function parseStateUpdate(content: string): {
  text: string;
  stateUpdate: Partial<AnalysisState> | null;
  hasCheckpoint: boolean;
} {
  let text = content;
  let stateUpdate: Partial<AnalysisState> | null = null;
  const hasCheckpoint = content.includes('[CHECKPOINT]');

  const stateMatch = content.match(/```state_update\s*([\s\S]*?)```/);
  if (stateMatch) {
    try {
      stateUpdate = JSON.parse(stateMatch[1].trim());
      text = text.replace(/```state_update\s*[\s\S]*?```/, '').trim();
    } catch (e) {
      console.error('Failed to parse state update:', e);
    }
  }

  text = text.replace('[CHECKPOINT]', '').trim();
  return { text, stateUpdate, hasCheckpoint };
}

// ─── Merge state ────────────────────────────────────────

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

// ─── Build messages (token-safe) ────────────────────────

function buildMessages(
  history: ChatMessage[],
  newMessage: string,
): Array<{ role: 'user' | 'assistant'; content: string }> {
  // Max 8 messages — keeps input under 30K tokens/min limit
  const recent = history.slice(-8);

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const msg of recent) {
    // Truncate long assistant responses to save tokens
    const content = msg.role === 'assistant' && msg.content.length > 2000
      ? msg.content.substring(0, 2000) + '\n\n[...kısaltıldı...]'
      : msg.content;
    messages.push({ role: msg.role, content });
  }

  messages.push({ role: 'user', content: newMessage });
  return messages;
}

// ─── Streaming analysis ─────────────────────────────────

export async function* streamAnalysis(
  state: AnalysisState,
  history: ChatMessage[],
  userMessage: string,
): AsyncGenerator<string> {
  const moduleContext = getModuleContext(state.meta.aktif_modul);
  const systemPrompt = buildSystemPrompt(state, moduleContext);
  const messages = buildMessages(history, userMessage);

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: systemPrompt,
      messages,
      tools: [WEB_SEARCH_TOOL],
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  } catch (error: any) {
    if (error?.status === 429) {
      yield '\n\n⏳ Rate limit — lütfen 60 saniye bekleyip tekrar deneyin.\n';
    } else {
      throw error;
    }
  }
}

// ─── Non-streaming analysis ─────────────────────────────

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
    max_tokens: 8000,
    system: systemPrompt,
    messages,
    tools: [WEB_SEARCH_TOOL],
  });

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('');
}
