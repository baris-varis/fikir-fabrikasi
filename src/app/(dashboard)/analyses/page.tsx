'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight, Trash2 } from 'lucide-react';
import ScoreGauge from '@/components/analysis/ScoreGauge';
import { Analysis } from '@/types';

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analyses')
      .then((r) => r.json())
      .then((data) => {
        setAnalyses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Bu analizi silmek istediğine emin misin?')) return;
    await fetch(`/api/analyses/${id}`, { method: 'DELETE' });
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-fab-muted text-sm">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl">Analizlerim</h1>
          <p className="text-fab-muted text-sm mt-1">
            {analyses.length} analiz
          </p>
        </div>
        <Link href="/new" className="fab-btn-primary">
          <Plus className="w-4 h-4" />
          Yeni Analiz
        </Link>
      </div>

      {analyses.length === 0 ? (
        <div className="fab-card p-12 text-center">
          <div className="text-4xl mb-4">🏭</div>
          <h2 className="font-display font-semibold text-lg mb-2">
            Henüz analiz yok
          </h2>
          <p className="text-fab-muted text-sm mb-6 max-w-sm mx-auto">
            İlk startup fikrini analiz etmek için yeni bir analiz başlat.
          </p>
          <Link href="/new" className="fab-btn-primary">
            <Plus className="w-4 h-4" />
            İlk Analizini Başlat
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="fab-card p-5 flex items-center gap-5 group hover:border-fab-accent/20 transition-colors"
            >
              {/* Score mini gauge */}
              <ScoreGauge
                score={analysis.state.meta.final_skor}
                karar={analysis.state.meta.karar}
                size="sm"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold truncate">
                    {analysis.state.meta.fikir_adi || analysis.title}
                  </h3>
                  {analysis.state.meta.sektor && (
                    <span className="fab-badge-module text-[10px] shrink-0">
                      {analysis.state.meta.sektor}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-fab-muted">
                  <span>
                    {analysis.state.meta.mod === 'hizli' ? '⚡ Hızlı' : '📋 Tam'} Analiz
                  </span>
                  <span>·</span>
                  <span>Modül {analysis.state.meta.aktif_modul}</span>
                  <span>·</span>
                  <span>
                    {new Date(analysis.updatedAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(analysis.id)}
                  className="p-2 text-fab-muted hover:text-fab-danger rounded-lg hover:bg-fab-danger/10 transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  href={`/analyses/${analysis.id}`}
                  className="fab-btn-primary py-2 px-4 text-sm"
                >
                  <span>Devam Et</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
