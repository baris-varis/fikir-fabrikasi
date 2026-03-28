'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Users, MessageSquare, ChevronRight, ChevronDown, Lock, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface UserSummary {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  analysisCount: number;
}

interface AnalysisSummary {
  id: string;
  title: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  state: {
    meta: {
      fikir_adi: string;
      sektor: string;
      aktif_modul: string;
      final_skor: number;
      karar: string;
      mod: string;
    };
  };
}

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  module?: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin?pw=${encodeURIComponent(password)}`);
      if (!res.ok) { setError('Yanlış şifre'); setLoading(false); return; }
      const data = await res.json();
      setUsers(data.users || []);
      setAuthenticated(true);
    } catch { setError('Bağlantı hatası'); }
    setLoading(false);
  }

  async function loadUserAnalyses(user: UserSummary) {
    setSelectedUser(user);
    setSelectedAnalysis(null);
    setMessages([]);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?pw=${encodeURIComponent(password)}&userId=${user.id}`);
      const data = await res.json();
      setAnalyses(data.analyses || []);
    } catch { setError('Analizler yüklenemedi'); }
    setLoading(false);
  }

  async function loadMessages(analysisId: string) {
    setSelectedAnalysis(analysisId);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?pw=${encodeURIComponent(password)}&analysisId=${analysisId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch { setError('Mesajlar yüklenemedi'); }
    setLoading(false);
  }

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fab-card p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-fab-accent" />
            <h1 className="font-display font-bold text-xl">Admin Panel</h1>
          </div>
          {error && <div className="bg-fab-danger/10 text-fab-danger text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="fab-input"
              placeholder="Admin şifresi"
              required
            />
            <button type="submit" disabled={loading} className="fab-btn-primary w-full py-3">
              {loading ? 'Kontrol ediliyor...' : 'Giriş'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-fab-border bg-fab-surface/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <h1 className="font-display font-bold text-lg">Admin Panel</h1>
            <span className="fab-badge-module text-[10px]">v6.2</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-fab-muted">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {users.length} kullanıcı</span>
            <Link href="/" className="fab-btn-ghost text-xs">Ana Sayfa</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-fab-muted mb-6">
          <button onClick={() => { setSelectedUser(null); setSelectedAnalysis(null); setMessages([]); }} className="hover:text-fab-accent transition-colors">
            Kullanıcılar
          </button>
          {selectedUser && (
            <>
              <ChevronRight className="w-3 h-3" />
              <button onClick={() => { setSelectedAnalysis(null); setMessages([]); }} className="hover:text-fab-accent transition-colors">
                {selectedUser.name}
              </button>
            </>
          )}
          {selectedAnalysis && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-fab-text">Sohbet</span>
            </>
          )}
        </div>

        {/* User List */}
        {!selectedUser && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fab-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="fab-input pl-10"
                  placeholder="Kullanıcı ara..."
                />
              </div>
            </div>
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => loadUserAnalyses(user)}
                  className="fab-card p-4 w-full text-left flex items-center gap-4 hover:border-fab-accent/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-fab-accent/20 flex items-center justify-center font-display font-bold text-sm">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-fab-muted text-xs">{user.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-display font-semibold text-fab-accent">{user.analysisCount}</div>
                    <div className="text-fab-muted text-[10px]">analiz</div>
                  </div>
                  <div className="text-fab-muted text-xs">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                  <ChevronRight className="w-4 h-4 text-fab-muted" />
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center text-fab-muted py-12 text-sm">
                  {users.length === 0 ? 'Henüz kullanıcı yok' : 'Aramayla eşleşen kullanıcı yok'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* User's Analyses */}
        {selectedUser && !selectedAnalysis && (
          <div>
            <button onClick={() => setSelectedUser(null)} className="flex items-center gap-1.5 text-fab-muted text-sm mb-4 hover:text-fab-accent transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Geri
            </button>
            <div className="fab-card p-4 mb-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-fab-accent/20 flex items-center justify-center font-display font-bold text-lg">
                {selectedUser.name[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-display font-semibold">{selectedUser.name}</div>
                <div className="text-fab-muted text-sm">{selectedUser.email}</div>
              </div>
            </div>

            {loading ? (
              <div className="text-center text-fab-muted py-12 text-sm">Yükleniyor...</div>
            ) : (
              <div className="space-y-2">
                {analyses.map((analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => loadMessages(analysis.id)}
                    className="fab-card p-4 w-full text-left flex items-center gap-4 hover:border-fab-accent/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {analysis.state?.meta?.fikir_adi || analysis.title || 'İsimsiz Analiz'}
                        </span>
                        {analysis.state?.meta?.sektor && (
                          <span className="fab-badge-module text-[10px]">{analysis.state.meta.sektor}</span>
                        )}
                        {analysis.state?.meta?.karar && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            analysis.state.meta.karar === 'GO' ? 'bg-fab-success/15 text-fab-success' :
                            analysis.state.meta.karar === 'CONDITIONAL GO' ? 'bg-fab-warning/15 text-fab-warning' :
                            'bg-fab-danger/15 text-fab-danger'
                          }`}>
                            {analysis.state.meta.karar}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-fab-muted">
                        <span>Modül {analysis.state?.meta?.aktif_modul || '?'}</span>
                        {analysis.state?.meta?.final_skor > 0 && (
                          <span>Skor: {analysis.state.meta.final_skor}/100</span>
                        )}
                        <span>{analysis.state?.meta?.mod === 'hizli' ? '⚡ Hızlı' : '📋 Tam'}</span>
                        <span>{new Date(analysis.updatedAt || analysis.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    <MessageSquare className="w-4 h-4 text-fab-muted" />
                    <ChevronRight className="w-4 h-4 text-fab-muted" />
                  </button>
                ))}
                {analyses.length === 0 && (
                  <div className="text-center text-fab-muted py-12 text-sm">Bu kullanıcının henüz analizi yok</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chat Messages */}
        {selectedAnalysis && (
          <div>
            <button onClick={() => { setSelectedAnalysis(null); setMessages([]); }} className="flex items-center gap-1.5 text-fab-muted text-sm mb-4 hover:text-fab-accent transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Analizlere Dön
            </button>

            {loading ? (
              <div className="text-center text-fab-muted py-12 text-sm">Mesajlar yükleniyor...</div>
            ) : (
              <div className="space-y-4">
                <div className="text-fab-muted text-xs mb-2">{messages.length} mesaj</div>
                {messages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-1 ${
                      msg.role === 'user' ? 'bg-fab-surface' : 'bg-fab-accent/20'
                    }`}>
                      {msg.role === 'user' ? '👤' : '🏭'}
                    </div>
                    <div className={`flex-1 min-w-0 ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block text-left rounded-2xl px-4 py-3 max-w-full ${
                        msg.role === 'user'
                          ? 'bg-fab-accent/10 text-fab-text'
                          : 'bg-fab-card border border-fab-border'
                      }`}>
                        {msg.role === 'user' ? (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="chat-markdown text-sm text-fab-text/90">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-fab-muted">
                        {msg.module && <span>Modül {msg.module}</span>}
                        <span>{new Date(msg.timestamp).toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center text-fab-muted py-12 text-sm">Bu analizde henüz mesaj yok</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
