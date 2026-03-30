import Anthropic from '@anthropic-ai/sdk';
import { AnalysisState, ChatMessage } from '@/types';
import { buildSystemPrompt, getModuleContext } from './prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── Web Search Tool ────────────────────────────────────

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

  // Try multiple state_update patterns for robustness
  const patterns = [
    /```state_update\s*([\s\S]*?)```/,
    /```json\s*\n\s*\{\s*"meta"/,
  ];

  const stateMatch = content.match(patterns[0]);
  if (stateMatch) {
    try {
      stateUpdate = JSON.parse(stateMatch[1].trim());
      text = text.replace(patterns[0], '').trim();
    } catch (e) {
      console.error('Failed to parse state update:', e);
      // Try to extract JSON even if malformed
      try {
        const jsonStr = stateMatch[1].trim();
        // Fix common issues: trailing commas, missing quotes
        const fixed = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        stateUpdate = JSON.parse(fixed);
        text = text.replace(patterns[0], '').trim();
      } catch (e2) {
        console.error('State update parse retry failed:', e2);
      }
    }
  }

  text = text.replace('[CHECKPOINT]', '').trim();
  return { text, stateUpdate, hasCheckpoint };
}

// ─── Merge state (deep merge for nested objects) ────────

export function mergeState(
  current: AnalysisState,
  update: Partial<AnalysisState>,
): AnalysisState {
  const deepMerge = (target: any, source: any): any => {
    if (!source) return target;
    if (!target) return source;
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  };

  return {
    meta: deepMerge(current.meta, update.meta),
    A_pazar: deepMerge(current.A_pazar, update.A_pazar),
    B_rekabet: deepMerge(current.B_rekabet, update.B_rekabet),
    C_strateji: deepMerge(current.C_strateji, update.C_strateji),
    D_final: deepMerge(current.D_final, update.D_final),
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

// ─── Build messages (token-safe + context-preserving) ───

function buildMessages(
  history: ChatMessage[],
  newMessage: string,
): Array<{ role: 'user' | 'assistant'; content: string }> {
  // Keep last 6 messages but smartly summarize old assistant messages
  const recent = history.slice(-6);

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (let i = 0; i < recent.length; i++) {
    const msg = recent[i];
    if (msg.role === 'assistant') {
      // For assistant messages, keep checkpoint info and key decisions
      // but truncate long analysis text
      if (msg.content.length > 2000) {
        // Extract key info: checkpoint, module, scores
        const hasCheckpoint = msg.content.includes('✅') || msg.content.includes('Checkpoint');
        const moduleMatch = msg.content.match(/Modül\s+([A-D])/i);
        const skorMatch = msg.content.match(/(\d+(?:\.\d+)?)\s*\/\s*100/);

        let summary = msg.content.substring(0, 1500);
        if (hasCheckpoint) summary += '\n[Checkpoint tamamlandı]';
        if (moduleMatch) summary += `\n[Modül ${moduleMatch[1]} analizi]`;
        if (skorMatch) summary += `\n[Skor: ${skorMatch[1]}/100]`;
        summary += '\n[...kısaltıldı...]';

        messages.push({ role: msg.role, content: summary });
      } else {
        messages.push({ role: msg.role, content: msg.content });
      }
    } else {
      messages.push({ role: msg.role, content: msg.content });
    }
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

  // Web search for A, B, D — not C (strategy uses existing data)
  const needsWebSearch = ['A', 'B', 'D'].includes(state.meta.aktif_modul);
  const tools = needsWebSearch ? [WEB_SEARCH_TOOL] : [];

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: systemPrompt,
      messages,
      ...(tools.length > 0 ? { tools } : {}),
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
      yield '\n\n⏳ Rate limit — 30 saniye bekleniyor...\n';
      await new Promise(resolve => setTimeout(resolve, 30000));

      try {
        // Retry without web search to reduce token load
        const retryStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          system: systemPrompt,
          messages,
        });

        for await (const event of retryStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            yield event.delta.text;
          }
        }
      } catch (retryError: any) {
        yield '\n\n❌ Rate limit devam ediyor. Lütfen 1-2 dakika bekleyip tekrar deneyin.\n';
      }
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
  });

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('');
}
