'use client';

import { AnalysisState } from '@/types';
import ScoreGauge from './ScoreGauge';

interface Props {
  state: AnalysisState;
}

// ─── PARA BİRİMİ FORMATLAMA ────────────────────────────

/** Ham değeri oku — string veya number olabilir */
function parseVal(val: unknown): number {
  if (val === undefined || val === null || val === '' || val === '—') return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // "$4.2B", "4200", "$850M", "%18.5", "77" gibi formatları parse et
    const cleaned = val.replace(/[₺$€£%,]/g, '').trim();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    // B/M/K suffix kontrolü
    const upper = val.toUpperCase();
    if (upper.includes('B')) return num * 1000; // Milyar → Milyon'a çevir
    if (upper.includes('M')) return num;
    if (upper.includes('K')) return num / 1000;
    return num;
  }
  return 0;
}

/** Milyon dolar formatla: 4200 → "$4.2B", 850 → "$850M", 42 → "$42M" */
function fmtMarket(valMillion: number): string {
  if (!valMillion) return '—';
  if (valMillion >= 1000) return `$${(valMillion / 1000).toFixed(1)}B`;
  if (valMillion >= 1) return `$${valMillion.toFixed(0)}M`;
  return `$${(valMillion * 1000).toFixed(0)}K`;
}

/** Yüzde formatla */
function fmtPct(val: unknown): string {
  const n = parseVal(val);
  if (!n) return '—';
  return `%${n.toFixed(1)}`;
}

/** Para birimi kısalt (USD) */
function fmtMoney(val: unknown): string {
  const n = parseVal(val);
  if (!n) return '—';
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

/** Safe string değer al */
function safeStr(val: unknown, fallback = '—'): string {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

// ─── Deep get: nested path ile değer çek ────────────────
function dig(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((o: unknown, k) => {
    if (o && typeof o === 'object') return (o as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

// ─── COMPONENT ──────────────────────────────────────────

export default function StatePanel({ state }: Props) {
  const { meta, A_pazar, B_rekabet, C_strateji, D_final } = state;
  const s = state as unknown as Record<string, unknown>;

  // Pazar verilerini çek — birden fazla olası field ismi dene
  const tamTR = parseVal(dig(s, 'A_pazar.tam_tr') || dig(s, 'A_pazar.tam'));
  const tamGlobal = parseVal(dig(s, 'A_pazar.tam_global'));
  const sam = parseVal(dig(s, 'A_pazar.sam'));
  const som = parseVal(dig(s, 'A_pazar.som_3yil'));
  const cagrTR = parseVal(dig(s, 'A_pazar.cagr_tr'));

  // Birim ekonomisi — birden fazla field ismi
  const ltvCac = safeStr(dig(s, 'C_strateji.birim_ekonomisi.ltv_cac') || dig(s, 'C_strateji.birim_ekonomisi.ltv_cac_oran'));
  const payback = parseVal(dig(s, 'C_strateji.birim_ekonomisi.payback_ay') || dig(s, 'C_strateji.birim_ekonomisi.payback'));
  const brutMarj = parseVal(dig(s, 'C_strateji.birim_ekonomisi.brut_marj'));
  const churn = parseVal(dig(s, 'C_strateji.birim_ekonomisi.churn_aylik'));
  const arpu = parseVal(dig(s, 'C_strateji.birim_ekonomisi.arpu_tl') || dig(s, 'C_strateji.birim_ekonomisi.arpu_aylik'));
  const cac = parseVal(dig(s, 'C_strateji.birim_ekonomisi.cac_tl') || dig(s, 'C_strateji.birim_ekonomisi.cac'));

  // Finansal
  const breakeven = parseVal(dig(s, 'D_final.finansal.breakeven_ay'));
  const fonlama = dig(s, 'D_final.finansal.fonlama') as Array<Record<string, unknown>> | undefined;
  const ilkTur = Array.isArray(fonlama) && fonlama.length > 0 ? fonlama[0] : null;

  // Rakipler
  const rakipler = (dig(s, 'B_rekabet.rakipler') || dig(s, 'B_rekabet.dogrudan_rakipler')) as Array<Record<string, unknown>> | undefined;
  const moat = safeStr(dig(s, 'B_rekabet.moat_tipi'));
  const moatSuresi = safeStr(dig(s, 'B_rekabet.moat_suresi'));

  // Kill risk
  const killRisk = dig(s, 'C_strateji.riskler.kill_risk') as Record<string, unknown> | undefined;
  const hasKillRisk = killRisk && (killRisk.var_mi || killRisk.aciklama);

  const hasPazar = tamTR > 0 || sam > 0;
  const hasBirimEko = ltvCac !== '—' || payback > 0 || brutMarj > 0;
  const hasRakipler = Array.isArray(rakipler) && rakipler.length > 0;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* ── SKOR ─────────────────────────────────────── */}
      <div className="fab-card p-5 flex flex-col items-center">
        <ScoreGauge score={meta.final_skor} karar={meta.karar} size="md" />
        {meta.fikir_adi && (
          <div className="mt-3 text-center">
            <div className="font-display font-semibold text-sm">{meta.fikir_adi}</div>
            <div className="text-fab-muted text-xs">{meta.sektor}</div>
          </div>
        )}
      </div>

      {/* ── PAZAR FIRSATI ────────────────────────────── */}
      {hasPazar && (
        <div className="fab-card p-4">
          <h3 className="text-xs font-display font-semibold text-fab-muted-light uppercase tracking-wider mb-3">
            Pazar Fırsatı
          </h3>

          {/* TAM/SAM/SOM metrikleri — grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <MetricCard label="TAM" value={fmtMarket(tamTR)} sub={tamGlobal > 0 ? `Global: ${fmtMarket(tamGlobal)}` : undefined} />
            <MetricCard label="SAM" value={fmtMarket(sam)} />
            <MetricCard label="SOM 3Y" value={fmtMarket(som)} />
          </div>

          {/* CAGR */}
          {cagrTR > 0 && (
            <div className="flex items-center justify-between text-sm px-1">
              <span className="text-fab-muted">CAGR (TR)</span>
              <span className="text-fab-accent font-semibold">{fmtPct(cagrTR)}</span>
            </div>
          )}
        </div>
      )}

      {/* ── RAKİPLER ─────────────────────────────────── */}
      {hasRakipler && (
        <div className="fab-card p-4">
          <h3 className="text-xs font-display font-semibold text-fab-muted-light uppercase tracking-wider mb-3">
            Rekabet
          </h3>
          <div className="space-y-2">
            {(rakipler as Array<Record<string, unknown>>).slice(0, 4).map((r, i) => {
              const ad = safeStr(r.ad || r.sirket);
              const tehdit = safeStr(r.tehdit);
              const tehditLower = tehdit.toLowerCase();
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="truncate mr-2">{ad}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    tehditLower.includes('yüksek') || tehditLower.includes('high')
                      ? 'bg-fab-danger/15 text-fab-danger'
                      : tehditLower.includes('orta') || tehditLower.includes('med')
                        ? 'bg-fab-warning/15 text-fab-warning'
                        : 'bg-fab-success/15 text-fab-success'
                  }`}>
                    {tehdit}
                  </span>
                </div>
              );
            })}
          </div>
          {moat !== '—' && (
            <div className="mt-3 pt-3 border-t border-fab-border">
              <div className="text-[10px] text-fab-muted uppercase tracking-wider mb-1">Moat</div>
              <div className="text-xs text-fab-accent-light font-medium">{moat}</div>
              {moatSuresi !== '—' && <div className="text-[10px] text-fab-muted mt-0.5">{moatSuresi}</div>}
            </div>
          )}
        </div>
      )}

      {/* ── BİRİM EKONOMİSİ ──────────────────────────── */}
      {hasBirimEko && (
        <div className="fab-card p-4">
          <h3 className="text-xs font-display font-semibold text-fab-muted-light uppercase tracking-wider mb-3">
            Birim Ekonomisi
          </h3>

          {/* Ana metrikler — grid */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {ltvCac !== '—' && (
              <MiniMetric
                label="LTV:CAC"
                value={ltvCac.includes(':') ? ltvCac : `${ltvCac}:1`}
                good={parseVal(ltvCac) >= 3}
              />
            )}
            {brutMarj > 0 && (
              <MiniMetric label="Brüt Marj" value={`%${brutMarj}`} good={brutMarj >= 60} />
            )}
            {payback > 0 && (
              <MiniMetric label="Payback" value={`${payback} ay`} good={payback <= 18} />
            )}
            {churn > 0 && (
              <MiniMetric label="Churn/mo" value={`%${churn}`} good={churn <= 5} />
            )}
          </div>

          {/* ARPU/CAC detay */}
          <div className="space-y-1 text-xs text-fab-muted mt-2 pt-2 border-t border-fab-border/50">
            {arpu > 0 && (
              <div className="flex justify-between">
                <span>ARPU/mo</span>
                <span className="text-fab-text">{fmtMoney(arpu)}</span>
              </div>
            )}
            {cac > 0 && (
              <div className="flex justify-between">
                <span>CAC</span>
                <span className="text-fab-text">{fmtMoney(cac)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FİNANSAL ────────────────────────────────── */}
      {(breakeven > 0 || ilkTur) && (
        <div className="fab-card p-4">
          <h3 className="text-xs font-display font-semibold text-fab-muted-light uppercase tracking-wider mb-3">
            Finansal
          </h3>
          <div className="space-y-2 text-sm">
            {breakeven > 0 && (
              <div className="flex justify-between">
                <span className="text-fab-muted">Break-even</span>
                <span className="font-medium">{breakeven} ay</span>
              </div>
            )}
            {ilkTur && (
              <>
                <div className="flex justify-between">
                  <span className="text-fab-muted">{safeStr(ilkTur.tur, 'Tur')}</span>
                  <span className="font-medium text-fab-accent">{safeStr(ilkTur.tutar)}</span>
                </div>
                <div className="text-[10px] text-fab-muted">{safeStr(ilkTur.kullanim)}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── KILL RISK ────────────────────────────────── */}
      {hasKillRisk && (
        <div className="fab-card p-4 border-fab-danger/30">
          <div className="flex items-center gap-2 text-fab-danger text-sm font-medium">
            <span>⚠️</span>
            <span>Kill Risk</span>
          </div>
          <p className="text-xs text-fab-muted mt-1.5 leading-relaxed">
            {safeStr((killRisk as Record<string, unknown>).aciklama || (killRisk as Record<string, unknown>).desc)}
          </p>
        </div>
      )}

      {/* ── ANALİZ BİLGİSİ ──────────────────────────── */}
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
          {meta.timing_carpani > 0 && (
            <div className="flex justify-between">
              <span>Timing</span>
              <span className="text-fab-text">×{meta.timing_carpani}</span>
            </div>
          )}
          {meta.usd_try_kur > 0 && (
            <div className="flex justify-between">
              <span>Kur</span>
              <span className="text-fab-text">₺{meta.usd_try_kur}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tarih</span>
            <span className="text-fab-text">{meta.tarih || '—'}</span>
          </div>
          {meta.tamamlanan_moduller.length > 0 && (
            <div className="flex justify-between">
              <span>Modüller</span>
              <div className="flex gap-1">
                {['A', 'B', 'C', 'D'].map(m => (
                  <span
                    key={m}
                    className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-medium ${
                      meta.tamamlanan_moduller.includes(m)
                        ? 'bg-fab-accent/20 text-fab-accent'
                        : meta.aktif_modul === m
                          ? 'bg-fab-warning/20 text-fab-warning animate-pulse'
                          : 'bg-fab-surface text-fab-muted/50'
                    }`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Alt Bileşenler ──────────────────────────────────────

/** Pazar büyüklüğü metrik kartı */
function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-fab-surface/50 rounded-lg p-2 text-center">
      <div className="text-[10px] text-fab-muted uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold text-fab-text mt-0.5">{value}</div>
      {sub && <div className="text-[9px] text-fab-muted mt-0.5">{sub}</div>}
    </div>
  );
}

/** Birim ekonomisi mini metrik — yeşil/kırmızı indicator */
function MiniMetric({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="bg-fab-surface/50 rounded-lg p-2">
      <div className="text-[10px] text-fab-muted">{label}</div>
      <div className={`text-sm font-semibold mt-0.5 ${
        good === true ? 'text-fab-success' : good === false ? 'text-fab-warning' : 'text-fab-text'
      }`}>
        {value}
      </div>
    </div>
  );
}
