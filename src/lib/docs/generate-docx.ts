import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, ShadingType, Header, Footer,
} from 'docx';
import { AnalysisState } from '@/types';

const C = { primary: '1E3A5F', accent: '2563EB', success: '16A34A', warning: 'D97706', danger: 'DC2626', text: '1F2937', muted: '6B7280' };

// ─── Helpers ────────────────────────────────────────────
// Deep get any nested value with fallback
function dig(obj: Record<string, unknown>, ...paths: string[]): string {
  for (const path of paths) {
    const val = path.split('.').reduce((o: unknown, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
    if (val !== undefined && val !== null && val !== '') {
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    }
  }
  return '—';
}

function digArr(obj: Record<string, unknown>, ...paths: string[]): string[] {
  for (const path of paths) {
    const val = path.split('.').reduce((o: unknown, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
    if (Array.isArray(val) && val.length > 0) return val.map(v => typeof v === 'string' ? v : JSON.stringify(v));
  }
  return [];
}

function digArrObj(obj: Record<string, unknown>, ...paths: string[]): Record<string, unknown>[] {
  for (const path of paths) {
    const val = path.split('.').reduce((o: unknown, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
    if (Array.isArray(val) && val.length > 0) return val as Record<string, unknown>[];
  }
  return [];
}

function h(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, color: C.primary, bold: true })] });
}
function p(text: string, opts?: { bold?: boolean; color?: string; size?: number }) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, bold: opts?.bold, color: opts?.color ?? C.text, size: opts?.size ?? 21 })] });
}
function tc(text: string, bold = false) {
  return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold, size: 19 })] })], margins: { top: 40, bottom: 40, left: 80, right: 80 } });
}
function th(text: string) {
  return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 19 })] })], shading: { type: ShadingType.SOLID, color: C.primary }, margins: { top: 40, bottom: 40, left: 80, right: 80 } });
}
function mkHeader(left: string, right: string) {
  return new Header({ children: [new Paragraph({ children: [new TextRun({ text: `${left}  |  ${right}`, size: 16, color: C.muted })] })] });
}
function mkFooter() {
  return new Footer({ children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Gizli — Yalnızca yatırımcı değerlendirmesi içindir', size: 14, color: C.muted, italics: true })] })] });
}
function legal() {
  return [h('Yasal Uyarı', HeadingLevel.HEADING_2), p('Bu doküman yalnızca bilgilendirme amaçlıdır ve yatırım tavsiyesi niteliği taşımaz. İleriye dönük tahminler içermektedir; gerçek sonuçlar öngörülenlerden önemli ölçüde farklılık gösterebilir.', { size: 18, color: C.muted })];
}
function mkDoc(name: string, docType: string, children: (Paragraph | Table)[]) {
  return new Document({ sections: [{ headers: { default: mkHeader(name, docType) }, footers: { default: mkFooter() }, children: [...children, ...legal()] }] });
}

// ─── EXECUTIVE SUMMARY ──────────────────────────────────
export async function generateExecSummary(state: AnalysisState): Promise<Buffer> {
  const s = state as unknown as Record<string, unknown>;
  const meta = state.meta;
  const name = meta.fikir_adi || 'Startup';

  const children: (Paragraph | Table)[] = [
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: name.toUpperCase(), bold: true, size: 32, color: C.primary })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: dig(s, 'B_rekabet.uvp', 'A_pazar.uvp', 'A_pazar.lean_canvas.unique_value', 'A_pazar.lean_canvas.value_prop'), italics: true, size: 22, color: C.accent })] }),

    h('Problem & Fırsat', HeadingLevel.HEADING_2),
    p(dig(s, 'A_pazar.problem', 'A_pazar.lean_canvas.problem')),

    h('Çözüm', HeadingLevel.HEADING_2),
    p(dig(s, 'A_pazar.cozum', 'A_pazar.lean_canvas.cozum', 'A_pazar.lean_canvas.solution')),

    h('Hedef Kitle', HeadingLevel.HEADING_2),
    p(dig(s, 'A_pazar.hedef_kitle', 'A_pazar.lean_canvas.customer_segments', 'A_pazar.lean_canvas.segments')),

    h('Pazar Fırsatı', HeadingLevel.HEADING_2),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
      new TableRow({ children: [th('Metrik'), th('Değer')] }),
      new TableRow({ children: [tc('TAM'), tc(dig(s, 'A_pazar.tam_tr', 'A_pazar.tam'))] }),
      new TableRow({ children: [tc('SAM'), tc(dig(s, 'A_pazar.sam'))] }),
      new TableRow({ children: [tc('SOM (3Y)'), tc(dig(s, 'A_pazar.som_3yil', 'A_pazar.som_3y'))] }),
      new TableRow({ children: [tc('CAGR'), tc(dig(s, 'A_pazar.cagr_tr', 'A_pazar.cagr'))] }),
    ]}),

    h('İş Modeli', HeadingLevel.HEADING_2),
    p(dig(s, 'C_strateji.is_modeli.tip', 'A_pazar.is_modeli_ozet', 'A_pazar.is_modeli')),

    h('Rekabet Avantajı', HeadingLevel.HEADING_2),
    p(`UVP: ${dig(s, 'B_rekabet.uvp', 'A_pazar.uvp')}`),
    p(`Moat: ${dig(s, 'B_rekabet.moat_tipi', 'B_rekabet.moat.tip')} — ${dig(s, 'B_rekabet.moat_suresi', 'B_rekabet.moat.sure')}`),

    h('Finansal Hedefler', HeadingLevel.HEADING_2),
    p(dig(s, 'D_final.yonetici_ozeti', 'D_final.finansal_projeksiyon')),

    h('Değerlendirme', HeadingLevel.HEADING_2),
    p(`Final Skor: ${meta.final_skor}/100 → ${meta.karar}`, { bold: true, color: String(meta.karar).includes('GO') && !String(meta.karar).includes('NO') ? C.success : C.danger }),
  ];

  // Fonlama
  const fonlama = dig(s, 'D_final.fonlama', 'D_final.finansal.fonlama');
  if (fonlama !== '—') {
    children.push(h('Fonlama Planı', HeadingLevel.HEADING_2));
    children.push(p(fonlama));
  }

  return Buffer.from(await Packer.toBuffer(mkDoc(name, 'Executive Summary', children)));
}

// ─── REKABET RAPORU ─────────────────────────────────────
export async function generateRekabeDocx(state: AnalysisState): Promise<Buffer> {
  const s = state as unknown as Record<string, unknown>;
  const name = state.meta.fikir_adi || 'Analiz';
  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new TextRun({ text: `${name} — Rekabet Analizi`, bold: true, size: 32, color: C.primary })] }),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
  ];

  // Rakipler
  const rakipler = digArrObj(s, 'B_rekabet.rakipler', 'B_rekabet.dogrudan_rakipler');
  if (rakipler.length > 0) {
    children.push(h('Doğrudan Rakipler', HeadingLevel.HEADING_2));
    const headerRow = new TableRow({ children: [th('Rakip'), th('Fonlama'), th('Güçlü Yön'), th('Zayıf Yön'), th('Tehdit')] });
    const dataRows = rakipler.map(r => new TableRow({ children: [
      tc(String(r.ad || r.name || '—'), true),
      tc(String(r.fonlama || r.kurulusfonlama || r.kullanici_mrr || '—')),
      tc(String(r.guclu_yon || r.guclu_yan || r.strengths || '—')),
      tc(String(r.zayif_yon || r.zayif_yan || r.weaknesses || '—')),
      tc(String(r.tehdit || r.threat || '—')),
    ]}));
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] }));
  }

  // Dolaylı rakipler
  const dolayli = digArr(s, 'B_rekabet.dolyli_rakipler', 'B_rekabet.dolayli_rakipler');
  if (dolayli.length > 0) {
    children.push(h('Dolaylı Rakipler', HeadingLevel.HEADING_2));
    dolayli.forEach(d => children.push(p(`• ${d}`)));
  }

  // Porter
  const porter = dig(s, 'B_rekabet.porter', 'B_rekabet.porter_5', 'B_rekabet.porter_analizi');
  if (porter !== '—') {
    children.push(h("Porter'ın 5 Gücü", HeadingLevel.HEADING_2));
    try {
      const obj = JSON.parse(porter);
      Object.entries(obj).forEach(([k, v]) => children.push(p(`${k}: ${v}`)));
    } catch { children.push(p(porter)); }
  }

  // SWOT
  children.push(h('SWOT Analizi', HeadingLevel.HEADING_2));
  const sw = digArr(s, 'B_rekabet.swot.S', 'B_rekabet.swot.strengths');
  const wk = digArr(s, 'B_rekabet.swot.W', 'B_rekabet.swot.weaknesses');
  const op = digArr(s, 'B_rekabet.swot.O', 'B_rekabet.swot.opportunities');
  const tr = digArr(s, 'B_rekabet.swot.T', 'B_rekabet.swot.threats');
  if (sw.length > 0 || wk.length > 0) {
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
      new TableRow({ children: [th('Güçlü Yönler (S)'), th('Zayıf Yönler (W)')] }),
      new TableRow({ children: [tc(sw.join('\n') || '—'), tc(wk.join('\n') || '—')] }),
      new TableRow({ children: [th('Fırsatlar (O)'), th('Tehditler (T)')] }),
      new TableRow({ children: [tc(op.join('\n') || '—'), tc(tr.join('\n') || '—')] }),
    ]}));
  }

  // TOWS
  const tows = dig(s, 'B_rekabet.tows');
  if (tows !== '—') {
    children.push(h('TOWS Stratejileri', HeadingLevel.HEADING_2));
    try {
      const obj = JSON.parse(tows);
      Object.entries(obj).forEach(([k, v]) => children.push(p(`${k.toUpperCase()}: ${v}`)));
    } catch { children.push(p(tows)); }
  }

  // UVP & Moat
  children.push(h('Farklılaşma', HeadingLevel.HEADING_2));
  children.push(p(`UVP: ${dig(s, 'B_rekabet.uvp')}`));
  children.push(p(`Moat: ${dig(s, 'B_rekabet.moat_tipi', 'B_rekabet.moat.tip')} — ${dig(s, 'B_rekabet.moat_suresi', 'B_rekabet.moat.sure', 'B_rekabet.moat.aciklama')}`));

  return Buffer.from(await Packer.toBuffer(mkDoc(name, 'Rekabet Analizi', children)));
}

// ─── RİSK RAPORU ────────────────────────────────────────
export async function generateRiskDocx(state: AnalysisState): Promise<Buffer> {
  const s = state as unknown as Record<string, unknown>;
  const name = state.meta.fikir_adi || 'Analiz';
  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new TextRun({ text: `${name} — Risk Matrisi`, bold: true, size: 32, color: C.primary })] }),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
  ];

  // Kill risk
  const killRisk = dig(s, 'C_strateji.riskler.kill_risk.aciklama', 'C_strateji.risk_matrisi.kill_risk');
  if (killRisk !== '—') {
    children.push(h('Kill Risk', HeadingLevel.HEADING_2));
    children.push(p(killRisk, { color: C.danger, bold: true }));
  }

  // Risk tablosu
  const riskler = digArrObj(s, 'C_strateji.riskler.top', 'C_strateji.risk_matrisi', 'C_strateji.risk_matrisi.top_riskler');
  if (riskler.length > 0) {
    children.push(h('Risk Matrisi', HeadingLevel.HEADING_2));
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
      new TableRow({ children: [th('Risk'), th('Kategori'), th('Olasılık'), th('Etki'), th('Skor')] }),
      ...riskler.map(r => new TableRow({ children: [
        tc(String(r.risk || r.tanim || '—')),
        tc(String(r.kategori || r.category || '—')),
        tc(String(r.olasilik || r['olasılık'] || '—')),
        tc(String(r.etki || '—')),
        tc(String(r.skor || '—')),
      ]})),
    ]}));
  }

  // Pre-mortem
  const premortem = digArr(s, 'C_strateji.riskler.pre_mortem', 'C_strateji.pre_mortem');
  if (premortem.length > 0) {
    children.push(h('Pre-Mortem Senaryoları', HeadingLevel.HEADING_2));
    premortem.forEach((pm, i) => children.push(p(`${i + 1}. ${pm}`)));
  }

  return Buffer.from(await Packer.toBuffer(mkDoc(name, 'Risk Raporu', children)));
}

// ─── GTM RAPORU ─────────────────────────────────────────
export async function generateGtmDocx(state: AnalysisState): Promise<Buffer> {
  const s = state as unknown as Record<string, unknown>;
  const name = state.meta.fikir_adi || 'Analiz';
  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new TextRun({ text: `${name} — GTM Planı`, bold: true, size: 32, color: C.primary })] }),
    new Paragraph({ spacing: { after: 200 }, children: [] }),

    h('ICP & Beachhead', HeadingLevel.HEADING_2),
    p(`ICP: ${dig(s, 'C_strateji.gtm.icp')}`),
    p(`Beachhead: ${dig(s, 'C_strateji.gtm.beachhead')}`),
    p(`Büyüme Motoru: ${dig(s, 'C_strateji.gtm.buyume_motoru')}`),

    h('Fiyatlama', HeadingLevel.HEADING_2),
    p(dig(s, 'C_strateji.gtm.fiyatlama', 'C_strateji.is_modeli.fiyatlar')),

    h('Edinim Kanalları', HeadingLevel.HEADING_2),
  ];

  const kanallar = digArr(s, 'C_strateji.gtm.kanallar');
  if (kanallar.length > 0) {
    kanallar.forEach(k => children.push(p(`• ${k}`)));
  }

  // Birim ekonomisi
  children.push(h('Birim Ekonomisi', HeadingLevel.HEADING_2));
  const be = dig(s, 'C_strateji.birim_ekonomisi', 'C_strateji.gtm.birim_ekonomisi', 'C_strateji.birim_ekonomi');
  if (be !== '—') {
    try {
      const obj = JSON.parse(be);
      Object.entries(obj).forEach(([k, v]) => children.push(p(`${k}: ${v}`)));
    } catch { children.push(p(be)); }
  }

  // 90 gün plan
  const plan = dig(s, 'C_strateji.gtm.plan_90gun', 'C_strateji.gtm.lansman_90');
  if (plan !== '—') {
    children.push(h('90 Gün Lansman Planı', HeadingLevel.HEADING_2));
    children.push(p(plan));
  }

  return Buffer.from(await Packer.toBuffer(mkDoc(name, 'GTM Planı', children)));
}

// ─── FİNANSAL RAPOR ────────────────────────────────────
export async function generateFinansalDocx(state: AnalysisState): Promise<Buffer> {
  const s = state as unknown as Record<string, unknown>;
  const name = state.meta.fikir_adi || 'Analiz';
  const children: (Paragraph | Table)[] = [
    new Paragraph({ children: [new TextRun({ text: `${name} — Finansal Projeksiyon`, bold: true, size: 32, color: C.primary })] }),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
  ];

  // Projeksiyon
  const proj = dig(s, 'D_final.finansal.projeksiyon_yillik', 'D_final.finansal_projeksiyon');
  if (proj !== '—') {
    children.push(h('Finansal Projeksiyon', HeadingLevel.HEADING_2));
    try {
      const obj = JSON.parse(proj);
      if (typeof obj === 'object' && !Array.isArray(obj)) {
        // Key-value format (2024, 2026, 2028)
        const years = Object.keys(obj);
        const metrics = Object.keys(obj[years[0]] || {});
        children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
          new TableRow({ children: [th(''), ...years.map(y => th(y))] }),
          ...metrics.map(m => new TableRow({ children: [tc(m, true), ...years.map(y => tc(String((obj as Record<string, Record<string, unknown>>)[y]?.[m] || '—')))] })),
        ]}));
      }
    } catch { children.push(p(proj)); }
  }

  // Senaryolar
  const senaryo = dig(s, 'D_final.finansal.senaryo', 'D_final.senaryolar');
  if (senaryo !== '—') {
    children.push(h('Senaryo Analizi', HeadingLevel.HEADING_2));
    try {
      const obj = JSON.parse(senaryo);
      Object.entries(obj).forEach(([k, v]) => children.push(p(`${k}: ${v}`)));
    } catch { children.push(p(senaryo)); }
  }

  // Break-even
  children.push(p(`Break-even: ${dig(s, 'D_final.finansal.breakeven_ay')}`, { bold: true }));

  // Exit
  const exit = dig(s, 'D_final.exit', 'D_final.exit_stratejisi');
  if (exit !== '—') {
    children.push(h('Exit Stratejisi', HeadingLevel.HEADING_2));
    try {
      const obj = JSON.parse(exit);
      Object.entries(obj).forEach(([k, v]) => children.push(p(`${k}: ${v}`)));
    } catch { children.push(p(exit)); }
  }

  return Buffer.from(await Packer.toBuffer(mkDoc(name, 'Finansal Projeksiyon', children)));
}
