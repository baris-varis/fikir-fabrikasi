// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Document Download Component
// Chat panelinde doküman üretim komutları algılandığında
// indirme butonu gösteren React bileşeni
// ═══════════════════════════════════════════════════════════

'use client';

import { useState, useCallback } from 'react';
import { FileDown, Loader2, Check, AlertCircle, FileText, FileSpreadsheet, Presentation } from 'lucide-react';

// ─── KOMUT TANIMLARI ──────────────────────────────────────

interface DocCommandInfo {
  key: string;
  label: string;
  labelEN: string;
  icon: 'docx' | 'xlsx' | 'pptx';
}

const DOC_COMMANDS: DocCommandInfo[] = [
  { key: 'exec_summary',    label: 'Executive Summary',              labelEN: 'Executive Summary',                icon: 'docx' },
  { key: 'detailed_exec',   label: 'Detayl\u0131 Executive Summary',     labelEN: 'Detailed Executive Summary',       icon: 'docx' },
  { key: 'teaser',          label: 'Investment Teaser',               labelEN: 'Investment Teaser',                 icon: 'docx' },
  { key: 'pitch_deck',      label: 'Pitch Deck Rehberi',              labelEN: 'Pitch Deck Guide',                  icon: 'docx' },
  { key: 'pitch_pptx',      label: 'Pitch Deck Sunum',                labelEN: 'Pitch Deck Presentation',           icon: 'pptx' },
  { key: 'finansal_model',  label: 'Finansal Model (11-sheet)',        labelEN: 'Financial Model (11-sheet)',         icon: 'xlsx' },
  { key: 'rekabet_docx',    label: 'Rekabet Analizi',                 labelEN: 'Competition Analysis',              icon: 'docx' },
  { key: 'risk_docx',       label: 'Risk Matrisi',                    labelEN: 'Risk Matrix',                       icon: 'docx' },
  { key: 'finansal_docx',   label: 'Finansal Projeksiyon',            labelEN: 'Financial Projections',              icon: 'docx' },
  { key: 'gtm_docx',        label: 'GTM Plan\u0131',                      labelEN: 'GTM Plan',                          icon: 'docx' },
  { key: 'data_room',       label: 'Data Room Checklist',             labelEN: 'Data Room Checklist',               icon: 'docx' },
  { key: 'lean_canvas',     label: 'Lean Canvas',                     labelEN: 'Lean Canvas',                       icon: 'docx' },
  { key: 'yazisma_pdf',    label: 'Yaz\u0131\u015Fma Transkripti',          labelEN: 'Chat Transcript',                   icon: 'docx' },
];

// Regex patterns matching index.ts
const COMMAND_PATTERNS: { pattern: RegExp; commandKey: string }[] = [
  { pattern: /detayl[ıi]\s*exec\s*summary\s*[üu]ret/i,  commandKey: 'detailed_exec' },
  { pattern: /exec\s*summary\s*[üu]ret/i,                commandKey: 'exec_summary' },
  { pattern: /one[- ]?pager\s*[üu]ret/i,                 commandKey: 'exec_summary' },
  { pattern: /teaser\s*[üu]ret/i,                         commandKey: 'teaser' },
  { pattern: /pitch\s*deck\s*[üu]ret/i,                   commandKey: 'pitch_deck' },
  { pattern: /sunum\s*[üu]ret/i,                          commandKey: 'pitch_pptx' },
  { pattern: /pptx\s*[üu]ret/i,                           commandKey: 'pitch_pptx' },
  { pattern: /finansal\s*model\s*[üu]ret/i,                commandKey: 'finansal_model' },
  { pattern: /rekabet\s*docx\s*[üu]ret/i,                 commandKey: 'rekabet_docx' },
  { pattern: /risk\s*docx\s*[üu]ret/i,                    commandKey: 'risk_docx' },
  { pattern: /finansal\s*docx\s*[üu]ret/i,                commandKey: 'finansal_docx' },
  { pattern: /gtm\s*docx\s*[üu]ret/i,                     commandKey: 'gtm_docx' },
  { pattern: /data\s*room\s*[üu]ret/i,                    commandKey: 'data_room' },
  { pattern: /lean\s*canvas\s*[üu]ret/i,                  commandKey: 'lean_canvas' },
  { pattern: /yaz[ıi]\u015Fma\s*(pdf)?\s*[üu]ret/i,            commandKey: 'yazisma_pdf' },
  { pattern: /transkript\s*[üu]ret/i,                     commandKey: 'yazisma_pdf' },
  { pattern: /chat\s*pdf\s*[üu]ret/i,                     commandKey: 'yazisma_pdf' },
];

const BATCH_PATTERNS: { pattern: RegExp; commands: string[]; label: string }[] = [
  {
    pattern: /tablolar\s*[üu]ret/i,
    commands: ['rekabet_docx', 'risk_docx', 'finansal_docx', 'gtm_docx'],
    label: 'Detayl\u0131 Tablo Dok\u00FCmanlar\u0131',
  },
  {
    pattern: /hepsini\s*[üu]ret/i,
    commands: [
      'exec_summary', 'detailed_exec', 'teaser', 'pitch_deck', 'pitch_pptx',
      'finansal_model', 'rekabet_docx', 'risk_docx', 'finansal_docx', 'gtm_docx',
      'data_room', 'lean_canvas',
    ],
    label: 'T\u00FCm Investor Package',
  },
];

// ─── KOMUT ALGILAMA ───────────────────────────────────────

export function detectFrontendDocCommand(message: string): {
  type: 'single' | 'batch';
  commandKeys: string[];
  lang: 'tr' | 'en';
  label: string;
} | null {
  const msg = message.trim();
  const lang: 'tr' | 'en' = /\b(en|english)\s*$/i.test(msg) ? 'en' : 'tr';

  // Toplu komutlar önce
  for (const batch of BATCH_PATTERNS) {
    if (batch.pattern.test(msg)) {
      return { type: 'batch', commandKeys: batch.commands, lang, label: batch.label };
    }
  }

  // Tekil komutlar
  for (const cp of COMMAND_PATTERNS) {
    if (cp.pattern.test(msg)) {
      const info = DOC_COMMANDS.find(d => d.key === cp.commandKey);
      return {
        type: 'single',
        commandKeys: [cp.commandKey],
        lang,
        label: info ? (lang === 'en' ? info.labelEN : info.label) : cp.commandKey,
      };
    }
  }

  return null;
}

// ─── ICON COMPONENT ───────────────────────────────────────

function DocIcon({ type, className }: { type: 'docx' | 'xlsx' | 'pptx'; className?: string }) {
  switch (type) {
    case 'xlsx': return <FileSpreadsheet className={className} />;
    case 'pptx': return <Presentation className={className} />;
    default:     return <FileText className={className} />;
  }
}

// ─── DOWNLOAD HANDLER ─────────────────────────────────────

async function downloadDocument(
  command: string,
  state: any,
  onProgress?: (status: 'loading' | 'success' | 'error') => void,
): Promise<void> {
  onProgress?.('loading');

  try {
    const response = await fetch('/api/documents/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, state }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    // Dosya adını header'dan al
    const disposition = response.headers.get('Content-Disposition') || '';
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : 'document';

    // Blob oluştur ve indir
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onProgress?.('success');
  } catch (err) {
    console.error('Document download failed:', err);
    onProgress?.('error');
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════
// SINGLE DOC DOWNLOAD CARD
// ═══════════════════════════════════════════════════════════

interface DocDownloadCardProps {
  commandKey: string;
  state: any;
  lang: 'tr' | 'en';
}

export function DocDownloadCard({ commandKey, state, lang }: DocDownloadCardProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const info = DOC_COMMANDS.find(d => d.key === commandKey);
  if (!info) return null;

  const label = lang === 'en' ? info.labelEN : info.label;

  const handleDownload = useCallback(async () => {
    setStatus('loading');
    try {
      // Uygun komutu reconstruct et
      const commandText = `${commandKey.replace(/_/g, ' ')} \u00FCret${lang === 'en' ? ' EN' : ''}`;
      await downloadDocument(commandText, state, (s) => setStatus(s === 'loading' ? 'loading' : s));
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  }, [commandKey, state, lang]);

  return (
    <button
      onClick={handleDownload}
      disabled={status === 'loading'}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border transition-all w-full text-left
        ${status === 'idle' ? 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/50' : ''}
        ${status === 'loading' ? 'border-blue-300 bg-blue-50/50 cursor-wait' : ''}
        ${status === 'success' ? 'border-green-300 bg-green-50/50' : ''}
        ${status === 'error' ? 'border-red-300 bg-red-50/50' : ''}
      `}
    >
      {/* Icon */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
        ${info.icon === 'xlsx' ? 'bg-emerald-100 text-emerald-600' : ''}
        ${info.icon === 'pptx' ? 'bg-orange-100 text-orange-600' : ''}
        ${info.icon === 'docx' ? 'bg-blue-100 text-blue-600' : ''}
      `}>
        <DocIcon type={info.icon} className="w-5 h-5" />
      </div>

      {/* Label */}
      <div className="flex-grow min-w-0">
        <div className="text-sm font-medium text-slate-700 truncate">{label}</div>
        <div className="text-xs text-slate-400">.{info.icon}</div>
      </div>

      {/* Status icon */}
      <div className="flex-shrink-0">
        {status === 'idle' && <FileDown className="w-4 h-4 text-slate-400" />}
        {status === 'loading' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
        {status === 'success' && <Check className="w-4 h-4 text-green-500" />}
        {status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// BATCH DOC DOWNLOAD PANEL
// ═══════════════════════════════════════════════════════════

interface DocBatchPanelProps {
  commandKeys: string[];
  state: any;
  lang: 'tr' | 'en';
  label: string;
}

export function DocBatchPanel({ commandKeys, state, lang, label }: DocBatchPanelProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <FileDown className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-xs text-slate-400 ml-auto">{commandKeys.length} dosya</span>
      </div>
      <div className="grid gap-2">
        {commandKeys.map(key => (
          <DocDownloadCard key={key} commandKey={key} state={state} lang={lang} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DOC MENU (Analiz sonunda gösterilen tam menü)
// ═══════════════════════════════════════════════════════════

interface DocMenuProps {
  state: any;
  lang?: 'tr' | 'en';
  finalScore?: number;
  karar?: string;
}

export function DocMenu({ state, lang = 'tr', finalScore, karar }: DocMenuProps) {
  const isTR = lang === 'tr';
  const score = finalScore || state?.meta?.final_skor || 0;
  const decision = karar || state?.meta?.karar || '';

  const scoreColor = score >= 70 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-sm max-w-xl">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="text-lg font-bold text-slate-800">
          {isTR ? '\u2705 Analiz tamamland\u0131!' : '\u2705 Analysis complete!'}
        </div>
        <div className={`text-2xl font-bold ${scoreColor}`}>
          {score}/100 \u2192 {decision}
        </div>
      </div>

      {/* Investor Package */}
      <Section title={isTR ? 'Investor Package' : 'Investor Package'}>
        {['exec_summary', 'detailed_exec', 'teaser', 'pitch_deck', 'pitch_pptx', 'finansal_model', 'data_room', 'lean_canvas'].map(key => (
          <DocDownloadCard key={key} commandKey={key} state={state} lang={lang} />
        ))}
      </Section>

      {/* Detaylı Tablolar */}
      <Section title={isTR ? 'Detayl\u0131 Tablo Dok\u00FCmanlar\u0131' : 'Detailed Table Documents'}>
        {['rekabet_docx', 'risk_docx', 'finansal_docx', 'gtm_docx'].map(key => (
          <DocDownloadCard key={key} commandKey={key} state={state} lang={lang} />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}
