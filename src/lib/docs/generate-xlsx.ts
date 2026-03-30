import ExcelJS from 'exceljs';
import { AnalysisState } from '@/types';

export async function generateFinansalXlsx(state: AnalysisState): Promise<Buffer> {
  const { meta, C_strateji: c, D_final: d } = state;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Ideactory.ai';

  const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
  const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

  // Sheet 1: Özet
  const ws1 = wb.addWorksheet('Özet');
  ws1.columns = [{ width: 25 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }];
  ws1.addRow([`${meta.fikir_adi} — Finansal Model`]).font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  ws1.addRow([`Sektör: ${meta.sektor}`, '', `Skor: ${meta.final_skor}/100`, '', `Karar: ${meta.karar}`]);
  ws1.addRow([]);

  // Sheet 2: Varsayımlar
  const ws2 = wb.addWorksheet('Varsayımlar');
  ws2.columns = [{ width: 30 }, { width: 20 }];
  const h2 = ws2.addRow(['Metrik', 'Değer']);
  h2.eachCell(c => { c.fill = headerFill; c.font = headerFont; });
  if (d?.finansal?.varsayimlar) {
    const v = d.finansal.varsayimlar;
    ws2.addRow(['ARPU (aylık)', v.arpu_tl]);
    ws2.addRow(['Büyüme (%/ay)', v.buyume_aylik_pct]);
    ws2.addRow(['Churn (%/ay)', v.churn_aylik_pct]);
    ws2.addRow(['Brüt Marj (%)', v.brut_marj_pct]);
    ws2.addRow(['CAC', v.cac_tl]);
    ws2.addRow(['Hosting/müşteri', v.hosting_musteri_basi_tl]);
    ws2.addRow(['Ödeme komisyon (%)', v.odeme_komisyon_pct]);
    ws2.addRow(['Genel giderler (aylık)', v.genel_giderler_aylik_tl]);
  }

  // Sheet 3: Birim Ekonomisi
  const ws3 = wb.addWorksheet('Birim Ekonomisi');
  ws3.columns = [{ width: 25 }, { width: 20 }, { width: 25 }];
  const h3 = ws3.addRow(['Metrik', 'Değer', 'Benchmark']);
  h3.eachCell(c => { c.fill = headerFill; c.font = headerFont; });
  if (c?.birim_ekonomisi) {
    const b = c.birim_ekonomisi;
    ws3.addRow(['ARPU/ay', b.arpu_tl, '']);
    ws3.addRow(['CAC (toplam)', b.cac_tl, '']);
    ws3.addRow(['LTV', b.ltv, '']);
    ws3.addRow(['LTV:CAC', b.ltv_cac, '>3:1']);
    ws3.addRow(['Payback (ay)', b.payback_ay, '<18 ay']);
    ws3.addRow(['Churn (%/ay)', b.churn_aylik, '%3-8']);
    ws3.addRow(['Brüt Marj (%)', b.brut_marj, '%70-85']);
  }

  // Sheet 4: Yıllık Projeksiyon
  const ws4 = wb.addWorksheet('Yıllık Projeksiyon');
  if (d?.finansal?.projeksiyon_yillik?.length) {
    const years = d.finansal.projeksiyon_yillik;
    ws4.columns = [{ width: 25 }, ...years.map(() => ({ width: 18 }))];
    const hRow = ws4.addRow(['', ...years.map(y => `Yıl ${y.yil}`)]);
    hRow.eachCell(c => { c.fill = headerFill; c.font = headerFont; });
    ws4.addRow(['Müşteri', ...years.map(y => y.musteri)]);
    ws4.addRow(['ARR', ...years.map(y => y.arr_tl)]);
    ws4.addRow(['Brüt Gelir', ...years.map(y => y.brut_gelir_tl)]);
    ws4.addRow(['COGS', ...years.map(y => y.cogs_tl)]);
    ws4.addRow(['Brüt Kâr', ...years.map(y => y.brut_kar_tl)]);
    ws4.addRow(['Brüt Marj (%)', ...years.map(y => y.brut_marj_pct)]);
    ws4.addRow(['Personel Gider', ...years.map(y => y.personel_gider_tl)]);
    ws4.addRow(['Pazarlama Gider', ...years.map(y => y.pazarlama_gider_tl)]);
    ws4.addRow(['EBITDA', ...years.map(y => y.ebitda_tl)]);
    ws4.addRow(['EBITDA Marj (%)', ...years.map(y => y.ebitda_marj_pct)]);
    ws4.addRow(['Dönem Sonu Nakit', ...years.map(y => y.donem_sonu_nakit_tl)]);
  }

  // Sheet 5: Senaryo
  const ws5 = wb.addWorksheet('Senaryo Analizi');
  ws5.columns = [{ width: 20 }, { width: 18 }, { width: 18 }, { width: 18 }];
  const h5 = ws5.addRow(['', 'Kötümser', 'Gerçekçi', 'İyimser']);
  h5.eachCell(c => { c.fill = headerFill; c.font = headerFont; });
  if (d?.finansal?.senaryo) {
    const s = d.finansal.senaryo;
    ws5.addRow(['ARR Yıl 3', s.kotumser.arr_yil3, s.gercekci.arr_yil3, s.iyimser.arr_yil3]);
    ws5.addRow(['ARR Yıl 5', s.kotumser.arr_yil5, s.gercekci.arr_yil5, s.iyimser.arr_yil5]);
    ws5.addRow(['Break-even (ay)', s.kotumser.breakeven_ay, s.gercekci.breakeven_ay, s.iyimser.breakeven_ay]);
  }

  // Sheet 6: Fonlama
  const ws6 = wb.addWorksheet('Fonlama');
  ws6.columns = [{ width: 15 }, { width: 15 }, { width: 15 }, { width: 30 }, { width: 30 }];
  const h6 = ws6.addRow(['Tur', 'Tutar', 'Dönem', 'Kullanım', 'Milestones']);
  h6.eachCell(c => { c.fill = headerFill; c.font = headerFont; });
  if (d?.finansal?.fonlama?.length) {
    for (const f of d.finansal.fonlama) {
      ws6.addRow([f.tur, f.tutar, f.donem, f.kullanim, f.milestones]);
    }
  }

  // Sheet 7: Exit
  const ws7 = wb.addWorksheet('Exit Stratejisi');
  ws7.columns = [{ width: 15 }, { width: 18 }, { width: 20 }, { width: 12 }, { width: 12 }, { width: 18 }];
  const h7 = ws7.addRow(['Senaryo', 'Yöntem', 'Alıcı', 'Zaman', 'Olasılık', 'Değer']);
  h7.eachCell(c => { c.fill = headerFill; c.font = headerFont; });
  if (d?.exit?.length) {
    for (const e of d.exit) {
      ws7.addRow([e.sira, e.yontem, e.alici, e.zaman, e.olasilik, e.deger]);
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
