'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAnalysis } from '@/hooks/useAnalysis';
import ChatPanel from '@/components/analysis/ChatPanel';
import StatePanel from '@/components/analysis/StatePanel';
import ModuleProgress from '@/components/analysis/ModuleProgress';
import { PanelRightOpen, PanelRightClose } from 'lucide-react';

export default function AnalysisPage() {
  const params = useParams();
  const id = params?.id as string;

  const {
    analysis,
    isStreaming,
    streamContent,
    error,
    sendMessage,
    stopStreaming,
    loadAnalysis,
  } = useAnalysis();

  const [showState, setShowState] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (id && !loaded) {
      loadAnalysis(id).then(() => setLoaded(true));
    }
  }, [id, loaded, loadAnalysis]);

  if (!loaded || !analysis) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-fab-muted text-sm">Analiz yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-fab-border bg-fab-surface/50">
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h2 className="font-display font-semibold text-sm truncate">
              {analysis.state.meta.fikir_adi || 'Yeni Analiz'}
            </h2>
          </div>
          <ModuleProgress
            activeModule={analysis.state.meta.aktif_modul}
            completedModules={analysis.state.meta.tamamlanan_moduller}
          />
        </div>
        <div className="flex items-center gap-2">
          {analysis.state.meta.final_skor > 0 && (
            <span
              className={`font-display font-bold text-sm ${
                analysis.state.meta.final_skor >= 70
                  ? 'text-fab-success'
                  : analysis.state.meta.final_skor >= 50
                    ? 'text-fab-warning'
                    : 'text-fab-danger'
              }`}
            >
              {analysis.state.meta.final_skor}/100
            </span>
          )}
          <button
            onClick={() => setShowState(!showState)}
            className="fab-btn-ghost p-2"
            title={showState ? 'Paneli Gizle' : 'Paneli Göster'}
          >
            {showState ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-fab-danger/10 text-fab-danger text-sm border-b border-fab-danger/20">
          {error}
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat */}
        <div className="flex-1 min-w-0">
          <ChatPanel
            messages={analysis.messages}
            streamContent={streamContent}
            isStreaming={isStreaming}
            onSend={sendMessage}
            onStop={stopStreaming}
            activeModule={analysis.state.meta.aktif_modul}
          />
        </div>

        {/* State panel (right sidebar) */}
        {showState && (
          <div className="hidden lg:block w-72 border-l border-fab-border bg-fab-surface/30 shrink-0">
            <StatePanel state={analysis.state} />
          </div>
        )}
      </div>
    </div>
  );
}
