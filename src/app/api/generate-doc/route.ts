import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAnalysis } from '@/lib/redis';
import { generateExecSummary, generateDetailedExecSummary } from '@/lib/docs/generate-exec-summary';
import { generateTeaser } from '@/lib/docs/generate-teaser';
import { generateRekabet, generateRisk, generateFinansal, generateGTM } from '@/lib/docs/generate-tables';
import { generatePitchDeck, generateDataRoom, generateLeanCanvas } from '@/lib/docs/generate-extras';
import { generatePitchPptx } from '@/lib/docs/generate-pptx';
import { generateFinancialModel } from '@/lib/docs/generate-xlsx';
import { generateTranskript } from '@/lib/docs/generate-transkript';

export const maxDuration = 30;

interface DocType {
  generator: (state: any, lang?: 'tr' | 'en') => Promise<Buffer>;
  filename: (name: string) => string;
  contentType: string;
}

const DOC_TYPES: Record<string, DocType> = {
  'exec-summary': {
    generator: generateExecSummary,
    filename: (n) => `Executive_Summary_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'detailed-exec': {
    generator: generateDetailedExecSummary,
    filename: (n) => `Executive_Summary_Detayli_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'teaser': {
    generator: generateTeaser,
    filename: (n) => `Investment_Teaser_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'rekabet': {
    generator: generateRekabet,
    filename: (n) => `Rekabet_Analizi_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'risk': {
    generator: generateRisk,
    filename: (n) => `Risk_Matrisi_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'gtm': {
    generator: generateGTM,
    filename: (n) => `GTM_Plani_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'finansal-docx': {
    generator: generateFinansal,
    filename: (n) => `Finansal_Projeksiyon_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'finansal-xlsx': {
    generator: generateFinancialModel,
    filename: (n) => `Finansal_Model_${n}.xlsx`,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  'pitch-deck': {
    generator: generatePitchDeck,
    filename: (n) => `Pitch_Deck_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'pitch-pptx': {
    generator: generatePitchPptx,
    filename: (n) => `Pitch_Deck_${n}.pptx`,
    contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  'data-room': {
    generator: generateDataRoom,
    filename: (n) => `Data_Room_Checklist_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'lean-canvas': {
    generator: generateLeanCanvas,
    filename: (n) => `Lean_Canvas_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'transkript': {
    generator: (state: any, lang?: 'tr' | 'en') => generateTranskript(state, [], lang),
    filename: (n) => `Yazisma_Transkript_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { analysisId, docType, lang } = await req.json();

  if (!analysisId || !docType || !DOC_TYPES[docType]) {
    return NextResponse.json({ error: 'Invalid request', availableTypes: Object.keys(DOC_TYPES) }, { status: 400 });
  }

  const analysis = await getAnalysis(analysisId);
  if (!analysis) {
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
  }

  const userId = (session.user as { id?: string }).id!;
  if (analysis.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const docInfo = DOC_TYPES[docType];
    const safeName = (analysis.state.meta.fikir_adi || 'Analiz').replace(/[^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF\s_-]/g, '_');
    const filename = docInfo.filename(safeName);

    const buffer = await docInfo.generator(analysis.state, lang || analysis.state.meta.dil || 'tr');

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': docInfo.contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (error) {
    console.error('Doc generation error:', error);
    return NextResponse.json({ error: 'Document generation failed', details: String(error) }, { status: 500 });
  }
}
