import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { User } from '@/types';

function isAdmin(req: NextRequest): boolean {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) return false;
  const provided = req.headers.get('x-admin-password') || req.nextUrl.searchParams.get('pw');
  return provided === adminPw;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const userId = searchParams.get('userId');
  const analysisId = searchParams.get('analysisId');

  if (analysisId) {
    const [metaRaw, messagesRaw] = await Promise.all([
      redis.get<string>(`analysis:${analysisId}`),
      redis.get<string>(`analysis:${analysisId}:messages`),
    ]);
    if (!metaRaw) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const meta = typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw;
    const messages = messagesRaw ? (typeof messagesRaw === 'string' ? JSON.parse(messagesRaw) : messagesRaw) : [];
    return NextResponse.json({ ...meta, messages });
  }

  if (userId) {
    const analysisIds = await redis.zrange(`user:${userId}:analyses`, 0, -1, { rev: true });
    const analyses = [];
    for (const id of analysisIds) {
      const raw = await redis.get<string>(`analysis:${id}`);
      if (raw) analyses.push(typeof raw === 'string' ? JSON.parse(raw) : raw);
    }
    return NextResponse.json({ userId, analyses });
  }

  const allUsers: Array<{ id: string; email: string; name: string; createdAt: number; analysisCount: number }> = [];
  let cursor = 0;
  do {
    const result = await redis.scan(cursor, { match: 'user:email:*', count: 100 });
    cursor = result[0];
    const keys = result[1] as string[];
    for (const key of keys) {
      const uid = await redis.get<string>(key);
      if (uid) {
        const userRaw = await redis.get<string>(`user:${uid}`);
        if (userRaw) {
          const user: User = typeof userRaw === 'string' ? JSON.parse(userRaw) : userRaw as unknown as User;
          const count = await redis.zcard(`user:${user.id}:analyses`);
          allUsers.push({ id: user.id, email: user.email, name: user.name, createdAt: user.createdAt, analysisCount: count });
        }
      }
    }
  } while (cursor !== 0);

  return NextResponse.json({ totalUsers: allUsers.length, users: allUsers.sort((a, b) => b.createdAt - a.createdAt) });
}
