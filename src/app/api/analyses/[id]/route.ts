import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAnalysis, deleteAnalysis } from '@/lib/redis';

// GET /api/analyses/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const analysis = await getAnalysis(id);

  if (!analysis) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const userId = (session.user as { id?: string }).id!;
  if (analysis.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(analysis);
}

// DELETE /api/analyses/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as { id?: string }).id!;
  await deleteAnalysis(id, userId);

  return NextResponse.json({ success: true });
}
