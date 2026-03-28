'use client';

import { AnalysisState } from '@/types';
import ScoreGauge from './ScoreGauge';

interface Props {
  state: AnalysisState;
}

export default function StatePanel({ state }: Props) {
  const { meta, A_pazar, B_rekabet, C_strateji } = state;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Score */}
      <div className="fab-card p-5 flex flex-col items-center">
        <ScoreGauge score={meta.final_skor} karar={meta.karar} size="md" />
        {meta.fikir_adi && (
          <div className="mt-3 text-center">
            <div className="font-display font-semibold text-sm">{meta.fikir_adi}</div>
            <div className="text-fab-muted text-xs">{meta.sektor}</div>
          </div>
        )}
      </div>

      {/* Quick stats */}
      {(A_pazar?.tam_tr || A_pazar?.sam) && (
        <div className="fab-card p-4">
          <h3 className="text-xs font-display font-semibold text-fab-muted-light uppercase tracking-wider mb-3">
            Pazar
          </h3>
          <div className="space-y-2 text-sm">
            {A_pazar.tam_tr && (
              <div className="flex justify-between">
                <span className="text-fab-muted">TAM (TR)</span>
                <span className="font-medium">{A_pazar.tam_tr}</span>
              </div>
            )}
            {A_pazar.sam && (
              <div className="flex justify-between">
                <span className="text-fab-muted">SAM</span>
                <span className="font-medium">{A_pazar.sam}</span>
              </div>
            )}
            {A_pazar.som_3yil && (
              <div className="flex justify-between">
                <span className="text-fab-muted">SOM (3Y)</span>
                <span className="font-medium">{A_pazar.som_3yil}</span>
              </div>
            )}
            {A_pazar.cagr_tr && (
              <div className="flex justify-between">
                <span className="text-fab-muted">CAGR</span>
                <span className="text-fab-accent font-medium">{A_pazar.cagr_tr}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Competitors */}
      {B_rekabet?.rakipler && B_rekabet.rakipler.length > 0 && (
        <div className="fab-card p-4">
          <h3 className="text-xs font-display font-semibold text-fab-muted-light uppercase tracking-wider mb-3">
            Rakipler
          </h3>
          <div className="space-y-2">
            {B_rekabet.rakipler.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="truncate mr-2">{r.ad}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    r.tehdit === 'Yüksek'
                      ? 'bg-fab-danger/15 text-fab-danger'
                      : r.tehdit === 'Orta'
                        ? 'bg-fab-warning/15 text-fab-warning'
                        : 'bg-fab-success/15 text-fab-success'
                  }`}
                >
                  {r.tehdit}
                </span>
              </div>
            ))}
          </div>
          {B_rekabet.moat_tipi && (
            <div className="mt-3 pt-3 border-t border-fab-border text-xs">
              <span className="text-fab-muted">Moat: </span>
              <span className="text-fab-accent-light">{B_rekabet.moat_tipi}</span>
            </div>
          )}
        </div>
      )}

      {/* Unit Economics */}
      {C_strateji?.birim_ekonomisi?.ltv_cac && (
        <div className="fab-card p-4">
          <h3 className="text-xs font-display font-semibold text-fab-muted-light uppercase tracking-wider mb-3">
            Birim Ekonomisi
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-fab-muted">LTV:CAC</span>
              <span className="font-medium">{C_strateji.birim_ekonomisi.ltv_cac}</span>
            </div>
            {C_strateji.birim_ekonomisi.payback_ay > 0 && (
              <div className="flex justify-between">
                <span className="text-fab-muted">Payback</span>
                <span className="font-medium">{C_strateji.birim_ekonomisi.payback_ay} ay</span>
              </div>
            )}
            {C_strateji.birim_ekonomisi.brut_marj > 0 && (
              <div className="flex justify-between">
                <span className="text-fab-muted">Brüt Marj</span>
                <span className="font-medium">%{C_strateji.birim_ekonomisi.brut_marj}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risks */}
      {C_strateji?.riskler?.kill_risk?.var_mi && (
        <div className="fab-card p-4 border-fab-danger/30">
          <div className="flex items-center gap-2 text-fab-danger text-sm font-medium">
            <span>⚠️</span>
            <span>Kill Risk Mevcut</span>
          </div>
          <p className="text-xs text-fab-muted mt-1">{C_strateji.riskler.kill_risk.aciklama}</p>
        </div>
      )}

      {/* Meta */}
      <div className="fab-card p-4">
        <h3 className="text-xs font-display font-semibold text-fab-muted-light uppercase tracking-wider mb-3">
          Analiz Bilgisi
        </h3>
        <div className="space-y-1.5 text-xs text-fab-muted">
          <div className="flex justify-between">
            <span>Kapsam</span>
            <span className="text-fab-text">{meta.kapsam}</span>
          </div>
          <div className="flex justify-between">
            <span>Mod</span>
            <span className="text-fab-text">{meta.mod === 'tam' ? 'Tam Analiz' : 'Hızlı'}</span>
          </div>
          <div className="flex justify-between">
            <span>Timing</span>
            <span className="text-fab-text">×{meta.timing_carpani || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span>Tarih</span>
            <span className="text-fab-text">{meta.tarih || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
