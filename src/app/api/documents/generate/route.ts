// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — Document Generation API Route (Alternatif)
// POST /api/documents/generate
// Ana endpoint: /api/generate-doc (ChatPanel bunu kullanır)
// Bu endpoint state'i doğrudan body'de alan alternatif API'dir
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { detectDocCommand, generateDocument, generateBatch } from '@/lib/docs';
import { generateTranskript } from '@/lib/docs/generate-transkript';
import { getAnalysis } from '@/lib/redis';

export const maxDuration = 30;

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
        const analysis = await getAnalysis(analysisId);
        if (analysis) state = analysis.state;
      } catch (err) {
        console.warn('State lookup failed:', err);
      }
    }

    if (!state) {
      return NextResponse.json(
        { error: 'No state available. Provide state in body or a valid analysisId.' },
        { status: 400 }
      );
    }

    // Yazışma transkript
    if (detected.commandKey === 'yazisma_pdf') {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json(
          { error: 'Transcript requires messages array.' },
          { status: 400 }
        );
      }
      const buffer = await generateTranskript(state, messages, detected.lang);
      const fikir = state?.meta?.fikir_adi || 'Startup';
      const filename = `Yazisma_Transkript_${sanitize(fikir)}.docx`;
      return new Response(new Uint8Array(buffer), {
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
      return new Response(new Uint8Array(results[0].buffer), {
        headers: {
          'Content-Type': results[0].mimeType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(results[0].filename)}"`,
          'X-Total-Documents': String(results.length),
          'X-Document-Names': results.map(r => r.filename).join(','),
        },
      });
    }

    // Tekil
    const result = await generateDocument(detected.commandKey, state, detected.lang);
    return new Response(new Uint8Array(result.buffer), {
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(result.filename)}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Document generation error:', message);
    return NextResponse.json({ error: 'Document generation failed', details: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ availableTypes: Object.keys({ 'exec-summary':1, 'detailed-exec':1, 'teaser':1, 'rekabet':1, 'risk':1, 'gtm':1, 'finansal-docx':1, 'finansal-xlsx':1, 'pitch-deck':1, 'pitch-pptx':1, 'data-room':1, 'lean-canvas':1, 'transkript':1 }) });
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9\u00C0-\u024F\s_-]/g, '').replace(/\s+/g, '_').substring(0, 50);
}
