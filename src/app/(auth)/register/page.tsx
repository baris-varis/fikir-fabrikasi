'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Kayıt başarısız.');
        setLoading(false);
        return;
      }

      router.push('/login?registered=true');
    } catch {
      setError('Bir hata oluştu.');
      setLoading(false);
    }
  }

  return (
    <div className="fab-card p-8">
      <h1 className="font-display font-bold text-2xl mb-1">Kayıt Ol</h1>
      <p className="text-fab-muted text-sm mb-6">Fikirlerini analiz etmeye başla</p>

      {error && (
        <div className="bg-fab-danger/10 text-fab-danger text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-fab-muted-light">İsim</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="fab-input"
            placeholder="Adın Soyadın"
            required
          />
        </div>
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
            placeholder="En az 6 karakter"
            minLength={6}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="fab-btn-primary w-full py-3">
          {loading ? 'Hesap oluşturuluyor...' : 'Kayıt Ol'}
        </button>
      </form>

      <p className="text-center text-fab-muted text-sm mt-6">
        Zaten hesabın var mı?{' '}
        <Link href="/login" className="text-fab-accent hover:underline">Giriş Yap</Link>
      </p>
    </div>
  );
}
