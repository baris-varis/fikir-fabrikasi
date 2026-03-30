import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAnalysis } from '@/lib/redis';
import { generateExecSummary, generateRekabeDocx, generateRiskDocx, generateGtmDocx, generateFinansalDocx } from '@/lib/docs/generate-docx';
import { generateFinansalXlsx } from '@/lib/docs/generate-xlsx';

export const maxDuration = 30;

const DOC_TYPES: Record<string, {
  generator: string;
  filename: (name: string) => string;
  contentType: string;
}> = {
  'exec-summary': {
    generator: 'execSummary',
    filename: (n) => `Executive_Summary_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'rekabet': {
    generator: 'rekabet',
    filename: (n) => `Rekabet_Analizi_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'risk': {
    generator: 'risk',
    filename: (n) => `Risk_Matrisi_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'gtm': {
    generator: 'gtm',
    filename: (n) => `GTM_Plani_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'finansal-docx': {
    generator: 'finansalDocx',
    filename: (n) => `Finansal_Projeksiyon_${n}.docx`,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'finansal-xlsx': {
    generator: 'finansalXlsx',
    filename: (n) => `Finansal_Model_${n}.xlsx`,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { analysisId, docType } = await req.json();

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
    const safeName = (analysis.state.meta.fikir_adi || 'Analiz').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '_');
    const filename = docInfo.filename(safeName);

    let buffer: Buffer;

    switch (docInfo.generator) {
      case 'execSummary':
        buffer = await generateExecSummary(analysis.state);
        break;
      case 'rekabet':
        buffer = await generateRekabeDocx(analysis.state);
        break;
      case 'risk':
        buffer = await generateRiskDocx(analysis.state);
        break;
      case 'gtm':
        buffer = await generateGtmDocx(analysis.state);
        break;
      case 'finansalDocx':
        buffer = await generateFinansalDocx(analysis.state);
        break;
      case 'finansalXlsx':
        buffer = await generateFinansalXlsx(analysis.state);
        break;
      default:
        return NextResponse.json({ error: 'Generator not found' }, { status: 400 });
    }

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
