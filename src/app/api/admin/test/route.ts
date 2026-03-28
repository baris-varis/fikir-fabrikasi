import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const provided = req.nextUrl.searchParams.get('pw');
  return NextResponse.json({
    adminMatch: provided === process.env.ADMIN_PASSWORD,
    hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    redisUrlPrefix: process.env.UPSTASH_REDIS_REST_URL?.substring(0, 20) || 'EMPTY',
    hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('UPSTASH') || k.includes('ADMIN') || k.includes('ANTHROPIC') || k.includes('NEXTAUTH')),
  });
}
