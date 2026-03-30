// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Doküman Üretim Orchestrator
// Komut algılama → generator routing → buffer döndürme
// ═══════════════════════════════════════════════════════════

import { generateExecSummary, generateDetailedExecSummary } from './generate-exec-summary';
import { generateTeaser } from './generate-teaser';
import { generateRekabet, generateRisk, generateFinansal, generateGTM } from './generate-tables';
import { generatePitchDeck, generateDataRoom, generateLeanCanvas } from './generate-extras';
import { generatePitchPptx } from './generate-pptx';
import { generateFinancialModel } from './generate-xlsx';
import { generateTranskript } from './generate-transkript';

// ─── KOMUT → DOSYA EŞLEMESİ ──────────────────────────────

export interface DocResult {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

interface CommandDef {
  patterns: RegExp[];
  generator: (state: any, lang?: 'tr' | 'en') => Promise<Buffer>;
  filename: (fikir: string, lang: string) => string;
  mimeType: string;
}

const COMMANDS: Record<string, CommandDef> = {
  detailed_exec: {
    patterns: [/detayl[ıi]\s*exec\s*summary\s*[üu]ret/i, /detailed\s*exec/i],
    generator: generateDetailedExecSummary,
    filename: (f, l) => `Executive_Summary_Detayli_${f}${l === 'en' ? '_EN' : ''}.docx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  exec_summary: {
    patterns: [/exec\s*summary\s*[üu]ret/i, /one[- ]?pager\s*[üu]ret/i],
    generator: generateExecSummary,
    filename: (f, l) => `Executive_Summary_${f}${l === 'en' ? '_EN' : ''}.docx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  teaser: {
    patterns: [/teaser\s*[üu]ret/i],
    generator: generateTeaser,
    filename: (f, l) => `Investment_Teaser_${f}${l === 'en' ? '_EN' : ''}.docx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  pitch_deck: {
    patterns: [/pitch\s*deck\s*[üu]ret/i],
    generator: generatePitchDeck,
    filename: (f, l) => `Pitch_Deck_${f}${l === 'en' ? '_EN' : ''}.docx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  pitch_pptx: {
    patterns: [/sunum\s*[üu]ret/i, /pptx\s*[üu]ret/i],
    generator: generatePitchPptx,
    filename: (f, l) => `Pitch_Deck_${f}${l === 'en' ? '_EN' : ''}.pptx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  finansal_model: {
    patterns: [/finansal\s*model\s*[üu]ret/i, /financial\s*model/i],
    generator: generateFinancialModel,
    filename: (f, l) => `Finansal_Model_${f}${l === 'en' ? '_EN' : ''}.xlsx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  rekabet_docx: {
    patterns: [/rekabet\s*docx\s*[üu]ret/i, /competition\s*docx/i],
    generator: generateRekabet,
    filename: (f, l) => `Rekabet_Analizi_${f}${l === 'en' ? '_EN' : ''}.docx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  risk_docx: {
    patterns: [/risk\s*docx\s*[üu]ret/i],
    generator: generateRisk,
    filename: (f, l) => `Risk_Matrisi_${f}${l === 'en' ? '_EN' : ''}.docx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  finansal_docx: {
    patterns: [/finansal\s*docx\s*[üu]ret/i, /financial\s*docx/i],
    generator: generateFinansal,
    filename: (f, l) => `Finansal_Projeksiyon_${f}${l === 'en' ? '_EN' : ''}.docx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  gtm_docx: {
    patterns: [/gtm\s*docx\s*[üu]ret/i, /gtm\s*plan/i],
    generator: generateGTM,
    filename: (f, l) => `GTM_Plani_${f}${l === 'en' ? '_EN' : ''}.docx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  data_room: {
    patterns: [/data\s*room\s*[üu]ret/i],
    generator: generateDataRoom,
    filename: (f, l) => `Data_Room_Checklist_${f}${l === 'en' ? '_EN' : ''}.docx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  lean_canvas: {
    patterns: [/lean\s*canvas\s*[üu]ret/i],
    generator: generateLeanCanvas,
    filename: (f, l) => `Lean_Canvas_${f}${l === 'en' ? '_EN' : ''}.docx`,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  yazisma_pdf: {
    patterns: [/yaz[ıi]\u015Fma\s*(pdf)?\s*[üu]ret/i, /transkript\s*[üu]ret/i, /chat\s*pdf\s*[üu]ret/i],
    generator: (state: any, lang?: 'tr' | 'en') => generateTranskript(state, [], lang),
    filename: (f, l) => `Yazisma_Transkript_${f}${l === 'en' ? '_EN' : ''}.pdf`,
    mimeType: 'application/pdf',
  },
};

// Toplu komutlar
const BATCH_COMMANDS: Record<string, string[]> = {
  'tablolar': ['rekabet_docx', 'risk_docx', 'finansal_docx', 'gtm_docx'],
  'hepsini': [
    'exec_summary', 'detailed_exec', 'teaser', 'pitch_deck', 'pitch_pptx',
    'finansal_model', 'rekabet_docx', 'risk_docx', 'finansal_docx', 'gtm_docx',
    'data_room', 'lean_canvas',
  ],
};

// ─── KOMUT ALGILA ─────────────────────────────────────────

/** Kullanıcı mesajından doküman üretim komutunu algıla */
export function detectDocCommand(message: string): { commandKey: string; lang: 'tr' | 'en' } | null {
  const msg = message.trim().toLowerCase();

  // Dil tespiti
  const lang: 'tr' | 'en' = /\b(en|english)\s*$/i.test(message.trim()) ? 'en'
    : /\btr\s*$/i.test(message.trim()) ? 'tr'
    : 'tr'; // default

  // Toplu komutlar
  for (const [batchKey, commands] of Object.entries(BATCH_COMMANDS)) {
    if (new RegExp(`${batchKey}\\s*[üu]ret`, 'i').test(msg)) {
      return { commandKey: `batch:${batchKey}`, lang };
    }
  }

  // Tekil komutlar
  for (const [key, def] of Object.entries(COMMANDS)) {
    if (def.patterns.some(p => p.test(msg))) {
      return { commandKey: key, lang };
    }
  }

  return null;
}

// ─── DOKÜMAN ÜRET ─────────────────────────────────────────

/** Tek doküman üret */
export async function generateDocument(commandKey: string, state: any, lang: 'tr' | 'en' = 'tr'): Promise<DocResult> {
  const def = COMMANDS[commandKey];
  if (!def) throw new Error(`Unknown command: ${commandKey}`);

  const fikir = sanitizeFilename(state?.meta?.fikir_adi || 'Startup');
  const buffer = await def.generator(state, lang);

  return {
    buffer,
    filename: def.filename(fikir, lang),
    mimeType: def.mimeType,
  };
}

/** Toplu doküman üret */
export async function generateBatch(batchKey: string, state: any, lang: 'tr' | 'en' = 'tr'): Promise<DocResult[]> {
  const commands = BATCH_COMMANDS[batchKey];
  if (!commands) throw new Error(`Unknown batch: ${batchKey}`);

  const results: DocResult[] = [];
  for (const cmd of commands) {
    try {
      const result = await generateDocument(cmd, state, lang);
      results.push(result);
    } catch (err) {
      console.error(`Failed to generate ${cmd}:`, err);
      // Devam et, hata olan dokümanı atla
    }
  }
  return results;
}

// ─── YARDIMCI ─────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF\s_-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

// ─── EXPORTS ──────────────────────────────────────────────
export { generateExecSummary, generateDetailedExecSummary } from './generate-exec-summary';
export { generateTeaser } from './generate-teaser';
export { generateRekabet, generateRisk, generateFinansal, generateGTM } from './generate-tables';
export { generatePitchDeck, generateDataRoom, generateLeanCanvas } from './generate-extras';
