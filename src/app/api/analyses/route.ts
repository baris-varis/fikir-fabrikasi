import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAnalysis, getUserAnalyses, createEmptyState } from '@/lib/redis';
import { Analysis } from '@/types';
import { nanoid } from 'nanoid';

// GET /api/analyses - list user's analyses
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id!;
  const analyses = await getUserAnalyses(userId);

  return NextResponse.json(analyses);
}

// POST /api/analyses - create new analysis
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id!;
  const { title, mode } = await req.json();

  const analysis: Analysis = {
    id: nanoid(),
    userId,
    title: title || 'Yeni Analiz',
    state: {
      ...createEmptyState(),
      meta: {
        ...createEmptyState().meta,
        mod: mode === 'hizli' ? 'hizli' : 'tam',
      },
    },
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'active',
  };

  await createAnalysis(analysis);

  return NextResponse.json(analysis);
}
