'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// ─── i18n ───────────────────────────────────────────────

const t = {
  tr: {
    nav: { login: 'Giriş Yap', cta: 'Ücretsiz Dene' },
    hero: {
      title1: 'Startup Fikrinizi',
      title2: 'Yatırıma Dönüştürün',
      sub: 'Yapay zeka destekli analiz motoru ile pazar araştırması, rekabet analizi, strateji, finansal projeksiyon ve investor-grade doküman üretimi — dakikalar içinde.',
      cta: 'Analiz Başlat',
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
        { n: '01', ico: '🔍', t: 'Keşif & Pazar', d: 'Fikrinizi yapılandırır, TAM/SAM/SOM hesaplar, Lean Canvas oluşturur ve pazar timing\'ini değerlendirir.', tags: ['TAM/SAM/SOM', 'Lean Canvas', 'Timing'] },
        { n: '02', ico: '⚔️', t: 'Rekabet Analizi', d: 'Doğrudan ve dolaylı rakipleri tespit eder, Porter 5 Güç, SWOT/TOWS ve Blue Ocean analizi yapar.', tags: ['Porter', 'SWOT', 'Blue Ocean'] },
        { n: '03', ico: '🎯', t: 'Strateji & Skor', d: 'GTM stratejisi, birim ekonomisi, risk matrisi oluşturur ve çok boyutlu skorlama ile GO/NO-GO kararı verir.', tags: ['GTM', 'Risk', 'Skorlama'] },
        { n: '04', ico: '📊', t: 'Final & Dokümanlar', d: '5 yıllık finansal projeksiyon, exit stratejisi ve investor-grade doküman paketi üretir.', tags: ['Projeksiyon', 'Exit', 'Pitch Deck'] },
      ],
    },
    why: {
      title: 'Neden Ideactory?',
      sub: 'Haftalarca süren danışmanlık sürecini dakikalara sığdırın',
      items: [
        { ico: '⚡', t: 'Dakikalar İçinde', d: 'Geleneksel danışmanlıkta haftalar süren analizi yapay zeka ile dakikalara sığdırın.' },
        { ico: '📐', t: 'Kanıtlanmış Framework\'ler', d: 'McKinsey, Porter, Y Combinator ve Sequoia metodolojilerini birleştiren sistematik analiz.' },
        { ico: '📄', t: 'Investor-Grade Çıktılar', d: 'Executive summary, pitch deck, finansal model — yatırımcıya hazır 15+ profesyonel doküman.' },
        { ico: '🎯', t: 'Objektif Karar', d: 'GO / CONDITIONAL GO / NO-GO — çok boyutlu değerlendirme ve pivot önerileri.' },
        { ico: '🌍', t: 'Yerel + Global', d: 'Türkiye pazarı derinlemesine, global genişleme stratejisi opsiyonel. Glocal yaklaşım.' },
        { ico: '🔄', t: 'Fikir Karşılaştırma', d: 'Birden fazla fikri yan yana skorlayın, en güçlü girişim fırsatını belirleyin.' },
      ],
    },
    docs: {
      title: 'Üretilen Dokümanlar',
      sub: 'Yatırımcı toplantısına hazır profesyonel paket',
      items: ['Executive Summary', 'Detaylı Exec Summary', 'Investment Teaser', 'Pitch Deck Rehberi', 'Sunum (.pptx)', 'Finansal Model (.xlsx)', 'Rekabet Raporu', 'Risk Matrisi', 'GTM Planı', 'Data Room Checklist', 'Lean Canvas', 'Transkript (.pdf)'],
    },
    cta: { title: 'Fikrinizi Test Etmeye Hazır Mısınız?', sub: 'Ücretsiz kayıt olun ve ilk analizinizi hemen başlatın.', btn: 'Hemen Başla' },
    footer: { copy: '© 2026 Ideactory.ai', tag: 'Startup Fikir Analiz Platformu' },
  },
  en: {
    nav: { login: 'Sign In', cta: 'Try Free' },
    hero: {
      title1: 'Turn Your Startup Idea',
      title2: 'Into an Investment',
      sub: 'AI-powered analysis engine for market research, competitive analysis, strategy, financial projections and investor-grade documents — in minutes.',
      cta: 'Start Analysis',
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
        { n: '01', ico: '🔍', t: 'Discovery & Market', d: 'Structures your idea, calculates TAM/SAM/SOM, creates Lean Canvas and evaluates market timing.', tags: ['TAM/SAM/SOM', 'Lean Canvas', 'Timing'] },
        { n: '02', ico: '⚔️', t: 'Competitive Analysis', d: "Identifies competitors, runs Porter's 5 Forces, SWOT/TOWS and Blue Ocean analysis.", tags: ['Porter', 'SWOT', 'Blue Ocean'] },
        { n: '03', ico: '🎯', t: 'Strategy & Score', d: 'Builds GTM strategy, unit economics, risk matrix and delivers a multi-dimension GO/NO-GO decision.', tags: ['GTM', 'Risk', 'Scoring'] },
        { n: '04', ico: '📊', t: 'Final & Documents', d: '5-year financial projections, exit strategy and investor-grade document package.', tags: ['Projections', 'Exit', 'Pitch Deck'] },
      ],
    },
    why: {
      title: 'Why Ideactory?',
      sub: 'Weeks of consulting compressed into minutes',
      items: [
        { ico: '⚡', t: 'Minutes, Not Weeks', d: 'Analysis that traditionally takes weeks of consulting, delivered by AI in minutes.' },
        { ico: '📐', t: 'Proven Frameworks', d: 'Systematic analysis combining McKinsey, Porter, Y Combinator and Sequoia methodologies.' },
        { ico: '📄', t: 'Investor-Grade Output', d: 'Executive summary, pitch deck, financial model — 15+ professional documents ready for investors.' },
        { ico: '🎯', t: 'Objective Decision', d: 'GO / CONDITIONAL GO / NO-GO — multi-dimension evaluation with pivot suggestions.' },
        { ico: '🌍', t: 'Local + Global', d: 'Deep Turkey market analysis with optional global expansion strategy. Glocal approach.' },
        { ico: '🔄', t: 'Compare Ideas', d: 'Score multiple ideas side by side, identify the strongest venture opportunity.' },
      ],
    },
    docs: {
      title: 'Generated Documents',
      sub: 'Professional package ready for investor meetings',
      items: ['Executive Summary', 'Detailed Exec Summary', 'Investment Teaser', 'Pitch Deck Guide', 'Presentation (.pptx)', 'Financial Model (.xlsx)', 'Competitive Report', 'Risk Matrix', 'GTM Plan', 'Data Room Checklist', 'Lean Canvas', 'Transcript (.pdf)'],
    },
    cta: { title: 'Ready to Test Your Idea?', sub: 'Sign up for free and start your first analysis now.', btn: 'Get Started' },
    footer: { copy: '© 2026 Ideactory.ai', tag: 'Startup Idea Analysis Platform' },
  },
};

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
        .lp-display { font-family: 'Sora', system-ui, sans-serif; }
        .lp-card { background: #fff; border: 1px solid #e8ecf4; border-radius: 16px; transition: all 0.3s; }
        .lp-card:hover { border-color: #c5d0e6; box-shadow: 0 8px 32px rgba(26,42,78,0.06); transform: translateY(-2px); }
        .lp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-family: 'Sora', sans-serif; font-size: 15px; transition: all 0.2s; cursor: pointer; text-decoration: none; }
        .lp-btn-primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; box-shadow: 0 4px 16px rgba(37,99,235,0.25); }
        .lp-btn-primary:hover { box-shadow: 0 6px 24px rgba(37,99,235,0.35); transform: translateY(-1px); }
        .lp-btn-outline { background: #fff; color: #1a1a2e; border: 1.5px solid #d1d9e8; }
        .lp-btn-outline:hover { border-color: #2563eb; color: #2563eb; }
        .lp-tag { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; background: #eef2ff; color: #4f46e5; }
        .lp-gradient-text { background: linear-gradient(135deg, #2563eb, #7c3aed, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lp-glow { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .lp-section { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
        .lp-step-num { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 64px; line-height: 1; color: #e8ecf4; position: absolute; top: -8px; right: 16px; }
        .lp-doc-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f8f9fc; border-radius: 10px; border: 1px solid #eef1f6; font-size: 14px; color: #3a3f5c; transition: all 0.2s; }
        .lp-doc-item:hover { background: #eef2ff; border-color: #c7d2fe; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .lp-float { animation: float 6s ease-in-out infinite; }
        .lp-float-delay { animation: float 6s ease-in-out infinite 2s; }
        .lp-float-delay2 { animation: float 6s ease-in-out infinite 4s; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s',
        background: scrolled ? 'rgba(250,251,254,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #e8ecf4' : '1px solid transparent',
        padding: scrolled ? '12px 0' : '20px 0',
      }}>
        <div className="lp-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/logo.png" alt="Ideactory" width={36} height={36} />
            <span className="lp-display" style={{ fontWeight: 700, fontSize: 18, color: '#1a1a2e' }}>Ideactory.ai</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', background: '#f0f2f8', borderRadius: 8, padding: 2 }}>
              <button onClick={() => setLang('tr')} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: lang === 'tr' ? '#2563eb' : 'transparent', color: lang === 'tr' ? '#fff' : '#64748b', transition: 'all 0.2s' }}>TR</button>
              <button onClick={() => setLang('en')} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: lang === 'en' ? '#2563eb' : 'transparent', color: lang === 'en' ? '#fff' : '#64748b', transition: 'all 0.2s' }}>EN</button>
            </div>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: '#475569', textDecoration: 'none', padding: '8px 16px' }}>{c.nav.login}</Link>
            <Link href="/register" className="lp-btn lp-btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>{c.nav.cta}</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop: 140, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
        <div className="lp-glow" style={{ width: 600, height: 600, background: 'rgba(37,99,235,0.06)', top: -200, left: -100 }} />
        <div className="lp-glow" style={{ width: 500, height: 500, background: 'rgba(124,58,237,0.04)', bottom: -150, right: -50 }} />
        <div className="lp-glow" style={{ width: 300, height: 300, background: 'rgba(245,158,11,0.05)', top: 100, right: 200 }} />

        <div className="lp-section" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div className="lp-float" style={{ marginBottom: 32 }}>
              <Image src="/logo.png" alt="Ideactory.ai" width={100} height={100} priority style={{ filter: 'drop-shadow(0 8px 24px rgba(37,99,235,0.15))' }} />
            </div>

            <h1 className="lp-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
              {c.hero.title1}<br />
              <span className="lp-gradient-text">{c.hero.title2}</span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.7, color: '#5a6178', maxWidth: 640, margin: '0 auto 36px' }}>
              {c.hero.sub}
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="lp-btn lp-btn-primary">{c.hero.cta} →</Link>
              <a href="#how" className="lp-btn lp-btn-outline">{c.hero.cta2}</a>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, maxWidth: 800, margin: '64px auto 0' }}>
            {c.stats.map((s, i) => (
              <div key={i} className="lp-card" style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{s.ico}</div>
                <div className="lp-display" style={{ fontSize: 28, fontWeight: 800, color: '#2563eb' }}>{s.val}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" style={{ padding: '80px 0', background: '#fff' }}>
        <div className="lp-section">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="lp-display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{c.how.title}</h2>
            <p style={{ fontSize: 17, color: '#64748b' }}>{c.how.sub}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {c.how.steps.map((s) => (
              <div key={s.n} className="lp-card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
                <div className="lp-step-num">{s.n}</div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.ico}</div>
                <h3 className="lp-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{s.t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#5a6178', marginBottom: 16 }}>{s.d}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {s.tags.map((tag) => <span key={tag} className="lp-tag">{tag}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Ideactory ── */}
      <section style={{ padding: '80px 0' }}>
        <div className="lp-section">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="lp-display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{c.why.title}</h2>
            <p style={{ fontSize: 17, color: '#64748b' }}>{c.why.sub}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {c.why.items.map((f, i) => (
              <div key={i} className="lp-card" style={{ padding: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{f.ico}</div>
                <h3 className="lp-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b' }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Documents ── */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="lp-section">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="lp-display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{c.docs.title}</h2>
            <p style={{ fontSize: 17, color: '#64748b' }}>{c.docs.sub}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 860, margin: '0 auto' }}>
            {c.docs.items.map((doc, i) => (
              <div key={i} className="lp-doc-item">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📄</div>
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 0' }}>
        <div className="lp-section">
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, #1e3a5f, #1e40af)', borderRadius: 24, padding: '64px 48px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
            <div className="lp-glow" style={{ width: 300, height: 300, background: 'rgba(96,165,250,0.15)', top: -100, right: -50 }} />
            <Image src="/logo.png" alt="Ideactory" width={56} height={56} style={{ margin: '0 auto 20px', display: 'block', filter: 'brightness(1.2) drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }} />
            <h2 className="lp-display" style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 12, position: 'relative' }}>{c.cta.title}</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 32, position: 'relative' }}>{c.cta.sub}</p>
            <Link href="/register" className="lp-btn" style={{ background: '#fff', color: '#1e3a5f', fontWeight: 700, padding: '16px 40px', fontSize: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', position: 'relative' }}>{c.cta.btn} →</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #e8ecf4', padding: '24px 0' }}>
        <div className="lp-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
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
