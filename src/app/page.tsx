'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const content = {
  tr: {
    nav: { login: 'Giriş', register: 'Ücretsiz Dene' },
    hero: {
      badge: 'Yapay Zeka Destekli Fikir Analizi',
      title1: 'Startup Fikrinizi',
      title2: 'Yatırıma Hazırlayın',
      subtitle: 'Pazar araştırması, rekabet analizi, strateji geliştirme, finansal projeksiyon ve investor-grade doküman üretimi — tek platformda, dakikalar içinde.',
      cta: 'Ücretsiz Analiz Başlat',
      ctaSecondary: 'Nasıl Çalışır?',
    },
    stats: [
      { value: '11', label: 'Analiz Aşaması' },
      { value: '4', label: 'Stratejik Modül' },
      { value: '15+', label: 'Doküman Şablonu' },
      { value: '100', label: 'Puan Üzerinden Skorlama' },
    ],
    howItWorks: {
      title: 'Nasıl Çalışır?',
      subtitle: 'Fikrinizden yatırımcı sunumuna 4 adımda',
      steps: [
        { num: '01', icon: '🔍', title: 'Keşif & Pazar', desc: 'Fikrinizi yapılandırır, TAM/SAM/SOM hesaplar, Lean Canvas oluşturur, pazar timing\'ini değerlendirir.', tags: ['TAM/SAM/SOM', 'Lean Canvas', 'Timing Analizi'] },
        { num: '02', icon: '⚔️', title: 'Rekabet Analizi', desc: 'Doğrudan ve dolaylı rakipleri tespit eder, Porter 5 Güç, SWOT/TOWS ve Blue Ocean analizi yapar.', tags: ['Porter 5 Güç', 'SWOT', 'Blue Ocean'] },
        { num: '03', icon: '🎯', title: 'Strateji & Skorlama', desc: 'GTM stratejisi, birim ekonomisi, risk matrisi oluşturur ve 7-9 boyutlu skorlama ile GO/NO-GO kararı verir.', tags: ['GTM', 'Birim Ekonomisi', 'Risk Matrisi', 'Skor'] },
        { num: '04', icon: '📊', title: 'Final & Dokümanlar', desc: '5 yıllık finansal projeksiyon, exit stratejisi, fonlama planı ve investor-grade doküman paketi üretir.', tags: ['Projeksiyon', 'Exit', 'Pitch Deck', 'One-Pager'] },
      ],
    },
    features: {
      title: 'Neden Ideactory?',
      subtitle: 'Haftalarca süren danışmanlık sürecini dakikalara sığdırın',
      items: [
        { icon: '⚡', title: 'Dakikalar İçinde', desc: 'Geleneksel danışmanlıkta haftalar süren analizi yapay zeka ile dakikalara sığdırın.' },
        { icon: '📐', title: 'Yapılandırılmış Framework', desc: 'McKinsey, Porter, Y Combinator ve Sequoia metodolojilerini birleştiren sistematik analiz.' },
        { icon: '📄', title: 'Investor-Grade Dokümanlar', desc: 'Executive summary, pitch deck, finansal model, teaser — yatırımcıya hazır profesyonel çıktılar.' },
        { icon: '🎯', title: 'Objektif Skorlama', desc: '7-9 boyutlu değerlendirme ile GO / CONDITIONAL GO / NO-GO kararı. Pivot önerileri dahil.' },
        { icon: '🌍', title: 'Yerel + Global', desc: 'Türkiye pazarı derinlemesine, global genişleme stratejisi opsiyonel. Glocal yaklaşım.' },
        { icon: '🔄', title: 'Karşılaştırma', desc: 'Birden fazla fikri yan yana skorlayın, en güçlü girişim fırsatını belirleyin.' },
      ],
    },
    documents: {
      title: 'Üretilen Dokümanlar',
      subtitle: 'Yatırımcı toplantısına hazır profesyonel paket',
      items: ['Executive Summary (One-Pager)', 'Detaylı Executive Summary', 'Investment Teaser', 'Pitch Deck İçerik Rehberi', 'Pitch Deck Sunum (.pptx)', 'Finansal Model (.xlsx)', 'Rekabet Analizi Raporu', 'Risk Matrisi & Pre-Mortem', 'GTM Planı', 'Data Room Checklist', 'Lean Canvas', 'Analiz Transkripti (.pdf)'],
    },
    cta: { title: 'Fikrinizi Test Etmeye Hazır Mısınız?', subtitle: 'Ücretsiz kayıt olun ve ilk analizinizi başlatın.', button: 'Hemen Başla' },
    footer: { copyright: '© 2026 Ideactory.ai — Tüm hakları saklıdır.', tagline: 'Startup fikir analiz platformu' },
  },
  en: {
    nav: { login: 'Sign In', register: 'Try Free' },
    hero: {
      badge: 'AI-Powered Idea Analysis',
      title1: 'Turn Your Startup Idea',
      title2: 'Into an Investment',
      subtitle: 'Market research, competitive analysis, strategy development, financial projections and investor-grade documents — all in one platform, in minutes.',
      cta: 'Start Free Analysis',
      ctaSecondary: 'How It Works',
    },
    stats: [
      { value: '11', label: 'Analysis Stages' },
      { value: '4', label: 'Strategic Modules' },
      { value: '15+', label: 'Document Templates' },
      { value: '100', label: 'Point Scoring System' },
    ],
    howItWorks: {
      title: 'How It Works',
      subtitle: 'From idea to investor deck in 4 steps',
      steps: [
        { num: '01', icon: '🔍', title: 'Discovery & Market', desc: 'Structures your idea, calculates TAM/SAM/SOM, creates Lean Canvas, evaluates market timing.', tags: ['TAM/SAM/SOM', 'Lean Canvas', 'Timing Analysis'] },
        { num: '02', icon: '⚔️', title: 'Competitive Analysis', desc: "Identifies competitors, runs Porter's 5 Forces, SWOT/TOWS and Blue Ocean analysis.", tags: ['Porter 5 Forces', 'SWOT', 'Blue Ocean'] },
        { num: '03', icon: '🎯', title: 'Strategy & Scoring', desc: 'Builds GTM strategy, unit economics, risk matrix and delivers a 7-9 dimension GO/NO-GO decision.', tags: ['GTM', 'Unit Economics', 'Risk Matrix', 'Score'] },
        { num: '04', icon: '📊', title: 'Final & Documents', desc: '5-year financial projections, exit strategy, funding plan and investor-grade document package.', tags: ['Projections', 'Exit', 'Pitch Deck', 'One-Pager'] },
      ],
    },
    features: {
      title: 'Why Ideactory?',
      subtitle: 'Weeks of consulting work compressed into minutes',
      items: [
        { icon: '⚡', title: 'Minutes, Not Weeks', desc: 'Analysis that traditionally takes weeks of consulting, delivered by AI in minutes.' },
        { icon: '📐', title: 'Structured Frameworks', desc: 'Systematic analysis combining McKinsey, Porter, Y Combinator and Sequoia methodologies.' },
        { icon: '📄', title: 'Investor-Grade Documents', desc: 'Executive summary, pitch deck, financial model, teaser — professional outputs ready for investors.' },
        { icon: '🎯', title: 'Objective Scoring', desc: '7-9 dimension evaluation with GO / CONDITIONAL GO / NO-GO decision. Pivot suggestions included.' },
        { icon: '🌍', title: 'Local + Global', desc: 'Deep Turkey market analysis with optional global expansion strategy. Glocal approach.' },
        { icon: '🔄', title: 'Compare Ideas', desc: 'Score multiple ideas side by side, identify the strongest venture opportunity.' },
      ],
    },
    documents: {
      title: 'Generated Documents',
      subtitle: 'Professional package ready for investor meetings',
      items: ['Executive Summary (One-Pager)', 'Detailed Executive Summary', 'Investment Teaser', 'Pitch Deck Content Guide', 'Pitch Deck Presentation (.pptx)', 'Financial Model (.xlsx)', 'Competitive Analysis Report', 'Risk Matrix & Pre-Mortem', 'GTM Plan', 'Data Room Checklist', 'Lean Canvas', 'Analysis Transcript (.pdf)'],
    },
    cta: { title: 'Ready to Test Your Idea?', subtitle: 'Sign up for free and start your first analysis.', button: 'Get Started' },
    footer: { copyright: '© 2026 Ideactory.ai — All rights reserved.', tagline: 'Startup idea analysis platform' },
  },
};

type Lang = 'tr' | 'en';

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('tr');
  const [scrolled, setScrolled] = useState(false);
  const t = content[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-fab-bg text-fab-text">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-30%] left-[-15%] w-[800px] h-[800px] bg-blue-500/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/[0.03] rounded-full blur-[130px]" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.4) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-fab-bg/80 backdrop-blur-xl border-b border-fab-border/50 py-3' : 'py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Ideactory" width={36} height={36} />
            <span className="font-display font-bold text-lg tracking-tight">Ideactory.ai</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-fab-surface rounded-lg p-0.5 border border-fab-border/50">
              <button onClick={() => setLang('tr')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${lang === 'tr' ? 'bg-fab-accent text-white' : 'text-fab-muted hover:text-fab-text'}`}>TR</button>
              <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${lang === 'en' ? 'bg-fab-accent text-white' : 'text-fab-muted hover:text-fab-text'}`}>EN</button>
            </div>
            <Link href="/login" className="fab-btn-ghost text-sm hidden sm:flex">{t.nav.login}</Link>
            <Link href="/register" className="fab-btn-primary text-sm">{t.nav.register}</Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <Image src="/logo.png" alt="Ideactory.ai" width={120} height={120} className="drop-shadow-2xl" priority />
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] mb-6">
              {t.hero.title1}<br />
              <span className="bg-gradient-to-r from-fab-accent via-blue-400 to-orange-400 bg-clip-text text-transparent">{t.hero.title2}</span>
            </h1>
            <p className="text-fab-muted-light text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">{t.hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/register" className="fab-btn-primary text-base px-8 py-3.5 shadow-xl shadow-fab-accent/20">{t.hero.cta} →</Link>
              <a href="#how-it-works" className="fab-btn-ghost text-base px-8 py-3.5 border border-fab-border">{t.hero.ctaSecondary}</a>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16">
            {t.stats.map((stat, i) => (
              <div key={i} className="text-center py-4">
                <div className="font-display font-extrabold text-3xl lg:text-4xl text-fab-accent mb-1">{stat.value}</div>
                <div className="text-fab-muted text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl lg:text-4xl mb-3">{t.howItWorks.title}</h2>
            <p className="text-fab-muted-light text-lg">{t.howItWorks.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {t.howItWorks.steps.map((step) => (
              <div key={step.num} className="group relative">
                <div className="fab-card p-6 lg:p-8 h-full hover:border-fab-accent/30 transition-all duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="font-display font-extrabold text-5xl text-fab-accent/10 leading-none select-none">{step.num}</span>
                    <div>
                      <div className="text-2xl mb-1">{step.icon}</div>
                      <h3 className="font-display font-bold text-xl">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-fab-muted-light text-sm leading-relaxed mb-4">{step.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.tags.map((tag) => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-fab-accent/[0.06] text-fab-accent border border-fab-accent/10">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-fab-surface/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl lg:text-4xl mb-3">{t.features.title}</h2>
            <p className="text-fab-muted-light text-lg">{t.features.subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.items.map((feature, i) => (
              <div key={i} className="fab-card p-6 hover:border-fab-accent/20 transition-all group">
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="font-display font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-fab-muted text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl lg:text-4xl mb-3">{t.documents.title}</h2>
            <p className="text-fab-muted-light text-lg">{t.documents.subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {t.documents.items.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-fab-surface/50 border border-fab-border/50 hover:border-fab-accent/20 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-fab-accent/10 flex items-center justify-center text-fab-accent text-sm shrink-0">📄</div>
                <span className="text-sm text-fab-text/80">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="fab-card p-10 lg:p-14 border-fab-accent/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fab-accent/50 to-transparent" />
            <Image src="/logo.png" alt="Ideactory" width={60} height={60} className="mx-auto mb-6 opacity-80" />
            <h2 className="font-display font-bold text-2xl lg:text-3xl mb-3">{t.cta.title}</h2>
            <p className="text-fab-muted-light mb-8">{t.cta.subtitle}</p>
            <Link href="/register" className="fab-btn-primary text-base px-10 py-4 shadow-xl shadow-fab-accent/20">{t.cta.button} →</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-fab-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Ideactory" width={24} height={24} />
            <span className="text-fab-muted text-sm">{t.footer.tagline}</span>
          </div>
          <span className="text-fab-muted/60 text-xs">{t.footer.copyright}</span>
        </div>
      </footer>
    </div>
  );
}
