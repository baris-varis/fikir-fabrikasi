'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Email veya şifre hatalı.');
    } else {
      router.push('/analyses');
      router.refresh();
    }
  }

  return (
    <div className="fab-card p-8">
      <h1 className="font-display font-bold text-2xl mb-1">Giriş Yap</h1>
      <p className="text-fab-muted text-sm mb-6">Analizlerine devam et</p>

      {error && (
        <div className="bg-fab-danger/10 text-fab-danger text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-fab-muted-light">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="fab-input"
            placeholder="ornek@email.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-fab-muted-light">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="fab-input"
            placeholder="••••••••"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="fab-btn-primary w-full py-3">
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="text-center text-fab-muted text-sm mt-6">
        Hesabın yok mu?{' '}
        <Link href="/register" className="text-fab-accent hover:underline">Kayıt Ol</Link>
      </p>
    </div>
  );
}
