// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Yazışma Transkript Generator (.docx)
// Chat geçmişini düzenli Word dokümanı olarak arşivler
// pdfkit bağımlılığı YOK — Vercel serverless uyumlu
// ═══════════════════════════════════════════════════════════

import { Paragraph, TextRun, BorderStyle, AlignmentType } from 'docx';
import { createDocument, packDoc, h1, h2, body, spacer, C, get, safeVal } from './styles';

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

  const children: any[] = [];

  // Kapak
  children.push(h1(`${fikir} \u2014 ${isTR ? 'Analiz Transkripti' : 'Analysis Transcript'}`));
  children.push(spacer(20));
  children.push(body(`${isTR ? 'Sekt\u00F6r' : 'Sector'}: ${sektor}`));
  children.push(body(`${isTR ? 'Kapsam' : 'Scope'}: ${get(state, 'meta.kapsam', '')}`));
  children.push(body(`Final Skor: ${skor}/100 \u2192 ${karar}`));
  children.push(body(`${isTR ? 'Tarih' : 'Date'}: ${tarih}`));
  children.push(body(`${isTR ? 'Toplam Mesaj' : 'Total Messages'}: ${messages.length}`));
  children.push(spacer(40));
  children.push(body(
    isTR
      ? 'Bu dok\u00FCman, fikir analizi s\u00FCrecindeki t\u00FCm yaz\u0131\u015Fmalar\u0131n kronolojik kayd\u0131n\u0131 i\u00E7ermektedir.'
      : 'This document contains a chronological record of all communications during the idea analysis process.',
    { italic: true, color: C.MUTED }
  ));

  children.push(spacer(80));
  children.push(h1(isTR ? 'YAZI\u015EMA' : 'TRANSCRIPT'));

  // Mesajlar
  messages.forEach((msg, i) => {
    const isUser = msg.role === 'user';
    const label = isUser ? (isTR ? 'KULLANICI' : 'USER') : (isTR ? 'ANAL\u0130ST' : 'ANALYST');

    // Rol başlığı
    children.push(new Paragraph({
      spacing: { before: 160, after: 40 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: C.BORDER, space: 4 } },
      children: [
        new TextRun({
          text: `${isUser ? '\uD83D\uDC64' : '\uD83E\uDD16'} ${label} #${i + 1}`,
          font: 'Calibri', size: 19, bold: true,
          color: isUser ? C.ACCENT : C.NAVY,
        }),
        ...(msg.timestamp ? [new TextRun({
          text: `  \u2014  ${msg.timestamp}`,
          font: 'Calibri', size: 16, color: C.MUTED,
        })] : []),
      ],
    }));

    // Mesaj içeriği — uzun mesajları kırp
    const content = msg.content.length > 3000
      ? msg.content.substring(0, 3000) + `\n[... ${isTR ? 'devam\u0131 k\u0131salt\u0131ld\u0131' : 'truncated'}]`
      : msg.content;

    content.split('\n').forEach(line => {
      children.push(new Paragraph({
        spacing: { before: 10, after: 10 },
        indent: { left: 200 },
        children: [new TextRun({ text: line, font: 'Calibri', size: 19, color: C.TEXT })],
      }));
    });
  });

  // Son sayfa — özet
  children.push(spacer(120));
  children.push(h1(isTR ? 'ANAL\u0130Z \u00D6ZET\u0130' : 'ANALYSIS SUMMARY'));

  const summaryItems = [
    [isTR ? 'Fikir' : 'Idea', fikir],
    ['Final Skor', `${skor}/100`],
    [isTR ? 'Karar' : 'Decision', karar],
    ['TAM', `$${get(state, 'A_pazar.tam', 0)}M`],
    ['UVP', get(state, 'B_rekabet.uvp', '')],
    ['Moat', get(state, 'B_rekabet.moat_tipi', '')],
    ['LTV:CAC', `${get(state, 'C_strateji.birim_ekonomisi.ltv_cac_oran', '')}:1`],
    ['Break-even', `${get(state, 'D_final.finansal.breakeven_ay', '')} ${isTR ? 'ay' : 'months'}`],
  ];

  summaryItems.forEach(([label, val]) => {
    children.push(new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({ text: `${label}: `, font: 'Calibri', size: 20, bold: true, color: C.TEXT }),
        new TextRun({ text: safeVal(val), font: 'Calibri', size: 20, color: C.TEXT }),
      ],
    }));
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
