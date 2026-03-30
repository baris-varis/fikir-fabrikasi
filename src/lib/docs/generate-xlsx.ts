// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Finansal Model Generator (.xlsx)
// 11-sheet investor-grade workbook
// ═══════════════════════════════════════════════════════════

import ExcelJS from 'exceljs';
import { get, safeVal, fmtPct } from './styles';

// ─── RENK KODLARI (ExcelJS ARGB format) ──────────────────
const NAVY = 'FF1E3A5F';
const ACCENT = 'FF2563EB';
const WHITE = 'FFFFFFFF';
const LIGHT_BG = 'FFEFF6FF';
const YELLOW_BG = 'FFFFF9C4';
const BORDER_COLOR = 'FFCBD5E1';
const TEXT = 'FF1F2937';
const MUTED = 'FF6B7280';
const BLUE_FONT = 'FF0000FF';   // Input cells
const GREEN_FONT = 'FF008000';  // Cross-sheet links
const SUCCESS = 'FF16A34A';
const WARN = 'FFD97706';
const DANGER = 'FFDC2626';

// ─── HELPER FONKSİYONLARI ────────────────────────────────

function headerStyle(ws: ExcelJS.Worksheet, row: number, lastCol: number) {
  const r = ws.getRow(row);
  for (let c = 1; c <= lastCol; c++) {
    const cell = r.getCell(c);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder();
  }
  r.height = 25;
}

function thinBorder(): Partial<ExcelJS.Borders> {
  const side: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: BORDER_COLOR } };
  return { top: side, bottom: side, left: side, right: side };
}

function inputCell(cell: ExcelJS.Cell, val: any) {
  cell.value = val;
  cell.font = { name: 'Calibri', size: 10, color: { argb: BLUE_FONT } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW_BG } };
  cell.border = thinBorder();
}

function formulaCell(cell: ExcelJS.Cell, val: any) {
  cell.value = val;
  cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF000000' } };
  cell.border = thinBorder();
}

function labelCell(cell: ExcelJS.Cell, text: string, opts?: { bold?: boolean }) {
  cell.value = text;
  cell.font = { name: 'Calibri', size: 10, bold: opts?.bold, color: { argb: TEXT } };
  cell.border = thinBorder();
}

function numberFmt(cell: ExcelJS.Cell, fmt: string = '$#,##0') {
  cell.numFmt = fmt;
}

function parseNum(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.-]/g, '')) || 0;
  return 0;
}

// ═══════════════════════════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════════════════════════

export async function generateFinancialModel(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const lang = langOverride || get(state, 'meta.dil', 'tr');
  const isTR = lang === 'tr';
  const kur = get(state, 'meta.usd_try_kur', 34);
  const fikir = get(state, 'meta.fikir_adi', 'Startup');
  const tarih = get(state, 'meta.tarih', new Date().toISOString().split('T')[0]);

  const varsayimlar = get(state, 'D_final.finansal.varsayimlar', {});
  const birimEko = get(state, 'C_strateji.birim_ekonomisi', {});
  const projYillik = get(state, 'D_final.finansal.projeksiyon_yillik', []);
  const projAylik = get(state, 'D_final.finansal.projeksiyon_aylik', []);
  const senaryo = get(state, 'D_final.finansal.senaryo', {});
  const kadro = get(state, 'D_final.finansal.kadro', []);
  const fonlama = get(state, 'D_final.finansal.fonlama', []);
  const exitData = get(state, 'D_final.exit', []);
  const useOfFunds = get(state, 'D_final.finansal.use_of_funds', {});
  const fiyatlar = get(state, 'C_strateji.is_modeli.fiyatlar', {});

  // Varsayımları normalize et (state'ten veya birim ekonomisinden)
  const arpu = parseNum(varsayimlar.arpu_usd || birimEko.arpu_aylik || 50);
  const buyumeAylik = parseNum(varsayimlar.buyume_aylik_pct || 8);
  const churnAylik = parseNum(varsayimlar.churn_aylik_pct || birimEko.churn_aylik || 3);
  const brutMarj = parseNum(varsayimlar.brut_marj_pct || birimEko.brut_marj || 70);
  const cac = parseNum(varsayimlar.cac_usd || birimEko.cac || 100);
  const mevcutNakit = parseNum(varsayimlar.mevcut_nakit_usd || 0);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Ideactory.ai';
  wb.lastModifiedBy = 'Ideactory.ai';

  // ── Sheet 1: KAPAK ──────────────────────────────
  const ws1 = wb.addWorksheet(isTR ? 'Kapak' : 'Cover');
  ws1.getColumn(1).width = 30;
  ws1.getColumn(2).width = 40;

  ws1.getCell('A2').value = `${fikir} \u2014 ${isTR ? 'Finansal Model' : 'Financial Model'}`;
  ws1.getCell('A2').font = { name: 'Calibri', size: 18, bold: true, color: { argb: NAVY } };

  const coverData = [
    [isTR ? 'Haz\u0131rlanma Tarihi' : 'Date', tarih],
    [isTR ? 'Para Birimi' : 'Currency', `USD (TL ref: ${kur})`],
    ['Versiyon', '1.0'],
    ['', ''],
    [isTR ? 'Sheet Dizini' : 'Sheet Index', ''],
    ['1', isTR ? 'Kapak & Navigasyon' : 'Cover & Navigation'],
    ['2', isTR ? 'Varsay\u0131mlar' : 'Assumptions'],
    ['3', isTR ? 'Gelir (Ayl\u0131k)' : 'Revenue (Monthly)'],
    ['4', isTR ? 'Gelir (Y\u0131ll\u0131k)' : 'Revenue (Annual)'],
    ['5', isTR ? 'Gider & Kadro' : 'Expenses & Team'],
    ['6', isTR ? 'K\u00E2r-Zarar' : 'Income Statement'],
    ['7', isTR ? 'Nakit Ak\u0131\u015F\u0131' : 'Cash Flow'],
    ['8', isTR ? 'Birim Ekonomisi' : 'Unit Economics'],
    ['9', isTR ? 'Senaryolar' : 'Scenarios'],
    ['10', isTR ? 'Exit & De\u011Ferleme' : 'Exit & Valuation'],
    ['11', 'Cap Table & Dilution'],
  ];
  coverData.forEach((row, i) => {
    ws1.getCell(`A${i + 4}`).value = row[0];
    ws1.getCell(`B${i + 4}`).value = row[1];
    ws1.getCell(`A${i + 4}`).font = { name: 'Calibri', size: 10, bold: i >= 5, color: { argb: TEXT } };
    ws1.getCell(`B${i + 4}`).font = { name: 'Calibri', size: 10, color: { argb: TEXT } };
  });

  // ── Sheet 2: VARSAYIMLAR ────────────────────────
  const ws2 = wb.addWorksheet(isTR ? 'Varsay\u0131mlar' : 'Assumptions');
  ws2.getColumn(1).width = 35;
  ws2.getColumn(2).width = 20;
  ws2.getColumn(3).width = 30;

  ws2.getCell('A1').value = isTR ? 'VARSAYIMLAR' : 'ASSUMPTIONS';
  ws2.getCell('A1').font = { name: 'Calibri', size: 14, bold: true, color: { argb: NAVY } };

  ws2.getCell('A3').value = isTR ? 'GEL\u0130R VARSAYIMLARI' : 'REVENUE ASSUMPTIONS';
  ws2.getCell('A3').font = { name: 'Calibri', size: 11, bold: true, color: { argb: ACCENT } };

  const assumptions = [
    [isTR ? 'Ba\u015Flang\u0131\u00E7 M\u00FC\u015Fteri' : 'Starting Customers', 10, isTR ? 'Kurucu tahmini' : 'Founder estimate'],
    [isTR ? 'Ayl\u0131k B\u00FCy\u00FCme (%)' : 'Monthly Growth (%)', buyumeAylik, ''],
    ['ARPU ($)', arpu, ''],
    [isTR ? 'Ayl\u0131k Churn (%)' : 'Monthly Churn (%)', churnAylik, ''],
    [isTR ? 'Br\u00FCt Marj (%)' : 'Gross Margin (%)', brutMarj, ''],
    [isTR ? 'CAC - Organik ($)' : 'CAC - Organic ($)', parseNum(varsayimlar.cac_organik_usd || cac * 0.3), ''],
    [isTR ? 'CAC - \u00DCcretli ($)' : 'CAC - Paid ($)', parseNum(varsayimlar.cac_ucretli_usd || cac), ''],
    [isTR ? 'Y\u0131ll\u0131k Fiyat Art\u0131\u015F\u0131 (%)' : 'Annual Price Increase (%)', parseNum(varsayimlar.yillik_fiyat_artisi_pct || 5), ''],
    [isTR ? 'Mevcut Nakit ($)' : 'Current Cash ($)', mevcutNakit, ''],
  ];

  assumptions.forEach((row, i) => {
    const r = i + 4;
    labelCell(ws2.getCell(`A${r}`), String(row[0]));
    inputCell(ws2.getCell(`B${r}`), row[1]);
    ws2.getCell(`C${r}`).value = row[2];
    ws2.getCell(`C${r}`).font = { name: 'Calibri', size: 9, italic: true, color: { argb: MUTED } };
  });

  // Fiyatlama katmanları
  const fiyatRow = 4 + assumptions.length + 2;
  ws2.getCell(`A${fiyatRow}`).value = isTR ? 'FIYATLAMA KATMANLARI' : 'PRICING TIERS';
  ws2.getCell(`A${fiyatRow}`).font = { name: 'Calibri', size: 11, bold: true, color: { argb: ACCENT } };

  if (typeof fiyatlar === 'object') {
    let fi = fiyatRow + 1;
    Object.entries(fiyatlar)
      .filter(([k]) => !['tip', 'model', 'taksit'].includes(k))
      .forEach(([name, val]) => {
        const price = typeof val === 'object' ? ((val as any).fiyat || (val as any).price || 0) : val;
        labelCell(ws2.getCell(`A${fi}`), name);
        inputCell(ws2.getCell(`B${fi}`), parseNum(price));
        numberFmt(ws2.getCell(`B${fi}`), '$#,##0');
        fi++;
      });
  }

  // ── Sheet 3: GELİR (AYLIK) ─────────────────────
  const ws3 = wb.addWorksheet(isTR ? 'Gelir (Ayl\u0131k)' : 'Revenue (Monthly)');
  ws3.getColumn(1).width = 20;

  ws3.getCell('A1').value = isTR ? 'AYLIK GEL\u0130R MODEL\u0130 \u2014 \u0130lk 24 Ay' : 'MONTHLY REVENUE \u2014 First 24 Months';
  ws3.getCell('A1').font = { name: 'Calibri', size: 12, bold: true, color: { argb: NAVY } };

  // Headers
  const monthHeaders = [isTR ? 'Metrik' : 'Metric'];
  for (let m = 1; m <= 24; m++) {
    monthHeaders.push(`${isTR ? 'Ay' : 'M'} ${m}`);
    ws3.getColumn(m + 1).width = 12;
  }
  monthHeaders.forEach((h, i) => {
    ws3.getCell(3, i + 1).value = h;
  });
  headerStyle(ws3, 3, 25);

  // Aylık verileri hesapla
  const monthlyMetrics = [
    isTR ? 'Yeni M\u00FC\u015Fteri' : 'New Customers',
    isTR ? 'Churned' : 'Churned',
    isTR ? 'Aktif M\u00FC\u015Fteri' : 'Active Customers',
    'MRR ($)',
    isTR ? 'Gelir ($)' : 'Revenue ($)',
  ];

  monthlyMetrics.forEach((metric, mi) => {
    const row = mi + 4;
    labelCell(ws3.getCell(row, 1), metric);

    let customers = 10;
    for (let m = 1; m <= 24; m++) {
      const col = m + 1;
      const cell = ws3.getCell(row, col);

      // Aylık projeksiyon verisi varsa onu kullan
      const aylikData = Array.isArray(projAylik) ? projAylik.find((p: any) => p.ay === m) : null;

      switch (mi) {
        case 0: // Yeni müşteri
          formulaCell(cell, aylikData ? parseNum(aylikData.yeni_musteri) : Math.round(customers * buyumeAylik / 100));
          break;
        case 1: // Churned
          formulaCell(cell, aylikData ? parseNum(aylikData.churned) : Math.round(customers * churnAylik / 100));
          break;
        case 2: // Aktif müşteri
          if (aylikData) {
            customers = parseNum(aylikData.aktif_musteri);
          } else {
            const newC = Math.round(customers * buyumeAylik / 100);
            const churned = Math.round(customers * churnAylik / 100);
            customers = customers + newC - churned;
          }
          formulaCell(cell, customers);
          break;
        case 3: // MRR
          formulaCell(cell, customers * arpu);
          numberFmt(cell, '$#,##0');
          break;
        case 4: // Gelir
          formulaCell(cell, customers * arpu);
          numberFmt(cell, '$#,##0');
          break;
      }
    }
  });

  // ── Sheet 4: GELİR (YILLIK) ────────────────────
  const ws4 = wb.addWorksheet(isTR ? 'Gelir (Y\u0131ll\u0131k)' : 'Revenue (Annual)');
  ws4.getColumn(1).width = 25;
  for (let y = 1; y <= 5; y++) ws4.getColumn(y + 1).width = 18;

  ws4.getCell('A1').value = isTR ? '5 YILLIK GEL\u0130R \u00D6ZET\u0130' : '5-YEAR REVENUE SUMMARY';
  ws4.getCell('A1').font = { name: 'Calibri', size: 12, bold: true, color: { argb: NAVY } };

  const yearHeaders = ['', ...Array.from({ length: 5 }, (_, i) => `${isTR ? 'Y\u0131l' : 'Year'} ${i + 1}`)];
  yearHeaders.forEach((h, i) => { ws4.getCell(3, i + 1).value = h; });
  headerStyle(ws4, 3, 6);

  const projArr = normalizeYearlyProjection(projYillik);
  const annualMetrics = [
    { label: isTR ? 'M\u00FC\u015Fteri' : 'Customers', key: 'musteri', fmt: '#,##0' },
    { label: 'ARR', key: 'arr', fmt: '$#,##0' },
    { label: isTR ? 'Br\u00FCt K\u00E2r' : 'Gross Profit', key: 'brut_kar', fmt: '$#,##0' },
    { label: 'COGS', key: 'cogs', fmt: '$#,##0' },
    { label: 'OpEx', key: 'opex', fmt: '$#,##0' },
    { label: 'EBITDA', key: 'ebitda', fmt: '$#,##0' },
    { label: isTR ? 'EBITDA Marj (%)' : 'EBITDA Margin (%)', key: 'ebitda_marj_pct', fmt: '0.0%' },
    { label: isTR ? 'D\u00F6nem Sonu Nakit' : 'Period End Cash', key: 'donem_sonu_nakit', fmt: '$#,##0' },
  ];

  annualMetrics.forEach((m, mi) => {
    const row = mi + 4;
    labelCell(ws4.getCell(row, 1), m.label);
    for (let y = 0; y < 5; y++) {
      const cell = ws4.getCell(row, y + 2);
      const yearData = projArr[y] || {};
      const val = parseNum(yearData[m.key] || yearData[m.key + '_usd'] || 0);
      formulaCell(cell, val);
      numberFmt(cell, m.fmt);
    }
  });

  // ── Sheet 5: GİDER & KADRO ─────────────────────
  const ws5 = wb.addWorksheet(isTR ? 'Gider & Kadro' : 'Expenses & Team');
  ws5.getColumn(1).width = 25;
  for (let c = 2; c <= 6; c++) ws5.getColumn(c).width = 15;

  ws5.getCell('A1').value = isTR ? 'G\u0130DER & KADRO PLANI' : 'EXPENSES & TEAM PLAN';
  ws5.getCell('A1').font = { name: 'Calibri', size: 12, bold: true, color: { argb: NAVY } };

  const kadroArr = Array.isArray(kadro) ? kadro : [];
  if (kadroArr.length > 0) {
    [isTR ? 'Rol' : 'Role', isTR ? 'Say\u0131' : 'Count', isTR ? 'Ba\u015Flang\u0131\u00E7 Ay' : 'Start Month', isTR ? 'Br\u00FCt Maa\u015F ($)' : 'Salary ($)'].forEach((h, i) => {
      ws5.getCell(3, i + 1).value = h;
    });
    headerStyle(ws5, 3, 4);

    kadroArr.forEach((k: any, i: number) => {
      const row = i + 4;
      labelCell(ws5.getCell(row, 1), safeVal(k.rol));
      inputCell(ws5.getCell(row, 2), parseNum(k.sayi));
      inputCell(ws5.getCell(row, 3), parseNum(k.baslangic_ay));
      inputCell(ws5.getCell(row, 4), parseNum(k.brut_maas_usd));
      numberFmt(ws5.getCell(row, 4), '$#,##0');
    });
  }

  // ── Sheet 6: KÂR-ZARAR ─────────────────────────
  const ws6 = wb.addWorksheet(isTR ? 'K\u00E2r-Zarar' : 'P&L');
  ws6.getColumn(1).width = 25;
  for (let c = 2; c <= 6; c++) ws6.getColumn(c).width = 18;

  ws6.getCell('A1').value = isTR ? 'K\u00C2R-ZARAR TABLOSU' : 'INCOME STATEMENT';
  ws6.getCell('A1').font = { name: 'Calibri', size: 12, bold: true, color: { argb: NAVY } };

  yearHeaders.forEach((h, i) => { ws6.getCell(3, i + 1).value = h; });
  headerStyle(ws6, 3, 6);

  const plMetrics = ['Gelir/Revenue', 'COGS', isTR ? 'Br\u00FCt K\u00E2r' : 'Gross Profit', 'OpEx', isTR ? 'Personel' : 'Payroll', isTR ? 'Pazarlama' : 'Marketing', 'G&A', 'EBITDA'];
  plMetrics.forEach((m, mi) => {
    labelCell(ws6.getCell(mi + 4, 1), m);
    ws6.getCell(mi + 4, 1).font = { name: 'Calibri', size: 10, bold: [0, 2, 7].includes(mi), color: { argb: TEXT } };
    for (let y = 0; y < 5; y++) {
      const cell = ws6.getCell(mi + 4, y + 2);
      formulaCell(cell, 0); // Placeholder — would reference other sheets in real model
      numberFmt(cell, '$#,##0;($#,##0);"-"');
    }
  });

  // ── Sheet 7: NAKİT AKIŞI ───────────────────────
  const ws7 = wb.addWorksheet(isTR ? 'Nakit Ak\u0131\u015F\u0131' : 'Cash Flow');
  ws7.getColumn(1).width = 25;
  for (let c = 2; c <= 6; c++) ws7.getColumn(c).width = 18;

  ws7.getCell('A1').value = isTR ? 'NAK\u0130T AKI\u015E TABLOSU' : 'CASH FLOW STATEMENT';
  ws7.getCell('A1').font = { name: 'Calibri', size: 12, bold: true, color: { argb: NAVY } };

  yearHeaders.forEach((h, i) => { ws7.getCell(3, i + 1).value = h; });
  headerStyle(ws7, 3, 6);

  const cfMetrics = [isTR ? 'D\u00F6nem Ba\u015F\u0131 Nakit' : 'Beginning Cash', isTR ? 'Operat\u00F6r Nakit Ak\u0131\u015F\u0131' : 'Operating CF', isTR ? 'Fonlama Giri\u015Fi' : 'Funding Inflow', isTR ? 'D\u00F6nem Sonu Nakit' : 'Ending Cash', isTR ? 'Runway (ay)' : 'Runway (months)'];
  cfMetrics.forEach((m, mi) => {
    labelCell(ws7.getCell(mi + 4, 1), m);
    for (let y = 0; y < 5; y++) {
      formulaCell(ws7.getCell(mi + 4, y + 2), 0);
      numberFmt(ws7.getCell(mi + 4, y + 2), mi === 4 ? '#,##0' : '$#,##0;($#,##0);"-"');
    }
  });

  // ── Sheet 8: BİRİM EKONOMİSİ ───────────────────
  const ws8 = wb.addWorksheet(isTR ? 'Birim Ekonomisi' : 'Unit Economics');
  ws8.getColumn(1).width = 25;
  for (let c = 2; c <= 6; c++) ws8.getColumn(c).width = 15;
  ws8.getColumn(7).width = 18;
  ws8.getColumn(8).width = 15;

  ws8.getCell('A1').value = isTR ? 'B\u0130R\u0130M EKONOM\u0130S\u0130' : 'UNIT ECONOMICS';
  ws8.getCell('A1').font = { name: 'Calibri', size: 12, bold: true, color: { argb: NAVY } };

  // Yıl bazında evrim
  const ueHeaders = ['', ...yearHeaders.slice(1), 'Benchmark', isTR ? 'Durum' : 'Status'];
  ueHeaders.forEach((h, i) => { ws8.getCell(3, i + 1).value = h; });
  headerStyle(ws8, 3, 8);

  const ueMetrics = [
    { label: 'CAC ($)', val: parseNum(birimEko.cac || cac), bench: '<$200', fmt: '$#,##0' },
    { label: 'ARPU/mo ($)', val: arpu, bench: '', fmt: '$#,##0' },
    { label: 'Churn/mo (%)', val: churnAylik, bench: '<5%', fmt: '0.0%' },
    { label: 'LTV ($)', val: parseNum(birimEko.ltv || (arpu / (churnAylik / 100))), bench: '>3\u00D7 CAC', fmt: '$#,##0' },
    { label: 'LTV:CAC', val: parseNum(birimEko.ltv_cac_oran || 0), bench: '>3:1', fmt: '0.0' },
    { label: 'Payback (mo)', val: parseNum(birimEko.payback || 0), bench: '<18', fmt: '#,##0' },
    { label: isTR ? 'Br\u00FCt Marj (%)' : 'Gross Margin (%)', val: brutMarj, bench: '>60%', fmt: '0.0%' },
  ];

  ueMetrics.forEach((m, mi) => {
    const row = mi + 4;
    labelCell(ws8.getCell(row, 1), m.label);
    // Yıl 1 değeri (diğer yıllar iyileşeceği varsayılır)
    for (let y = 0; y < 5; y++) {
      const improvement = 1 - (y * 0.05); // Her yıl %5 iyileşme (CAC, churn düşer)
      const val = m.label.includes('CAC') || m.label.includes('Churn') ? m.val * improvement : m.val * (1 + y * 0.05);
      inputCell(ws8.getCell(row, y + 2), Math.round(val * 100) / 100);
      numberFmt(ws8.getCell(row, y + 2), m.fmt);
    }
    ws8.getCell(row, 7).value = m.bench;
    ws8.getCell(row, 7).font = { name: 'Calibri', size: 9, italic: true, color: { argb: MUTED } };
  });

  // ── Sheet 9: SENARYOLAR ─────────────────────────
  const ws9 = wb.addWorksheet(isTR ? 'Senaryolar' : 'Scenarios');
  ws9.getColumn(1).width = 25;
  ws9.getColumn(2).width = 18;
  ws9.getColumn(3).width = 18;
  ws9.getColumn(4).width = 18;

  ws9.getCell('A1').value = isTR ? 'SENARYO ANAL\u0130Z\u0130' : 'SCENARIO ANALYSIS';
  ws9.getCell('A1').font = { name: 'Calibri', size: 12, bold: true, color: { argb: NAVY } };

  [isTR ? 'Parametre' : 'Parameter', isTR ? 'K\u00F6t\u00FCmser' : 'Bear', isTR ? 'Baz' : 'Base', isTR ? '\u0130yimser' : 'Bull'].forEach((h, i) => {
    ws9.getCell(3, i + 1).value = h;
  });
  headerStyle(ws9, 3, 4);

  const scenarioParams = [
    [isTR ? 'B\u00FCy\u00FCme \u00E7arpan\u0131' : 'Growth multiplier', '×0.6', '×1.0', '×1.4'],
    [isTR ? 'Churn \u00E7arpan\u0131' : 'Churn multiplier', '×1.3', '×1.0', '×0.7'],
    [isTR ? 'CAC \u00E7arpan\u0131' : 'CAC multiplier', '×1.3', '×1.0', '×0.8'],
    ['', '', '', ''],
    [isTR ? 'SONU\u00C7LAR' : 'RESULTS', '', '', ''],
    [`ARR ${isTR ? 'Y\u0131l 3' : 'Y3'}`,
      safeVal(get(senaryo, 'kotumser.arr_yil3')),
      safeVal(get(senaryo, 'gercekci.arr_yil3', get(senaryo, 'baz.arr_yil3'))),
      safeVal(get(senaryo, 'iyimser.arr_yil3')),
    ],
    [`ARR ${isTR ? 'Y\u0131l 5' : 'Y5'}`,
      safeVal(get(senaryo, 'kotumser.arr_yil5')),
      safeVal(get(senaryo, 'gercekci.arr_yil5', get(senaryo, 'baz.arr_yil5'))),
      safeVal(get(senaryo, 'iyimser.arr_yil5')),
    ],
    ['Break-even',
      `${get(senaryo, 'kotumser.breakeven_ay', '—')} mo`,
      `${get(senaryo, 'gercekci.breakeven_ay', get(senaryo, 'baz.breakeven_ay', '—'))} mo`,
      `${get(senaryo, 'iyimser.breakeven_ay', '—')} mo`,
    ],
  ];

  scenarioParams.forEach((row, i) => {
    row.forEach((val, j) => {
      const cell = ws9.getCell(i + 4, j + 1);
      cell.value = val;
      cell.font = { name: 'Calibri', size: 10, bold: i === 4, color: { argb: TEXT } };
      cell.border = thinBorder();
    });
  });

  // ── Sheet 10: EXIT & DEĞERLEME ──────────────────
  const ws10 = wb.addWorksheet(isTR ? 'Exit & De\u011Ferleme' : 'Exit & Valuation');
  ws10.getColumn(1).width = 20;
  ws10.getColumn(2).width = 20;
  ws10.getColumn(3).width = 20;
  ws10.getColumn(4).width = 15;
  ws10.getColumn(5).width = 20;

  ws10.getCell('A1').value = isTR ? 'EXIT & DE\u011EERLEME' : 'EXIT & VALUATION';
  ws10.getCell('A1').font = { name: 'Calibri', size: 12, bold: true, color: { argb: NAVY } };

  const exits = Array.isArray(exitData) ? exitData : [];
  if (exits.length > 0) {
    [isTR ? 'Senaryo' : 'Scenario', isTR ? 'Y\u00F6ntem' : 'Method', isTR ? 'Al\u0131c\u0131' : 'Acquirer', isTR ? 'Zaman' : 'Timeline', isTR ? 'De\u011Fer' : 'Value'].forEach((h, i) => {
      ws10.getCell(3, i + 1).value = h;
    });
    headerStyle(ws10, 3, 5);

    exits.forEach((e: any, i: number) => {
      [safeVal(e.sira), safeVal(e.yontem), safeVal(e.alici), safeVal(e.zaman), safeVal(e.deger)].forEach((val, j) => {
        const cell = ws10.getCell(i + 4, j + 1);
        cell.value = val;
        cell.font = { name: 'Calibri', size: 10, color: { argb: TEXT } };
        cell.border = thinBorder();
      });
    });
  }

  // ── Sheet 11: CAP TABLE ─────────────────────────
  const ws11 = wb.addWorksheet('Cap Table');
  ws11.getColumn(1).width = 20;
  for (let c = 2; c <= 5; c++) ws11.getColumn(c).width = 18;

  ws11.getCell('A1').value = 'CAP TABLE & DILUTION';
  ws11.getCell('A1').font = { name: 'Calibri', size: 12, bold: true, color: { argb: NAVY } };

  [isTR ? 'Tur' : 'Round', isTR ? 'Tutar' : 'Amount', 'Pre-Val', 'Post-Val', isTR ? 'Pay (%)' : 'Stake (%)'].forEach((h, i) => {
    ws11.getCell(3, i + 1).value = h;
  });
  headerStyle(ws11, 3, 5);

  const fonArr = Array.isArray(fonlama) ? fonlama : [];
  // Kurucu satırı
  [isTR ? 'Kurucu' : 'Founder', '\u2014', '\u2014', '\u2014', '100%'].forEach((val, j) => {
    const cell = ws11.getCell(4, j + 1);
    cell.value = val;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: TEXT } };
    cell.border = thinBorder();
  });

  fonArr.forEach((f: any, i: number) => {
    [safeVal(f.tur), safeVal(f.tutar), '', '', ''].forEach((val, j) => {
      const cell = ws11.getCell(i + 5, j + 1);
      cell.value = val;
      cell.font = { name: 'Calibri', size: 10, color: { argb: TEXT } };
      cell.border = thinBorder();
    });
  });

  // Yasal uyarı
  const lastRow = 5 + fonArr.length + 2;
  ws11.getCell(`A${lastRow}`).value = isTR
    ? 'Not: Bu basitle\u015Ftirilmi\u015F bir modeldir. Ger\u00E7ek cap table i\u00E7in profesyonel hukuki dan\u0131\u015Fmanl\u0131k al\u0131nmal\u0131d\u0131r.'
    : 'Note: This is a simplified model. Seek professional legal advice for actual cap table.';
  ws11.getCell(`A${lastRow}`).font = { name: 'Calibri', size: 9, italic: true, color: { argb: MUTED } };

  // ── Buffer olarak döndür ────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// ─── YARDIMCI ─────────────────────────────────────

function normalizeYearlyProjection(proj: any): any[] {
  if (Array.isArray(proj)) return proj;
  if (typeof proj === 'object' && proj !== null) {
    return Object.entries(proj).map(([key, val]: [string, any]) => ({
      yil: parseInt(key) || 0,
      ...(typeof val === 'object' ? val : { arr: val }),
    }));
  }
  return [];
}

// Backward compatibility alias — eski route.ts dosyası bu isimle import ediyor
export const generateFinansalXlsx = generateFinancialModel;
