// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Pitch Deck Sunum Generator (.pptx)
// 14 slide + appendix — KB spec compliant
// ═══════════════════════════════════════════════════════════

// @ts-ignore — pptxgenjs types may not match runtime
import pptxgen from 'pptxgenjs';
import { get, safeVal, fmtMoney, fmtPct, fmtDual } from './styles';

const getShapes = (p: any) => p.shapes;

// Renk paleti
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
      isTR ? 'Gizli — Yalnızca yatırımcı değerlendirmesi' : 'Confidential — Investor evaluation only',
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

  function bulletSlide(title: string, items: string[], notes?: string): pptxgen.Slide {
    const s = contentSlide(title);
    const bullets = items.filter(Boolean).slice(0, 6).map(t => ({
      text: trunc(t, 120), options: { bullet: true, breakLine: true, fontSize: 14, fontFace: 'Calibri', color: TEXT_COLOR, lineSpacingMultiple: 1.4 }
    }));
    if (bullets.length > 0) s.addText(bullets, { x: 0.5, y: 1.2, w: 9, h: 3.5 });
    if (notes) s.addNotes(notes);
    return s;
  }

  const uvp = get(state, 'B_rekabet.uvp', get(state, 'A_pazar.cozum', ''));

  // ══════════════════════════════════════════════════
  // SLIDE 1: KAPAK
  // ══════════════════════════════════════════════════
  const s1 = pres.addSlide();
  s1.background = { fill: NAVY };
  s1.addText(fikir.toUpperCase(), { x: 0.5, y: 1.5, w: 9, h: 1.2, fontSize: 44, fontFace: 'Calibri', color: WHITE, bold: true, align: 'center' });
  s1.addText(get(state, 'meta.sektor', ''), { x: 0.5, y: 2.7, w: 9, h: 0.5, fontSize: 18, fontFace: 'Calibri', color: ACCENT, align: 'center' });
  s1.addText(`"${trunc(uvp, 120)}"`, { x: 1, y: 3.5, w: 8, h: 0.8, fontSize: 16, fontFace: 'Calibri', color: 'B0C4DE', italic: true, align: 'center' });
  s1.addText(fikir, { x: 0.3, y: 5.0, w: 5, h: 0.3, fontSize: 9, fontFace: 'Calibri', color: MUTED });
  s1.addNotes(isTR ? 'İlk 10 saniyede yatırımcıyı yakala. UVP\'yi güçlü oku.' : 'Hook investor in 10 seconds.');

  // ══════════════════════════════════════════════════
  // SLIDE 2: PROBLEM
  // ══════════════════════════════════════════════════
  const s2 = contentSlide(isTR ? 'PROBLEM' : 'THE PROBLEM');
  s2.addText(trunc(get(state, 'A_pazar.problem', ''), 300), { x: 0.5, y: 1.2, w: 9, h: 2, fontSize: 16, fontFace: 'Calibri', color: TEXT_COLOR, lineSpacingMultiple: 1.4 });
  s2.addText(`${isTR ? 'Hedef' : 'Target'}: ${trunc(get(state, 'A_pazar.hedef_kitle', ''), 100)}`, { x: 0.5, y: 3.5, w: 9, h: 0.6, fontSize: 14, fontFace: 'Calibri', color: ACCENT, bold: true });
  s2.addNotes(isTR ? 'Empati kur. "Bu sorunu yaşıyor musunuz?"' : 'Build empathy.');

  // ══════════════════════════════════════════════════
  // SLIDE 3: ÇÖZÜM
  // ══════════════════════════════════════════════════
  const s3 = contentSlide(isTR ? 'ÇÖZÜM' : 'THE SOLUTION');
  s3.addText(trunc(get(state, 'A_pazar.cozum', ''), 300), { x: 0.5, y: 1.2, w: 9, h: 2.5, fontSize: 16, fontFace: 'Calibri', color: TEXT_COLOR, lineSpacingMultiple: 1.4 });
  s3.addNotes(isTR ? 'Basit tut, teknik detaya girme.' : 'Keep it simple.');

  // ══════════════════════════════════════════════════
  // SLIDE 4: DEMO / ÜRÜN (YENİ)
  // ══════════════════════════════════════════════════
  const s4 = contentSlide(isTR ? 'ÜRÜN' : 'PRODUCT');
  const leanCanvas = get(state, 'A_pazar.lean_canvas', {});
  const cozumler = leanCanvas.cozumler || [];
  const cozumItems = Array.isArray(cozumler) ? cozumler : [String(cozumler)];
  const productBullets = cozumItems.filter(Boolean).slice(0, 4).map((t: string) => ({
    text: trunc(t, 100), options: { bullet: true, breakLine: true, fontSize: 14, fontFace: 'Calibri', color: TEXT_COLOR, lineSpacingMultiple: 1.4 }
  }));
  if (productBullets.length > 0) {
    s4.addText(productBullets, { x: 0.5, y: 1.2, w: 9, h: 2.5 });
  } else {
    s4.addText(trunc(get(state, 'A_pazar.cozum', isTR ? 'Ürün detayları eklenecek' : 'Product details to be added'), 300),
      { x: 0.5, y: 1.2, w: 9, h: 2.5, fontSize: 16, fontFace: 'Calibri', color: TEXT_COLOR, lineSpacingMultiple: 1.4 });
  }
  s4.addText(isTR ? '📸 Ekran görüntüleri / demo videosu ekleyin' : '📸 Add screenshots / demo video',
    { x: 0.5, y: 4.2, w: 9, h: 0.4, fontSize: 12, fontFace: 'Calibri', color: MUTED, italic: true });
  s4.addNotes(isTR ? 'Demo veya mockup göster. "Sizinle paylaşmak istediğim..." ile gir.' : 'Show demo or mockup.');

  // ══════════════════════════════════════════════════
  // SLIDE 5: NEDEN ŞİMDİ
  // ══════════════════════════════════════════════════
  const s5 = contentSlide(isTR ? 'NEDEN ŞİMDİ' : 'WHY NOW');
  const timing = get(state, 'A_pazar.timing', {});
  const timingBullets: { text: string; options: any }[] = [];
  for (const [key, val] of Object.entries(timing)) {
    if (key === 'skor') continue;
    const text = typeof val === 'object' ? ((val as any).aciklama || (val as any).desc || '') : String(val);
    if (text && text !== '0') timingBullets.push({ text: `${key}: ${trunc(text, 80)}`, options: { bullet: true, breakLine: true, fontSize: 14, fontFace: 'Calibri', color: TEXT_COLOR } });
  }
  if (timingBullets.length > 0) s5.addText(timingBullets.slice(0, 4), { x: 0.5, y: 1.2, w: 9, h: 3 });
  s5.addNotes(isTR ? 'Urgency yarat.' : 'Create urgency.');

  // ══════════════════════════════════════════════════
  // SLIDE 6: PAZAR FIRSATI
  // ══════════════════════════════════════════════════
  const s6 = contentSlide(isTR ? 'PAZAR FIRSATI' : 'MARKET OPPORTUNITY');
  const tam = get(state, 'A_pazar.tam_tr', get(state, 'A_pazar.tam', 0));
  const sam = get(state, 'A_pazar.sam', 0);
  const som = get(state, 'A_pazar.som_3yil', 0);
  const cagr = get(state, 'A_pazar.cagr_tr', 0);

  const metrics = [
    { label: 'TAM', val: fmtMarketVal(tam), x: 0.5 },
    { label: 'SAM', val: fmtMarketVal(sam), x: 2.9 },
    { label: 'SOM (3Y)', val: fmtMarketVal(som), x: 5.3 },
    { label: 'CAGR', val: fmtPct(parseNum(cagr)), x: 7.7 },
  ];
  metrics.forEach(m => {
    s6.addShape(getShapes(pres).ROUNDED_RECTANGLE, { x: m.x, y: 1.5, w: 2.1, h: 1.5, fill: { color: LIGHT }, rectRadius: 0.1 });
    s6.addText(m.label, { x: m.x, y: 1.6, w: 2.1, h: 0.4, fontSize: 11, fontFace: 'Calibri', color: MUTED, align: 'center' });
    s6.addText(m.val, { x: m.x, y: 2.0, w: 2.1, h: 0.8, fontSize: 28, fontFace: 'Calibri', color: ACCENT, bold: true, align: 'center' });
  });
  s6.addNotes(isTR ? 'Huni görseli — "Nereyi hedefliyoruz?"' : 'Funnel — "Where we target"');

  // ══════════════════════════════════════════════════
  // SLIDE 7: TRACTION / VALİDASYON (YENİ)
  // ══════════════════════════════════════════════════
  const s7 = contentSlide(isTR ? 'TRACTION & VALİDASYON' : 'TRACTION & VALIDATION');
  const tractionItems: string[] = [];
  // İlk 30 gün aksiyonlarını traction olarak kullan
  const ilk30 = get(state, 'D_final.ilk_30_gun', []);
  if (Array.isArray(ilk30)) {
    ilk30.slice(0, 3).forEach((a: any) => {
      const text = typeof a === 'object' ? (a.aksiyon || a.text || '') : String(a);
      if (text) tractionItems.push(text);
    });
  }
  // Başarı faktörleri
  const basari = get(state, 'D_final.basari_faktorleri', []);
  if (Array.isArray(basari)) basari.slice(0, 3).forEach((b: string) => { if (b) tractionItems.push(b); });

  if (tractionItems.length > 0) {
    const trBullets = tractionItems.slice(0, 5).map(t => ({
      text: trunc(t, 100), options: { bullet: true, breakLine: true, fontSize: 14, fontFace: 'Calibri', color: TEXT_COLOR, lineSpacingMultiple: 1.4 }
    }));
    s7.addText(trBullets, { x: 0.5, y: 1.2, w: 9, h: 3 });
  } else {
    s7.addText(isTR ? 'Pre-launch aşamasında — validasyon planı hazır' : 'Pre-launch stage — validation plan ready',
      { x: 0.5, y: 2.0, w: 9, h: 1, fontSize: 18, fontFace: 'Calibri', color: MUTED, align: 'center' });
  }
  s7.addNotes(isTR ? 'Varsa metrik göster, yoksa validasyon planını anlat.' : 'Show metrics if available, otherwise validation plan.');

  // ══════════════════════════════════════════════════
  // SLIDE 8: İŞ MODELİ
  // ══════════════════════════════════════════════════
  const s8 = contentSlide(isTR ? 'İŞ MODELİ' : 'BUSINESS MODEL');
  s8.addText(`Model: ${safeVal(get(state, 'C_strateji.is_modeli.tip', get(state, 'A_pazar.is_modeli_ozet', '')))}`,
    { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 18, fontFace: 'Calibri', color: NAVY, bold: true });

  const fiyatlar = get(state, 'C_strateji.is_modeli.fiyatlar', get(state, 'C_strateji.gtm.fiyatlama', {}));
  if (fiyatlar && typeof fiyatlar === 'object') {
    const pricingRows: { text: string; options: any }[] = [];
    const entries = Array.isArray(fiyatlar) ? fiyatlar : Object.entries(fiyatlar).filter(([k]) => !['tip', 'model', 'taksit'].includes(k));
    (Array.isArray(fiyatlar) ? fiyatlar : entries).slice(0, 4).forEach((item: any) => {
      const name = Array.isArray(fiyatlar) ? (item.katman || item.name || '') : item[0];
      const val = Array.isArray(fiyatlar) ? (item.fiyat_usd || item.fiyat || item.price || '') : (typeof item[1] === 'object' ? (item[1].fiyat || item[1].price || '') : item[1]);
      pricingRows.push({ text: `${name}: ${fmtDual(val as any, kur)}/mo`, options: { bullet: true, breakLine: true, fontSize: 14, fontFace: 'Calibri', color: TEXT_COLOR } });
    });
    if (pricingRows.length > 0) s8.addText(pricingRows, { x: 0.5, y: 2.0, w: 9, h: 2 });
  }

  const birimEko = get(state, 'C_strateji.birim_ekonomisi', {});
  const ltvCac = safeVal(birimEko.ltv_cac || birimEko.ltv_cac_oran);
  const payback = safeVal(birimEko.payback_ay || birimEko.payback);
  s8.addText(`LTV:CAC = ${ltvCac}:1 | Payback: ${payback} mo`,
    { x: 0.5, y: 4.2, w: 9, h: 0.5, fontSize: 14, fontFace: 'Calibri', color: ACCENT, bold: true });

  // ══════════════════════════════════════════════════
  // SLIDE 9: REKABET
  // ══════════════════════════════════════════════════
  const s9 = contentSlide(isTR ? 'REKABET' : 'COMPETITION');
  s9.addText(`Moat: ${safeVal(get(state, 'B_rekabet.moat_tipi'))}`,
    { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 18, fontFace: 'Calibri', color: NAVY, bold: true });

  const rakipler = get(state, 'B_rekabet.rakipler', get(state, 'B_rekabet.dogrudan_rakipler', []));
  if (Array.isArray(rakipler) && rakipler.length > 0) {
    const rows: pptxgen.TableRow[] = [
      [
        { text: isTR ? 'Şirket' : 'Company', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10 } },
        { text: isTR ? 'Güçlü' : 'Strength', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10 } },
        { text: isTR ? 'Zayıf' : 'Weakness', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10 } },
        { text: isTR ? 'Tehdit' : 'Threat', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10 } },
      ],
    ];
    rakipler.slice(0, 4).forEach((r: any) => {
      rows.push([
        { text: safeVal(r.ad || r.sirket), options: { fontSize: 10, color: TEXT_COLOR } },
        { text: trunc(safeVal(r.guclu_yon || r.guclu), 40), options: { fontSize: 10, color: TEXT_COLOR } },
        { text: trunc(safeVal(r.zayif_yon || r.zayif), 40), options: { fontSize: 10, color: TEXT_COLOR } },
        { text: safeVal(r.tehdit), options: { fontSize: 10, color: TEXT_COLOR } },
      ]);
    });
    s9.addTable(rows, { x: 0.5, y: 2.0, w: 9, colW: [2.2, 2.8, 2.8, 1.2], border: { pt: 0.5, color: 'CBD5E1' }, rowH: 0.4 });
  }
  s9.addNotes(isTR ? '2×2 matris göster. "Biz sağ üstteyiz."' : 'Show 2×2 matrix. "We are top right."');

  // ══════════════════════════════════════════════════
  // SLIDE 10: GTM STRATEJİSİ
  // ══════════════════════════════════════════════════
  const s10 = contentSlide(isTR ? 'GTM STRATEJİSİ' : 'GO-TO-MARKET');
  const gtm = get(state, 'C_strateji.gtm', {});
  s10.addText(`${isTR ? 'Büyüme Motoru' : 'Growth Engine'}: ${safeVal(gtm.buyume_motoru)}`,
    { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 16, fontFace: 'Calibri', color: NAVY, bold: true });
  s10.addText(`Beachhead: ${trunc(safeVal(gtm.beachhead), 100)}`,
    { x: 0.5, y: 1.8, w: 9, h: 0.5, fontSize: 14, fontFace: 'Calibri', color: TEXT_COLOR });

  const kanallar = gtm.kanallar || [];
  if (Array.isArray(kanallar) && kanallar.length > 0) {
    const kRows: pptxgen.TableRow[] = [
      [
        { text: isTR ? 'Kanal' : 'Channel', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10 } },
        { text: 'CAC ($)', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10 } },
        { text: isTR ? 'Öncelik' : 'Priority', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10 } },
      ],
    ];
    kanallar.slice(0, 4).forEach((k: any) => {
      const kanal = typeof k === 'string' ? k : safeVal(k.kanal || k.ad || k.channel);
      const cac = typeof k === 'object' ? safeVal(k.cac || k.tahmini_cac_usd) : '—';
      const onc = typeof k === 'object' ? safeVal(k.oncelik || k.priority) : '—';
      kRows.push([
        { text: kanal, options: { fontSize: 10, color: TEXT_COLOR } },
        { text: String(cac), options: { fontSize: 10, color: TEXT_COLOR } },
        { text: onc, options: { fontSize: 10, color: TEXT_COLOR } },
      ]);
    });
    s10.addTable(kRows, { x: 0.5, y: 2.5, w: 9, colW: [4, 2.5, 2.5], border: { pt: 0.5, color: 'CBD5E1' }, rowH: 0.35 });
  }
  s10.addNotes(isTR ? 'Kanal ikonları + CAC rakamları göster.' : 'Show channel icons + CAC numbers.');

  // ══════════════════════════════════════════════════
  // SLIDE 11: FİNANSAL PROJEKSİYON
  // ══════════════════════════════════════════════════
  const s11 = contentSlide(isTR ? 'FİNANSAL PROJEKSİYON' : 'FINANCIAL PROJECTIONS');
  const projYillik = get(state, 'D_final.finansal.projeksiyon_yillik', []);
  const projArr = normProjArr(projYillik);
  if (projArr.length > 0) {
    const finRows: pptxgen.TableRow[] = [
      [
        { text: '', options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10 } },
        ...projArr.map((p: any) => ({ text: `${isTR ? 'Yıl' : 'Y'} ${p.yil}`, options: { bold: true, fill: { color: NAVY }, color: WHITE, fontSize: 10, align: 'center' as const } })),
      ],
    ];
    const metricKeys = [
      { key: 'musteri', label: isTR ? 'Müşteri' : 'Customers', fmt: false },
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
    s11.addTable(finRows, { x: 0.5, y: 1.2, w: 9, colW, border: { pt: 0.5, color: 'CBD5E1' }, rowH: 0.4 });
  }
  const breakeven = get(state, 'D_final.finansal.breakeven_ay', 0);
  s11.addText(`Break-even: ${breakeven} ${isTR ? 'ay' : 'months'}`,
    { x: 0.5, y: 4.5, w: 9, h: 0.4, fontSize: 14, fontFace: 'Calibri', color: SUCCESS, bold: true });
  s11.addNotes(isTR ? 'Çizgi grafik (ARR 5Y) + bar chart (senaryo) göster.' : 'Show ARR chart + scenario bars.');

  // ══════════════════════════════════════════════════
  // SLIDE 12: EKİP (YENİ)
  // ══════════════════════════════════════════════════
  const s12 = contentSlide(isTR ? 'EKİP' : 'THE TEAM');
  const ekip = get(state, 'C_strateji.skorlama.ekip', get(state, 'meta.ekip', null));
  if (ekip && typeof ekip === 'object') {
    const ekipItems: string[] = [];
    if (ekip.kurucular) {
      const kurucular = Array.isArray(ekip.kurucular) ? ekip.kurucular : [ekip.kurucular];
      kurucular.forEach((k: any) => {
        const text = typeof k === 'object' ? `${k.isim || k.ad || ''} — ${k.rol || k.pozisyon || ''} (${k.deneyim || ''})` : String(k);
        ekipItems.push(text);
      });
    }
    if (ekip.aciklama) ekipItems.push(String(ekip.aciklama));
    if (ekipItems.length > 0) {
      const ekipBullets = ekipItems.slice(0, 5).map(t => ({
        text: trunc(t, 120), options: { bullet: true, breakLine: true, fontSize: 14, fontFace: 'Calibri', color: TEXT_COLOR, lineSpacingMultiple: 1.4 }
      }));
      s12.addText(ekipBullets, { x: 0.5, y: 1.2, w: 9, h: 3 });
    }
  } else {
    s12.addText(isTR ? 'Ekip bilgileri eklenecek' : 'Team details to be added',
      { x: 0.5, y: 2.0, w: 9, h: 1, fontSize: 18, fontFace: 'Calibri', color: MUTED, align: 'center' });
    s12.addText(isTR ? '👥 Kurucu fotoğrafları, rolleri ve deneyimlerini ekleyin' : '👥 Add founder photos, roles and experience',
      { x: 0.5, y: 3.5, w: 9, h: 0.4, fontSize: 12, fontFace: 'Calibri', color: MUTED, italic: true });
  }
  s12.addNotes(isTR ? 'Neden bu ekip? Sektör deneyimi, tamamlayıcılık.' : 'Why this team? Sector experience, complementary skills.');

  // ══════════════════════════════════════════════════
  // SLIDE 13: THE ASK
  // ══════════════════════════════════════════════════
  const s13 = contentSlide(isTR ? 'YATIRIM TALEBİ' : 'THE ASK');
  const fonlama = get(state, 'D_final.finansal.fonlama', []);
  const f0 = Array.isArray(fonlama) ? fonlama[0] : fonlama;
  if (f0) {
    s13.addShape(getShapes(pres).ROUNDED_RECTANGLE, { x: 1.5, y: 1.2, w: 7, h: 1.5, fill: { color: LIGHT }, line: { color: ACCENT, width: 2 }, rectRadius: 0.15 });
    s13.addText(`${safeVal(f0.tutar)} ${safeVal(f0.tur)}`, { x: 1.5, y: 1.3, w: 7, h: 0.7, fontSize: 28, fontFace: 'Calibri', color: NAVY, bold: true, align: 'center' });
    s13.addText(trunc(safeVal(f0.kullanim), 100), { x: 1.5, y: 2.0, w: 7, h: 0.5, fontSize: 14, fontFace: 'Calibri', color: TEXT_COLOR, align: 'center' });
  }

  // Use of Funds
  const uof = get(state, 'D_final.finansal.use_of_funds', {});
  if (uof && (uof.urun_pct || uof.pazarlama_pct)) {
    const uofData = [
      { label: isTR ? 'Ürün' : 'Product', pct: uof.urun_pct || 0, color: ACCENT },
      { label: isTR ? 'Pazarlama' : 'Marketing', pct: uof.pazarlama_pct || 0, color: SUCCESS },
      { label: isTR ? 'Ekip' : 'Team', pct: uof.ekip_pct || 0, color: WARN },
      { label: 'G&A', pct: uof.genel_pct || 0, color: MUTED },
    ];
    let xPos = 1;
    uofData.forEach(d => {
      if (d.pct > 0) {
        s13.addShape(getShapes(pres).ROUNDED_RECTANGLE, { x: xPos, y: 3.2, w: 1.8, h: 1.5, fill: { color: LIGHT }, rectRadius: 0.1 });
        s13.addText(`${d.pct}%`, { x: xPos, y: 3.3, w: 1.8, h: 0.7, fontSize: 24, fontFace: 'Calibri', color: d.color, bold: true, align: 'center' });
        s13.addText(d.label, { x: xPos, y: 4.0, w: 1.8, h: 0.4, fontSize: 10, fontFace: 'Calibri', color: MUTED, align: 'center' });
        xPos += 2.1;
      }
    });
  }
  s13.addNotes(isTR ? 'Pasta grafik (use of funds) + milestone timeline göster.' : 'Pie chart (use of funds) + milestone timeline.');

  // ══════════════════════════════════════════════════
  // SLIDE 14: KAPANIŞ / CTA (GELİŞTİRİLMİŞ)
  // ══════════════════════════════════════════════════
  const s14 = pres.addSlide();
  s14.background = { fill: NAVY };
  s14.addText(isTR ? 'Birlikte Büyüyelim' : "Let's Grow Together",
    { x: 0.5, y: 1.2, w: 9, h: 1, fontSize: 36, fontFace: 'Calibri', color: WHITE, bold: true, align: 'center' });
  s14.addText(`"${trunc(uvp, 100)}"`,
    { x: 1, y: 2.5, w: 8, h: 0.8, fontSize: 16, fontFace: 'Calibri', color: 'B0C4DE', italic: true, align: 'center' });

  // Skor badge
  const finalSkor = get(state, 'meta.final_skor', 0);
  const karar = get(state, 'meta.karar', '');
  const skorColor = karar === 'GO' ? SUCCESS : karar === 'CONDITIONAL GO' ? WARN : DANGER;
  s14.addShape(getShapes(pres).ROUNDED_RECTANGLE, { x: 3.5, y: 3.5, w: 3, h: 0.8, fill: { color: skorColor }, rectRadius: 0.15 });
  s14.addText(`${finalSkor}/100 — ${karar}`, { x: 3.5, y: 3.5, w: 3, h: 0.8, fontSize: 18, fontFace: 'Calibri', color: WHITE, bold: true, align: 'center' });

  s14.addText(isTR ? 'İletişim: [e-posta] | [telefon]' : 'Contact: [email] | [phone]',
    { x: 1, y: 4.6, w: 8, h: 0.4, fontSize: 14, fontFace: 'Calibri', color: ACCENT, align: 'center' });
  s14.addText(isTR ? 'Detaylı bilgi için data room\'a erişim talep edin' : 'Request data room access for detailed information',
    { x: 1, y: 5.0, w: 8, h: 0.3, fontSize: 11, fontFace: 'Calibri', color: MUTED, align: 'center' });
  s14.addNotes(isTR ? 'Güçlü CTA ile bitir. Sonraki adımı net söyle.' : 'End with strong CTA. State next steps clearly.');

  // ── APPENDIX (bonus slide) ──────────────────────
  const appSlide = contentSlide('APPENDIX');
  appSlide.addText(isTR ? 'Detaylı veriler bu sunum ile birlikte data room\'da mevcuttur.' : 'Detailed data available in the data room accompanying this presentation.',
    { x: 0.5, y: 1.5, w: 9, h: 1, fontSize: 16, fontFace: 'Calibri', color: TEXT_COLOR, lineSpacingMultiple: 1.4 });
  const appendixItems = [
    isTR ? 'Detaylı finansal model (.xlsx)' : 'Detailed financial model (.xlsx)',
    isTR ? 'Rekabet analizi raporu' : 'Competitive analysis report',
    isTR ? 'Risk matrisi & pre-mortem' : 'Risk matrix & pre-mortem',
    isTR ? 'GTM planı & 90 gün detay' : 'GTM plan & 90-day detail',
  ];
  const appBullets = appendixItems.map(t => ({
    text: t, options: { bullet: true, breakLine: true, fontSize: 14, fontFace: 'Calibri', color: ACCENT }
  }));
  appSlide.addText(appBullets, { x: 0.5, y: 2.8, w: 9, h: 2 });
  appSlide.addNotes(isTR ? 'Q&A sırasında yatırımcı detaylı soru sorarsa hemen bu slide\'a geç.' : 'Jump here during Q&A for detailed questions.');

  // ── Buffer olarak döndür ────────────────────────
  const data = await pres.write({ outputType: 'nodebuffer' });
  return Buffer.from(data as ArrayBuffer);
}

// ── Helpers ───────────────────────────────────────

function trunc(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.substring(0, max) + '...' : text;
}

function normProjArr(proj: any): any[] {
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

function fmtMarketVal(val: any): string {
  const n = parseNum(typeof val === 'string' ? val.replace(/[₺$€£,]/g, '') : val);
  if (!n) return '—';
  const upper = typeof val === 'string' ? val.toUpperCase() : '';
  let millions = n;
  if (upper.includes('B')) millions = n * 1000;
  else if (upper.includes('M')) millions = n;
  else if (upper.includes('K')) millions = n / 1000;
  else if (n > 100) millions = n; // assume already in millions
  if (millions >= 1000) return `$${(millions / 1000).toFixed(1)}B`;
  if (millions >= 1) return `$${millions.toFixed(0)}M`;
  return `$${(millions * 1000).toFixed(0)}K`;
}
