'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const t = {
  tr: {
    nav: { login: 'Giriş Yap', cta: 'Hemen Dene' },
    hero: {
      title1: 'Startup Fikrinizi',
      title2: 'Yatırıma Dönüştürün',
      sub: 'Yapay zeka destekli analiz motoru ile pazar araştırması, rekabet analizi, strateji, finansal projeksiyon ve investor-grade doküman üretimi — dakikalar içinde.',
      cta: 'Hemen Dene',
      cta2: 'Nasıl Çalışır?',
    },
    stats: [
      { val: '11', lbl: 'Analiz Aşaması', ico: '📊' },
      { val: '4', lbl: 'Stratejik Modül', ico: '🧩' },
      { val: '15+', lbl: 'Doküman Şablonu', ico: '📄' },
      { val: '/100', lbl: 'Objektif Skorlama', ico: '🎯' },
    ],
    how: {
      title: 'Nasıl Çalışır?',
      sub: 'Fikrinizden yatırımcı sunumuna 4 adımda',
      steps: [
        { n: '01', ico: '🔍', t: 'Keşif & Pazar', d: 'Fikrinizi yapılandırır, pazar büyüklüğünü hesaplar, Lean Canvas oluşturur ve pazar timing\'ini değerlendirir.' },
        { n: '02', ico: '⚔️', t: 'Rekabet Analizi', d: 'Doğrudan ve dolaylı rakipleri tespit eder, güçlü/zayıf yönleri analiz eder ve farklılaşma stratejisi belirler.' },
        { n: '03', ico: '🎯', t: 'Strateji & Skor', d: 'Pazara giriş stratejisi, birim ekonomisi ve risk matrisi oluşturur, çok boyutlu skorlama ile karar verir.' },
        { n: '04', ico: '📊', t: 'Final & Dokümanlar', d: '5 yıllık finansal projeksiyon, exit stratejisi ve investor-grade doküman paketi üretir.' },
      ],
    },
    why: {
      title: 'Neden Ideactory?',
      sub: 'Haftalarca süren danışmanlık sürecini dakikalara sığdırın',
      items: [
        { t: 'Dakikalar İçinde', d: 'Geleneksel danışmanlıkta haftalar süren analizi yapay zeka ile dakikalara sığdırın.' },
        { t: 'Kanıtlanmış Framework\'ler', d: 'McKinsey, Porter, Y Combinator ve Sequoia metodolojilerini birleştiren sistematik analiz.' },
        { t: 'Investor-Grade Çıktılar', d: 'Executive summary, pitch deck, finansal model — yatırımcıya hazır 15+ profesyonel doküman.' },
        { t: 'Objektif Karar', d: 'GO / CONDITIONAL GO / NO-GO — çok boyutlu değerlendirme ve pivot önerileri.' },
        { t: 'Yerel + Global', d: 'Türkiye pazarı derinlemesine, global genişleme stratejisi opsiyonel. Glocal yaklaşım.' },
        { t: 'Fikir Karşılaştırma', d: 'Birden fazla fikri yan yana skorlayın, en güçlü girişim fırsatını belirleyin.' },
      ],
    },
    docs: {
      title: 'Üretilen Dokümanlar',
      sub: 'Yatırımcı toplantısına hazır profesyonel paket',
      items: [
        { name: 'Executive Summary', ico: 'M4 4h16v2H4zm0 4h10v2H4zm0 4h16v2H4zm0 4h10v2H4z' },
        { name: 'Detaylı Exec Summary', ico: 'M4 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4z' },
        { name: 'Investment Teaser', ico: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01z' },
        { name: 'Pitch Deck Rehberi', ico: 'M3 3h18v14H3zm0 14l4-4 3 3 5-5 6 6' },
        { name: 'Sunum (.pptx)', ico: 'M3 3h18v18H3zm4 4v4h4V7zm6 0v4h4V7zm-6 6v4h4v-4zm6 0v4h4v-4z' },
        { name: 'Finansal Model (.xlsx)', ico: 'M3 3h18v18H3zm2 4v2h4V7zm6 0v2h4V7zm-6 4v2h4v-2zm6 0v2h4v-2zm-6 4v2h4v-2zm6 0v2h4v-2z' },
        { name: 'Rekabet Raporu', ico: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z' },
        { name: 'Risk Matrisi', ico: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z' },
        { name: 'GTM Planı', ico: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z' },
        { name: 'Data Room Checklist', ico: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' },
        { name: 'Lean Canvas', ico: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z' },
        { name: 'Transkript (.pdf)', ico: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z' },
      ],
    },
    cta: { title: 'Fikrinizi Test Etmeye Hazır Mısınız?', sub: 'Ücretsiz kayıt olun ve ilk analizinizi hemen başlatın.', btn: 'Hemen Dene' },
    footer: { copy: '© 2026 Ideactory.ai', tag: 'Startup Fikir Analiz Platformu' },
  },
  en: {
    nav: { login: 'Sign In', cta: 'Try Now' },
    hero: {
      title1: 'Turn Your Startup Idea',
      title2: 'Into an Investment',
      sub: 'AI-powered analysis engine for market research, competitive analysis, strategy, financial projections and investor-grade documents — in minutes.',
      cta: 'Try Now',
      cta2: 'How It Works',
    },
    stats: [
      { val: '11', lbl: 'Analysis Stages', ico: '📊' },
      { val: '4', lbl: 'Strategic Modules', ico: '🧩' },
      { val: '15+', lbl: 'Document Templates', ico: '📄' },
      { val: '/100', lbl: 'Objective Scoring', ico: '🎯' },
    ],
    how: {
      title: 'How It Works',
      sub: 'From idea to investor deck in 4 steps',
      steps: [
        { n: '01', ico: '🔍', t: 'Discovery & Market', d: 'Structures your idea, calculates market size, creates Lean Canvas and evaluates market timing.' },
        { n: '02', ico: '⚔️', t: 'Competitive Analysis', d: 'Identifies direct and indirect competitors, analyzes strengths/weaknesses and defines differentiation.' },
        { n: '03', ico: '🎯', t: 'Strategy & Score', d: 'Builds go-to-market strategy, unit economics and risk matrix, delivers multi-dimension scoring.' },
        { n: '04', ico: '📊', t: 'Final & Documents', d: '5-year financial projections, exit strategy and investor-grade document package.' },
      ],
    },
    why: {
      title: 'Why Ideactory?',
      sub: 'Weeks of consulting compressed into minutes',
      items: [
        { t: 'Minutes, Not Weeks', d: 'Analysis that traditionally takes weeks of consulting, delivered by AI in minutes.' },
        { t: 'Proven Frameworks', d: 'Systematic analysis combining McKinsey, Porter, Y Combinator and Sequoia methodologies.' },
        { t: 'Investor-Grade Output', d: 'Executive summary, pitch deck, financial model — 15+ professional documents ready for investors.' },
        { t: 'Objective Decision', d: 'GO / CONDITIONAL GO / NO-GO — multi-dimension evaluation with pivot suggestions.' },
        { t: 'Local + Global', d: 'Deep Turkey market analysis with optional global expansion strategy. Glocal approach.' },
        { t: 'Compare Ideas', d: 'Score multiple ideas side by side, identify the strongest venture opportunity.' },
      ],
    },
    docs: {
      title: 'Generated Documents',
      sub: 'Professional package ready for investor meetings',
      items: [
        { name: 'Executive Summary', ico: 'M4 4h16v2H4zm0 4h10v2H4zm0 4h16v2H4zm0 4h10v2H4z' },
        { name: 'Detailed Exec Summary', ico: 'M4 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4z' },
        { name: 'Investment Teaser', ico: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01z' },
        { name: 'Pitch Deck Guide', ico: 'M3 3h18v14H3zm0 14l4-4 3 3 5-5 6 6' },
        { name: 'Presentation (.pptx)', ico: 'M3 3h18v18H3zm4 4v4h4V7zm6 0v4h4V7zm-6 6v4h4v-4zm6 0v4h4v-4z' },
        { name: 'Financial Model (.xlsx)', ico: 'M3 3h18v18H3zm2 4v2h4V7zm6 0v2h4V7zm-6 4v2h4v-2zm6 0v2h4v-2zm-6 4v2h4v-2zm6 0v2h4v-2z' },
        { name: 'Competitive Report', ico: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z' },
        { name: 'Risk Matrix', ico: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z' },
        { name: 'GTM Plan', ico: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z' },
        { name: 'Data Room Checklist', ico: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' },
        { name: 'Lean Canvas', ico: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z' },
        { name: 'Transcript (.pdf)', ico: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z' },
      ],
    },
    cta: { title: 'Ready to Test Your Idea?', sub: 'Sign up for free and start your first analysis now.', btn: 'Try Now' },
    footer: { copy: '© 2026 Ideactory.ai', tag: 'Startup Idea Analysis Platform' },
  },
};

const WHY_ICONS = [
  'M13 10V3L4 14h7v7l9-11h-7z',
  'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm14.5 0L21 17.5 17.5 21 14 17.5zM10 10H5V5h5zm11 0h-5V5h5zm-11 11H5v-5h5z',
  'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-3-7H9v-2h6v2zm0 4H9v-2h6v2zm-2-8H9V7h4v2z',
  'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z',
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 014 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0120 12c0 4.42-3.58 8-8 8z',
  'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z',
];

const WHY_COLORS = ['#2563eb', '#7c3aed', '#059669', '#f59e0b', '#0891b2', '#e11d48'];
const WHY_BGS = ['#eff6ff', '#f5f3ff', '#ecfdf5', '#fffbeb', '#ecfeff', '#fff1f2'];

type L = 'tr' | 'en';

export default function LandingPage() {
  const [lang, setLang] = useState<L>('tr');
  const [scrolled, setScrolled] = useState(false);
  const c = t[lang];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ background: '#FAFBFE', color: '#1a1a2e', fontFamily: "'DM Sans', system-ui, sans-serif" }} className="min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .ld { font-family: 'Sora', system-ui, sans-serif; }
        .lc { background: #fff; border: 1px solid #e8ecf4; border-radius: 16px; transition: all 0.3s; }
        .lc:hover { border-color: #c5d0e6; box-shadow: 0 8px 32px rgba(26,42,78,0.06); transform: translateY(-2px); }
        .lb { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-family: 'Sora', sans-serif; font-size: 15px; transition: all 0.2s; cursor: pointer; text-decoration: none; }
        .lbp { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; box-shadow: 0 4px 16px rgba(37,99,235,0.25); }
        .lbp:hover { box-shadow: 0 6px 24px rgba(37,99,235,0.35); transform: translateY(-1px); }
        .lbo { background: #fff; color: #1a1a2e; border: 1.5px solid #d1d9e8; }
        .lbo:hover { border-color: #2563eb; color: #2563eb; }
        .lg { background: linear-gradient(135deg, #2563eb, #7c3aed, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lgl { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .ls { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
        .lsn { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 64px; line-height: 1; color: #e8ecf4; position: absolute; top: -8px; right: 16px; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .lf { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: 'all 0.3s',
        background: scrolled ? 'rgba(250,251,254,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #e8ecf4' : '1px solid transparent',
        padding: scrolled ? '12px 0' : '20px 0',
      }}>
        <div className="ls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/logo.png" alt="Ideactory" width={36} height={36} />
            <span className="ld" style={{ fontWeight: 700, fontSize: 18 }}>Ideactory.ai</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', background: '#f0f2f8', borderRadius: 8, padding: 2 }}>
              <button onClick={() => setLang('tr')} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: lang === 'tr' ? '#2563eb' : 'transparent', color: lang === 'tr' ? '#fff' : '#64748b', transition: 'all 0.2s' }}>TR</button>
              <button onClick={() => setLang('en')} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: lang === 'en' ? '#2563eb' : 'transparent', color: lang === 'en' ? '#fff' : '#64748b', transition: 'all 0.2s' }}>EN</button>
            </div>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: '#475569', textDecoration: 'none', padding: '8px 16px' }}>{c.nav.login}</Link>
            <Link href="/register" className="lb lbp" style={{ padding: '10px 24px', fontSize: 14 }}>{c.nav.cta}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
        <div className="lgl" style={{ width: 600, height: 600, background: 'rgba(37,99,235,0.06)', top: -200, left: -100 }} />
        <div className="lgl" style={{ width: 500, height: 500, background: 'rgba(124,58,237,0.04)', bottom: -150, right: -50 }} />
        <div className="lgl" style={{ width: 300, height: 300, background: 'rgba(245,158,11,0.05)', top: 100, right: 200 }} />

        <div className="ls" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div className="lf" style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
              <Image src="/logo.png" alt="Ideactory.ai" width={100} height={100} priority style={{ filter: 'drop-shadow(0 8px 24px rgba(37,99,235,0.15))' }} />
            </div>

            <h1 className="ld" style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
              {c.hero.title1}<br />
              <span className="lg">{c.hero.title2}</span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.7, color: '#5a6178', maxWidth: 640, margin: '0 auto 36px' }}>{c.hero.sub}</p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="lb lbp">{c.hero.cta} →</Link>
              <a href="#how" className="lb lbo">{c.hero.cta2}</a>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, maxWidth: 800, margin: '64px auto 0' }}>
            {c.stats.map((s, i) => (
              <div key={i} className="lc" style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{s.ico}</div>
                <div className="ld" style={{ fontSize: 28, fontWeight: 800, color: '#2563eb' }}>{s.val}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" style={{ padding: '80px 0', background: '#f1f5f9' }}>
        <div className="ls">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="ld" style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{c.how.title}</h2>
            <p style={{ fontSize: 17, color: '#64748b' }}>{c.how.sub}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {c.how.steps.map((s) => (
              <div key={s.n} className="lc" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
                <div className="lsn">{s.n}</div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.ico}</div>
                <h3 className="ld" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{s.t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#5a6178' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Ideactory */}
      <section style={{ padding: '80px 0', background: '#FAFBFE' }}>
        <div className="ls">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="ld" style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{c.why.title}</h2>
            <p style={{ fontSize: 17, color: '#64748b' }}>{c.why.sub}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {c.why.items.map((f, i) => (
              <div key={i} className="lc" style={{ padding: 28, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: WHY_BGS[i], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={WHY_COLORS[i]}><path d={WHY_ICONS[i]} /></svg>
                </div>
                <h3 className="ld" style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b' }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section style={{ padding: '80px 0', background: '#f1f5f9' }}>
        <div className="ls">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="ld" style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{c.docs.title}</h2>
            <p style={{ fontSize: 17, color: '#64748b' }}>{c.docs.sub}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 860, margin: '0 auto' }}>
            {c.docs.items.map((doc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', borderRadius: 12, border: '1px solid #e8ecf4', fontSize: 14, color: '#3a3f5c', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#c7d2fe'; (e.currentTarget as HTMLDivElement).style.background = '#eef2ff'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e8ecf4'; (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#4f46e5"><path d={doc.ico} /></svg>
                </div>
                <span style={{ fontWeight: 500 }}>{doc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', background: '#FAFBFE' }}>
        <div className="ls">
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, #1e3a5f, #1e40af)', borderRadius: 24, padding: '64px 48px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
            <div className="lgl" style={{ width: 300, height: 300, background: 'rgba(96,165,250,0.15)', top: -100, right: -50 }} />
            <Image src="/logo.png" alt="Ideactory" width={80} height={80} style={{ margin: '0 auto 24px', display: 'block', filter: 'brightness(1.2) drop-shadow(0 4px 16px rgba(0,0,0,0.25))' }} />
            <h2 className="ld" style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 12, position: 'relative' }}>{c.cta.title}</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 32, position: 'relative' }}>{c.cta.sub}</p>
            <Link href="/register" className="lb" style={{ background: '#fff', color: '#1e3a5f', fontWeight: 700, padding: '16px 40px', fontSize: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', position: 'relative' }}>{c.cta.btn} →</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e8ecf4', padding: '24px 0', background: '#FAFBFE' }}>
        <div className="ls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/logo.png" alt="Ideactory" width={22} height={22} />
            <span style={{ fontSize: 14, color: '#64748b' }}>{c.footer.tag}</span>
          </div>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.footer.copy}</span>
        </div>
      </footer>
    </div>
  );
}
