'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '@/types';
import { cleanDisplayText } from '@/lib/utils';
import { Send, Square, Loader2 } from 'lucide-react';

// Custom markdown components for proper table rendering
const markdownComponents = {
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-fab-border">
      <table className="w-full text-sm border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-fab-accent/10" {...props}>{children}</thead>
  ),
  tbody: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className="divide-y divide-fab-border" {...props}>{children}</tbody>
  ),
  tr: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="hover:bg-white/[0.02] transition-colors" {...props}>{children}</tr>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-3 py-2 text-left text-fab-accent-light font-medium text-xs whitespace-nowrap" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-3 py-2 text-fab-text/80 text-sm" {...props}>{children}</td>
  ),
  // Code blocks — hide state_update blocks that leak through
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
    const text = extractText(children);
    if (text.includes('state_update') || text.includes('"meta"') && text.includes('"aktif_modul"')) {
      return null;
    }
    return (
      <pre className="bg-fab-surface rounded-xl p-4 my-3 overflow-x-auto text-sm" {...props}>
        {children}
      </pre>
    );
  },
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="bg-fab-surface px-1.5 py-0.5 rounded text-sm"
          style={{ fontFamily: 'var(--font-mono)' }}
          {...props}
        >
          {children}
        </code>
      );
    }
    return <code className={className} {...props}>{children}</code>;
  },
};

// Helper to extract text content from React children
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && node !== null && 'props' in (node as Record<string, unknown>)) {
    const el = node as { props?: { children?: React.ReactNode } };
    return extractText(el.props?.children);
  }
  return '';
}

interface Props {
  messages: ChatMessage[];
  streamContent: string;
  isStreaming: boolean;
  onSend: (message: string) => void;
  onStop: () => void;
  activeModule: string;
  analysisId?: string;
}

const DOC_BUTTONS = [
  { label: 'Executive Summary', type: 'exec-summary', ext: '.docx', icon: '📋' },
  { label: 'Rekabet Raporu', type: 'rekabet', ext: '.docx', icon: '⚔️' },
  { label: 'Risk Matrisi', type: 'risk', ext: '.docx', icon: '⚠️' },
  { label: 'GTM Planı', type: 'gtm', ext: '.docx', icon: '🚀' },
  { label: 'Finansal Rapor', type: 'finansal-docx', ext: '.docx', icon: '💰' },
  { label: 'Finansal Model', type: 'finansal-xlsx', ext: '.xlsx', icon: '📊' },
];

export default function ChatPanel({
  messages,
  streamContent,
  isStreaming,
  onSend,
  onStop,
  activeModule,
  analysisId,
}: Props) {
  const [input, setInput] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const cleanedStream = useMemo(() => cleanDisplayText(streamContent), [streamContent]);

  async function handleDownload(docType: string, filename: string) {
    if (!analysisId || downloading) return;
    setDownloading(docType);
    try {
      const res = await fetch('/api/generate-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId, docType }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
    setDownloading(null);
  }

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamContent]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }, [input]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Welcome message */}
        {messages.length === 0 && !streamContent && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="text-5xl mb-4">🏭</div>
            <h2 className="font-display font-bold text-xl mb-2">Ideactory.ai</h2>
            <p className="text-fab-muted max-w-md text-sm leading-relaxed">
              Startup fikrini paylaş, McKinsey kalitesinde analiz başlasın.
              Pazar, rekabet, strateji, skorlama ve investor-grade doküman üretimi — hepsi otomatik.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                'Türkiye için bir B2B SaaS fatura yönetim platformu',
                'Yapay zeka destekli kişisel beslenme asistanı',
                'KOBİ\'ler için dijital muhasebe çözümü',
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => { setInput(ex); textareaRef.current?.focus(); }}
                  className="text-xs text-fab-muted-light border border-fab-border rounded-lg px-3 py-2 hover:border-fab-accent/30 hover:text-fab-accent transition-colors text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming content */}
        {cleanedStream && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-fab-accent/20 flex items-center justify-center text-sm shrink-0 mt-1">
              🏭
            </div>
            <div className="flex-1 min-w-0">
              <div className="chat-markdown text-sm text-fab-text/90">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {cleanedStream}
                </ReactMarkdown>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-fab-accent typing-dot" />
                <div className="w-1.5 h-1.5 rounded-full bg-fab-accent typing-dot" />
                <div className="w-1.5 h-1.5 rounded-full bg-fab-accent typing-dot" />
              </div>
            </div>
          </div>
        )}

        {/* Loading state without content yet */}
        {isStreaming && !streamContent && (
          <div className="flex gap-3 items-center">
            <div className="w-7 h-7 rounded-lg bg-fab-accent/20 flex items-center justify-center text-sm">
              🏭
            </div>
            <div className="flex items-center gap-2 text-fab-muted text-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analiz ediliyor...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-fab-border p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeModule === 'A' && messages.length === 0
                  ? 'Startup fikrini anlat...'
                  : 'Mesaj yaz veya "devam" de...'
              }
              className="fab-input resize-none min-h-[44px] max-h-[160px] pr-4"
              rows={1}
              disabled={isStreaming}
            />
          </div>
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="fab-btn bg-fab-danger/10 text-fab-danger hover:bg-fab-danger/20 p-3"
              title="Durdur"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="fab-btn-primary p-3"
              title="Gönder"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Quick commands */}
        {messages.length > 0 && !isStreaming && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['devam', 'state göster', 'hızlı analiz', 'karşılaştır'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => onSend(cmd)}
                className="text-[11px] text-fab-muted hover:text-fab-accent border border-fab-border/50 rounded-md px-2 py-1 hover:border-fab-accent/30 transition-colors"
              >
                {cmd}
              </button>
            ))}
            {activeModule === 'D' && analysisId && (
              <>
                <div className="w-full h-px bg-fab-border/30 my-2" />
                <div className="w-full">
                  <div className="text-[10px] text-fab-muted mb-1.5 font-medium uppercase tracking-wider">Doküman İndir</div>
                  <div className="flex flex-wrap gap-1.5">
                    {DOC_BUTTONS.map((doc) => (
                      <button
                        key={doc.type}
                        onClick={() => handleDownload(doc.type, `${doc.label}${doc.ext}`)}
                        disabled={downloading !== null}
                        className={`text-[11px] flex items-center gap-1 border rounded-md px-2.5 py-1.5 transition-colors ${
                          downloading === doc.type
                            ? 'bg-fab-accent/10 border-fab-accent/30 text-fab-accent'
                            : 'text-fab-accent/70 hover:text-fab-accent border-fab-accent/20 hover:border-fab-accent/40'
                        }`}
                      >
                        <span>{downloading === doc.type ? '⏳' : doc.icon}</span>
                        <span>{doc.label}</span>
                        <span className="text-fab-muted/50">{doc.ext}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Message Bubble ─────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const cleanedContent = useMemo(
    () => (isUser ? message.content : cleanDisplayText(message.content)),
    [message.content, isUser],
  );

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-1 ${
          isUser ? 'bg-fab-surface' : 'bg-fab-accent/20'
        }`}
      >
        {isUser ? '👤' : '🏭'}
      </div>
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block text-left rounded-2xl px-4 py-3 max-w-full ${
            isUser
              ? 'bg-fab-accent/10 text-fab-text'
              : 'bg-fab-card border border-fab-border'
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="chat-markdown text-sm text-fab-text/90">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {cleanedContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {message.checkpoint && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-fab-success text-xs">
            <span>✅</span>
            <span>Checkpoint — Modül {message.module}</span>
          </div>
        )}
      </div>
    </div>
  );
}
