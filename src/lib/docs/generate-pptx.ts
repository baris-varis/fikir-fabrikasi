// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Pitch Deck Sunum Generator (.pptx)
// ═══════════════════════════════════════════════════════════

// @ts-ignore — pptxgenjs types may not match runtime
import pptxgen from 'pptxgenjs';
import { get, safeVal, fmtMoney, fmtPct, fmtDual } from './styles';

// pptxgenjs shapes accessor (workaround for TS type mismatch)
const getShapes = (p: any) => p.shapes;

// Renk paleti (# olmadan)
const NAVY = '1E3A5F';
const ACCENT = '2563EB';
const WHITE = 'FFFFFF';
const LIGHT = 'F8FAFC';
const TEXT_COLOR = '1F2937';
const MUTED = '94A3B8';
const SUCCESS = '16A34A';
const WARN = 'D97706';
const DANGER = 'DC2626';

export async function generatePitchPptx(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const lang = langOverride || get(state, 'meta.dil', 'tr');
  const isTR = lang === 'tr';
  const kur = get(state, 'meta.usd_try_kur', 34);
  const fikir = get(state, 'meta.fikir_adi', 'Startup');
  const kapsam = get(state, 'meta.kapsam', 'Yerel');

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Ideactory.ai';
  pres.title = `${fikir} - Pitch Deck`;

  // ── Slide helpers ───────────────────────────────

  function addTitleBar(slide: pptxgen.Slide, title: string) {
    slide.addShape(getShapes(pres).RECTANGLE, { x: 0, y: 0, w: 10, h: 0.7, fill: { color: NAVY } });
    slide.addText(title, { x: 0.4, y: 0.1, w: 9.2, h: 0.5, fontSize: 20, fontFace: 'Calibri', color: WHITE, bold: true });
  }

  function addFooter(slide: pptxgen.Slide) {
    slide.addShape(getShapes(pres).RECTANGLE, { x: 0, y: 5.3, w: 10, h: 0.325, fill: { color: 'E2E8F0' } });
    slide.addText(
      isTR ? 'Gizli \u2014 Yaln\u0131zca yat\u0131r\u0131mc\u0131 de\u011Ferlendirmesi' : 'Confidential \u2014 Investor evaluation only',
      { x: 0.3, y: 5.33, w: 5, h: 0.25, fontSize: 8, fontFace: 'Calibri', color: MUTED }
    );
  }

  function contentSlide(title: string): pptxgen.Slide {
    const s = pres.addSlide();
    s.background = { fill: WHITE };
    addTitleBar(s, title);
    addFooter(s);
    return s;
  }

  // ── 1. KAPAK ────────────────────────────────────
  const s1 = pres.addSlide();
  s1.background = { fill: NAVY };
  s1.addText(fikir.toUpperCase(), { x: 0.5, y: 1.5, w: 9, h: 1.2, fontSize: 44, fontFace: 'Calibri', color: WHITE, bold: true, align: 'center' });
  s1.addText(get(state, 'meta.sektor', ''), { x: 0.5, y: 2.7, w: 9, h: 0.5, fontSize: 18, fontFace: 'Calibri', color: ACCENT, align: 'center' });
  const uvp = get(state, 'B_rekabet.uvp', get(state, 'A_pazar.cozum', ''));
  s1.addText(`"${uvp}"`, { x: 1, y: 3.5, w: 8, h: 0.8, fontSize: 16, fontFace: 'Calibri', color: 'B0C4DE', italic: true, align: 'center' });
  s1.addText(fikir, { x: 0.3, y: 5.0, w: 5, h: 0.3, fontSize: 9, fontFace: 'Calibri', color: MUTED });
  s1.addNotes(isTR ? '\u0130lk 10 saniyede yat\u0131r\u0131mc\u0131y\u0131 yakala. UVP\'yi g\u00FC\u00E7l\u00FC oku.' : 'Hook investor in 10 seconds. Read UVP with conviction.');

  // ── 2. PROBLEM ──────────────────────────────────
  const s2 = contentSlide(isTR ? 'PROBLEM' : 'THE PROBLEM');
  s2.addText(truncate(get(state, 'A_pazar.problem', ''), 300), { x: 0.5, y: 1.2, w: 9, h: 2, fontSize: 16, fontFace: 'Calibri', color: TEXT_COLOR, lineSpacingMultiple: 1.4 });
  s2.addText(`${isTR ? 'Hedef' : 'Target'}: ${truncate(get(state, 'A_pazar.hedef_kitle', ''), 100)}`, { x: 0.5, y: 3.5, w: 9, h: 0.6, fontSize: 14, fontFace: 'Calibri', color: ACCENT, bold: true });
  s2.addNotes(isTR ? 'Empati kur. "Bu sorunu ya\u015F\u0131yor musunuz?"' : 'Build empathy. "Have you experienced this?"');

  // ── 3. ÇÖZÜM ───────────────────────────────────
  const s3 = contentSlide(isTR ? '\u00C7\u00D6Z\u00DCM' : 'THE SOLUTION');
  s3.addText(truncate(get(state, 'A_pazar.cozum', ''), 300), { x: 0.5, y: 1.2, w: 9, h: 2.5, fontSize: 16, fontFace: 'Calibri', color: TEXT_COLOR, lineSpacingMultiple: 1.4 });
  s3.addNotes(isTR ? 'Basit tut, teknik detaya girme.' : 'Keep it simple, avoid technical details.');

  // ── 4. NEDEN ŞİMDİ ─────────────────────────────
  const s4 = contentSlide(isTR ? 'NEDEN \u015E\u0130MD\u0130' : 'WHY NOW');
  const timing = get(state, 'A_pazar.timing', {});
  const timingBullets: { text: string; options: any }[] = [];
  for (const [key, val] of Object.entries(timing)) {
    const text = typeof val === 'object' ? ((val as any).aciklama || (val as any).desc || '') : String(val);
    if (text) timingBullets.push({ text: `${key}: ${truncate(text, 80)}`, options: { bullet: true, breakLine: true, fontSize: 14, fontFace: 'Calibri', color: TEXT_COLOR } });
  }
  if (timingBullets.length > 0) s4.addText(timingBullets.slice(0, 4), { x: 0.5, y: 1.2, w: 9, h: 3 });
  s4.addNotes(isTR ? 'Urgency yarat.' : 'Create urgency.');

  // ── 5. PAZAR FIRSATI ────────────────────────────
  const s5 = contentSlide(isTR ? 'PAZAR FIRSATI' : 'MARKET OPPORTUNITY');
  const tam = get(state, 'A_pazar.tam', 0);
  const sam = get(state, 'A_pazar.sam', 0);
  const som = get(state, 'A_pazar.som_3yil', 0);
  const cagr = get(state, 'A_pazar.cagr_tr', 0);

  // Mini metric cards
  const metrics = [
    { label: 'TAM', val: `$${tam}M`, x: 0.5 },
    { label: 'SAM', val: `$${sam}M`, x: 2.9 },
    { label: 'SOM (3Y)', val: `$${som}M`, x: 5.3 },
    { label: 'CAGR', val: fmtPct(cagr), x: 7.7 },
  ];
  metrics.forEach(m => {
    s5.addShape(getShapes(pres).ROUNDED_RECTANGLE, { x: m.x, y: 1.5, w: 2.1, h: 1.5, fill: { color: LIGHT }, rectRadius: 0.1 });
    s5.addText(m.label, { x: m.x, y: 1.6, w: 2.1, h: 0.4, fontSize: 11, fontFace: 'Calibri', color: MUTED, align: 'center' });
    s5.addText(m.val, { x: m.x, y: 2.0, w: 2.1, h: 0.8, fontSize: 28, fontFace: 'Calibri', color: ACCENT, bold: true, align: 'center' });
  });
  s5.addNotes(isTR ? 'Huni g\u00F6rseli \u2014 "Nereyi hedefliyoruz?"' : 'Funnel visual \u2014 "Where we target"');

  // ── 6. İŞ MODELİ ───────────────────────────────
  const s6 = contentSlide(isTR ? '\u0130\u015E MODEL\u0130' : 'BUSINESS MODEL');
  s6.addText(`Model: ${safeVal(get(state, 'C_strateji.is_modeli.tip'))}`, { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 18, fontFace: 'Calibri', color: NAVY, bold: true });

  // Fiyatlama tablosu
  const fiyatlar = get(state, 'C_strateji.is_modeli.fiyatlar', get(state, 'C_strateji.gtm.fiyatlama', {}));
  if (fiyatlar && typeof fiyatlar === 'object') {
    const pricingRows: { text: string; options: any }[] = [];
    Object.entries(fiyatlar)
      .filter(([k]) => !['tip', 'model', 'taksit'].includes(k))
      .slice(0, 4)
      .forEach(([name, val]) => {
        const price = typeof val === 'object' ? ((val as any).fiyat || (val as any).price || '') : val;
        pricingRows.push({ text: `${name}: ${fmtDual(price as any, kur)}/mo`, options: { bullet: true, breakLine: true, fontSize: 14, fontFace: 'Calibri', color: TEXT_COLOR } });
      });
    if (pricingRows.length > 0) s6.addText(pricingRows, { x: 0.5, y: 2.0, w: 9, h: 2 });
  }

  // Birim ekonomisi
  const birimEko = get(state, 'C_strateji.birim_ekonomisi', {});
  s6.addText(`LTV:CAC = ${safeVal(birimEko.ltv_cac_oran)}:1 | Payback: ${safeVal(birimEko.payback)} mo`, { x: 0.5, y: 4.2, w: 9, h: 0.5, fontSize: 14, fontFace: 'Calibri', color: ACCENT, bold: true });

  // ── 7. REKABET ──────────────────────────────────
  const s7 = contentSlide(isTR ? 'REKABET' : 'COMPETITION');
  s7.addText(`Moat: ${safeVal(get(state, 'B_rekabet.moat_tipi'))}`, { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 18, fontFace: 'Calibri', color: NAVY, bold: true });

  const rakipler = get(state, 'B_rekabet.dogrudan_rakipler', []);
  if (Array.isArray(rakipler) && rakipler.length > 0) {
    const rows: pptxgen.TableRow[] = [
      [
        { text: isTR ? '\u015Eirket' : 'Company', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10 } },
        { text: isTR ? 'G\u00FC\u00E7l\u00FC' : 'Strength', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10 } },
        { text: isTR ? 'Zay\u0131f' : 'Weakness', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10 } },
      ],
    ];
    rakipler.slice(0, 4).forEach((r: any) => {
      rows.push([
        { text: safeVal(r.ad || r.sirket), options: { fontSize: 10, color: TEXT_COLOR } },
        { text: truncate(safeVal(r.guclu_yon || r.guclu), 50), options: { fontSize: 10, color: TEXT_COLOR } },
        { text: truncate(safeVal(r.zayif_yon || r.zayif), 50), options: { fontSize: 10, color: TEXT_COLOR } },
      ]);
    });
    s7.addTable(rows, { x: 0.5, y: 2.0, w: 9, colW: [2.5, 3.25, 3.25], border: { pt: 0.5, color: 'CBD5E1' }, rowH: 0.4 });
  }

  // ── 8. FİNANSAL ────────────────────────────────
  const s8 = contentSlide(isTR ? 'F\u0130NANSAL PROJEKS\u0130YON' : 'FINANCIAL PROJECTIONS');
  const projYillik = get(state, 'D_final.finansal.projeksiyon_yillik', []);
  const projArr = normalizeProjectionArray(projYillik);
  if (projArr.length > 0) {
    const finRows: pptxgen.TableRow[] = [
      [
        { text: '', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10 } },
        ...projArr.map((p: any) => ({ text: `${isTR ? 'Y\u0131l' : 'Y'} ${p.yil}`, options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10, align: 'center' as const } })),
      ],
    ];

    const metricKeys = [
      { key: 'musteri', label: isTR ? 'M\u00FC\u015Fteri' : 'Customers', fmt: false },
      { key: 'arr', label: 'ARR', fmt: true },
      { key: 'ebitda', label: 'EBITDA', fmt: true },
    ];
    metricKeys.forEach(mk => {
      finRows.push([
        { text: mk.label, options: { bold: true, fontSize: 10, color: TEXT_COLOR } },
        ...projArr.map((p: any) => {
          const val = p[mk.key] || p[mk.key + '_usd'] || 0;
          return { text: mk.fmt ? fmtMoney(parseNum(val)) : safeVal(val), options: { fontSize: 10, color: TEXT_COLOR, align: 'right' as const } };
        }),
      ]);
    });
    const colW = [1.5, ...projArr.map(() => (9 - 1.5) / projArr.length)];
    s8.addTable(finRows, { x: 0.5, y: 1.2, w: 9, colW, border: { pt: 0.5, color: 'CBD5E1' }, rowH: 0.4 });
  }

  const breakeven = get(state, 'D_final.finansal.breakeven_ay', 0);
  s8.addText(`Break-even: ${breakeven} ${isTR ? 'ay' : 'months'}`, { x: 0.5, y: 4.5, w: 9, h: 0.4, fontSize: 14, fontFace: 'Calibri', color: SUCCESS, bold: true });

  // ── 9. THE ASK ──────────────────────────────────
  const s9 = contentSlide(isTR ? 'YATIRIM TALEB\u0130' : 'THE ASK');
  const fonlama = get(state, 'D_final.finansal.fonlama', []);
  const f0 = Array.isArray(fonlama) ? fonlama[0] : fonlama;
  if (f0) {
    s9.addShape(getShapes(pres).ROUNDED_RECTANGLE, { x: 1.5, y: 1.2, w: 7, h: 1.5, fill: { color: LIGHT }, line: { color: ACCENT, width: 2 }, rectRadius: 0.15 });
    s9.addText(`${safeVal(f0.tutar)} ${safeVal(f0.tur)}`, { x: 1.5, y: 1.3, w: 7, h: 0.7, fontSize: 28, fontFace: 'Calibri', color: NAVY, bold: true, align: 'center' });
    s9.addText(safeVal(f0.kullanim), { x: 1.5, y: 2.0, w: 7, h: 0.5, fontSize: 14, fontFace: 'Calibri', color: TEXT_COLOR, align: 'center' });
  }

  // Use of Funds
  const uof = get(state, 'D_final.finansal.use_of_funds', {});
  if (uof && (uof.urun_pct || uof.pazarlama_pct)) {
    const uofData = [
      { label: isTR ? '\u00DCr\u00FCn' : 'Product', pct: uof.urun_pct || 0, color: ACCENT },
      { label: isTR ? 'Pazarlama' : 'Marketing', pct: uof.pazarlama_pct || 0, color: SUCCESS },
      { label: isTR ? 'Ekip' : 'Team', pct: uof.ekip_pct || 0, color: WARN },
      { label: 'G&A', pct: uof.genel_pct || 0, color: MUTED },
    ];
    let xPos = 1;
    uofData.forEach(d => {
      if (d.pct > 0) {
        s9.addShape(getShapes(pres).ROUNDED_RECTANGLE, { x: xPos, y: 3.2, w: 1.8, h: 1.5, fill: { color: LIGHT }, rectRadius: 0.1 });
        s9.addText(`${d.pct}%`, { x: xPos, y: 3.3, w: 1.8, h: 0.7, fontSize: 24, fontFace: 'Calibri', color: d.color, bold: true, align: 'center' });
        s9.addText(d.label, { x: xPos, y: 4.0, w: 1.8, h: 0.4, fontSize: 10, fontFace: 'Calibri', color: MUTED, align: 'center' });
        xPos += 2.1;
      }
    });
  }

  // Milestones
  const milestones = get(state, 'D_final.basari_faktorleri', []);
  if (milestones.length > 0) {
    const msBullets = milestones.slice(0, 3).map((m: string) => ({ text: `\u2192 ${m}`, options: { breakLine: true, fontSize: 12, fontFace: 'Calibri', color: TEXT_COLOR } }));
    s9.addText(msBullets, { x: 0.5, y: 4.8, w: 9, h: 0.4 });
  }

  // ── 10. KAPANIŞ ─────────────────────────────────
  const s10 = pres.addSlide();
  s10.background = { fill: NAVY };
  s10.addText(isTR ? 'Birlikte B\u00FCy\u00FCyelim' : "Let's Grow Together", { x: 0.5, y: 1.5, w: 9, h: 1, fontSize: 36, fontFace: 'Calibri', color: WHITE, bold: true, align: 'center' });
  s10.addText(uvp, { x: 1, y: 3, w: 8, h: 0.8, fontSize: 16, fontFace: 'Calibri', color: 'B0C4DE', italic: true, align: 'center' });
  s10.addText(isTR ? 'Demo g\u00F6rmek ister misiniz?' : 'Want to see a demo?', { x: 1, y: 4.2, w: 8, h: 0.5, fontSize: 18, fontFace: 'Calibri', color: ACCENT, bold: true, align: 'center' });

  // ── Buffer olarak döndür ────────────────────────
  const data = await pres.write({ outputType: 'nodebuffer' });
  return Buffer.from(data as ArrayBuffer);
}

// ── Helpers ───────────────────────────────────────

function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.substring(0, max) + '...' : text;
}

function normalizeProjectionArray(proj: any): any[] {
  if (Array.isArray(proj)) return proj;
  if (typeof proj === 'object' && proj !== null) {
    return Object.entries(proj).map(([key, val]: [string, any]) => ({
      yil: parseInt(key) || 0,
      ...(typeof val === 'object' ? val : { arr: val }),
    }));
  }
  return [];
}

function parseNum(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.-]/g, '')) || 0;
  return 0;
}
