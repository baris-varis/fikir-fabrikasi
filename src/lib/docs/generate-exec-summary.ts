// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Executive Summary Generator
// A1) One-Pager  |  A2) Detaylı (3-5 sayfa)
// ═══════════════════════════════════════════════════════════

import { Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign } from 'docx';
import {
  C, PAGE, BORDERS, NO_BORDERS,
  h1, h2, h3, body, spacer, pageBreak, bullet,
  makeTable, highlightBox, createDocument, packDoc,
  fmtMoney, fmtDual, fmtPct, safeVal, get,
} from './styles';

// ─── STATE HELPER ─────────────────────────────────────────
function extractState(state: any) {
  const kur = get(state, 'meta.usd_try_kur', 34);
  const lang = get(state, 'meta.dil', 'tr');
  return {
    fikir: get(state, 'meta.fikir_adi', 'Startup'),
    sektor: get(state, 'meta.sektor', ''),
    kapsam: get(state, 'meta.kapsam', 'Yerel'),
    tarih: get(state, 'meta.tarih', new Date().toISOString().split('T')[0]),
    skor: get(state, 'meta.final_skor', 0),
    karar: get(state, 'meta.karar', ''),
    kur,
    lang,
    // A_pazar
    problem: get(state, 'A_pazar.problem', ''),
    cozum: get(state, 'A_pazar.cozum', ''),
    hedef_kitle: get(state, 'A_pazar.hedef_kitle', ''),
    tam: get(state, 'A_pazar.tam', 0),
    sam: get(state, 'A_pazar.sam', 0),
    som_3yil: get(state, 'A_pazar.som_3yil', 0),
    cagr: get(state, 'A_pazar.cagr_tr', 0),
    timing: get(state, 'A_pazar.timing', {}),
    global_pazar: get(state, 'A_pazar.global_pazar', null),
    lean_canvas: get(state, 'A_pazar.lean_canvas', {}),
    // B_rekabet
    uvp: get(state, 'B_rekabet.uvp', ''),
    moat_tipi: get(state, 'B_rekabet.moat_tipi', ''),
    moat_suresi: get(state, 'B_rekabet.moat_suresi', ''),
    rakipler: get(state, 'B_rekabet.dogrudan_rakipler', []),
    swot: get(state, 'B_rekabet.swot', { strengths: [], weaknesses: [], opportunities: [], threats: [] }),
    // C_strateji
    is_modeli_tip: get(state, 'C_strateji.is_modeli.tip', ''),
    fiyatlar: get(state, 'C_strateji.is_modeli.fiyatlar', get(state, 'C_strateji.gtm.fiyatlama', {})),
    birim_eko: get(state, 'C_strateji.birim_ekonomisi', {}),
    gtm: get(state, 'C_strateji.gtm', {}),
    riskler: get(state, 'C_strateji.riskler', {}),
    skorlama: get(state, 'C_strateji.skorlama', {}),
    // D_final
    projeksiyon: get(state, 'D_final.finansal.projeksiyon_yillik', get(state, 'D_final.finansal_projeksiyon', [])),
    senaryo: get(state, 'D_final.finansal.senaryo', {}),
    breakeven: get(state, 'D_final.finansal.breakeven_ay', 0),
    fonlama: get(state, 'D_final.finansal.fonlama', []),
    use_of_funds: get(state, 'D_final.finansal.use_of_funds', {}),
    exit: get(state, 'D_final.exit', []),
    comparable_exits: get(state, 'D_final.comparable_exits', []),
    basari_faktorleri: get(state, 'D_final.basari_faktorleri', []),
    yonetici_ozeti: get(state, 'D_final.yonetici_ozeti', ''),
  };
}

// ═══════════════════════════════════════════════════════════
// A1) ONE-PAGER EXECUTIVE SUMMARY
// ═══════════════════════════════════════════════════════════

export async function generateExecSummary(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const s = extractState(state);
  const lang = langOverride || s.lang;
  const isTR = lang === 'tr';

  // Projeksiyon verilerini çıkar (yıl 1, 3, 5)
  const proj = normalizeProjection(s.projeksiyon);
  const fonlama0 = Array.isArray(s.fonlama) ? s.fonlama[0] : s.fonlama;

  // Fiyatlama bilgisini çıkar
  const pricingText = extractPricing(s.fiyatlar, s.kur);

  // Timing'den en güçlü 2-3 boyut
  const timingItems = extractTimingHighlights(s.timing);

  const children: (Paragraph | Table)[] = [];

  // ── HEADER BAR ──────────────────────────────────
  children.push(
    new Table({
      width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [PAGE.CONTENT_WIDTH],
      rows: [new TableRow({
        children: [new TableCell({
          borders: NO_BORDERS,
          shading: { fill: C.NAVY, type: ShadingType.CLEAR },
          width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
          margins: { top: 150, bottom: 150, left: 200, right: 200 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: s.fikir.toUpperCase(), font: 'Calibri', size: 32, bold: true, color: C.WHITE })],
            }),
            new Paragraph({
              children: [new TextRun({
                text: s.uvp || s.cozum,
                font: 'Calibri', size: 20, italics: true, color: 'B0C4DE',
              })],
            }),
          ],
        })],
      })],
    })
  );

  children.push(spacer(80));

  // ── 2×2 GRID: Problem & Fırsat | Çözüm ──────────
  children.push(twoColumnSection(
    isTR ? 'PROBLEM & FIRSAT' : 'PROBLEM & OPPORTUNITY',
    truncate(s.problem, 200),
    isTR ? '\u00C7\u00D6Z\u00DCM' : 'SOLUTION',
    truncate(s.cozum, 200),
  ));

  children.push(spacer(60));

  // ── 2×2 GRID: Pazar Fırsatı | İş Modeli ────────
  const pazarText = `TAM: ${fmtMoney(s.tam * 1e6)} \u2192 SAM: ${fmtMoney(s.sam * 1e6)}\nSOM (3Y): ${fmtMoney(s.som_3yil * 1e6)} | CAGR: ${fmtPct(s.cagr)}`;
  const isModeliText = `${safeVal(s.is_modeli_tip)}\n${pricingText}\nARPU: ${fmtDual(get(s.birim_eko, 'arpu_aylik', 0), s.kur)}/mo`;

  children.push(twoColumnSection(
    isTR ? 'PAZAR FIRSATI' : 'MARKET OPPORTUNITY',
    pazarText,
    isTR ? '\u0130\u015E MODEL\u0130' : 'BUSINESS MODEL',
    isModeliText,
  ));

  children.push(spacer(60));

  // ── 2×2 GRID: Rekabet Avantajı | Neden Şimdi ───
  const moatText = `${safeVal(s.moat_tipi)} (${safeVal(s.moat_suresi)})\n${s.uvp ? s.uvp.substring(0, 100) : ''}`;
  const timingText = timingItems.join('\n');

  children.push(twoColumnSection(
    isTR ? 'REKABET AVANTAJI' : 'COMPETITIVE ADVANTAGE',
    moatText,
    isTR ? 'NEDEN \u015E\u0130MD\u0130' : 'WHY NOW',
    timingText,
  ));

  children.push(spacer(60));

  // ── FİNANSAL HEDEFLER TABLOSU ──────────────────
  children.push(h3(isTR ? 'F\u0130NANSAL HEDEFLER' : 'FINANCIAL TARGETS'));
  children.push(makeTable({
    headers: ['', isTR ? 'Y\u0131l 1' : 'Year 1', isTR ? 'Y\u0131l 3' : 'Year 3', isTR ? 'Y\u0131l 5' : 'Year 5'],
    rows: [
      ['ARR', fmtMoney(proj.y1?.arr), fmtMoney(proj.y3?.arr), fmtMoney(proj.y5?.arr)],
      [isTR ? 'M\u00FC\u015Fteri' : 'Customers', safeVal(proj.y1?.musteri), safeVal(proj.y3?.musteri), safeVal(proj.y5?.musteri)],
      ['EBITDA', fmtMoney(proj.y1?.ebitda), fmtMoney(proj.y3?.ebitda), fmtMoney(proj.y5?.ebitda)],
    ],
    colWidths: [2000, 2450, 2450, 2454],
  }));

  children.push(spacer(80));

  // ── THE ASK ─────────────────────────────────────
  const askTitle = isTR ? 'YATIRIM TALEB\u0130' : 'THE ASK';
  const askLines: Paragraph[] = [];
  if (fonlama0) {
    askLines.push(new Paragraph({
      spacing: { before: 0, after: 60 },
      children: [new TextRun({
        text: `${safeVal(fonlama0.tutar)} ${safeVal(fonlama0.tur)} | ${safeVal(fonlama0.kullanim)}`,
        font: 'Calibri', size: 22, bold: true, color: C.NAVY,
      })],
    }));
  }
  // Milestones
  const milestones = s.basari_faktorleri.slice(0, 3);
  milestones.forEach((m: string) => {
    askLines.push(new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [new TextRun({ text: `\u2192 ${m}`, font: 'Calibri', size: 19, color: C.ACCENT })],
    }));
  });

  children.push(h3(askTitle));
  children.push(highlightBox(askLines));

  children.push(spacer(40));

  // ── TRACTION (varsa) ────────────────────────────
  const traction = get(state, 'traction', null);
  if (traction) {
    children.push(h3(isTR ? 'TRACTION & VAL\u0130DASYON' : 'TRACTION & VALIDATION'));
    children.push(body(String(traction)));
  }

  // Document oluştur
  const doc = createDocument({
    companyName: s.fikir,
    docType: isTR ? 'Executive Summary' : 'Executive Summary',
    date: s.tarih,
    lang,
    children,
  });

  return packDoc(doc);
}

// ═══════════════════════════════════════════════════════════
// A2) DETAYLI EXECUTIVE SUMMARY (3-5 sayfa)
// ═══════════════════════════════════════════════════════════

export async function generateDetailedExecSummary(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const s = extractState(state);
  const lang = langOverride || s.lang;
  const isTR = lang === 'tr';
  const proj = normalizeProjection(s.projeksiyon);
  const fonlama0 = Array.isArray(s.fonlama) ? s.fonlama[0] : s.fonlama;

  const children: (Paragraph | Table)[] = [];

  // ── 1. YÖNETİCİ ÖZETİ ──────────────────────────
  children.push(h1(isTR ? 'Y\u00D6NET\u0130C\u0130 \u00D6ZET\u0130' : 'EXECUTIVE SUMMARY'));
  children.push(body(s.yonetici_ozeti || `${s.fikir} \u2014 ${s.uvp || s.cozum}`));

  // ── 2. PROBLEM & FIRSAT ─────────────────────────
  children.push(pageBreak());
  children.push(h1(isTR ? 'PROBLEM & FIRSAT' : 'PROBLEM & OPPORTUNITY'));
  children.push(body(s.problem));
  children.push(spacer(40));
  children.push(h3(isTR ? 'Hedef Kitle' : 'Target Audience'));
  children.push(body(s.hedef_kitle));

  // ── 3. ÇÖZÜM & UVP ─────────────────────────────
  children.push(spacer(80));
  children.push(h1(isTR ? '\u00C7\u00D6Z\u00DCM & UVP' : 'SOLUTION & UVP'));
  children.push(body(s.cozum));
  if (s.uvp) {
    children.push(spacer(40));
    children.push(highlightBox([
      new Paragraph({
        children: [new TextRun({ text: s.uvp, font: 'Calibri', size: 22, bold: true, color: C.NAVY })],
      }),
    ]));
  }

  // ── 4. PAZAR FIRSATI ────────────────────────────
  children.push(pageBreak());
  children.push(h1(isTR ? 'PAZAR FIRSATI' : 'MARKET OPPORTUNITY'));

  children.push(makeTable({
    headers: [isTR ? 'Metrik' : 'Metric', isTR ? 'De\u011Fer' : 'Value'],
    rows: [
      ['TAM', `$${s.tam}M`],
      ['SAM', `$${s.sam}M`],
      ['SOM (3Y)', `$${s.som_3yil}M`],
      ['CAGR', fmtPct(s.cagr)],
    ],
    colWidths: [4000, 5354],
  }));

  // Timing
  const timingItems = extractTimingHighlights(s.timing);
  if (timingItems.length > 0) {
    children.push(spacer(60));
    children.push(h3(isTR ? 'Neden \u015Eimdi' : 'Why Now'));
    timingItems.forEach(t => children.push(bullet(t)));
  }

  // ── 5. İŞ MODELİ & BİRİM EKONOMİSİ ────────────
  children.push(spacer(80));
  children.push(h1(isTR ? '\u0130\u015E MODEL\u0130 & B\u0130R\u0130M EKONOM\u0130S\u0130' : 'BUSINESS MODEL & UNIT ECONOMICS'));
  children.push(body(`${isTR ? 'Model' : 'Model'}: ${safeVal(s.is_modeli_tip)}`));

  // Fiyatlama tablosu
  const pricingRows = extractPricingRows(s.fiyatlar, s.kur);
  if (pricingRows.length > 0) {
    children.push(spacer(40));
    children.push(h3(isTR ? 'Fiyatlama' : 'Pricing'));
    children.push(makeTable({
      headers: [isTR ? 'Katman' : 'Tier', isTR ? 'Fiyat' : 'Price', isTR ? 'Hedef Segment' : 'Target'],
      rows: pricingRows,
      colWidths: [2500, 3427, 3427],
    }));
  }

  // Birim ekonomisi
  children.push(spacer(40));
  children.push(h3(isTR ? 'Birim Ekonomisi' : 'Unit Economics'));
  children.push(makeTable({
    headers: [isTR ? 'Metrik' : 'Metric', isTR ? 'De\u011Fer' : 'Value'],
    rows: [
      ['CAC', fmtDual(get(s.birim_eko, 'cac', 0), s.kur)],
      ['ARPU/mo', fmtDual(get(s.birim_eko, 'arpu_aylik', 0), s.kur)],
      ['LTV', fmtDual(get(s.birim_eko, 'ltv', 0), s.kur)],
      ['LTV:CAC', `${safeVal(get(s.birim_eko, 'ltv_cac_oran', ''))}:1`],
      [isTR ? 'Br\u00FCt Marj' : 'Gross Margin', fmtPct(get(s.birim_eko, 'brut_marj', 0))],
    ],
    colWidths: [4000, 5354],
  }));

  // ── 6. REKABET & AVANTAJ ────────────────────────
  children.push(pageBreak());
  children.push(h1(isTR ? 'REKABET & AVANTAJ' : 'COMPETITION & ADVANTAGE'));

  const topRakipler = (s.rakipler || []).slice(0, 3);
  if (topRakipler.length > 0) {
    children.push(makeTable({
      headers: [isTR ? '\u015Eirket' : 'Company', isTR ? 'Fonlama' : 'Funding', isTR ? 'G\u00FC\u00E7l\u00FC' : 'Strength', isTR ? 'Zay\u0131f' : 'Weakness'],
      rows: topRakipler.map((r: any) => [
        safeVal(r.ad || r.sirket),
        safeVal(r.fonlama || r.kurulusfonlama),
        truncate(safeVal(r.guclu_yon || r.guclu), 60),
        truncate(safeVal(r.zayif_yon || r.zayif), 60),
      ]),
      colWidths: [2000, 2000, 2677, 2677],
    }));
  }

  children.push(spacer(40));
  children.push(h3(`Moat: ${safeVal(s.moat_tipi)}`));
  children.push(body(s.uvp));

  // ── 7. GTM STRATEJİSİ ──────────────────────────
  children.push(spacer(80));
  children.push(h1(isTR ? 'GTM STRATEJ\u0130S\u0130' : 'GO-TO-MARKET STRATEGY'));
  const gtm = s.gtm;
  if (gtm.icp) children.push(body(`ICP: ${gtm.icp}`));
  if (gtm.beachhead) children.push(body(`Beachhead: ${gtm.beachhead}`));
  if (gtm.buyume_motoru) children.push(body(`${isTR ? 'B\u00FCy\u00FCme Motoru' : 'Growth Engine'}: ${gtm.buyume_motoru}`));

  const kanallar = gtm.kanallar || [];
  if (kanallar.length > 0) {
    children.push(spacer(40));
    children.push(h3(isTR ? 'Edinim Kanallar\u0131' : 'Acquisition Channels'));
    kanallar.slice(0, 3).forEach((k: any) => {
      const kText = typeof k === 'string' ? k : `${safeVal(k.kanal || k.ad)} (CAC: ${fmtDual(k.cac, s.kur)})`;
      children.push(bullet(kText));
    });
  }

  // ── 8. FİNANSAL PROJEKSİYON ────────────────────
  children.push(spacer(80));
  children.push(h1(isTR ? 'F\u0130NANSAL PROJEKS\u0130YON' : 'FINANCIAL PROJECTIONS'));

  children.push(makeTable({
    headers: ['', isTR ? 'Y\u0131l 1' : 'Year 1', isTR ? 'Y\u0131l 2' : 'Year 2', isTR ? 'Y\u0131l 3' : 'Year 3', isTR ? 'Y\u0131l 5' : 'Year 5'],
    rows: [
      [isTR ? 'M\u00FC\u015Fteri' : 'Customers', safeVal(proj.y1?.musteri), safeVal(proj.y2?.musteri), safeVal(proj.y3?.musteri), safeVal(proj.y5?.musteri)],
      ['ARR', fmtMoney(proj.y1?.arr), fmtMoney(proj.y2?.arr), fmtMoney(proj.y3?.arr), fmtMoney(proj.y5?.arr)],
      ['EBITDA', fmtMoney(proj.y1?.ebitda), fmtMoney(proj.y2?.ebitda), fmtMoney(proj.y3?.ebitda), fmtMoney(proj.y5?.ebitda)],
    ],
    colWidths: [1800, 1888, 1888, 1888, 1890],
  }));

  children.push(spacer(40));
  children.push(body(`Break-even: ${s.breakeven} ${isTR ? 'ay' : 'months'}`, { bold: true, color: C.ACCENT }));

  // Senaryo
  if (s.senaryo && s.senaryo.gercekci) {
    children.push(spacer(40));
    children.push(h3(isTR ? 'Senaryo Analizi (ARR Y\u0131l 3)' : 'Scenario Analysis (ARR Year 3)'));
    children.push(makeTable({
      headers: [isTR ? 'K\u00F6t\u00FCmser' : 'Bear', isTR ? 'Baz' : 'Base', isTR ? '\u0130yimser' : 'Bull'],
      rows: [[
        fmtMoney(get(s.senaryo, 'kotumser.arr_yil3', 0)),
        fmtMoney(get(s.senaryo, 'gercekci.arr_yil3', 0)),
        fmtMoney(get(s.senaryo, 'iyimser.arr_yil3', 0)),
      ]],
      colWidths: [3118, 3118, 3118],
    }));
  }

  // ── 10. YATIRIM TALEBİ ──────────────────────────
  children.push(spacer(80));
  children.push(h1(isTR ? 'YATIRIM TALEB\u0130 & KULLANIM' : 'THE ASK & USE OF FUNDS'));

  if (fonlama0) {
    children.push(highlightBox([
      new Paragraph({
        children: [new TextRun({
          text: `${safeVal(fonlama0.tutar)} ${safeVal(fonlama0.tur)}`,
          font: 'Calibri', size: 24, bold: true, color: C.NAVY,
        })],
      }),
      new Paragraph({
        spacing: { before: 40 },
        children: [new TextRun({
          text: safeVal(fonlama0.kullanim),
          font: 'Calibri', size: 20, color: C.TEXT,
        })],
      }),
    ]));
  }

  // Use of funds
  const uof = s.use_of_funds;
  if (uof && (uof.urun_pct || uof.pazarlama_pct)) {
    children.push(spacer(40));
    children.push(makeTable({
      headers: [isTR ? 'Kategori' : 'Category', '%'],
      rows: [
        [isTR ? '\u00DCr\u00FCn Geli\u015Ftirme' : 'Product Development', `${uof.urun_pct || 0}%`],
        [isTR ? 'Pazarlama & Sat\u0131\u015F' : 'Marketing & Sales', `${uof.pazarlama_pct || 0}%`],
        [isTR ? 'Ekip' : 'Team', `${uof.ekip_pct || 0}%`],
        [isTR ? 'Genel & \u0130dari' : 'G&A', `${uof.genel_pct || 0}%`],
      ],
      colWidths: [6000, 3354],
    }));
  }

  // Milestones
  const milestones = s.basari_faktorleri.slice(0, 5);
  if (milestones.length > 0) {
    children.push(spacer(40));
    children.push(h3('Milestones'));
    milestones.forEach((m: string) => children.push(bullet(m)));
  }

  // ── 11. EXIT STRATEJİSİ ────────────────────────
  children.push(spacer(80));
  children.push(h1(isTR ? 'EXIT STRATEJ\u0130S\u0130' : 'EXIT STRATEGY'));

  const exits = Array.isArray(s.exit) ? s.exit.slice(0, 3) : [];
  if (exits.length > 0) {
    children.push(makeTable({
      headers: [
        isTR ? 'Senaryo' : 'Scenario',
        isTR ? 'Y\u00F6ntem' : 'Method',
        isTR ? 'Al\u0131c\u0131' : 'Acquirer',
        isTR ? 'De\u011Fer' : 'Value',
      ],
      rows: exits.map((e: any) => [
        safeVal(e.sira),
        safeVal(e.yontem),
        safeVal(e.alici),
        safeVal(e.deger),
      ]),
      colWidths: [2000, 2400, 2477, 2477],
    }));
  }

  // Comparable exits
  if (s.comparable_exits.length > 0) {
    children.push(spacer(40));
    children.push(h3(isTR ? 'Kar\u015F\u0131la\u015Ft\u0131r\u0131labilir \u00C7\u0131k\u0131\u015Flar' : 'Comparable Exits'));
    s.comparable_exits.slice(0, 3).forEach((ce: any) => {
      children.push(bullet(`${safeVal(ce.sirket)} \u2192 ${safeVal(ce.alici)} (${safeVal(ce.deger)}, ${safeVal(ce.carpan)})`));
    });
  }

  const doc = createDocument({
    companyName: s.fikir,
    docType: isTR ? 'Detayl\u0131 Executive Summary' : 'Detailed Executive Summary',
    date: s.tarih,
    lang,
    children,
  });

  return packDoc(doc);
}

// ═══════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════

function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.substring(0, max) + '...' : text;
}

function normalizeProjection(proj: any): { y1?: any; y2?: any; y3?: any; y5?: any } {
  if (!proj) return {};

  // Array format: [{yil: 1, ...}, {yil: 2, ...}]
  if (Array.isArray(proj)) {
    const byYear: any = {};
    proj.forEach((p: any) => {
      const y = p.yil || p.year;
      if (y === 1) byYear.y1 = normalizeYearData(p);
      if (y === 2) byYear.y2 = normalizeYearData(p);
      if (y === 3) byYear.y3 = normalizeYearData(p);
      if (y === 5) byYear.y5 = normalizeYearData(p);
    });
    return byYear;
  }

  // Object format: {2024: {...}, 2025: {...}} or {yil1: {...}}
  if (typeof proj === 'object') {
    const keys = Object.keys(proj).sort();
    const result: any = {};
    if (keys.length >= 1) result.y1 = normalizeYearData(proj[keys[0]]);
    if (keys.length >= 2) result.y2 = normalizeYearData(proj[keys[1]]);
    if (keys.length >= 3) result.y3 = normalizeYearData(proj[keys[2]]);
    if (keys.length >= 5) result.y5 = normalizeYearData(proj[keys[4]]);
    else if (keys.length >= 4) result.y5 = normalizeYearData(proj[keys[keys.length - 1]]);
    return result;
  }

  return {};
}

function normalizeYearData(data: any): any {
  if (!data) return {};
  return {
    musteri: data.musteri || data.customers || data.aktif_musteri || 0,
    arr: parseNumeric(data.arr || data.arr_usd || data.gelir || data.revenue || 0),
    ebitda: parseNumeric(data.ebitda || data.ebitda_usd || 0),
    brut_kar: parseNumeric(data.brut_kar || data.brut_kar_usd || data.gross_profit || 0),
    nakit: parseNumeric(data.nakit || data.donem_sonu_nakit || data.donem_sonu_nakit_usd || 0),
  };
}

function parseNumeric(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  }
  return 0;
}

function extractPricing(fiyatlar: any, kur: number): string {
  if (!fiyatlar) return '';
  // Object with tiers: {starter: {fiyat: 49}, professional: {fiyat: 149}}
  if (typeof fiyatlar === 'object' && !Array.isArray(fiyatlar)) {
    const tiers = Object.entries(fiyatlar)
      .filter(([k]) => !['tip', 'model', 'taksit'].includes(k))
      .slice(0, 3);
    return tiers.map(([name, val]: [string, any]) => {
      const price = typeof val === 'object' ? (val.fiyat || val.price || val.aylik) : val;
      return `${name}: ${fmtDual(price, kur)}/mo`;
    }).join(' | ');
  }
  return String(fiyatlar);
}

function extractPricingRows(fiyatlar: any, kur: number): string[][] {
  if (!fiyatlar || typeof fiyatlar !== 'object') return [];
  return Object.entries(fiyatlar)
    .filter(([k]) => !['tip', 'model', 'taksit'].includes(k))
    .map(([name, val]: [string, any]) => {
      const price = typeof val === 'object' ? (val.fiyat || val.price || val.aylik) : val;
      const target = typeof val === 'object' ? (val.hedef || val.segment || '') : '';
      return [name, fmtDual(price, kur) + '/mo', target];
    });
}

function extractTimingHighlights(timing: any): string[] {
  if (!timing || typeof timing !== 'object') return [];
  const items: string[] = [];
  const keys = ['teknolojik', 'regulatorik', 'sosyal', 'ekonomik', 'technological', 'regulatory', 'social', 'economic'];
  for (const key of keys) {
    if (timing[key]) {
      const val = typeof timing[key] === 'object' ? (timing[key].aciklama || timing[key].desc || JSON.stringify(timing[key])) : timing[key];
      items.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${truncate(String(val), 80)}`);
    }
  }
  return items.slice(0, 3);
}

/** 2 sütunlu bilgi kutusu */
function twoColumnSection(
  leftTitle: string, leftText: string,
  rightTitle: string, rightText: string,
): Table {
  const halfWidth = Math.floor(PAGE.CONTENT_WIDTH / 2);
  const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: C.BORDER };

  function makeCell(title: string, text: string, width: number): TableCell {
    return new TableCell({
      borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
      width: { size: width, type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.TOP,
      children: [
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: title, font: 'Calibri', size: 20, bold: true, color: C.ACCENT })],
        }),
        ...text.split('\n').map(line =>
          new Paragraph({
            spacing: { before: 20, after: 20 },
            children: [new TextRun({ text: line, font: 'Calibri', size: 19, color: C.TEXT })],
          })
        ),
      ],
    });
  }

  return new Table({
    width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [halfWidth, PAGE.CONTENT_WIDTH - halfWidth],
    rows: [new TableRow({
      children: [
        makeCell(leftTitle, leftText, halfWidth),
        makeCell(rightTitle, rightText, PAGE.CONTENT_WIDTH - halfWidth),
      ],
    })],
  });
}
