// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Document Generation API Route
// POST /api/documents/generate
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { detectDocCommand, generateDocument, generateBatch, DocResult } from '@/lib/docs';
import { generateTranskript } from '@/lib/docs/generate-transkript';
import redis from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { command, analysisId, state: providedState, messages } = body;

    if (!command) {
      return NextResponse.json({ error: 'Missing command parameter' }, { status: 400 });
    }

    const detected = detectDocCommand(command);
    if (!detected) {
      return NextResponse.json({ error: 'Unrecognized document command', command }, { status: 400 });
    }

    // State'i al
    let state = providedState;
    if (!state && analysisId) {
      try {
        const redisData = await redis.get(`analysis:${analysisId}:state`);
        if (redisData) {
          state = typeof redisData === 'string' ? JSON.parse(redisData) : redisData;
        }
      } catch (redisErr) {
        console.warn('Redis state lookup failed:', redisErr);
      }
    }

    if (!state) {
      return NextResponse.json(
        { error: 'No state available. Provide state in body or a valid analysisId.' },
        { status: 400 }
      );
    }

    // Yazışma transkript özel akışı
    if (detected.commandKey === 'yazisma_pdf') {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json(
          { error: 'Transcript generation requires messages array in request body.' },
          { status: 400 }
        );
      }
      const buffer = await generateTranskript(state, messages, detected.lang);
      const fikir = state?.meta?.fikir_adi || 'Startup';
      const filename = `Yazisma_Transkript_${sanitize(fikir)}.docx`;
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        },
      });
    }

    // Toplu komut
    if (detected.commandKey.startsWith('batch:')) {
      const batchKey = detected.commandKey.replace('batch:', '');
      const results = await generateBatch(batchKey, state, detected.lang);

      if (results.length === 0) {
        return NextResponse.json({ error: 'No documents generated' }, { status: 500 });
      }

      return new NextResponse(new Uint8Array(results[0].buffer), {
        status: 200,
        headers: {
          'Content-Type': results[0].mimeType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(results[0].filename)}"`,
          'X-Total-Documents': String(results.length),
          'X-Document-Names': results.map(r => r.filename).join(','),
        },
      });
    }

    // Tekil doküman
    const result: DocResult = await generateDocument(detected.commandKey, state, detected.lang);

    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(result.filename)}"`,
      },
    });
  } catch (err: any) {
    console.error('Document generation error:', err);
    return NextResponse.json(
      { error: 'Document generation failed', details: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    commands: {
      'exec summary üret': 'One-Pager Executive Summary (.docx)',
      'detaylı exec summary üret': 'Detailed Executive Summary 3-5 pages (.docx)',
      'teaser üret': 'Investment Teaser (.docx)',
      'pitch deck üret': 'Pitch Deck content guide (.docx)',
      'sunum üret': 'Pitch Deck presentation (.pptx)',
      'finansal model üret': 'Financial Model 11-sheet (.xlsx)',
      'rekabet docx üret': 'Competition analysis + Porter + SWOT (.docx)',
      'risk docx üret': 'Risk matrix + pre-mortem (.docx)',
      'finansal docx üret': '5-year projections + scenarios (.docx)',
      'gtm docx üret': 'GTM plan + 90-day detail (.docx)',
      'data room üret': 'Data Room Checklist (.docx)',
      'lean canvas üret': 'Lean Canvas (.docx)',
      'yazışma pdf üret': 'Chat transcript (.docx)',
      'tablolar üret': '4 table documents',
      'hepsini üret': 'Full investor package (12 docs)',
    },
  });
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF\s_-]/g, '').replace(/\s+/g, '_').substring(0, 50);
}
