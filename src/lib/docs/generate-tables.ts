// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Detaylı Tablo Dokümanları
// rekabet docx | risk docx | finansal docx | gtm docx
// ═══════════════════════════════════════════════════════════

import { Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign } from 'docx';
import {
  C, PAGE, BORDERS, NO_BORDERS,
  h1, h2, h3, body, spacer, pageBreak, bullet, numberedItem,
  makeTable, highlightBox, createDocument, packDoc,
  fmtMoney, fmtDual, fmtPct, safeVal, get,
} from './styles';

// ═══════════════════════════════════════════════════════════
// F) REKABET ANALİZİ
// ═══════════════════════════════════════════════════════════

export async function generateRekabet(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const lang = langOverride || get(state, 'meta.dil', 'tr');
  const isTR = lang === 'tr';
  const kur = get(state, 'meta.usd_try_kur', 34);
  const fikir = get(state, 'meta.fikir_adi', 'Startup');
  const tarih = get(state, 'meta.tarih', '');
  const kapsam = get(state, 'meta.kapsam', 'Yerel');

  const rakipler = get(state, 'B_rekabet.dogrudan_rakipler', []);
  const dolayliRakipler = get(state, 'B_rekabet.dolayli_rakipler', []);
  const porter = get(state, 'B_rekabet.porter', {});
  const swot = get(state, 'B_rekabet.swot', {});
  const tows = get(state, 'B_rekabet.tows', {});
  const uvp = get(state, 'B_rekabet.uvp', '');
  const moat = get(state, 'B_rekabet.moat_tipi', '');
  const moatSuresi = get(state, 'B_rekabet.moat_suresi', '');
  const blueOcean = get(state, 'B_rekabet.blue_ocean', null);
  const globalRakipler = get(state, 'B_rekabet.global_rakipler', []);

  const children: (Paragraph | Table)[] = [];

  // 1. Yönetici Özeti
  children.push(h1(isTR ? 'REKABET ANAL\u0130Z\u0130' : 'COMPETITIVE ANALYSIS'));
  children.push(body(isTR
    ? `${fikir} rekabet ortam\u0131 analizi. ${rakipler.length} do\u011Frudan rakip tespit edilmi\u015Ftir. Ana farkl\u0131la\u015Fma: ${uvp}`
    : `Competition analysis for ${fikir}. ${rakipler.length} direct competitors identified. Key differentiator: ${uvp}`
  ));

  // 2. Doğrudan Rakipler
  children.push(pageBreak());
  children.push(h1(isTR ? 'DO\u011ERUDAN RAK\u0130PLER' : 'DIRECT COMPETITORS'));

  if (rakipler.length > 0) {
    children.push(makeTable({
      headers: [
        isTR ? '\u015Eirket' : 'Company',
        isTR ? 'Kurulu\u015F/Fonlama' : 'Founded/Funding',
        isTR ? 'G\u00FC\u00E7l\u00FC Y\u00F6n' : 'Strength',
        isTR ? 'Zay\u0131f Y\u00F6n' : 'Weakness',
        isTR ? 'Tehdit' : 'Threat',
      ],
      rows: rakipler.map((r: any) => [
        safeVal(r.ad || r.sirket),
        safeVal(r.fonlama || r.kurulusfonlama),
        safeVal(r.guclu_yon || r.guclu),
        safeVal(r.zayif_yon || r.zayif),
        safeVal(r.tehdit),
      ]),
      colWidths: [1600, 1800, 2200, 2200, 1554],
    }));
  }

  // 3. Dolaylı Rakipler
  if (dolayliRakipler.length > 0 || typeof dolayliRakipler === 'string') {
    children.push(spacer(80));
    children.push(h2(isTR ? 'DOLAYLI RAK\u0130PLER & ALTERNAT\u0130FLER' : 'INDIRECT COMPETITORS & ALTERNATIVES'));
    if (typeof dolayliRakipler === 'string') {
      children.push(body(dolayliRakipler));
    } else {
      dolayliRakipler.forEach((r: any) => {
        const text = typeof r === 'string' ? r : `${safeVal(r.ad)}: ${safeVal(r.aciklama)}`;
        children.push(bullet(text));
      });
    }
  }

  // 4. Porter'ın 5 Gücü
  children.push(pageBreak());
  children.push(h1(isTR ? 'PORTER\'IN 5 G\u00DCC\u00DC ANAL\u0130Z\u0130' : 'PORTER\'S FIVE FORCES'));

  const porterKeys = [
    { key: 'mevcut_rekabet', tr: 'Mevcut Rekabet', en: 'Industry Rivalry' },
    { key: 'yeni_giris', tr: 'Yeni Giri\u015F Tehdidi', en: 'Threat of New Entrants' },
    { key: 'ikame', tr: '\u0130kame \u00DCr\u00FCn Tehdidi', en: 'Threat of Substitutes' },
    { key: 'tedarikci', tr: 'Tedarik\u00E7i G\u00FCc\u00FC', en: 'Supplier Power' },
    { key: 'alici', tr: 'Al\u0131c\u0131 G\u00FCc\u00FC', en: 'Buyer Power' },
  ];

  porterKeys.forEach(pk => {
    const val = porter[pk.key];
    if (val) {
      const seviye = typeof val === 'object' ? (val.seviye || val.level || '') : val;
      const aciklama = typeof val === 'object' ? (val.aciklama || val.desc || '') : '';
      children.push(h3(`${isTR ? pk.tr : pk.en}: ${seviye}`));
      if (aciklama) children.push(body(aciklama));
      children.push(spacer(40));
    }
  });

  // 5. SWOT Matrisi
  children.push(pageBreak());
  children.push(h1('SWOT'));

  const swotData = [
    { title: isTR ? 'G\u00FC\u00E7l\u00FC Y\u00F6nler (S)' : 'Strengths', items: swot.strengths || swot.S || [], bg: 'E8F5E9' },
    { title: isTR ? 'Zay\u0131f Y\u00F6nler (W)' : 'Weaknesses', items: swot.weaknesses || swot.W || [], bg: 'FFF3E0' },
    { title: isTR ? 'F\u0131rsatlar (O)' : 'Opportunities', items: swot.opportunities || swot.O || [], bg: 'E3F2FD' },
    { title: isTR ? 'Tehditler (T)' : 'Threats', items: swot.threats || swot.T || [], bg: 'FFEBEE' },
  ];

  // 2×2 grid olarak
  const halfW = Math.floor(PAGE.CONTENT_WIDTH / 2);
  for (let i = 0; i < swotData.length; i += 2) {
    const left = swotData[i];
    const right = swotData[i + 1];
    if (left && right) {
      children.push(swotRow(left, right, halfW));
      children.push(spacer(20));
    }
  }

  // 6. TOWS
  if (tows && Object.keys(tows).length > 0) {
    children.push(spacer(60));
    children.push(h2('TOWS'));
    const towsKeys = [
      { key: 'SO', tr: 'SO Stratejileri', en: 'SO Strategies' },
      { key: 'ST', tr: 'ST Stratejileri', en: 'ST Strategies' },
      { key: 'WO', tr: 'WO Stratejileri', en: 'WO Strategies' },
      { key: 'WT', tr: 'WT Stratejileri', en: 'WT Strategies' },
    ];
    towsKeys.forEach(tk => {
      const val = tows[tk.key];
      if (val) {
        children.push(h3(isTR ? tk.tr : tk.en));
        if (Array.isArray(val)) val.forEach((v: string) => children.push(bullet(v)));
        else children.push(body(String(val)));
      }
    });
  }

  // 7. UVP & Moat
  children.push(pageBreak());
  children.push(h1(isTR ? 'UVP & MOAT ANAL\u0130Z\u0130' : 'UVP & MOAT ANALYSIS'));
  children.push(h3('Unique Value Proposition'));
  children.push(highlightBox([
    new Paragraph({ children: [new TextRun({ text: uvp, font: 'Calibri', size: 22, bold: true, color: C.NAVY })] }),
  ]));
  children.push(spacer(40));
  children.push(h3(`Moat: ${moat} (${moatSuresi})`));

  // 8. Blue Ocean (varsa)
  if (blueOcean) {
    children.push(spacer(60));
    children.push(h2('BLUE OCEAN'));
    if (typeof blueOcean === 'string') children.push(body(blueOcean));
    else {
      const boKeys = ['eliminate', 'reduce', 'raise', 'create', 'eleme', 'azalt', 'artir', 'yarat'];
      boKeys.forEach(k => {
        if (blueOcean[k]) {
          children.push(h3(k.toUpperCase()));
          if (Array.isArray(blueOcean[k])) blueOcean[k].forEach((v: string) => children.push(bullet(v)));
          else children.push(body(String(blueOcean[k])));
        }
      });
    }
  }

  // 9. Global Rakipler (Glocal/Global)
  if ((kapsam === 'Glocal' || kapsam === 'Global') && globalRakipler.length > 0) {
    children.push(pageBreak());
    children.push(h1(isTR ? 'GLOBAL RAK\u0130PLER' : 'GLOBAL COMPETITORS'));
    children.push(makeTable({
      headers: [isTR ? '\u015Eirket' : 'Company', isTR ? 'B\u00F6lge' : 'Region', isTR ? 'Fonlama' : 'Funding', isTR ? 'Not' : 'Notes'],
      rows: globalRakipler.map((r: any) => [
        safeVal(r.ad || r.sirket),
        safeVal(r.bolge || r.region),
        safeVal(r.fonlama),
        safeVal(r.not || r.aciklama),
      ]),
      colWidths: [2000, 2000, 2000, 3354],
    }));
  }

  return packDoc(createDocument({ companyName: fikir, docType: isTR ? 'Rekabet Analizi' : 'Competitive Analysis', date: tarih, lang, children }));
}

// ═══════════════════════════════════════════════════════════
// G) RİSK MATRİSİ
// ═══════════════════════════════════════════════════════════

export async function generateRisk(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const lang = langOverride || get(state, 'meta.dil', 'tr');
  const isTR = lang === 'tr';
  const fikir = get(state, 'meta.fikir_adi', 'Startup');
  const tarih = get(state, 'meta.tarih', '');
  const riskler = get(state, 'C_strateji.riskler', {});
  const killRisk = riskler.kill_risk || riskler.killRisk;
  const topRisks = riskler.top || riskler.riskler || [];
  const premortem = riskler.pre_mortem || riskler.premortem || [];

  const children: (Paragraph | Table)[] = [];

  // 1. Yönetici Özeti
  children.push(h1(isTR ? 'R\u0130SK MATR\u0130S\u0130' : 'RISK MATRIX'));
  const killText = killRisk
    ? (typeof killRisk === 'object' ? (killRisk.aciklama || killRisk.desc || JSON.stringify(killRisk)) : String(killRisk))
    : (isTR ? 'Tespit edilmedi' : 'Not identified');
  children.push(body(isTR
    ? `Kill Risk: ${killText}`
    : `Kill Risk: ${killText}`
  ));

  // 2. Kill Risk Banner
  if (killRisk) {
    children.push(spacer(40));
    children.push(highlightBox([
      new Paragraph({
        children: [
          new TextRun({ text: '\u26A0\uFE0F KILL RISK: ', font: 'Calibri', size: 22, bold: true, color: C.DANGER }),
          new TextRun({ text: killText, font: 'Calibri', size: 21, color: C.TEXT }),
        ],
      }),
    ]));
  }

  // 3. Risk Tablosu
  children.push(pageBreak());
  children.push(h1(isTR ? 'TOP R\u0130SKLER' : 'TOP RISKS'));

  if (Array.isArray(topRisks) && topRisks.length > 0) {
    children.push(makeTable({
      headers: ['#', isTR ? 'Risk' : 'Risk', isTR ? 'Kategori' : 'Category', isTR ? 'Olas\u0131l\u0131k' : 'Likelihood', isTR ? 'Etki' : 'Impact', isTR ? 'Azaltma' : 'Mitigation'],
      rows: topRisks.map((r: any, i: number) => [
        String(i + 1),
        safeVal(r.risk || r.baslik || r.ad),
        safeVal(r.kategori || r.category),
        safeVal(r.olasilik || r.likelihood),
        safeVal(r.etki || r.impact),
        safeVal(r.azaltma || r.mitigation),
      ]),
      colWidths: [400, 2200, 1400, 1200, 1200, 2954],
    }));
  }

  // 4. Pre-Mortem Senaryolar
  if (Array.isArray(premortem) && premortem.length > 0) {
    children.push(pageBreak());
    children.push(h1(isTR ? 'PRE-MORTEM SENARYOLAR' : 'PRE-MORTEM SCENARIOS'));

    premortem.forEach((pm: any, i: number) => {
      children.push(h2(`${isTR ? 'Senaryo' : 'Scenario'} ${i + 1}: ${safeVal(pm.baslik || pm.title)}`));
      if (pm.ne_oldu || pm.what_happened) children.push(body(`${isTR ? 'Ne oldu' : 'What happened'}: ${pm.ne_oldu || pm.what_happened}`));
      if (pm.kor_nokta || pm.blind_spot) children.push(body(`${isTR ? 'K\u00F6r nokta' : 'Blind spot'}: ${pm.kor_nokta || pm.blind_spot}`));
      if (pm.erken_uyari || pm.early_warning) children.push(body(`${isTR ? 'Erken uyar\u0131' : 'Early warning'}: ${pm.erken_uyari || pm.early_warning}`));
      if (pm.test_90gun || pm.test_90day) children.push(body(`90 ${isTR ? 'g\u00FCn testi' : 'day test'}: ${pm.test_90gun || pm.test_90day}`));
      children.push(spacer(40));
    });
  }

  // 5. Risk Azaltma Yolharitası
  if (Array.isArray(topRisks) && topRisks.length > 0) {
    children.push(pageBreak());
    children.push(h1(isTR ? 'R\u0130SK AZALTMA YOLHAR\u0130TASI' : 'RISK MITIGATION ROADMAP'));
    children.push(makeTable({
      headers: [
        isTR ? 'Risk' : 'Risk',
        isTR ? '30 G\u00FCn' : '30 Days',
        isTR ? '90 G\u00FCn' : '90 Days',
        isTR ? '180 G\u00FCn' : '180 Days',
      ],
      rows: topRisks.slice(0, 5).map((r: any) => [
        safeVal(r.risk || r.baslik || r.ad),
        safeVal(r.azaltma_30 || r.azaltma || 'Test & validate'),
        safeVal(r.azaltma_90 || 'Monitor & optimize'),
        safeVal(r.azaltma_180 || 'Scale safeguards'),
      ]),
      colWidths: [2400, 2318, 2318, 2318],
    }));
  }

  return packDoc(createDocument({ companyName: fikir, docType: isTR ? 'Risk Matrisi' : 'Risk Matrix', date: tarih, lang, children }));
}

// ═══════════════════════════════════════════════════════════
// H) FİNANSAL PROJEKSİYON
// ═══════════════════════════════════════════════════════════

export async function generateFinansal(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const lang = langOverride || get(state, 'meta.dil', 'tr');
  const isTR = lang === 'tr';
  const kur = get(state, 'meta.usd_try_kur', 34);
  const fikir = get(state, 'meta.fikir_adi', 'Startup');
  const tarih = get(state, 'meta.tarih', '');

  const varsayimlar = get(state, 'D_final.finansal.varsayimlar', {});
  const projYillik = get(state, 'D_final.finansal.projeksiyon_yillik', []);
  const senaryo = get(state, 'D_final.finansal.senaryo', {});
  const breakeven = get(state, 'D_final.finansal.breakeven_ay', 0);
  const fonlama = get(state, 'D_final.finansal.fonlama', []);
  const useOfFunds = get(state, 'D_final.finansal.use_of_funds', {});
  const birimEko = get(state, 'C_strateji.birim_ekonomisi', {});
  const exitData = get(state, 'D_final.exit', []);

  const children: (Paragraph | Table)[] = [];

  // 1. Yönetici Özeti
  children.push(h1(isTR ? 'F\u0130NANSAL PROJEKS\u0130YON' : 'FINANCIAL PROJECTIONS'));
  children.push(body(isTR
    ? `Bu dok\u00FCman ${fikir} i\u00E7in 5 y\u0131ll\u0131k finansal projeksiyonlar\u0131 i\u00E7ermektedir. T\u00FCm tahminler varsay\u0131mlara dayal\u0131d\u0131r.`
    : `This document contains 5-year financial projections for ${fikir}. All estimates are assumption-based.`
  ));

  // 2. Temel Varsayımlar
  children.push(spacer(60));
  children.push(h2(isTR ? 'TEMEL VARSAYIMLAR' : 'KEY ASSUMPTIONS'));

  const assumptionRows: string[][] = [];
  if (varsayimlar.arpu_usd) assumptionRows.push(['ARPU', fmtDual(varsayimlar.arpu_usd, kur) + '/mo']);
  if (varsayimlar.buyume_aylik_pct) assumptionRows.push([isTR ? 'Ayl\u0131k B\u00FCy\u00FCme' : 'Monthly Growth', fmtPct(varsayimlar.buyume_aylik_pct)]);
  if (varsayimlar.churn_aylik_pct) assumptionRows.push([isTR ? 'Ayl\u0131k Churn' : 'Monthly Churn', fmtPct(varsayimlar.churn_aylik_pct)]);
  if (varsayimlar.brut_marj_pct) assumptionRows.push([isTR ? 'Br\u00FCt Marj' : 'Gross Margin', fmtPct(varsayimlar.brut_marj_pct)]);
  if (varsayimlar.cac_usd) assumptionRows.push(['CAC', fmtDual(varsayimlar.cac_usd, kur)]);
  if (birimEko.cac) assumptionRows.push(['CAC', fmtDual(birimEko.cac, kur)]);
  if (birimEko.arpu_aylik) assumptionRows.push(['ARPU', fmtDual(birimEko.arpu_aylik, kur) + '/mo']);

  if (assumptionRows.length > 0) {
    children.push(makeTable({
      headers: [isTR ? 'Parametre' : 'Parameter', isTR ? 'De\u011Fer' : 'Value'],
      rows: assumptionRows,
      colWidths: [4500, 4854],
    }));
  }

  // 3. 5 Yıllık Projeksiyon
  children.push(pageBreak());
  children.push(h1(isTR ? '5 YILLIK PROJEKS\u0130YON' : '5-YEAR PROJECTION'));

  const projArray = normalizeProjectionArray(projYillik);
  if (projArray.length > 0) {
    const yearHeaders = ['', ...projArray.map((p: any) => `${isTR ? 'Y\u0131l' : 'Year'} ${p.yil}`)];
    const metricsMap = [
      { key: 'musteri', label: isTR ? 'M\u00FC\u015Fteri' : 'Customers' },
      { key: 'arr', label: 'ARR', format: 'money' },
      { key: 'brut_kar', label: isTR ? 'Br\u00FCt K\u00E2r' : 'Gross Profit', format: 'money' },
      { key: 'ebitda', label: 'EBITDA', format: 'money' },
      { key: 'donem_sonu_nakit', label: isTR ? 'Nakit' : 'Cash', format: 'money' },
    ];

    children.push(makeTable({
      headers: yearHeaders,
      rows: metricsMap.map(m => [
        m.label,
        ...projArray.map((p: any) => {
          const val = p[m.key] || p[m.key + '_usd'] || 0;
          return m.format === 'money' ? fmtMoney(parseNum(val)) : safeVal(val);
        }),
      ]),
      colWidths: [1800, ...projArray.map(() => Math.floor((PAGE.CONTENT_WIDTH - 1800) / projArray.length))],
    }));
  }

  // Break-even
  children.push(spacer(40));
  children.push(body(`Break-even: ${breakeven} ${isTR ? 'ay' : 'months'}`, { bold: true, color: C.ACCENT }));

  // 4. Senaryo Analizi
  if (senaryo && (senaryo.gercekci || senaryo.baz)) {
    children.push(spacer(80));
    children.push(h2(isTR ? 'SENARYO ANAL\u0130Z\u0130' : 'SCENARIO ANALYSIS'));

    children.push(makeTable({
      headers: ['', isTR ? 'K\u00F6t\u00FCmser' : 'Bear', isTR ? 'Baz' : 'Base', isTR ? '\u0130yimser' : 'Bull'],
      rows: [
        [`ARR ${isTR ? 'Y\u0131l 3' : 'Year 3'}`,
          fmtMoney(parseNum(get(senaryo, 'kotumser.arr_yil3', 0))),
          fmtMoney(parseNum(get(senaryo, 'gercekci.arr_yil3', get(senaryo, 'baz.arr_yil3', 0)))),
          fmtMoney(parseNum(get(senaryo, 'iyimser.arr_yil3', 0))),
        ],
        [`ARR ${isTR ? 'Y\u0131l 5' : 'Year 5'}`,
          fmtMoney(parseNum(get(senaryo, 'kotumser.arr_yil5', 0))),
          fmtMoney(parseNum(get(senaryo, 'gercekci.arr_yil5', get(senaryo, 'baz.arr_yil5', 0)))),
          fmtMoney(parseNum(get(senaryo, 'iyimser.arr_yil5', 0))),
        ],
        ['Break-even',
          `${get(senaryo, 'kotumser.breakeven_ay', '—')} ${isTR ? 'ay' : 'mo'}`,
          `${get(senaryo, 'gercekci.breakeven_ay', get(senaryo, 'baz.breakeven_ay', breakeven))} ${isTR ? 'ay' : 'mo'}`,
          `${get(senaryo, 'iyimser.breakeven_ay', '—')} ${isTR ? 'ay' : 'mo'}`,
        ],
      ],
      colWidths: [2200, 2384, 2385, 2385],
    }));
  }

  // 7. Fonlama Planı
  children.push(pageBreak());
  children.push(h1(isTR ? 'FONLAMA PLANI' : 'FUNDING PLAN'));

  const fonArray = Array.isArray(fonlama) ? fonlama : [fonlama].filter(Boolean);
  if (fonArray.length > 0) {
    children.push(makeTable({
      headers: [isTR ? 'Tur' : 'Round', isTR ? 'Tutar' : 'Amount', isTR ? 'D\u00F6nem' : 'Timing', isTR ? 'Kullan\u0131m' : 'Use', 'Milestones'],
      rows: fonArray.map((f: any) => [
        safeVal(f.tur || f.round),
        safeVal(f.tutar || f.amount),
        safeVal(f.donem || f.timing),
        safeVal(f.kullanim || f.use),
        safeVal(f.milestones),
      ]),
      colWidths: [1400, 1400, 1400, 2777, 2377],
    }));
  }

  // Use of Funds
  if (useOfFunds && Object.keys(useOfFunds).length > 0) {
    children.push(spacer(40));
    children.push(h3(isTR ? 'Kullan\u0131m Da\u011F\u0131l\u0131m\u0131' : 'Use of Funds'));
    children.push(makeTable({
      headers: [isTR ? 'Kategori' : 'Category', '%'],
      rows: [
        [isTR ? '\u00DCr\u00FCn Geli\u015Ftirme' : 'Product Dev', `${useOfFunds.urun_pct || 0}%`],
        [isTR ? 'Pazarlama' : 'Marketing', `${useOfFunds.pazarlama_pct || 0}%`],
        [isTR ? 'Ekip' : 'Team', `${useOfFunds.ekip_pct || 0}%`],
        ['G&A', `${useOfFunds.genel_pct || 0}%`],
      ],
      colWidths: [5000, 4354],
    }));
  }

  // 8. Exit
  const exits = Array.isArray(exitData) ? exitData : [];
  if (exits.length > 0) {
    children.push(spacer(80));
    children.push(h2(isTR ? 'EXIT DE\u011EERLEME' : 'EXIT VALUATION'));
    children.push(makeTable({
      headers: [isTR ? 'Senaryo' : 'Scenario', isTR ? 'Y\u00F6ntem' : 'Method', isTR ? 'De\u011Fer' : 'Value', isTR ? 'Zaman' : 'Timeline'],
      rows: exits.map((e: any) => [
        safeVal(e.sira), safeVal(e.yontem), safeVal(e.deger), safeVal(e.zaman),
      ]),
      colWidths: [2000, 2451, 2452, 2451],
    }));
  }

  return packDoc(createDocument({ companyName: fikir, docType: isTR ? 'Finansal Projeksiyon' : 'Financial Projections', date: tarih, lang, children }));
}

// ═══════════════════════════════════════════════════════════
// I) GTM PLANI
// ═══════════════════════════════════════════════════════════

export async function generateGTM(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const lang = langOverride || get(state, 'meta.dil', 'tr');
  const isTR = lang === 'tr';
  const kur = get(state, 'meta.usd_try_kur', 34);
  const fikir = get(state, 'meta.fikir_adi', 'Startup');
  const tarih = get(state, 'meta.tarih', '');

  const gtm = get(state, 'C_strateji.gtm', {});
  const isModeli = get(state, 'C_strateji.is_modeli', {});
  const birimEko = get(state, 'C_strateji.birim_ekonomisi', {});

  const children: (Paragraph | Table)[] = [];

  // 1. Yönetici Özeti
  children.push(h1(isTR ? 'GTM PLANI' : 'GO-TO-MARKET PLAN'));
  children.push(body(isTR
    ? `${fikir} i\u00E7in pazar giri\u015F stratejisi. B\u00FCy\u00FCme motoru: ${safeVal(gtm.buyume_motoru)}. Beachhead: ${safeVal(gtm.beachhead)}.`
    : `Go-to-market strategy for ${fikir}. Growth engine: ${safeVal(gtm.buyume_motoru)}. Beachhead: ${safeVal(gtm.beachhead)}.`
  ));

  // 2. ICP
  children.push(spacer(60));
  children.push(h2(isTR ? 'ICP PROF\u0130L\u0130' : 'IDEAL CUSTOMER PROFILE'));
  children.push(body(safeVal(gtm.icp)));

  // 3. Beachhead
  children.push(spacer(60));
  children.push(h2('BEACHHEAD MARKET'));
  children.push(body(safeVal(gtm.beachhead)));

  // 4. Büyüme Motoru
  children.push(spacer(60));
  children.push(h2(isTR ? 'B\u00DCY\u00DCME MOTORU' : 'GROWTH ENGINE'));
  children.push(body(safeVal(gtm.buyume_motoru)));

  // 5. Edinim Kanalları
  const kanallar = gtm.kanallar || [];
  if (Array.isArray(kanallar) && kanallar.length > 0) {
    children.push(pageBreak());
    children.push(h1(isTR ? 'ED\u0130N\u0130M KANALLARI' : 'ACQUISITION CHANNELS'));
    children.push(makeTable({
      headers: [
        isTR ? 'Kanal' : 'Channel',
        'CAC ($)',
        isTR ? '\u00D6l\u00E7ek' : 'Scale',
        isTR ? 'H\u0131z' : 'Speed',
        isTR ? '\u00D6ncelik' : 'Priority',
      ],
      rows: kanallar.map((k: any) => {
        if (typeof k === 'string') return [k, '—', '—', '—', '—'];
        return [
          safeVal(k.kanal || k.ad || k.channel),
          fmtDual(k.cac, kur),
          safeVal(k.olcek || k.scale),
          safeVal(k.hiz || k.speed),
          safeVal(k.oncelik || k.priority),
        ];
      }),
      colWidths: [2200, 1800, 1600, 1400, 2354],
    }));
  }

  // 6. Fiyatlama
  const fiyatlar = isModeli.fiyatlar || gtm.fiyatlama;
  if (fiyatlar && typeof fiyatlar === 'object') {
    children.push(spacer(80));
    children.push(h2(isTR ? 'FIYATLAMA MODEL\u0130' : 'PRICING MODEL'));
    const rows = Object.entries(fiyatlar)
      .filter(([k]) => !['tip', 'model', 'taksit'].includes(k))
      .map(([name, val]: [string, any]) => {
        const price = typeof val === 'object' ? (val.fiyat || val.price || val.aylik || '') : val;
        const hedef = typeof val === 'object' ? (val.hedef || val.segment || '') : '';
        const ozellik = typeof val === 'object' ? (val.ozellikler || val.features || '') : '';
        return [name, fmtDual(price, kur) + '/mo', hedef, ozellik];
      });
    children.push(makeTable({
      headers: [isTR ? 'Katman' : 'Tier', isTR ? 'Fiyat' : 'Price', isTR ? 'Hedef' : 'Target', isTR ? '\u00D6zellikler' : 'Features'],
      rows,
      colWidths: [1800, 2000, 2277, 3277],
    }));
  }

  // 7. 90 Gün Lansman Planı
  const plan90 = gtm.plan_90gun || gtm.plan90;
  if (plan90) {
    children.push(pageBreak());
    children.push(h1(isTR ? '90 G\u00DCN LANSMAN PLANI' : '90-DAY LAUNCH PLAN'));

    if (Array.isArray(plan90)) {
      children.push(makeTable({
        headers: [isTR ? 'Ay' : 'Month', isTR ? 'Hedef' : 'Goal', isTR ? 'Ana Aksiyon' : 'Key Action', 'KPI'],
        rows: plan90.map((p: any) => [
          safeVal(p.ay || p.month),
          safeVal(p.hedef || p.goal),
          safeVal(p.aksiyon || p.action),
          safeVal(p.kpi),
        ]),
        colWidths: [1200, 2718, 2718, 2718],
      }));
    } else if (typeof plan90 === 'object') {
      Object.entries(plan90).forEach(([month, actions]: [string, any]) => {
        children.push(h3(`${isTR ? 'Ay' : 'Month'} ${month}`));
        if (Array.isArray(actions)) actions.forEach((a: string) => children.push(bullet(a)));
        else children.push(body(String(actions)));
      });
    }
  }

  // 8. Birim Ekonomisi
  children.push(spacer(80));
  children.push(h2(isTR ? 'B\u0130R\u0130M EKONOM\u0130S\u0130' : 'UNIT ECONOMICS'));
  children.push(makeTable({
    headers: [isTR ? 'Metrik' : 'Metric', isTR ? 'De\u011Fer' : 'Value', 'Benchmark'],
    rows: [
      ['CAC', fmtDual(birimEko.cac, kur), '>$0 (lower is better)'],
      ['ARPU/mo', fmtDual(birimEko.arpu_aylik, kur), ''],
      ['LTV', fmtDual(birimEko.ltv, kur), '>3× CAC'],
      ['LTV:CAC', `${safeVal(birimEko.ltv_cac_oran)}:1`, '>3:1'],
      ['Churn/mo', fmtPct(birimEko.churn_aylik || birimEko.churn), '<5%'],
      ['Payback', `${safeVal(birimEko.payback)} ${isTR ? 'ay' : 'mo'}`, '<18 mo'],
      [isTR ? 'Br\u00FCt Marj' : 'Gross Margin', fmtPct(birimEko.brut_marj), '>60%'],
    ],
    colWidths: [2500, 3427, 3427],
  }));

  return packDoc(createDocument({ companyName: fikir, docType: isTR ? 'GTM Plan\u0131' : 'GTM Plan', date: tarih, lang, children }));
}

// ═══════════════════════════════════════════════════════════
// YARDIMCI
// ═══════════════════════════════════════════════════════════

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

function swotRow(left: any, right: any, halfW: number): Table {
  function swotCell(data: any, width: number): TableCell {
    const items = Array.isArray(data.items) ? data.items : [];
    return new TableCell({
      borders: BORDERS,
      width: { size: width, type: WidthType.DXA },
      shading: { fill: data.bg, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.TOP,
      children: [
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: data.title, font: 'Calibri', size: 20, bold: true, color: C.NAVY })],
        }),
        ...items.map((item: string) =>
          new Paragraph({
            spacing: { before: 20, after: 20 },
            children: [new TextRun({ text: `\u2022 ${item}`, font: 'Calibri', size: 19, color: C.TEXT })],
          })
        ),
      ],
    });
  }

  return new Table({
    width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [halfW, PAGE.CONTENT_WIDTH - halfW],
    rows: [new TableRow({ children: [swotCell(left, halfW), swotCell(right, PAGE.CONTENT_WIDTH - halfW)] })],
  });
}
