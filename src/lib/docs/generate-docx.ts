import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeadingLevel,
  ShadingType, Header, Footer, PageNumber, NumberFormat,
} from 'docx';
import { AnalysisState } from '@/types';

const COLORS = {
  primary: '1E3A5F',
  accent: '2563EB',
  success: '16A34A',
  warning: 'D97706',
  danger: 'DC2626',
  text: '1F2937',
  muted: '6B7280',
  light: 'F8FAFC',
};

function heading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, color: COLORS.primary, bold: true })] });
}

function para(text: string, opts?: { bold?: boolean; color?: string; size?: number; spacing?: number }) {
  return new Paragraph({
    spacing: { after: opts?.spacing ?? 120 },
    children: [new TextRun({ text, bold: opts?.bold, color: opts?.color ?? COLORS.text, size: opts?.size ?? 21 })],
  });
}

function tableCellP(text: string, bold = false, color = COLORS.text) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold, color, size: 19 })] })],
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
  });
}

function headerCell(text: string) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 19 })] })],
    shading: { type: ShadingType.SOLID, color: COLORS.primary },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
  });
}

function makeHeader(leftText: string, rightText: string) {
  return new Header({
    children: [new Paragraph({
      children: [
        new TextRun({ text: leftText, size: 16, color: COLORS.muted }),
        new TextRun({ text: '    |    ', size: 16, color: COLORS.muted }),
        new TextRun({ text: rightText, size: 16, color: COLORS.muted }),
      ],
    })],
  });
}

function makeFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({ text: 'Gizli — Yalnızca yatırımcı değerlendirmesi içindir', size: 14, color: COLORS.muted, italics: true }),
      ],
    })],
  });
}

function legalDisclaimer() {
  return [
    heading('Yasal Uyarı', HeadingLevel.HEADING_2),
    para('Bu doküman yalnızca bilgilendirme amaçlıdır ve yatırım tavsiyesi niteliği taşımaz. İleriye dönük tahminler içermektedir; gerçek sonuçlar öngörülenlerden önemli ölçüde farklılık gösterebilir. Yatırım kararı vermeden önce bağımsız profesyonel danışmanlık alınması önerilir. Tüm finansal projeksiyonlar varsayımlara dayalıdır ve garanti niteliğinde değildir.', { size: 18, color: COLORS.muted }),
  ];
}

// ─── EXECUTIVE SUMMARY ──────────────────────────────────

export async function generateExecSummary(state: AnalysisState): Promise<Buffer> {
  const { meta, A_pazar: a, B_rekabet: b, C_strateji: c, D_final: d } = state;

  const doc = new Document({
    sections: [{
      headers: { default: makeHeader(meta.fikir_adi || 'Analiz', 'Executive Summary') },
      footers: { default: makeFooter() },
      children: [
        // Header
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: (meta.fikir_adi || 'Startup').toUpperCase(), bold: true, size: 32, color: COLORS.primary })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: b?.uvp || a?.uvp || '', italics: true, size: 22, color: COLORS.accent })] }),

        // Problem & Fırsat
        heading('Problem & Fırsat', HeadingLevel.HEADING_2),
        para(a?.problem || 'Belirtilmemiş'),

        // Çözüm
        heading('Çözüm', HeadingLevel.HEADING_2),
        para(a?.cozum || 'Belirtilmemiş'),

        // Pazar
        heading('Pazar Fırsatı', HeadingLevel.HEADING_2),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [headerCell('Metrik'), headerCell('Değer')] }),
            new TableRow({ children: [tableCellP('TAM (TR)'), tableCellP(a?.tam_tr || '—')] }),
            new TableRow({ children: [tableCellP('SAM'), tableCellP(a?.sam || '—')] }),
            new TableRow({ children: [tableCellP('SOM (3Y)'), tableCellP(a?.som_3yil || '—')] }),
            new TableRow({ children: [tableCellP('CAGR'), tableCellP(a?.cagr_tr || '—')] }),
          ],
        }),

        // İş Modeli
        heading('İş Modeli', HeadingLevel.HEADING_2),
        para(c?.is_modeli?.tip || a?.is_modeli_ozet || 'Belirtilmemiş'),

        // Rekabet Avantajı
        heading('Rekabet Avantajı', HeadingLevel.HEADING_2),
        para(`Moat: ${b?.moat_tipi || '—'} | UVP: ${b?.uvp || '—'}`),

        // Finansal
        heading('Finansal Hedefler', HeadingLevel.HEADING_2),
        ...(d?.finansal?.projeksiyon_yillik?.length ? [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: [headerCell(''), headerCell('Yıl 1'), headerCell('Yıl 3'), headerCell('Yıl 5')] }),
              new TableRow({
                children: [
                  tableCellP('ARR', true),
                  tableCellP(d.finansal.projeksiyon_yillik[0]?.arr_tl || '—'),
                  tableCellP(d.finansal.projeksiyon_yillik[2]?.arr_tl || '—'),
                  tableCellP(d.finansal.projeksiyon_yillik[4]?.arr_tl || '—'),
                ],
              }),
              new TableRow({
                children: [
                  tableCellP('Müşteri', true),
                  tableCellP(String(d.finansal.projeksiyon_yillik[0]?.musteri || '—')),
                  tableCellP(String(d.finansal.projeksiyon_yillik[2]?.musteri || '—')),
                  tableCellP(String(d.finansal.projeksiyon_yillik[4]?.musteri || '—')),
                ],
              }),
            ],
          }),
        ] : [para('Finansal projeksiyon henüz tamamlanmadı.')]),

        // Yatırım Talebi
        heading('Yatırım Talebi', HeadingLevel.HEADING_2),
        ...(d?.finansal?.fonlama?.length ? d.finansal.fonlama.map(f =>
          para(`${f.tur}: ${f.tutar} — ${f.kullanim}`)
        ) : [para('Fonlama planı henüz tamamlanmadı.')]),

        // Skor
        heading('Değerlendirme', HeadingLevel.HEADING_2),
        para(`Final Skor: ${meta.final_skor}/100 → ${meta.karar}`, { bold: true, color: meta.karar === 'GO' ? COLORS.success : meta.karar === 'NO-GO' ? COLORS.danger : COLORS.warning }),

        ...legalDisclaimer(),
      ],
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

// ─── REKABET RAPORU ─────────────────────────────────────

export async function generateRekabeDocx(state: AnalysisState): Promise<Buffer> {
  const { meta, B_rekabet: b } = state;
  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new TextRun({ text: `${meta.fikir_adi} — Rekabet Analizi`, bold: true, size: 32, color: COLORS.primary })] }),
    new Paragraph({ spacing: { after: 200 }, children: [] }),

    heading('Doğrudan Rakipler', HeadingLevel.HEADING_2),
  ];

  if (b?.rakipler?.length) {
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('Rakip'), headerCell('Fonlama'), headerCell('Güçlü Yön'), headerCell('Zayıf Yön'), headerCell('Tehdit')] }),
        ...b.rakipler.map(r => new TableRow({
          children: [tableCellP(r.ad, true), tableCellP(r.fonlama), tableCellP(r.guclu_yon), tableCellP(r.zayif_yon), tableCellP(r.tehdit)],
        })),
      ],
    }));
  }

  // Porter
  if (b?.porter) {
    children.push(heading("Porter'ın 5 Gücü", HeadingLevel.HEADING_2));
    const p = b.porter;
    for (const [key, val] of Object.entries(p)) {
      children.push(para(`${key}: ${val}`));
    }
  }

  // SWOT
  if (b?.swot) {
    children.push(heading('SWOT Analizi', HeadingLevel.HEADING_2));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('Güçlü (S)'), headerCell('Zayıf (W)')] }),
        new TableRow({ children: [tableCellP((b.swot.S || []).join('\n')), tableCellP((b.swot.W || []).join('\n'))] }),
        new TableRow({ children: [headerCell('Fırsatlar (O)'), headerCell('Tehditler (T)')] }),
        new TableRow({ children: [tableCellP((b.swot.O || []).join('\n')), tableCellP((b.swot.T || []).join('\n'))] }),
      ],
    }));
  }

  // UVP & Moat
  children.push(heading('Farklılaşma', HeadingLevel.HEADING_2));
  children.push(para(`UVP: ${b?.uvp || '—'}`));
  children.push(para(`Moat: ${b?.moat_tipi || '—'} (${b?.moat_suresi || '—'})`));

  children.push(...legalDisclaimer());

  const doc = new Document({
    sections: [{
      headers: { default: makeHeader(meta.fikir_adi || 'Analiz', 'Rekabet Analizi') },
      footers: { default: makeFooter() },
      children,
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

// ─── RİSK RAPORU ────────────────────────────────────────

export async function generateRiskDocx(state: AnalysisState): Promise<Buffer> {
  const { meta, C_strateji: c } = state;
  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new TextRun({ text: `${meta.fikir_adi} — Risk Matrisi`, bold: true, size: 32, color: COLORS.primary })] }),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
  ];

  if (c?.riskler?.kill_risk?.var_mi) {
    children.push(heading('⚠️ Kill Risk', HeadingLevel.HEADING_2));
    children.push(para(c.riskler.kill_risk.aciklama, { color: COLORS.danger }));
    children.push(para(`Test: ${c.riskler.kill_risk.test}`));
  }

  if (c?.riskler?.top?.length) {
    children.push(heading('Risk Matrisi', HeadingLevel.HEADING_2));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('#'), headerCell('Risk'), headerCell('Kategori'), headerCell('Olasılık'), headerCell('Etki'), headerCell('Skor'), headerCell('Azaltma')] }),
        ...c.riskler.top.map(r => new TableRow({
          children: [tableCellP(String(r.no)), tableCellP(r.tanim), tableCellP(r.kategori), tableCellP(String(r.olasilik)), tableCellP(String(r.etki)), tableCellP(String(r.skor)), tableCellP(r.mitigation)],
        })),
      ],
    }));
  }

  if (c?.riskler?.pre_mortem?.length) {
    children.push(heading('Pre-Mortem Senaryoları', HeadingLevel.HEADING_2));
    for (const pm of c.riskler.pre_mortem) {
      children.push(para(`${pm.senaryo}`, { bold: true }));
      children.push(para(`Ne oldu: ${pm.ne_oldu}`));
      children.push(para(`Kör nokta: ${pm.kor_nokta}`));
      children.push(para(`Erken uyarı: ${pm.erken_uyari}`));
      children.push(para(`90 gün testi: ${pm.test_90gun}`, { spacing: 200 }));
    }
  }

  children.push(...legalDisclaimer());
  const doc = new Document({ sections: [{ headers: { default: makeHeader(meta.fikir_adi || 'Analiz', 'Risk Raporu') }, footers: { default: makeFooter() }, children }] });
  return Buffer.from(await Packer.toBuffer(doc));
}

// ─── GTM RAPORU ─────────────────────────────────────────

export async function generateGtmDocx(state: AnalysisState): Promise<Buffer> {
  const { meta, C_strateji: c } = state;
  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new TextRun({ text: `${meta.fikir_adi} — GTM Planı`, bold: true, size: 32, color: COLORS.primary })] }),
    new Paragraph({ spacing: { after: 200 }, children: [] }),

    heading('ICP & Beachhead', HeadingLevel.HEADING_2),
    para(`ICP: ${c?.gtm?.icp || '—'}`),
    para(`Beachhead: ${c?.gtm?.beachhead || '—'}`),
    para(`Büyüme Motoru: ${c?.gtm?.buyume_motoru || '—'}`),

    heading('Edinim Kanalları', HeadingLevel.HEADING_2),
  ];

  if (c?.gtm?.kanallar?.length) {
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('Kanal'), headerCell('CAC'), headerCell('Ölçeklenebilirlik'), headerCell('Hız'), headerCell('Öncelik')] }),
        ...c.gtm.kanallar.map(k => new TableRow({
          children: [tableCellP(k.kanal), tableCellP(k.tahmini_cac_tl), tableCellP(k.olceklenebilirlik), tableCellP(k.hiz), tableCellP(k.oncelik)],
        })),
      ],
    }));
  }

  if (c?.gtm?.plan_90gun?.length) {
    children.push(heading('90 Gün Lansman Planı', HeadingLevel.HEADING_2));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('Ay'), headerCell('Hedef'), headerCell('Aksiyon'), headerCell('KPI')] }),
        ...c.gtm.plan_90gun.map(p => new TableRow({
          children: [tableCellP(`Ay ${p.ay}`), tableCellP(p.hedef), tableCellP(p.aksiyon), tableCellP(p.kpi)],
        })),
      ],
    }));
  }

  children.push(...legalDisclaimer());
  const doc = new Document({ sections: [{ headers: { default: makeHeader(meta.fikir_adi || 'Analiz', 'GTM Planı') }, footers: { default: makeFooter() }, children }] });
  return Buffer.from(await Packer.toBuffer(doc));
}

// ─── FİNANSAL RAPOR ────────────────────────────────────

export async function generateFinansalDocx(state: AnalysisState): Promise<Buffer> {
  const { meta, D_final: d } = state;
  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new TextRun({ text: `${meta.fikir_adi} — Finansal Projeksiyon`, bold: true, size: 32, color: COLORS.primary })] }),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
  ];

  if (d?.finansal?.projeksiyon_yillik?.length) {
    children.push(heading('5 Yıllık Projeksiyon', HeadingLevel.HEADING_2));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell(''), ...d.finansal.projeksiyon_yillik.map(y => headerCell(`Yıl ${y.yil}`))] }),
        new TableRow({ children: [tableCellP('Müşteri', true), ...d.finansal.projeksiyon_yillik.map(y => tableCellP(String(y.musteri)))] }),
        new TableRow({ children: [tableCellP('ARR', true), ...d.finansal.projeksiyon_yillik.map(y => tableCellP(y.arr_tl))] }),
        new TableRow({ children: [tableCellP('EBITDA', true), ...d.finansal.projeksiyon_yillik.map(y => tableCellP(y.ebitda_tl))] }),
        new TableRow({ children: [tableCellP('Nakit', true), ...d.finansal.projeksiyon_yillik.map(y => tableCellP(y.donem_sonu_nakit_tl))] }),
      ],
    }));
  }

  children.push(para(`Break-even: Ay ${d?.finansal?.breakeven_ay || '—'}`, { bold: true }));

  children.push(...legalDisclaimer());
  const doc = new Document({ sections: [{ headers: { default: makeHeader(meta.fikir_adi || 'Analiz', 'Finansal Projeksiyon') }, footers: { default: makeFooter() }, children }] });
  return Buffer.from(await Packer.toBuffer(doc));
}
