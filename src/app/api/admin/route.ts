import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

function isAdmin(req: NextRequest): boolean {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) return false;
  const provided = req.nextUrl.searchParams.get('pw');
  return provided === adminPw;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const userId = searchParams.get('userId');
  const analysisId = searchParams.get('analysisId');

  try {
    if (analysisId) {
      const [metaRaw, messagesRaw] = await Promise.all([
        redis.get(`analysis:${analysisId}`),
        redis.get(`analysis:${analysisId}:messages`),
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
        const raw = await redis.get(`analysis:${id}`);
        if (raw) analyses.push(typeof raw === 'string' ? JSON.parse(raw) : raw);
      }
      return NextResponse.json({ userId, analyses });
    }

    // List all users using KEYS instead of SCAN
    const emailKeys = await redis.keys('user:email:*');
    const allUsers = [];

    for (const key of emailKeys) {
      const uid = await redis.get(key);
      if (uid && typeof uid === 'string') {
        const userRaw = await redis.get(`user:${uid}`);
        if (userRaw) {
          const user = typeof userRaw === 'string' ? JSON.parse(userRaw) : userRaw;
          const count = await redis.zcard(`user:${user.id}:analyses`);
          allUsers.push({
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            analysisCount: count,
          });
        }
      }
    }

    return NextResponse.json({
      totalUsers: allUsers.length,
      users: allUsers.sort((a: { createdAt: number }, b: { createdAt: number }) => b.createdAt - a.createdAt),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}
