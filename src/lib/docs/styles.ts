// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Ortak Kurumsal Kimlik & Yardımcı Fonksiyonlar
// ═══════════════════════════════════════════════════════════

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageBreak, HeadingLevel, LevelFormat,
  TabStopType, TabStopPosition, PageNumber
} from 'docx';

// ─── RENK PALETİ ──────────────────────────────────────────
export const C = {
  NAVY:       '1E3A5F',   // Ana — başlıklar, header bar
  ACCENT:     '2563EB',   // Vurgu — linkler, önemli rakamlar
  SUCCESS:    '16A34A',   // Başarı — GO, pozitif metrikler
  WARN:       'D97706',   // Uyarı — CONDITIONAL GO
  DANGER:     'DC2626',   // Tehlike — NO-GO, riskler
  WHITE:      'FFFFFF',
  TEXT:        '1F2937',   // Koyu gri — ana metin
  MUTED:      '6B7280',   // Gri — footer, ikincil
  LIGHT_BG:   'EFF6FF',   // Açık mavi arka plan
  HEADER_BG:  '1E3A5F',   // Tablo header arka plan
  BORDER:     'CBD5E1',   // Tablo kenarlık
  LIGHT_GRAY: 'F8FAFC',   // Çok açık gri arka plan
};

// ─── TABLO KENARLIKLARI ───────────────────────────────────
const borderDef = { style: BorderStyle.SINGLE, size: 1, color: C.BORDER };
export const BORDERS = { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef };
export const NO_BORDERS = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

// ─── SAYFA BOYUTLARI (A4 — DXA) ──────────────────────────
export const PAGE = {
  WIDTH: 11906,
  HEIGHT: 16838,
  MARGIN_TOP: 1134,     // 2cm
  MARGIN_BOTTOM: 1134,  // 2cm
  MARGIN_LEFT: 1418,    // 2.5cm
  MARGIN_RIGHT: 1134,   // 2cm
  get CONTENT_WIDTH() { return this.WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT; }, // ~9354
};

// ─── NUMBERING CONFIG ─────────────────────────────────────
export const NUMBERING_CONFIG = {
  config: [
    {
      reference: 'bullets',
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: '\u2022',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    },
    {
      reference: 'numbers',
      levels: [{
        level: 0,
        format: LevelFormat.DECIMAL,
        text: '%1.',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    },
    {
      reference: 'checkboxes',
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: '\u2610',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    },
  ],
};

// ─── STIL TANIMLARI ───────────────────────────────────────
export const DOC_STYLES = {
  default: { document: { run: { font: 'Calibri', size: 21 } } }, // 10.5pt
  paragraphStyles: [
    {
      id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 32, bold: true, font: 'Calibri', color: C.NAVY },
      paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 },
    },
    {
      id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 26, bold: true, font: 'Calibri', color: C.ACCENT },
      paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 },
    },
    {
      id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 22, bold: true, font: 'Calibri', color: C.TEXT },
      paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 },
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════

/** Rakamları formatlı göster: 1234567 → $1.2M */
export function fmtMoney(val: number | string | undefined, unit?: string): string {
  if (val === undefined || val === null || val === '') return '—';
  const n = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]/g, '')) : val;
  if (isNaN(n)) return String(val);
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

/** USD→TL dönüşüm ile gösterim: "$50K (~₺1.9M)" */
export function fmtDual(usd: number | string | undefined, kur: number): string {
  if (usd === undefined || usd === null || usd === '') return '—';
  const n = typeof usd === 'string' ? parseFloat(usd.replace(/[^0-9.-]/g, '')) : usd;
  if (isNaN(n)) return String(usd);
  const tl = n * kur;
  const usdStr = fmtMoney(n);
  const tlAbs = Math.abs(tl);
  let tlStr: string;
  if (tlAbs >= 1e9) tlStr = `₺${(tl / 1e9).toFixed(1)}B`;
  else if (tlAbs >= 1e6) tlStr = `₺${(tl / 1e6).toFixed(1)}M`;
  else if (tlAbs >= 1e3) tlStr = `₺${(tl / 1e3).toFixed(0)}K`;
  else tlStr = `₺${tl.toFixed(0)}`;
  return `${usdStr} (~${tlStr})`;
}

/** Yüzde formatlama */
export function fmtPct(val: number | string | undefined): string {
  if (val === undefined || val === null || val === '') return '—';
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return String(val);
  return `${n.toFixed(1)}%`;
}

/** Güvenli değer çekme — undefined/null/empty string → fallback */
export function safeVal(val: any, fallback: string = '—'): string {
  if (val === undefined || val === null || val === '') return fallback;
  return String(val);
}

/** State'ten nested path ile güvenli değer çekme: get(state, 'A_pazar.tam') */
export function get(obj: any, path: string, fallback: any = undefined): any {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : fallback), obj);
}

// ─── PARAGRAF FABRİKALARI ─────────────────────────────────

export function h1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: 'Calibri', size: 32, bold: true, color: C.NAVY })],
  });
}

export function h2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, font: 'Calibri', size: 26, bold: true, color: C.ACCENT })],
  });
}

export function h3(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 160, after: 80 },
    children: [new TextRun({ text, font: 'Calibri', size: 22, bold: true, color: C.TEXT })],
  });
}

export function body(text: string, opts: { bold?: boolean; italic?: boolean; color?: string; size?: number } = {}): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: 60 },
    children: [new TextRun({
      text,
      font: 'Calibri',
      size: opts.size || 21,
      bold: opts.bold,
      italics: opts.italic,
      color: opts.color || C.TEXT,
    })],
  });
}

export function spacer(pts: number = 120): Paragraph {
  return new Paragraph({ spacing: { before: pts, after: 0 }, children: [] });
}

export function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

export function bullet(text: string, ref: string = 'bullets'): Paragraph {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: 'Calibri', size: 21, color: C.TEXT })],
  });
}

export function numberedItem(text: string): Paragraph {
  return bullet(text, 'numbers');
}

export function checkbox(text: string): Paragraph {
  return bullet(text, 'checkboxes');
}

/** Vurgulu metin kutusu — "The Ask" gibi bölümler için */
export function highlightBox(children: Paragraph[]): Table {
  return new Table({
    width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [PAGE.CONTENT_WIDTH],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 3, color: C.ACCENT },
              bottom: { style: BorderStyle.SINGLE, size: 3, color: C.ACCENT },
              left: { style: BorderStyle.SINGLE, size: 3, color: C.ACCENT },
              right: { style: BorderStyle.SINGLE, size: 3, color: C.ACCENT },
            },
            shading: { fill: C.LIGHT_BG, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            width: { size: PAGE.CONTENT_WIDTH, type: WidthType.DXA },
            children,
          }),
        ],
      }),
    ],
  });
}

// ─── TABLO FABRİKALARI ───────────────────────────────────

interface TableConfig {
  headers: string[];
  rows: string[][];
  colWidths?: number[];
  headerBg?: string;
  headerColor?: string;
}

/** Standart investor-grade tablo oluştur */
export function makeTable(config: TableConfig): Table {
  const { headers, rows, headerBg = C.HEADER_BG, headerColor = C.WHITE } = config;
  const colCount = headers.length;
  const totalWidth = PAGE.CONTENT_WIDTH;
  const colWidths = config.colWidths || headers.map(() => Math.floor(totalWidth / colCount));

  // Genişliklerin toplamını eşitle
  const diff = totalWidth - colWidths.reduce((a, b) => a + b, 0);
  if (diff !== 0) colWidths[colWidths.length - 1] += diff;

  const headerRow = new TableRow({
    children: headers.map((text, i) =>
      new TableCell({
        borders: BORDERS,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: headerBg, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, font: 'Calibri', size: 19, bold: true, color: headerColor })],
        })],
      })
    ),
  });

  const dataRows = rows.map(row =>
    new TableRow({
      children: row.map((text, i) =>
        new TableCell({
          borders: BORDERS,
          width: { size: colWidths[i], type: WidthType.DXA },
          margins: { top: 50, bottom: 50, left: 100, right: 100 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            children: [new TextRun({ text: safeVal(text), font: 'Calibri', size: 19, color: C.TEXT })],
          })],
        })
      ),
    })
  );

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  });
}

// ─── HEADER / FOOTER FABRİKALARI ─────────────────────────

export function makeHeader(companyName: string, docType: string): Header {
  return new Header({
    children: [
      new Paragraph({
        spacing: { after: 0 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.ACCENT, space: 4 } },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: companyName, font: 'Calibri', size: 18, bold: true, color: C.NAVY }),
          new TextRun({ text: `\t${docType}`, font: 'Calibri', size: 16, color: C.MUTED }),
        ],
      }),
    ],
  });
}

export function makeFooterTR(date: string): Footer {
  return new Footer({
    children: [
      new Paragraph({
        spacing: { before: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.BORDER, space: 4 } },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({
            text: 'Gizli \u2014 Yaln\u0131zca yat\u0131r\u0131mc\u0131 de\u011Ferlendirmesi i\u00E7indir',
            font: 'Calibri', size: 14, italics: true, color: C.MUTED,
          }),
          new TextRun({ text: `\tHaz\u0131rlanma Tarihi: ${date}`, font: 'Calibri', size: 14, color: C.MUTED }),
        ],
      }),
    ],
  });
}

export function makeFooterEN(date: string): Footer {
  return new Footer({
    children: [
      new Paragraph({
        spacing: { before: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.BORDER, space: 4 } },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({
            text: 'Confidential \u2014 For investor evaluation only',
            font: 'Calibri', size: 14, italics: true, color: C.MUTED,
          }),
          new TextRun({ text: `\tDate: ${date}`, font: 'Calibri', size: 14, color: C.MUTED }),
        ],
      }),
    ],
  });
}

// ─── YASAL UYARI ──────────────────────────────────────────

export function legalDisclaimerTR(): Paragraph[] {
  return [
    pageBreak(),
    h2('YASAL UYARI'),
    body(
      'Bu dok\u00FCman yaln\u0131zca bilgilendirme ama\u00E7l\u0131d\u0131r ve yat\u0131r\u0131m tavsiyesi niteli\u011Fi ta\u015F\u0131maz. ' +
      '\u0130leriye d\u00F6n\u00FCk tahminler (forward-looking statements) i\u00E7ermektedir; ger\u00E7ek sonu\u00E7lar ' +
      '\u00F6ng\u00F6r\u00FClenlerden \u00F6nemli \u00F6l\u00E7\u00FCde farkl\u0131l\u0131k g\u00F6sterebilir. ' +
      'Yat\u0131r\u0131m karar\u0131 vermeden \u00F6nce ba\u011F\u0131ms\u0131z profesyonel dan\u0131\u015Fmanl\u0131k al\u0131nmas\u0131 ' +
      '\u00F6nerilir. T\u00FCm finansal projeksiyonlar varsay\u0131mlara dayal\u0131d\u0131r ve garanti niteli\u011Finde de\u011Fildir.',
      { italic: true, color: C.MUTED, size: 18 }
    ),
  ];
}

export function legalDisclaimerEN(): Paragraph[] {
  return [
    pageBreak(),
    h2('LEGAL DISCLAIMER'),
    body(
      'This document is for informational purposes only and does not constitute investment advice. ' +
      'It contains forward-looking statements; actual results may differ materially from those projected. ' +
      'Independent professional advice should be obtained before making any investment decision. ' +
      'All financial projections are based on assumptions and are not guarantees.',
      { italic: true, color: C.MUTED, size: 18 }
    ),
  ];
}

// ─── DOKÜMAN OLUŞTURMA WRAPPER ────────────────────────────

interface DocOptions {
  companyName: string;
  docType: string;
  date: string;
  lang: 'tr' | 'en';
  children: (Paragraph | Table)[];
}

export function createDocument(opts: DocOptions): Document {
  const footer = opts.lang === 'tr' ? makeFooterTR(opts.date) : makeFooterEN(opts.date);
  const legal = opts.lang === 'tr' ? legalDisclaimerTR() : legalDisclaimerEN();

  return new Document({
    styles: DOC_STYLES,
    numbering: NUMBERING_CONFIG,
    sections: [{
      properties: {
        page: {
          size: { width: PAGE.WIDTH, height: PAGE.HEIGHT },
          margin: {
            top: PAGE.MARGIN_TOP,
            bottom: PAGE.MARGIN_BOTTOM,
            left: PAGE.MARGIN_LEFT,
            right: PAGE.MARGIN_RIGHT,
          },
        },
      },
      headers: { default: makeHeader(opts.companyName, opts.docType) },
      footers: { default: footer },
      children: [...opts.children, ...legal],
    }],
  });
}

/** Document → Buffer */
export async function packDoc(doc: Document): Promise<Buffer> {
  return Packer.toBuffer(doc) as unknown as Promise<Buffer>;
}
