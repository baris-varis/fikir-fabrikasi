import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { createUser, getUserByEmail } from '@/lib/redis';
import { User } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Tüm alanlar zorunlu.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı.' }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Bu email zaten kayıtlı.' }, { status: 409 });
    }

    const user: User = {
      id: nanoid(),
      email,
      name,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: Date.now(),
      analysisCount: 0,
    };

    await createUser(user);

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
