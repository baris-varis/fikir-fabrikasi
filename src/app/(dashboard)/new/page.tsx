'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ClipboardList } from 'lucide-react';

export default function NewAnalysisPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'tam' | 'hizli'>('tam');
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Yeni Analiz', mode }),
      });
      const data = await res.json();
      router.push(`/analyses/${data.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏭</div>
          <h1 className="font-display font-bold text-2xl mb-2">Yeni Analiz Başlat</h1>
          <p className="text-fab-muted text-sm">Analiz modunu seç ve fikrini paylaş</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Tam Analiz */}
          <button
            onClick={() => setMode('tam')}
            className={`fab-card p-5 text-left transition-all ${
              mode === 'tam'
                ? 'border-fab-accent ring-1 ring-fab-accent/30'
                : 'hover:border-fab-border/80'
            }`}
          >
            <ClipboardList
              className={`w-6 h-6 mb-3 ${mode === 'tam' ? 'text-fab-accent' : 'text-fab-muted'}`}
            />
            <h3 className="font-display font-semibold text-sm mb-1">Tam Analiz</h3>
            <p className="text-xs text-fab-muted leading-relaxed">
              A→B→C→D tüm modüller. Pazar, rekabet, strateji, skorlama, finansal projeksiyon ve dashboard.
            </p>
          </button>

          {/* Hızlı Analiz */}
          <button
            onClick={() => setMode('hizli')}
            className={`fab-card p-5 text-left transition-all ${
              mode === 'hizli'
                ? 'border-fab-accent ring-1 ring-fab-accent/30'
                : 'hover:border-fab-border/80'
            }`}
          >
            <Zap
              className={`w-6 h-6 mb-3 ${mode === 'hizli' ? 'text-fab-accent' : 'text-fab-muted'}`}
            />
            <h3 className="font-display font-semibold text-sm mb-1">Hızlı Analiz</h3>
            <p className="text-xs text-fab-muted leading-relaxed">
              Lite mode — yapılandırma, kısa pazar, top 3 rakip, skor. Sonra tam analize geçilebilir.
            </p>
          </button>
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className="fab-btn-primary w-full py-3.5 text-base"
        >
          {loading ? 'Oluşturuluyor...' : 'Analizi Başlat →'}
        </button>
      </div>
    </div>
  );
}
