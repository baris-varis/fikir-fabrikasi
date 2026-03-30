// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — HTML Dashboard Generator
// 9 bölümlü interaktif analiz özet sayfası
// Chart.js grafikleri + skor gauge + SWOT grid
// ═══════════════════════════════════════════════════════════

import { get, safeVal, fmtMoney, fmtPct } from './styles';

function parseNum(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.-]/g, '')) || 0;
  return 0;
}

function esc(s: string): string {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function fmtMarket(val: any): string {
  const n = parseNum(typeof val === 'string' ? val.replace(/[₺$€£,]/g, '') : val);
  if (!n) return '—';
  const upper = typeof val === 'string' ? val.toUpperCase() : '';
  let m = n;
  if (upper.includes('B')) m = n * 1000;
  else if (upper.includes('M')) m = n;
  else if (upper.includes('K')) m = n / 1000;
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  if (m >= 1) return `$${m.toFixed(0)}M`;
  return `$${(m * 1000).toFixed(0)}K`;
}

export async function generateDashboardHtml(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const lang = langOverride || get(state, 'meta.dil', 'tr');
  const t = lang === 'tr';
  const fikir = esc(get(state, 'meta.fikir_adi', 'Startup'));
  const sektor = esc(get(state, 'meta.sektor', ''));
  const kapsam = get(state, 'meta.kapsam', 'Yerel');
  const finalSkor = parseNum(get(state, 'meta.final_skor', 0));
  const karar = get(state, 'meta.karar', '');
  const hamSkor = parseNum(get(state, 'meta.ham_skor', 0));
  const timingC = parseNum(get(state, 'meta.timing_carpani', 1));
  const tarih = get(state, 'meta.tarih', new Date().toISOString().split('T')[0]);

  // Data extraction
  const problem = esc(get(state, 'A_pazar.problem', ''));
  const hedefKitle = esc(get(state, 'A_pazar.hedef_kitle', ''));
  const uvp = esc(get(state, 'B_rekabet.uvp', ''));
  const isModeliTip = esc(get(state, 'C_strateji.is_modeli.tip', get(state, 'A_pazar.is_modeli_ozet', '')));
  const tamTR = fmtMarket(get(state, 'A_pazar.tam_tr', get(state, 'A_pazar.tam', 0)));
  const sam = fmtMarket(get(state, 'A_pazar.sam', 0));
  const som = fmtMarket(get(state, 'A_pazar.som_3yil', 0));
  const cagrTR = fmtPct(parseNum(get(state, 'A_pazar.cagr_tr', 0)));
  const timing = get(state, 'A_pazar.timing', {});
  const timingSkor = parseNum(timing.skor || 0);

  // Scoring
  const boyutlar = get(state, 'C_strateji.skorlama.boyutlar', []);
  const guclu = get(state, 'C_strateji.skorlama.guclu_yonler', []);
  const zayif = get(state, 'C_strateji.skorlama.zayif_yonler', []);

  // Competition
  const rakipler = get(state, 'B_rekabet.rakipler', get(state, 'B_rekabet.dogrudan_rakipler', []));
  const swot = get(state, 'B_rekabet.swot', {});
  const moat = esc(get(state, 'B_rekabet.moat_tipi', ''));

  // Financial
  const projYillik = get(state, 'D_final.finansal.projeksiyon_yillik', []);
  const senaryo = get(state, 'D_final.finansal.senaryo', {});
  const breakeven = parseNum(get(state, 'D_final.finansal.breakeven_ay', 0));
  const birimEko = get(state, 'C_strateji.birim_ekonomisi', {});

  // Risks
  const riskler = get(state, 'C_strateji.riskler', {});
  const killRisk = riskler.kill_risk || riskler.killRisk;
  const topRisks = Array.isArray(riskler.top) ? riskler.top : (Array.isArray(riskler.riskler) ? riskler.riskler : []);

  // GTM
  const gtm = get(state, 'C_strateji.gtm', {});
  const kanallar = Array.isArray(gtm.kanallar) ? gtm.kanallar : [];

  // Exit & Funding
  const exitData = Array.isArray(get(state, 'D_final.exit', [])) ? get(state, 'D_final.exit', []) : [];
  const fonlama = Array.isArray(get(state, 'D_final.finansal.fonlama', [])) ? get(state, 'D_final.finansal.fonlama', []) : [];
  const useOfFunds = get(state, 'D_final.finansal.use_of_funds', {});

  // First 30 days
  const ilk30 = Array.isArray(get(state, 'D_final.ilk_30_gun', [])) ? get(state, 'D_final.ilk_30_gun', []) : [];

  // Karar rengi
  const kararColor = karar === 'GO' ? '#22c55e' : karar === 'CONDITIONAL GO' ? '#f59e0b' : '#ef4444';
  const kararBg = karar === 'GO' ? 'rgba(34,197,94,0.15)' : karar === 'CONDITIONAL GO' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)';

  // Projeksiyon verilerini normalize et
  const projArr = normalizeProj(projYillik);
  const arrData = projArr.map((p: any) => parseNum(p.arr || p.arr_usd || 0));
  const musteriData = projArr.map((p: any) => parseNum(p.musteri || 0));
  const ebitdaData = projArr.map((p: any) => parseNum(p.ebitda || p.ebitda_usd || 0));

  // Senaryo verileri
  const senaryoArr3 = [
    parseNum(get(senaryo, 'kotumser.arr_yil3', 0)),
    parseNum(get(senaryo, 'gercekci.arr_yil3', get(senaryo, 'baz.arr_yil3', 0))),
    parseNum(get(senaryo, 'iyimser.arr_yil3', 0)),
  ];

  // Boyutlar için bar chart verisi
  const boyutlarArr = Array.isArray(boyutlar) ? boyutlar : [];
  const boyutLabels = boyutlarArr.map((b: any) => esc(b.ad || b.name || ''));
  const boyutPuanlar = boyutlarArr.map((b: any) => parseNum(b.puan || b.score || 0));

  // SWOT items
  const swotS = Array.isArray(swot.S || swot.strengths) ? (swot.S || swot.strengths) : [];
  const swotW = Array.isArray(swot.W || swot.weaknesses) ? (swot.W || swot.weaknesses) : [];
  const swotO = Array.isArray(swot.O || swot.opportunities) ? (swot.O || swot.opportunities) : [];
  const swotT = Array.isArray(swot.T || swot.threats) ? (swot.T || swot.threats) : [];

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fikir} — Dashboard</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#0f172a;color:#f1f5f9;line-height:1.6}
.container{max-width:1200px;margin:0 auto;padding:24px}
.header{text-align:center;padding:40px 0 32px;border-bottom:1px solid rgba(59,130,246,0.2)}
.header h1{font-size:32px;font-weight:700;margin-bottom:8px}
.badge{display:inline-block;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;margin:0 4px}
.badge-sektor{background:rgba(59,130,246,0.15);color:#60a5fa}
.badge-karar{background:${kararBg};color:${kararColor}}
.skor-ring{display:inline-flex;align-items:center;justify-content:center;margin:20px auto;position:relative;width:140px;height:140px}
.skor-ring svg{transform:rotate(-90deg)}
.skor-val{position:absolute;font-size:36px;font-weight:700;color:${kararColor}}
.skor-sub{position:absolute;bottom:28px;font-size:12px;color:#94a3b8}
.section{margin:32px 0}
.section-title{font-size:18px;font-weight:600;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.08)}
.grid-4{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.card{background:#1e293b;border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.06)}
.card-label{font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;margin-bottom:6px}
.card-value{font-size:22px;font-weight:700;color:#3b82f6}
.card-value.green{color:#22c55e}.card-value.amber{color:#f59e0b}.card-value.red{color:#ef4444}
.card-text{font-size:13px;color:#cbd5e1;line-height:1.5}
.market-funnel{display:flex;flex-direction:column;align-items:center;gap:8px}
.funnel-bar{border-radius:8px;text-align:center;padding:12px;font-weight:600;color:#fff}
.funnel-bar.tam{background:rgba(59,130,246,0.3);width:100%;font-size:20px}
.funnel-bar.sam{background:rgba(59,130,246,0.5);width:75%;font-size:18px}
.funnel-bar.som{background:rgba(59,130,246,0.8);width:50%;font-size:16px}
.funnel-label{font-size:11px;color:#94a3b8;text-transform:uppercase}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;padding:8px 10px;background:#334155;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
td{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.05);color:#e2e8f0}
tr:hover td{background:rgba(255,255,255,0.02)}
.swot-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px}
.swot-cell{padding:14px;border-radius:8px;font-size:13px}
.swot-cell h4{font-size:13px;font-weight:600;margin-bottom:8px}
.swot-cell ul{list-style:none;padding:0}.swot-cell li{padding:2px 0;font-size:12px;line-height:1.4}
.swot-s{background:rgba(34,197,94,0.1);color:#86efac}.swot-s h4{color:#22c55e}
.swot-w{background:rgba(245,158,11,0.1);color:#fcd34d}.swot-w h4{color:#f59e0b}
.swot-o{background:rgba(59,130,246,0.1);color:#93c5fd}.swot-o h4{color:#3b82f6}
.swot-t{background:rgba(239,68,68,0.1);color:#fca5a5}.swot-t h4{color:#ef4444}
.kill-risk{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:16px;margin-bottom:16px}
.kill-risk-title{color:#ef4444;font-weight:700;font-size:15px;margin-bottom:6px}
.risk-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.risk-green{background:#22c55e}.risk-yellow{background:#f59e0b}.risk-orange{background:#fb923c}.risk-red{background:#ef4444}
.exit-card{background:#1e293b;border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.06);text-align:center}
.exit-card .exit-rank{font-size:12px;color:#94a3b8;text-transform:uppercase;margin-bottom:6px}
.exit-card .exit-value{font-size:22px;font-weight:700;color:#3b82f6;margin-bottom:4px}
.exit-card .exit-method{font-size:13px;color:#cbd5e1}
.timeline-item{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)}
.timeline-num{width:28px;height:28px;border-radius:50%;background:rgba(59,130,246,0.2);color:#3b82f6;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex-shrink:0}
.timeline-text{font-size:13px;color:#e2e8f0;padding-top:4px}
.chart-card{background:#1e293b;border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.06)}
.footer{text-align:center;padding:32px 0 16px;color:#64748b;font-size:12px;border-top:1px solid rgba(255,255,255,0.05);margin-top:40px}
.stars{color:#f59e0b;font-size:14px;letter-spacing:2px}
@media(max-width:768px){.grid-4,.grid-3,.grid-2,.swot-grid{grid-template-columns:1fr}.container{padding:16px}}
</style>
</head>
<body>
<div class="container">

<!-- HEADER -->
<div class="header">
  <h1>${fikir}</h1>
  <div><span class="badge badge-sektor">${sektor}</span><span class="badge badge-karar">${karar}</span><span class="badge badge-sektor">${kapsam}</span></div>
  <div class="skor-ring">
    <svg width="140" height="140"><circle cx="70" cy="70" r="60" fill="none" stroke="#1e293b" stroke-width="10"/><circle cx="70" cy="70" r="60" fill="none" stroke="${kararColor}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 60}" stroke-dashoffset="${2 * Math.PI * 60 * (1 - finalSkor / 100)}"/></svg>
    <span class="skor-val">${finalSkor}</span>
    <span class="skor-sub">/100</span>
  </div>
  <div style="font-size:13px;color:#94a3b8">${t ? 'Ham' : 'Raw'}: ${hamSkor} × ${timingC} = ${finalSkor} | Timing: ${timingSkor}/4</div>
</div>

<!-- BÖLÜM 1: 4 ÖZET KART -->
<div class="section">
  <div class="section-title">📋 ${t ? 'Özet' : 'Overview'}</div>
  <div class="grid-4">
    <div class="card"><div class="card-label">${t ? 'Problem' : 'Problem'}</div><div class="card-text">${problem || '—'}</div></div>
    <div class="card"><div class="card-label">${t ? 'Hedef Kitle' : 'Target'}</div><div class="card-text">${hedefKitle || '—'}</div></div>
    <div class="card"><div class="card-label">UVP</div><div class="card-text">${uvp || '—'}</div></div>
    <div class="card"><div class="card-label">${t ? 'İş Modeli' : 'Business Model'}</div><div class="card-text">${isModeliTip || '—'}</div></div>
  </div>
</div>

<!-- BÖLÜM 2: PAZAR -->
<div class="section">
  <div class="section-title">📊 ${t ? 'Pazar Fırsatı' : 'Market Opportunity'}</div>
  <div class="grid-2">
    <div class="card">
      <div class="market-funnel">
        <div class="funnel-label">TAM</div><div class="funnel-bar tam">${tamTR}</div>
        <div class="funnel-label">SAM</div><div class="funnel-bar sam">${sam}</div>
        <div class="funnel-label">SOM (3Y)</div><div class="funnel-bar som">${som}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-label">CAGR</div><div class="card-value" style="font-size:32px;margin-bottom:16px">${cagrTR}</div>
      <div class="card-label">Timing (${timingSkor}/4)</div>
      <div class="stars">${'★'.repeat(timingSkor)}${'☆'.repeat(4 - timingSkor)}</div>
      <div style="margin-top:12px;font-size:12px;color:#94a3b8">
        ${Object.entries(timing).filter(([k]) => k !== 'skor').map(([k, v]) => {
          const text = typeof v === 'object' ? ((v as any).aciklama || '') : String(v);
          return text && text !== '0' ? `<div style="margin-bottom:4px"><b style="color:#60a5fa">${esc(k)}:</b> ${esc(String(text).substring(0,60))}</div>` : '';
        }).join('')}
      </div>
    </div>
  </div>
</div>

<!-- BÖLÜM 3: SKORLAMA -->
<div class="section">
  <div class="section-title">🎯 ${t ? 'Skorlama' : 'Scoring'}</div>
  <div class="chart-card">
    <canvas id="skorChart" height="200"></canvas>
  </div>
  <div class="grid-2" style="margin-top:12px">
    <div class="card"><div class="card-label" style="color:#22c55e">${t ? 'Güçlü Yönler' : 'Strengths'}</div>${Array.isArray(guclu) ? guclu.slice(0,3).map((g: string) => `<div class="card-text">✅ ${esc(g)}</div>`).join('') : ''}</div>
    <div class="card"><div class="card-label" style="color:#f59e0b">${t ? 'Zayıf Yönler' : 'Weaknesses'}</div>${Array.isArray(zayif) ? zayif.slice(0,3).map((z: string) => `<div class="card-text">⚠️ ${esc(z)}</div>`).join('') : ''}</div>
  </div>
</div>

<!-- BÖLÜM 4: REKABET & SWOT -->
<div class="section">
  <div class="section-title">⚔️ ${t ? 'Rekabet' : 'Competition'} — Moat: ${moat}</div>
  <div class="grid-2">
    <div class="card" style="overflow-x:auto">
      <table>
        <tr><th>${t ? 'Şirket' : 'Company'}</th><th>${t ? 'Güçlü' : 'Strength'}</th><th>${t ? 'Tehdit' : 'Threat'}</th></tr>
        ${Array.isArray(rakipler) ? rakipler.slice(0, 5).map((r: any) => {
          const ad = esc(safeVal(r.ad || r.sirket));
          const g = esc(safeVal(r.guclu_yon || r.guclu || ''));
          const th = safeVal(r.tehdit || '');
          const tc = String(th).toLowerCase();
          const color = tc.includes('yüksek') || tc.includes('high') ? '#ef4444' : tc.includes('orta') || tc.includes('med') ? '#f59e0b' : '#22c55e';
          return `<tr><td>${ad}</td><td style="font-size:12px">${g.substring(0,40)}</td><td style="color:${color};font-weight:600">${esc(th)}</td></tr>`;
        }).join('') : '<tr><td colspan="3">—</td></tr>'}
      </table>
    </div>
    <div class="swot-grid">
      <div class="swot-cell swot-s"><h4>S</h4><ul>${swotS.slice(0,3).map((s: string) => `<li>• ${esc(s).substring(0,50)}</li>`).join('')}</ul></div>
      <div class="swot-cell swot-w"><h4>W</h4><ul>${swotW.slice(0,3).map((w: string) => `<li>• ${esc(w).substring(0,50)}</li>`).join('')}</ul></div>
      <div class="swot-cell swot-o"><h4>O</h4><ul>${swotO.slice(0,3).map((o: string) => `<li>• ${esc(o).substring(0,50)}</li>`).join('')}</ul></div>
      <div class="swot-cell swot-t"><h4>T</h4><ul>${swotT.slice(0,3).map((t2: string) => `<li>• ${esc(t2).substring(0,50)}</li>`).join('')}</ul></div>
    </div>
  </div>
</div>

<!-- BÖLÜM 5: FİNANSAL -->
<div class="section">
  <div class="section-title">💰 ${t ? 'Finansal Projeksiyon' : 'Financial Projections'}</div>
  <div class="grid-2">
    <div class="chart-card"><canvas id="arrChart" height="200"></canvas></div>
    <div class="chart-card"><canvas id="senaryoChart" height="200"></canvas></div>
  </div>
  <div class="grid-4" style="margin-top:12px">
    <div class="card"><div class="card-label">LTV:CAC</div><div class="card-value">${safeVal(birimEko.ltv_cac || birimEko.ltv_cac_oran || '—')}:1</div></div>
    <div class="card"><div class="card-label">Payback</div><div class="card-value">${safeVal(birimEko.payback_ay || birimEko.payback || '—')} ${t ? 'ay' : 'mo'}</div></div>
    <div class="card"><div class="card-label">${t ? 'Brüt Marj' : 'Gross Margin'}</div><div class="card-value">${fmtPct(parseNum(birimEko.brut_marj || 0))}</div></div>
    <div class="card"><div class="card-label">Break-even</div><div class="card-value">${breakeven} ${t ? 'ay' : 'mo'}</div></div>
  </div>
</div>

<!-- BÖLÜM 6: RİSK -->
<div class="section">
  <div class="section-title">⚠️ ${t ? 'Risk Değerlendirmesi' : 'Risk Assessment'}</div>
  ${killRisk ? `<div class="kill-risk"><div class="kill-risk-title">⚠️ Kill Risk</div><div class="card-text">${esc(typeof killRisk === 'object' ? (killRisk.aciklama || killRisk.desc || JSON.stringify(killRisk)) : String(killRisk))}</div></div>` : ''}
  <div class="card" style="overflow-x:auto">
    <table>
      <tr><th>#</th><th>${t ? 'Risk' : 'Risk'}</th><th>${t ? 'Kategori' : 'Category'}</th><th>${t ? 'Skor' : 'Score'}</th><th>${t ? 'Azaltma' : 'Mitigation'}</th></tr>
      ${topRisks.slice(0, 6).map((r: any, i: number) => {
        const skor = parseNum(r.skor || r.score || (parseNum(r.olasilik) * parseNum(r.etki)));
        const dotClass = skor <= 4 ? 'risk-green' : skor <= 9 ? 'risk-yellow' : skor <= 15 ? 'risk-orange' : 'risk-red';
        return `<tr><td>${i+1}</td><td>${esc(safeVal(r.risk || r.baslik || r.ad))}</td><td style="font-size:12px">${esc(safeVal(r.kategori || r.category || ''))}</td><td><span class="risk-dot ${dotClass}"></span>${skor}</td><td style="font-size:12px">${esc(safeVal(r.azaltma || r.mitigation || '')).substring(0,60)}</td></tr>`;
      }).join('')}
    </table>
  </div>
</div>

<!-- BÖLÜM 7: GTM -->
<div class="section">
  <div class="section-title">🚀 ${t ? 'Pazara Giriş Stratejisi' : 'Go-To-Market'}</div>
  <div class="grid-3">
    <div class="card"><div class="card-label">ICP</div><div class="card-text">${esc(safeVal(gtm.icp || '')).substring(0, 120)}</div></div>
    <div class="card"><div class="card-label">Beachhead</div><div class="card-text">${esc(safeVal(gtm.beachhead || '')).substring(0, 120)}</div></div>
    <div class="card"><div class="card-label">${t ? 'Büyüme Motoru' : 'Growth Engine'}</div><div class="card-value" style="font-size:16px">${esc(safeVal(gtm.buyume_motoru || ''))}</div></div>
  </div>
  ${kanallar.length > 0 ? `<div class="card" style="margin-top:12px;overflow-x:auto"><table><tr><th>${t ? 'Kanal' : 'Channel'}</th><th>CAC</th><th>${t ? 'Öncelik' : 'Priority'}</th></tr>${kanallar.slice(0, 5).map((k: any) => {
    const kanal = typeof k === 'string' ? k : safeVal(k.kanal || k.ad || k.channel);
    const cac = typeof k === 'object' ? safeVal(k.cac || k.tahmini_cac_usd) : '—';
    const onc = typeof k === 'object' ? safeVal(k.oncelik || k.priority) : '—';
    return `<tr><td>${esc(kanal)}</td><td>${esc(String(cac))}</td><td>${esc(onc)}</td></tr>`;
  }).join('')}</table></div>` : ''}
</div>

<!-- BÖLÜM 8: EXIT & FONLAMA -->
<div class="section">
  <div class="section-title">🏁 ${t ? 'Çıkış & Fonlama' : 'Exit & Funding'}</div>
  <div class="grid-3">
    ${exitData.slice(0, 3).map((e: any) => `<div class="exit-card"><div class="exit-rank">${esc(safeVal(e.sira || ''))}</div><div class="exit-value">${esc(safeVal(e.deger || e.value || ''))}</div><div class="exit-method">${esc(safeVal(e.yontem || e.method || ''))}</div><div style="font-size:12px;color:#94a3b8;margin-top:4px">${esc(safeVal(e.zaman || e.timeline || ''))}</div></div>`).join('')}
  </div>
  ${fonlama.length > 0 ? `<div class="card" style="margin-top:12px;overflow-x:auto"><table><tr><th>${t ? 'Tur' : 'Round'}</th><th>${t ? 'Tutar' : 'Amount'}</th><th>${t ? 'Dönem' : 'Timing'}</th><th>${t ? 'Kullanım' : 'Use'}</th></tr>${fonlama.map((f: any) => `<tr><td>${esc(safeVal(f.tur || f.round))}</td><td style="color:#3b82f6;font-weight:600">${esc(safeVal(f.tutar || f.amount))}</td><td>${esc(safeVal(f.donem || f.timing))}</td><td style="font-size:12px">${esc(safeVal(f.kullanim || f.use))}</td></tr>`).join('')}</table></div>` : ''}
  ${useOfFunds && (useOfFunds.urun_pct || useOfFunds.pazarlama_pct) ? `<div class="grid-4" style="margin-top:12px">${[{l:t?'Ürün':'Product',p:useOfFunds.urun_pct},{l:t?'Pazarlama':'Marketing',p:useOfFunds.pazarlama_pct},{l:t?'Ekip':'Team',p:useOfFunds.ekip_pct},{l:'G&A',p:useOfFunds.genel_pct}].filter(x=>x.p).map(x=>`<div class="card"><div class="card-label">${x.l}</div><div class="card-value">${x.p}%</div></div>`).join('')}</div>` : ''}
</div>

<!-- BÖLÜM 9: İLK 30 GÜN -->
<div class="section">
  <div class="section-title">📅 ${t ? 'İlk 30 Gün Aksiyonları' : 'First 30 Days'}</div>
  ${ilk30.slice(0, 5).map((a: any, i: number) => {
    const text = typeof a === 'object' ? (a.aksiyon || a.text || '') : String(a);
    return `<div class="timeline-item"><div class="timeline-num">${i + 1}</div><div class="timeline-text">${esc(text)}</div></div>`;
  }).join('')}
</div>

<!-- FOOTER -->
<div class="footer">
  Ideactory.ai v6.2 — ${t ? 'Bu analiz yapay zeka tarafından üretilmiştir.' : 'This analysis was generated by AI.'}<br>
  ${tarih}
</div>

</div>

<script>
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';

// Skor horizontal bar chart
new Chart(document.getElementById('skorChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(boyutLabels)},
    datasets: [{
      data: ${JSON.stringify(boyutPuanlar)},
      backgroundColor: ${JSON.stringify(boyutPuanlar.map((p: number) => p >= 70 ? 'rgba(34,197,94,0.6)' : p >= 50 ? 'rgba(245,158,11,0.6)' : 'rgba(239,68,68,0.6)'))},
      borderRadius: 4,
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { max: 100, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { grid: { display: false } } }
  }
});

// ARR 5-year line chart
${arrData.length > 0 ? `new Chart(document.getElementById('arrChart'), {
  type: 'line',
  data: {
    labels: ${JSON.stringify(projArr.map((_: any, i: number) => `${t ? 'Yıl' : 'Y'} ${i + 1}`))},
    datasets: [
      { label: 'ARR', data: ${JSON.stringify(arrData)}, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.3 },
      { label: 'EBITDA', data: ${JSON.stringify(ebitdaData)}, borderColor: '#22c55e', backgroundColor: 'transparent', borderDash: [5,3], tension: 0.3 }
    ]
  },
  options: {
    responsive: true,
    plugins: { title: { display: true, text: '${t ? '5 Yıllık Projeksiyon' : '5-Year Projection'}', color: '#e2e8f0' } },
    scales: { y: { grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { display: false } } }
  }
});` : ''}

// Senaryo bar chart
${senaryoArr3.some(v => v > 0) ? `new Chart(document.getElementById('senaryoChart'), {
  type: 'bar',
  data: {
    labels: ['${t ? 'Kötümser' : 'Bear'}', '${t ? 'Baz' : 'Base'}', '${t ? 'İyimser' : 'Bull'}'],
    datasets: [{
      label: 'ARR ${t ? 'Yıl 3' : 'Year 3'}',
      data: ${JSON.stringify(senaryoArr3)},
      backgroundColor: ['rgba(239,68,68,0.5)', 'rgba(59,130,246,0.5)', 'rgba(34,197,94,0.5)'],
      borderRadius: 6,
    }]
  },
  options: {
    responsive: true,
    plugins: { title: { display: true, text: '${t ? 'Senaryo Analizi (ARR Yıl 3)' : 'Scenario Analysis (ARR Y3)'}', color: '#e2e8f0' }, legend: { display: false } },
    scales: { y: { grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { display: false } } }
  }
});` : ''}
</script>
</body>
</html>`;

  return Buffer.from(html, 'utf-8');
}

function normalizeProj(proj: any): any[] {
  if (Array.isArray(proj)) return proj;
  if (typeof proj === 'object' && proj !== null) {
    return Object.entries(proj).map(([key, val]: [string, any]) => ({
      yil: parseInt(key) || 0,
      ...(typeof val === 'object' ? val : { arr: val }),
    }));
  }
  return [];
}
