// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Yazışma Transkript Generator (.pdf)
// Chat geçmişini düzenli PDF olarak arşivler
// ═══════════════════════════════════════════════════════════
//
// NOT: Bu generator diğerlerinden farklıdır — state'ten değil,
// chat geçmişi array'inden üretilir. Frontend'den messages[]
// dizisi gönderilmelidir.
//
// Kullanım:
//   POST /api/documents/generate
//   body: { command: "yazışma pdf üret", state: {...}, messages: [...] }

import { get, safeVal } from './styles';

// PDFKit kullanarak PDF üretimi — Next.js serverless'ta çalışır
// Bağımlılık: npm install pdfkit
// (Eğer pdfkit yoksa, basitleştirilmiş docx formatında fallback üretir)

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export async function generateTranskript(
  state: any,
  messages: ChatMessage[],
  langOverride?: 'tr' | 'en',
): Promise<Buffer> {
  const lang = langOverride || get(state, 'meta.dil', 'tr');
  const isTR = lang === 'tr';
  const fikir = get(state, 'meta.fikir_adi', 'Startup');
  const sektor = get(state, 'meta.sektor', '');
  const tarih = get(state, 'meta.tarih', new Date().toISOString().split('T')[0]);
  const skor = get(state, 'meta.final_skor', 0);
  const karar = get(state, 'meta.karar', '');

  // pdfkit dinamik import (serverless uyumlu)
  let PDFDocument: any;
  try {
    PDFDocument = (await import('pdfkit')).default;
  } catch {
    // pdfkit yoksa docx fallback kullan
    return generateTranskriptDocxFallback(state, messages, lang);
  }

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
      info: {
        Title: `${fikir} — ${isTR ? 'Analiz Transkripti' : 'Analysis Transcript'}`,
        Author: 'Ideactory.ai v6.2',
        Subject: `${fikir} — ${sektor}`,
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── RENK TANIMLARI ────────────────────────────
    const NAVY = '#1E3A5F';
    const ACCENT = '#2563EB';
    const TEXT = '#1F2937';
    const MUTED = '#6B7280';
    const USER_BG = '#EFF6FF';
    const ASST_BG = '#F8FAFC';
    const BORDER = '#CBD5E1';

    // ── KAPAK SAYFASI ─────────────────────────────
    doc.rect(0, 0, doc.page.width, 200).fill(NAVY);

    doc.fontSize(28).font('Helvetica-Bold').fillColor('white')
      .text(fikir.toUpperCase(), 72, 60, { width: doc.page.width - 144 });

    doc.fontSize(14).font('Helvetica').fillColor('#B0C4DE')
      .text(
        isTR ? 'Fikir Analizi — Tam Yaz\u0131\u015Fma Transkripti' : 'Idea Analysis — Full Transcript',
        72, 100, { width: doc.page.width - 144 }
      );

    doc.fontSize(11).font('Helvetica').fillColor(TEXT)
      .text(`${isTR ? 'Sekt\u00F6r' : 'Sector'}: ${sektor}`, 72, 240)
      .text(`${isTR ? 'Kapsam' : 'Scope'}: ${get(state, 'meta.kapsam', '')}`, 72, 258)
      .text(`Final Skor: ${skor}/100 → ${karar}`, 72, 276)
      .text(`${isTR ? 'Tarih' : 'Date'}: ${tarih}`, 72, 294)
      .text(`${isTR ? 'Toplam Mesaj' : 'Total Messages'}: ${messages.length}`, 72, 312);

    doc.fontSize(9).font('Helvetica-Oblique').fillColor(MUTED)
      .text(
        isTR
          ? 'Bu dok\u00FCman, fikir analizi s\u00FCrecindeki t\u00FCm yaz\u0131\u015Fmalar\u0131n kronolojik kayd\u0131n\u0131 i\u00E7ermektedir.'
          : 'This document contains a chronological record of all communications during the idea analysis process.',
        72, 360, { width: doc.page.width - 144 }
      );

    doc.fontSize(8).fillColor(MUTED)
      .text('Ideactory.ai v6.2', 72, doc.page.height - 50);

    // ── MESAJLAR ──────────────────────────────────
    doc.addPage();

    doc.fontSize(16).font('Helvetica-Bold').fillColor(NAVY)
      .text(isTR ? 'YAZI\u015EMA' : 'TRANSCRIPT', 72, 72);

    doc.moveTo(72, 98).lineTo(doc.page.width - 72, 98).strokeColor(BORDER).stroke();

    let y = 110;
    const pageHeight = doc.page.height - 100;
    const contentWidth = doc.page.width - 144;

    messages.forEach((msg, i) => {
      const isUser = msg.role === 'user';
      const label = isUser ? (isTR ? 'KULLANICI' : 'USER') : (isTR ? 'ANAL\u0130ST' : 'ANALYST');
      const emoji = isUser ? '\uD83D\uDC64' : '\uD83E\uDD16';
      const bgColor = isUser ? USER_BG : ASST_BG;

      // İçerik yüksekliğini hesapla (yaklaşık)
      const lines = Math.ceil(msg.content.length / 80);
      const blockHeight = Math.max(40, lines * 14 + 30);

      // Sayfa taşarsa yeni sayfa
      if (y + blockHeight > pageHeight) {
        doc.addPage();
        y = 72;
      }

      // Rol etiketi
      doc.fontSize(9).font('Helvetica-Bold').fillColor(isUser ? ACCENT : NAVY)
        .text(`${emoji} ${label}`, 72, y);

      // Sıra numarası
      doc.fontSize(8).font('Helvetica').fillColor(MUTED)
        .text(`#${i + 1}`, doc.page.width - 110, y, { width: 38, align: 'right' });

      y += 16;

      // Mesaj içeriği — uzun mesajları kırp
      const content = msg.content.length > 3000
        ? msg.content.substring(0, 3000) + '\n[... devam\u0131 k\u0131salt\u0131ld\u0131]'
        : msg.content;

      doc.fontSize(10).font('Helvetica').fillColor(TEXT)
        .text(content, 80, y, {
          width: contentWidth - 16,
          lineGap: 3,
        });

      y = doc.y + 12;

      // Ayırıcı çizgi
      doc.moveTo(72, y).lineTo(doc.page.width - 72, y)
        .strokeColor(BORDER).lineWidth(0.5).stroke();

      y += 10;
    });

    // ── SON SAYFA — ÖZET ──────────────────────────
    doc.addPage();

    doc.fontSize(16).font('Helvetica-Bold').fillColor(NAVY)
      .text(isTR ? 'ANAL\u0130Z \u00D6ZET\u0130' : 'ANALYSIS SUMMARY', 72, 72);

    doc.moveTo(72, 98).lineTo(doc.page.width - 72, 98).strokeColor(ACCENT).lineWidth(2).stroke();

    const summaryItems = [
      [`${isTR ? 'Fikir' : 'Idea'}`, fikir],
      ['Final Skor', `${skor}/100`],
      [isTR ? 'Karar' : 'Decision', karar],
      [`TAM`, `$${get(state, 'A_pazar.tam', 0)}M`],
      ['UVP', get(state, 'B_rekabet.uvp', '')],
      ['Moat', get(state, 'B_rekabet.moat_tipi', '')],
      ['LTV:CAC', `${get(state, 'C_strateji.birim_ekonomisi.ltv_cac_oran', '')}:1`],
      ['Break-even', `${get(state, 'D_final.finansal.breakeven_ay', '')} ${isTR ? 'ay' : 'months'}`],
    ];

    y = 115;
    summaryItems.forEach(([label, val]) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor(TEXT).text(label + ':', 72, y);
      doc.fontSize(10).font('Helvetica').fillColor(TEXT).text(String(val), 200, y, { width: contentWidth - 128 });
      y += 18;
    });

    // Footer uyarı
    y += 30;
    doc.fontSize(8).font('Helvetica-Oblique').fillColor(MUTED)
      .text(
        isTR
          ? 'Bu transkript fikir analizi s\u00FCrecinin tam kayd\u0131d\u0131r. \u0130\u00E7erdi\u011Fi t\u00FCm projeksiyonlar varsay\u0131mlara dayal\u0131d\u0131r ve garanti niteli\u011Finde de\u011Fildir.'
          : 'This transcript is a complete record of the idea analysis process. All projections are based on assumptions and are not guarantees.',
        72, y, { width: contentWidth }
      );

    doc.end();
  });
}

// ─── DOCX FALLBACK (pdfkit yoksa) ─────────────────────────

async function generateTranskriptDocxFallback(
  state: any,
  messages: ChatMessage[],
  lang: string,
): Promise<Buffer> {
  // pdfkit yüklü değilse docx formatında üret
  const { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType } = await import('docx');
  const { createDocument, packDoc, h1, h2, body, spacer, C } = await import('./styles');

  const isTR = lang === 'tr';
  const fikir = get(state, 'meta.fikir_adi', 'Startup');
  const tarih = get(state, 'meta.tarih', '');

  const children: any[] = [];

  children.push(h1(`${fikir} — ${isTR ? 'Analiz Transkripti' : 'Analysis Transcript'}`));
  children.push(body(`${isTR ? 'Tarih' : 'Date'}: ${tarih} | ${isTR ? 'Toplam Mesaj' : 'Total Messages'}: ${messages.length}`));
  children.push(spacer(60));

  messages.forEach((msg, i) => {
    const isUser = msg.role === 'user';
    const label = isUser ? (isTR ? 'KULLANICI' : 'USER') : (isTR ? 'ANAL\u0130ST' : 'ANALYST');

    children.push(new Paragraph({
      spacing: { before: 120, after: 40 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1', space: 4 } },
      children: [
        new TextRun({ text: `${isUser ? '\uD83D\uDC64' : '\uD83E\uDD16'} ${label} #${i + 1}`, font: 'Calibri', size: 18, bold: true, color: isUser ? '2563EB' : '1E3A5F' }),
      ],
    }));

    // İçerik — uzun mesajları kırp
    const content = msg.content.length > 2000
      ? msg.content.substring(0, 2000) + '\n[... devam\u0131 k\u0131salt\u0131ld\u0131]'
      : msg.content;

    content.split('\n').forEach(line => {
      children.push(new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [new TextRun({ text: line, font: 'Calibri', size: 19, color: '1F2937' })],
      }));
    });
  });

  const doc = createDocument({
    companyName: fikir,
    docType: isTR ? 'Yaz\u0131\u015Fma Transkripti' : 'Chat Transcript',
    date: tarih,
    lang: lang as 'tr' | 'en',
    children,
  });

  return packDoc(doc);
}
