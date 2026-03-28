import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const adminPw = process.env.ADMIN_PASSWORD;
  const provided = req.nextUrl.searchParams.get('pw');
  return NextResponse.json({
    hasEnv: !!adminPw,
    envLength: adminPw?.length || 0,
    provided: provided,
    match: provided === adminPw,
  });
}
