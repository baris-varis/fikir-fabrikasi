// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Pitch Deck + Data Room + Lean Canvas
// ═══════════════════════════════════════════════════════════

import { Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign } from 'docx';
import {
  C, PAGE, BORDERS, NO_BORDERS,
  h1, h2, h3, body, spacer, pageBreak, bullet,
  makeTable, highlightBox, createDocument, packDoc,
  fmtMoney, fmtDual, fmtPct, safeVal, get,
} from './styles';

// ═══════════════════════════════════════════════════════════
// C) PITCH DECK İÇERİK REHBERİ (.docx)
// ═══════════════════════════════════════════════════════════

export async function generatePitchDeck(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const lang = langOverride || get(state, 'meta.dil', 'tr');
  const isTR = lang === 'tr';
  const kur = get(state, 'meta.usd_try_kur', 34);
  const fikir = get(state, 'meta.fikir_adi', 'Startup');
  const tarih = get(state, 'meta.tarih', '');
  const kapsam = get(state, 'meta.kapsam', 'Yerel');

  const slides = buildSlideContent(state, isTR, kur, kapsam);

  const children: (Paragraph | Table)[] = [];

  children.push(h1(isTR ? 'PITCH DECK \u0130\u00C7ER\u0130K REHBER\u0130' : 'PITCH DECK CONTENT GUIDE'));
  children.push(body(isTR
    ? `${slides.length} slide i\u00E7in i\u00E7erik, konu\u015Fmac\u0131 notu ve g\u00F6rsel \u00F6nerisi.`
    : `Content, speaker notes, and visual suggestions for ${slides.length} slides.`
  ));
  children.push(spacer(40));

  // Slide tasarım kuralları
  children.push(highlightBox([
    new Paragraph({
      children: [new TextRun({
        text: isTR ? 'Tasar\u0131m Kurallar\u0131: Slide ba\u015F\u0131na TEK ana mesaj \u2022 Min 30pt font \u2022 Max 5 bullet \u2022 Animasyon YOK \u2022 16:9 widescreen'
          : 'Design Rules: ONE key message per slide \u2022 Min 30pt font \u2022 Max 5 bullets \u2022 No animations \u2022 16:9 widescreen',
        font: 'Calibri', size: 19, color: C.MUTED, italics: true,
      })],
    }),
  ]));

  // Her slide
  slides.forEach((slide, i) => {
    if (i > 0) children.push(pageBreak());
    children.push(slideHeader(i + 1, slide.title));
    children.push(spacer(20));

    // Ana Mesaj
    children.push(h3(isTR ? 'Ana Mesaj' : 'Key Message'));
    children.push(body(slide.message, { bold: true, color: C.NAVY }));
    children.push(spacer(20));

    // İçerik
    children.push(h3(isTR ? '\u0130\u00E7erik' : 'Content'));
    if (Array.isArray(slide.content)) {
      slide.content.forEach((c: string) => children.push(bullet(c)));
    } else {
      children.push(body(slide.content));
    }
    children.push(spacer(20));

    // Konuşmacı Notu
    children.push(speakerNote(slide.note, isTR));
    children.push(spacer(20));

    // Görsel Önerisi
    children.push(visualSuggestion(slide.visual, isTR));
  });

  // Appendix
  children.push(pageBreak());
  children.push(h1('APPENDIX'));
  children.push(body(isTR
    ? 'A\u015Fa\u011F\u0131daki slide\'lar ana sunumda g\u00F6sterilmez. Q&A s\u0131ras\u0131nda kullan\u0131l\u0131r.'
    : 'These slides are not shown in the main deck. Use during Q&A.'
  ));

  const appendixSlides = [
    { id: 'A1', title: isTR ? 'Detayl\u0131 Finansal Tablo' : 'Detailed Financials', desc: isTR ? '5 y\u0131l tam gelir/gider/EBITDA tablosu' : '5-year full P&L table' },
    { id: 'A2', title: isTR ? 'Birim Ekonomisi Detay' : 'Unit Economics Detail', desc: 'CAC/LTV/Payback/Churn' },
    { id: 'A3', title: isTR ? 'Rakip Kar\u015F\u0131la\u015Ft\u0131rma' : 'Competitor Matrix', desc: isTR ? 'T\u00FCm rakipler + 2\u00D72 matris' : 'All competitors + 2×2 matrix' },
    { id: 'A4', title: isTR ? 'Senaryo Analizi' : 'Scenario Analysis', desc: isTR ? 'K\u00F6t\u00FCmser/Baz/\u0130yimser' : 'Bear/Base/Bull' },
    { id: 'A5', title: isTR ? 'Teknik Mimari' : 'Technical Architecture', desc: isTR ? 'Kurucu taraf\u0131ndan doldurulacak' : 'To be completed by founder' },
  ];

  children.push(makeTable({
    headers: ['#', isTR ? 'Ba\u015Fl\u0131k' : 'Title', isTR ? '\u0130\u00E7erik' : 'Content'],
    rows: appendixSlides.map(a => [a.id, a.title, a.desc]),
    colWidths: [800, 3277, 5277],
  }));

  return packDoc(createDocument({ companyName: fikir, docType: 'Pitch Deck Guide', date: tarih, lang, children }));
}

// ═══════════════════════════════════════════════════════════
// J) DATA ROOM CHECKLIST
// ═══════════════════════════════════════════════════════════

export async function generateDataRoom(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const lang = langOverride || get(state, 'meta.dil', 'tr');
  const isTR = lang === 'tr';
  const fikir = get(state, 'meta.fikir_adi', 'Startup');
  const tarih = get(state, 'meta.tarih', '');
  const sektor = get(state, 'meta.sektor', '');

  const children: (Paragraph | Table)[] = [];

  children.push(h1(`${fikir} \u2014 Data Room`));
  children.push(body(isTR
    ? `Haz\u0131rl\u0131k Durumu: ${tarih} | Sekt\u00F6r: ${sektor}`
    : `Status: ${tarih} | Sector: ${sektor}`
  ));
  children.push(spacer(40));
  children.push(body(isTR
    ? '\u25A1 = Haz\u0131rlanmam\u0131\u015F | \u2611 = Haz\u0131r | \u26A0 = Haz\u0131rlan\u0131yor'
    : '\u25A1 = Not ready | \u2611 = Ready | \u26A0 = In progress'
  , { italic: true, color: C.MUTED }));

  const sections = isTR ? [
    { title: 'KURUMSAL BELGELER', items: [
      '\u015Eirket ana s\u00F6zle\u015Fmesi', 'Ticaret sicil gazetesi', '\u0130mza sirk\u00FCleri',
      'Vergi levhas\u0131', 'Ortakl\u0131k yap\u0131s\u0131 (cap table)', 'Mevcut yat\u0131r\u0131mc\u0131 anla\u015Fmalar\u0131 (varsa)',
    ]},
    { title: 'F\u0130NANSAL BELGELER', items: [
      'Son 2 y\u0131l bilan\u00E7o + gelir tablosu (varsa)', 'G\u00FCncel banka hesap \u00F6zetleri',
      'Finansal model (\u2190 "finansal model \u00FCret")', 'Vergi beyannameleri',
    ]},
    { title: '\u00DCR\u00DCN & TEKNOLOJ\u0130', items: [
      '\u00DCr\u00FCn demo / ekran g\u00F6r\u00FCnt\u00FCleri', 'Teknik mimari dok\u00FCman\u0131',
      'Patent / fikri m\u00FClkiyet ba\u015Fvurular\u0131 (varsa)', 'Mevcut kullan\u0131c\u0131 metrikleri (varsa)',
    ]},
    { title: 'PAZAR & STRATEJ\u0130', items: [
      'Executive Summary (\u2190 "exec summary \u00FCret")', 'Pitch Deck (\u2190 "sunum \u00FCret")',
      'Rekabet analizi (\u2190 "rekabet docx \u00FCret")', 'GTM plan\u0131 (\u2190 "gtm docx \u00FCret")',
    ]},
    { title: 'HUKUK & UYUM', items: [
      'KVKK uyum durumu', 'Sekt\u00F6rel lisanslar (BDDK/BTK/SPK \u2014 gerekiyorsa)',
      'Kullan\u0131c\u0131 s\u00F6zle\u015Fmeleri (ToS, Privacy Policy)', '\u00C7al\u0131\u015Fan s\u00F6zle\u015Fmeleri',
    ]},
    { title: 'EK\u0130P', items: [
      'Kurucu CV\'leri', 'Organizasyon \u015Femas\u0131', 'Kilit personel s\u00F6zle\u015Fmeleri', 'Vesting plan\u0131 (varsa)',
    ]},
  ] : [
    { title: 'CORPORATE DOCUMENTS', items: [
      'Articles of incorporation', 'Trade registry', 'Signature circular',
      'Tax certificate', 'Cap table', 'Existing investor agreements (if any)',
    ]},
    { title: 'FINANCIAL DOCUMENTS', items: [
      'Last 2 years balance sheet + income statement', 'Current bank statements',
      'Financial model', 'Tax returns',
    ]},
    { title: 'PRODUCT & TECHNOLOGY', items: [
      'Product demo / screenshots', 'Technical architecture doc',
      'Patents / IP filings (if any)', 'Current user metrics (if any)',
    ]},
    { title: 'MARKET & STRATEGY', items: [
      'Executive Summary', 'Pitch Deck', 'Competitive analysis', 'GTM plan',
    ]},
    { title: 'LEGAL & COMPLIANCE', items: [
      'Data privacy compliance (GDPR/KVKK)', 'Sector licenses (if applicable)',
      'User agreements (ToS, Privacy Policy)', 'Employee contracts',
    ]},
    { title: 'TEAM', items: [
      'Founder CVs', 'Org chart', 'Key personnel contracts', 'Vesting plan (if any)',
    ]},
  ];

  sections.forEach(section => {
    children.push(spacer(60));
    children.push(h2(section.title));
    section.items.forEach(item => {
      children.push(new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({ text: '\u25A1  ', font: 'Calibri', size: 21, color: C.MUTED }),
          new TextRun({ text: item, font: 'Calibri', size: 21, color: C.TEXT }),
        ],
      }));
    });
  });

  children.push(spacer(80));
  children.push(body(isTR
    ? 'Bu checklist giri\u015Fimin mevcut a\u015Famas\u0131na g\u00F6re uyarlanmal\u0131d\u0131r. Pre-seed a\u015Famas\u0131nda t\u00FCm belgelerin haz\u0131r olmas\u0131 beklenmez.'
    : 'This checklist should be adapted to the current stage. Not all documents are expected at pre-seed stage.'
  , { italic: true, color: C.MUTED }));

  return packDoc(createDocument({ companyName: fikir, docType: 'Data Room Checklist', date: tarih, lang, children }));
}

// ═══════════════════════════════════════════════════════════
// K) LEAN CANVAS
// ═══════════════════════════════════════════════════════════

export async function generateLeanCanvas(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const lang = langOverride || get(state, 'meta.dil', 'tr');
  const isTR = lang === 'tr';
  const fikir = get(state, 'meta.fikir_adi', 'Startup');
  const tarih = get(state, 'meta.tarih', '');
  const kur = get(state, 'meta.usd_try_kur', 34);

  // Lean canvas verilerini çek — önce lean_canvas, yoksa state'in farklı bölümlerinden
  const lc = get(state, 'A_pazar.lean_canvas', {});
  const problemler = lc.problemler || [get(state, 'A_pazar.problem', '')];
  const cozumler = lc.cozumler || [get(state, 'A_pazar.cozum', '')];
  const uvp = lc.uvp || get(state, 'B_rekabet.uvp', '');
  const haksizAvantaj = lc.haksiz_avantaj || get(state, 'B_rekabet.moat_tipi', '');
  const musteriSegmentleri = lc.musteri_segmentleri || get(state, 'A_pazar.hedef_kitle', '');
  const kanallar = lc.kanallar || get(state, 'C_strateji.gtm.kanallar', []);
  const anahtar = lc.anahtar_metrikler || '';
  const maliyetYapisi = lc.maliyet_yapisi || '';
  const gelirAkislari = lc.gelir_akislari || get(state, 'C_strateji.is_modeli.tip', '');

  const children: (Paragraph | Table)[] = [];

  children.push(h1(`${fikir} \u2014 Lean Canvas`));
  children.push(spacer(40));

  // Canvas 5-sütunlu grid (satır 1)
  const c1 = 1870; const c2 = 1870; const c3 = 1870; const c4 = 1870; const c5 = 1874;

  function canvasCell(title: string, content: string[], width: number, bg: string = 'FFFFFF'): TableCell {
    return new TableCell({
      borders: BORDERS,
      width: { size: width, type: WidthType.DXA },
      shading: { fill: bg, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      verticalAlign: VerticalAlign.TOP,
      children: [
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: title, font: 'Calibri', size: 16, bold: true, color: C.ACCENT })],
        }),
        ...content.map(line => new Paragraph({
          spacing: { before: 10, after: 10 },
          children: [new TextRun({ text: line, font: 'Calibri', size: 16, color: C.TEXT })],
        })),
      ],
    });
  }

  // Problem verisi normalize
  const probArr = Array.isArray(problemler) ? problemler.slice(0, 3) : [String(problemler)];
  const cozArr = Array.isArray(cozumler) ? cozumler.slice(0, 3) : [String(cozumler)];
  const kanalArr = Array.isArray(kanallar)
    ? kanallar.slice(0, 3).map((k: any) => typeof k === 'string' ? k : (k.kanal || k.ad || ''))
    : [String(kanallar)];
  const musteriArr = Array.isArray(musteriSegmentleri) ? musteriSegmentleri : [String(musteriSegmentleri)];

  // Satır 1: Problem | Çözüm | UVP | Haksız Avantaj | Müşteri
  children.push(new Table({
    width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [c1, c2, c3, c4, c5],
    rows: [
      // Header row
      new TableRow({
        children: [
          canvasCell(isTR ? 'PROBLEM' : 'PROBLEM', probArr.map((p, i) => `${i + 1}. ${p}`), c1, C.LIGHT_BG),
          canvasCell(isTR ? '\u00C7\u00D6Z\u00DCM' : 'SOLUTION', cozArr.map((c, i) => `${i + 1}. ${c}`), c2, C.LIGHT_BG),
          canvasCell('UVP', [uvp], c3, 'FFF9E6'),
          canvasCell(isTR ? 'HAKSIZ AVANTAJ' : 'UNFAIR ADVANTAGE', [haksizAvantaj], c4, C.LIGHT_BG),
          canvasCell(isTR ? 'M\u00DC\u015ETER\u0130' : 'CUSTOMERS', musteriArr, c5, C.LIGHT_BG),
        ],
      }),
    ],
  }));

  // Satır 2: Metrikler | (merged) | Kanallar | (merged)
  const halfW = Math.floor(PAGE.CONTENT_WIDTH / 2);
  const anahStr = Array.isArray(anahtar) ? anahtar.join(', ') : String(anahtar || '');
  const kanalStr = kanalArr.join(', ');

  children.push(new Table({
    width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [halfW, PAGE.CONTENT_WIDTH - halfW],
    rows: [new TableRow({
      children: [
        canvasCell(isTR ? 'ANAHTAR METR\u0130KLER' : 'KEY METRICS', [anahStr], halfW, C.LIGHT_BG),
        canvasCell(isTR ? 'KANALLAR' : 'CHANNELS', [kanalStr], PAGE.CONTENT_WIDTH - halfW, C.LIGHT_BG),
      ],
    })],
  }));

  // Satır 3: Maliyet Yapısı | Gelir Akışları
  const maliyetStr = Array.isArray(maliyetYapisi) ? maliyetYapisi.join(', ') : String(maliyetYapisi || '');
  const gelirStr = Array.isArray(gelirAkislari) ? gelirAkislari.join(', ') : String(gelirAkislari || '');

  children.push(new Table({
    width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [halfW, PAGE.CONTENT_WIDTH - halfW],
    rows: [new TableRow({
      children: [
        canvasCell(isTR ? 'MAL\u0130YET YAPISI' : 'COST STRUCTURE', [maliyetStr], halfW, 'FFF3E0'),
        canvasCell(isTR ? 'GEL\u0130R AKI\u015ELARI' : 'REVENUE STREAMS', [gelirStr], PAGE.CONTENT_WIDTH - halfW, 'E8F5E9'),
      ],
    })],
  }));

  return packDoc(createDocument({ companyName: fikir, docType: 'Lean Canvas', date: tarih, lang, children }));
}

// ═══════════════════════════════════════════════════════════
// SLIDE CONTENT BUILDER
// ═══════════════════════════════════════════════════════════

interface SlideData {
  title: string;
  message: string;
  content: string | string[];
  note: string;
  visual: string;
}

function buildSlideContent(state: any, isTR: boolean, kur: number, kapsam: string): SlideData[] {
  const slides: SlideData[] = [];
  const p = (path: string, fb: any = '') => get(state, path, fb);

  // 1. Kapak
  slides.push({
    title: isTR ? 'Kapak' : 'Cover',
    message: p('B_rekabet.uvp') || p('A_pazar.cozum'),
    content: [`${p('meta.fikir_adi')} \u2014 ${p('meta.sektor')}`],
    note: isTR ? '\u0130lk 10 saniyede yat\u0131r\u0131mc\u0131y\u0131 yakala.' : 'Hook the investor in the first 10 seconds.',
    visual: isTR ? 'B\u00FCy\u00FCk logo + UVP tek c\u00FCmle' : 'Large logo + UVP one-liner',
  });

  // 2. Problem
  slides.push({
    title: isTR ? 'Problem' : 'Problem',
    message: p('A_pazar.problem'),
    content: [safeVal(p('A_pazar.problem')), `${isTR ? 'Hedef' : 'Target'}: ${safeVal(p('A_pazar.hedef_kitle'))}`],
    note: isTR ? 'Empati kur \u2014 "Bu sorunu ya\u015F\u0131yor musunuz?"' : 'Build empathy \u2014 "Have you experienced this?"',
    visual: isTR ? '\u0130kon veya b\u00FCy\u00FCk rakam' : 'Icon or large number',
  });

  // 3. Çözüm
  slides.push({
    title: isTR ? '\u00C7\u00F6z\u00FCm' : 'Solution',
    message: p('A_pazar.cozum'),
    content: [safeVal(p('A_pazar.cozum'))],
    note: isTR ? 'Basit tut, teknik detaya girme.' : 'Keep it simple, no technical details.',
    visual: isTR ? '3 ad\u0131ml\u0131 ak\u0131\u015F diyagram\u0131 veya mockup' : '3-step flow or mockup',
  });

  // 4. Neden Şimdi
  slides.push({
    title: isTR ? 'Neden \u015Eimdi' : 'Why Now',
    message: isTR ? 'Timing m\u00FCkemmel' : 'Perfect timing',
    content: extractTimingBullets(p('A_pazar.timing', {})),
    note: isTR ? 'Urgency yarat \u2014 "1 y\u0131l sonra \u00E7ok ge\u00E7"' : 'Create urgency \u2014 "Too late in 1 year"',
    visual: 'Timeline / trend arrows',
  });

  // 5. Demo
  slides.push({
    title: isTR ? 'Demo / \u00DCr\u00FCn' : 'Demo / Product',
    message: isTR ? 'B\u00F6yle \u00E7al\u0131\u015F\u0131yor' : 'How it works',
    content: [`${isTR ? '\u0130\u015F Modeli' : 'Business Model'}: ${safeVal(p('C_strateji.is_modeli.tip'))}`],
    note: isTR ? 'G\u00F6ster, anlatma \u2014 mockup/screenshot' : 'Show, don\'t tell \u2014 mockup/screenshot',
    visual: 'Product screenshots / mockup',
  });

  // 6. Pazar
  slides.push({
    title: isTR ? 'Pazar F\u0131rsat\u0131' : 'Market Opportunity',
    message: isTR ? 'Pazar b\u00FCy\u00FCk ve b\u00FCy\u00FCyor' : 'Large and growing market',
    content: [
      `TAM: $${p('A_pazar.tam', 0)}M`,
      `SAM: $${p('A_pazar.sam', 0)}M`,
      `SOM (3Y): $${p('A_pazar.som_3yil', 0)}M`,
      `CAGR: ${fmtPct(p('A_pazar.cagr_tr', 0))}`,
    ],
    note: isTR ? 'Huni g\u00F6rseli \u2014 "Nereyi hedefliyoruz?"' : 'Funnel visual \u2014 "Where we\'re targeting"',
    visual: 'TAM \u2192 SAM \u2192 SOM funnel',
  });

  // 7. Traction
  slides.push({
    title: isTR ? 'Traction & Validasyon' : 'Traction & Validation',
    message: isTR ? 'Kan\u0131t var' : 'Evidence exists',
    content: [isTR ? 'Pilot, LOI, waitlist, kullan\u0131c\u0131 verisi' : 'Pilot, LOI, waitlist, user data'],
    note: isTR ? 'Hen\u00FCz yoksa bile: "Bu verileri topluyoruz"' : 'Even if none yet: "We\'re collecting this data"',
    visual: isTR ? 'Metrik kartlar\u0131 veya b\u00FCy\u00FCme grafi\u011Fi' : 'Metric cards or growth chart',
  });

  // 8. İş Modeli
  slides.push({
    title: isTR ? '\u0130\u015F Modeli' : 'Business Model',
    message: isTR ? 'Para b\u00F6yle kazan\u0131lacak' : 'Revenue model',
    content: [`Model: ${safeVal(p('C_strateji.is_modeli.tip'))}`, `LTV:CAC = ${safeVal(p('C_strateji.birim_ekonomisi.ltv_cac_oran'))}:1`],
    note: isTR ? 'Fiyatlama tablosu + LTV:CAC' : 'Pricing table + LTV:CAC',
    visual: isTR ? 'Fiyatlama tablosu (katman kar\u015F\u0131la\u015Ft\u0131rma)' : 'Pricing comparison table',
  });

  // 9. Rekabet
  slides.push({
    title: isTR ? 'Rekabet' : 'Competition',
    message: isTR ? 'Farkl\u0131y\u0131z ve savunulabilir' : 'Different and defensible',
    content: [`Moat: ${safeVal(p('B_rekabet.moat_tipi'))}`, `UVP: ${safeVal(p('B_rekabet.uvp'))}`],
    note: isTR ? '2\u00D72 matris g\u00F6rseli \u2014 biz sa\u011F \u00FCstteyiz' : '2×2 matrix \u2014 we\'re top right',
    visual: '2×2 positioning matrix',
  });

  // 10. GTM
  slides.push({
    title: isTR ? 'GTM Stratejisi' : 'GTM Strategy',
    message: isTR ? 'M\u00FC\u015Fteriye b\u00F6yle ula\u015Faca\u011F\u0131z' : 'How we reach customers',
    content: [
      `ICP: ${safeVal(p('C_strateji.gtm.icp'))}`,
      `Beachhead: ${safeVal(p('C_strateji.gtm.beachhead'))}`,
      `${isTR ? 'B\u00FCy\u00FCme' : 'Growth'}: ${safeVal(p('C_strateji.gtm.buyume_motoru'))}`,
    ],
    note: isTR ? 'ICP profili + top 3 kanal' : 'ICP profile + top 3 channels',
    visual: isTR ? 'Kanal ikonlar\u0131 + CAC rakamlar\u0131' : 'Channel icons + CAC numbers',
  });

  // 11. Finansal
  slides.push({
    title: isTR ? 'Finansal Projeksiyon' : 'Financial Projections',
    message: isTR ? 'B\u00FCy\u00FCme yolu net' : 'Clear growth path',
    content: [isTR ? '5 y\u0131l ARR + break-even noktas\u0131' : '5-year ARR + break-even point'],
    note: isTR ? '5 y\u0131l \u00E7izgi grafik + break-even vurgula' : '5-year line chart + highlight break-even',
    visual: isTR ? '\u00C7izgi grafik (ARR 5Y) + bar chart (senaryo)' : 'Line chart (ARR 5Y) + bar chart (scenarios)',
  });

  // 12. Ekip
  slides.push({
    title: isTR ? 'Ekip' : 'Team',
    message: isTR ? 'Do\u011Fru ekip bu i\u015Fi yapabilir' : 'The right team for this',
    content: [isTR ? 'Kurucu profili + tamamlay\u0131c\u0131 yetkinlikler' : 'Founder profiles + complementary skills'],
    note: isTR ? 'Tamamlay\u0131c\u0131 yetkinlikleri vurgula' : 'Highlight complementary skills',
    visual: isTR ? 'Foto + k\u0131sa bio' : 'Photos + short bios',
  });

  // 13. The Ask
  slides.push({
    title: isTR ? 'Yat\u0131r\u0131m Talebi' : 'The Ask',
    message: isTR ? 'Bu kadar laz\u0131m, b\u00F6yle harcayaca\u011F\u0131z' : 'This is what we need and how we\'ll use it',
    content: (() => {
      const f = get(state, 'D_final.finansal.fonlama', []);
      const f0 = Array.isArray(f) ? f[0] : f;
      return f0 ? [`${safeVal(f0.tutar)} ${safeVal(f0.tur)}`, safeVal(f0.kullanim)] : [''];
    })(),
    note: isTR ? 'Use of funds pasta + milestones' : 'Use of funds pie + milestones',
    visual: isTR ? 'Pasta grafik + milestone timeline' : 'Pie chart + milestone timeline',
  });

  // 14. Kapanış
  slides.push({
    title: isTR ? 'Kapan\u0131\u015F & CTA' : 'Closing & CTA',
    message: isTR ? 'Birlikte b\u00FCy\u00FCyelim' : 'Let\'s grow together',
    content: [safeVal(p('B_rekabet.uvp'))],
    note: isTR ? 'Net sonraki ad\u0131m: "Demo g\u00F6rmek ister misiniz?"' : 'Clear next step: "Want to see a demo?"',
    visual: isTR ? '\u0130leti\u015Fim bilgileri + CTA' : 'Contact info + CTA',
  });

  // Glocal/Global ek slide'lar
  if (kapsam === 'Glocal' || kapsam === 'Global') {
    slides.splice(6, 0, {
      title: isTR ? 'Global F\u0131rsat' : 'Global Opportunity',
      message: isTR ? 'Global pazar\u0131 hedefliyoruz' : 'Targeting global market',
      content: [`Global TAM: $${safeVal(p('A_pazar.global_pazar.toplam'))}M`],
      note: isTR ? 'B\u00F6lgesel f\u0131rsatlar\u0131 g\u00F6ster' : 'Show regional opportunities',
      visual: 'World map with target regions',
    });

    slides.splice(12, 0, {
      title: isTR ? 'Geni\u015Fleme Yol Haritas\u0131' : 'Expansion Roadmap',
      message: isTR ? 'Ad\u0131m ad\u0131m b\u00FCy\u00FCyece\u011Fiz' : 'Step by step growth',
      content: [isTR ? 'Faz 1: T\u00FCrkiye \u2192 Faz 2: B\u00F6lgesel \u2192 Faz 3: Global' : 'Phase 1: Turkey \u2192 Phase 2: Regional \u2192 Phase 3: Global'],
      note: isTR ? 'Her faz i\u00E7in metrikler ve milestones' : 'Metrics and milestones per phase',
      visual: 'Phased timeline',
    });
  }

  return slides;
}

function extractTimingBullets(timing: any): string[] {
  if (!timing || typeof timing !== 'object') return [''];
  const items: string[] = [];
  for (const [key, val] of Object.entries(timing)) {
    if (val) {
      const text = typeof val === 'object' ? ((val as any).aciklama || (val as any).desc || '') : String(val);
      if (text) items.push(`${key}: ${text}`);
    }
  }
  return items.length > 0 ? items.slice(0, 4) : [''];
}

// ── Slide formatting helpers ──────────────────────

function slideHeader(num: number, title: string): Table {
  return new Table({
    width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [PAGE.CONTENT_WIDTH],
    rows: [new TableRow({
      children: [new TableCell({
        borders: NO_BORDERS,
        shading: { fill: C.NAVY, type: ShadingType.CLEAR },
        width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 150, right: 150 },
        children: [new Paragraph({
          children: [
            new TextRun({ text: `SLIDE ${num}`, font: 'Calibri', size: 20, bold: true, color: C.ACCENT }),
            new TextRun({ text: `  \u2014  ${title}`, font: 'Calibri', size: 20, color: C.WHITE }),
          ],
        })],
      })],
    })],
  });
}

function speakerNote(text: string, isTR: boolean): Paragraph {
  return new Paragraph({
    spacing: { before: 20, after: 20 },
    border: { left: { style: BorderStyle.SINGLE, size: 3, color: 'D97706', space: 8 } },
    indent: { left: 200 },
    children: [
      new TextRun({ text: isTR ? '\uD83C\uDFA4 Konu\u015Fmac\u0131 Notu: ' : '\uD83C\uDFA4 Speaker Note: ', font: 'Calibri', size: 19, bold: true, color: 'D97706' }),
      new TextRun({ text, font: 'Calibri', size: 19, italics: true, color: C.MUTED }),
    ],
  });
}

function visualSuggestion(text: string, isTR: boolean): Paragraph {
  return new Paragraph({
    spacing: { before: 20, after: 20 },
    border: { left: { style: BorderStyle.SINGLE, size: 3, color: '6366F1', space: 8 } },
    indent: { left: 200 },
    children: [
      new TextRun({ text: isTR ? '\uD83C\uDFA8 G\u00F6rsel: ' : '\uD83C\uDFA8 Visual: ', font: 'Calibri', size: 19, bold: true, color: '6366F1' }),
      new TextRun({ text, font: 'Calibri', size: 19, italics: true, color: C.MUTED }),
    ],
  });
}
