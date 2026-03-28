import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    redisUrlStart: (process.env.UPSTASH_REDIS_REST_URL || 'EMPTY').substring(0, 25),
    hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasAdminPw: !!process.env.ADMIN_PASSWORD,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  });
}
