import Link from 'next/link';
import Image from 'next/image';

const MODULES = [
  { icon: '🔍', label: 'Keşif & Pazar', desc: 'TAM/SAM/SOM, timing, Lean Canvas' },
  { icon: '⚔️', label: 'Rekabet', desc: 'Porter, SWOT, Blue Ocean, moat' },
  { icon: '🎯', label: 'Strateji & Skor', desc: 'GTM, birim ekonomisi, skorlama' },
  { icon: '📊', label: 'Final', desc: 'Projeksiyon, exit, dashboard' },
  { icon: '📄', label: 'Doküman', desc: 'Investor-grade package' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-fab-accent/[0.07] rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/[0.05] rounded-full blur-[120px]" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
          <span className="font-display font-bold text-lg tracking-tight">Fikir Analiz Factory</span>
          <span className="fab-badge-module text-[10px]">v6.2</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="fab-btn-ghost text-sm">Giriş</Link>
          <Link href="/register" className="fab-btn-primary text-sm">Kayıt Ol</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-32 text-center">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="Fikir Analiz Factory"
            width={140}
            height={140}
            className="drop-shadow-2xl"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-2 fab-badge-module text-sm mb-6 px-4 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-fab-accent animate-pulse" />
          McKinsey × Y Combinator × Sequoia
        </div>

        <h1 className="font-display font-extrabold text-5xl lg:text-7xl tracking-tight leading-[1.1] mb-6">
          Startup Fikrinizi
          <br />
          <span className="bg-gradient-to-r from-fab-accent via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Analiz Edin
          </span>
        </h1>

        <p className="text-fab-muted-light text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Pazar değerlendirmesi, rekabet analizi, strateji, skorlama ve
          investor-grade doküman üretimi — tek platformda.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/register" className="fab-btn-primary text-base px-8 py-3.5 shadow-xl shadow-fab-accent/20">
            Analiz Başlat →
          </Link>
          <Link href="/login" className="fab-btn-ghost text-base px-8 py-3.5 border border-fab-border">
            Giriş Yap
          </Link>
        </div>

        {/* Module pipeline */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {MODULES.map((m, i) => (
            <div key={i} className="fab-card p-4 text-left relative group hover:border-fab-accent/30 transition-colors">
              <div className="text-2xl mb-2">{m.icon}</div>
              <div className="font-display font-semibold text-sm mb-1">{m.label}</div>
              <div className="text-fab-muted text-xs">{m.desc}</div>
              {i < 4 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-fab-muted/30 text-lg z-10">→</div>
              )}
            </div>
          ))}
        </div>

        {/* Features summary */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="fab-card p-6">
            <div className="text-fab-accent font-display font-bold text-3xl mb-1">7+</div>
            <div className="text-sm text-fab-muted-light">Analitik boyut ile skorlama</div>
          </div>
          <div className="fab-card p-6">
            <div className="text-fab-accent font-display font-bold text-3xl mb-1">15+</div>
            <div className="text-sm text-fab-muted-light">Investor-grade doküman şablonu</div>
          </div>
          <div className="fab-card p-6">
            <div className="text-fab-accent font-display font-bold text-3xl mb-1">∞</div>
            <div className="text-sm text-fab-muted-light">Sınırsız fikir karşılaştırması</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-fab-border py-6 text-center text-fab-muted text-xs">
        Fikir Analiz Factory v6.2 — Powered by Claude
      </footer>
    </div>
  );
}
