// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Investment Teaser Generator
// Soğuk e-posta eki — 1 sayfa, merak uyandırıcı
// ═══════════════════════════════════════════════════════════

import { Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign } from 'docx';
import {
  C, PAGE, NO_BORDERS,
  spacer, createDocument, packDoc,
  fmtMoney, fmtPct, safeVal, get,
} from './styles';

export async function generateTeaser(state: any, langOverride?: 'tr' | 'en'): Promise<Buffer> {
  const lang = langOverride || get(state, 'meta.dil', 'tr');
  const isTR = lang === 'tr';
  const kur = get(state, 'meta.usd_try_kur', 34);
  const fikir = get(state, 'meta.fikir_adi', 'Startup');
  const sektor = get(state, 'meta.sektor', '');
  const tarih = get(state, 'meta.tarih', new Date().toISOString().split('T')[0]);

  const uvp = get(state, 'B_rekabet.uvp', '');
  const problem = get(state, 'A_pazar.problem', '');
  const cozum = get(state, 'A_pazar.cozum', '');
  const tam = get(state, 'A_pazar.tam', 0);
  const som = get(state, 'A_pazar.som_3yil', 0);
  const cagr = get(state, 'A_pazar.cagr_tr', 0);
  const moat = get(state, 'B_rekabet.moat_tipi', '');
  const swotS = get(state, 'B_rekabet.swot.strengths', []);
  const fonlama = get(state, 'D_final.finansal.fonlama', []);
  const fonlama0 = Array.isArray(fonlama) ? fonlama[0] : fonlama;

  const children: (Paragraph | Table)[] = [];

  // ── HEADER: Şirket adı, sektör, aşama ──────────
  children.push(
    new Table({
      width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [PAGE.CONTENT_WIDTH],
      rows: [new TableRow({
        children: [new TableCell({
          borders: NO_BORDERS,
          shading: { fill: C.NAVY, type: ShadingType.CLEAR },
          width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
          margins: { top: 200, bottom: 200, left: 300, right: 300 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: fikir.toUpperCase(), font: 'Calibri', size: 36, bold: true, color: C.WHITE }),
                new TextRun({ text: `  \u2014  ${sektor}`, font: 'Calibri', size: 24, color: 'B0C4DE' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 80 },
              children: [new TextRun({
                text: `"${uvp || cozum}"`,
                font: 'Calibri', size: 22, italics: true, color: C.WHITE,
              })],
            }),
          ],
        })],
      })],
    })
  );

  children.push(spacer(120));

  // ── THE OPPORTUNITY ─────────────────────────────
  children.push(sectionTitle(isTR ? 'FIRSAT' : 'THE OPPORTUNITY'));

  // Problem
  children.push(labelValue(isTR ? 'Problem' : 'Problem', truncate(problem, 150)));
  children.push(spacer(40));

  // Çözüm
  children.push(labelValue(isTR ? '\u00C7\u00F6z\u00FCm' : 'Solution', truncate(cozum, 150)));
  children.push(spacer(40));

  // Pazar
  children.push(labelValue(
    isTR ? 'Pazar' : 'Market',
    `TAM $${tam}M \u2192 SOM $${som}M (3Y) | CAGR ${fmtPct(cagr)}`
  ));

  children.push(spacer(100));

  // ── NEDEN BİZ ───────────────────────────────────
  children.push(sectionTitle(isTR ? 'NEDEN B\u0130Z' : 'WHY US'));

  const advantages: string[] = [];
  if (moat) advantages.push(moat);
  swotS.slice(0, 2).forEach((s: string) => advantages.push(s));
  if (advantages.length === 0) advantages.push('First-mover advantage');

  advantages.forEach(adv => {
    children.push(new Paragraph({
      spacing: { before: 30, after: 30 },
      children: [
        new TextRun({ text: '\u2022  ', font: 'Calibri', size: 21, color: C.ACCENT, bold: true }),
        new TextRun({ text: adv, font: 'Calibri', size: 21, color: C.TEXT }),
      ],
    }));
  });

  children.push(spacer(100));

  // ── THE ASK ─────────────────────────────────────
  children.push(sectionTitle(isTR ? 'YATIRIM TALEB\u0130' : 'THE ASK'));

  if (fonlama0) {
    children.push(
      new Table({
        width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [PAGE.CONTENT_WIDTH],
        rows: [new TableRow({
          children: [new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: C.ACCENT },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: C.ACCENT },
              left: { style: BorderStyle.SINGLE, size: 2, color: C.ACCENT },
              right: { style: BorderStyle.SINGLE, size: 2, color: C.ACCENT },
            },
            shading: { fill: 'EFF6FF', type: ShadingType.CLEAR },
            width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
            margins: { top: 100, bottom: 100, left: 200, right: 200 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${safeVal(fonlama0.tutar)} ${safeVal(fonlama0.tur)}`,
                  font: 'Calibri', size: 24, bold: true, color: C.NAVY,
                }),
                new TextRun({
                  text: `  |  ${safeVal(fonlama0.kullanim)}`,
                  font: 'Calibri', size: 20, color: C.TEXT,
                }),
              ],
            })],
          })],
        })],
      })
    );
  }

  children.push(spacer(120));

  // ── FOOTER: İletişim ────────────────────────────
  children.push(
    new Table({
      width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [PAGE.CONTENT_WIDTH],
      rows: [new TableRow({
        children: [new TableCell({
          borders: { top: { style: BorderStyle.SINGLE, size: 2, color: C.BORDER }, bottom: NO_BORDERS.bottom, left: NO_BORDERS.left, right: NO_BORDERS.right },
          width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
          margins: { top: 100, bottom: 0, left: 0, right: 0 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              text: isTR
                ? 'Detayl\u0131 bilgi i\u00E7in toplant\u0131 talep edin.'
                : 'Request a meeting for detailed information.',
              font: 'Calibri', size: 18, italics: true, color: C.MUTED,
            })],
          })],
        })],
      })],
    })
  );

  const doc = createDocument({
    companyName: fikir,
    docType: 'Investment Teaser',
    date: tarih,
    lang,
    children,
  });

  return packDoc(doc);
}

// ── Yardımcılar ───────────────────────────────────

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: C.ACCENT, space: 4 } },
    children: [new TextRun({ text, font: 'Calibri', size: 24, bold: true, color: C.NAVY })],
  });
}

function labelValue(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { before: 20, after: 20 },
    children: [
      new TextRun({ text: `${label}: `, font: 'Calibri', size: 21, bold: true, color: C.TEXT }),
      new TextRun({ text: value, font: 'Calibri', size: 21, color: C.TEXT }),
    ],
  });
}

function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.substring(0, max) + '...' : text;
}
