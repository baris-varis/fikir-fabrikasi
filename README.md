# 🏭 Fikir Analiz Fabrikası v6.2 — Web Uygulaması

Startup fikirlerini McKinsey analitikliği, Y Combinator pragmatizmi ve Sequoia vizyonuyla analiz eden web uygulaması.

## Mimari

```
┌─────────────────────────────────────────────────────┐
│                    Vercel Edge                       │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Next.js   │  │ NextAuth │  │ Upstash Redis    │ │
│  │ App Router│  │ JWT Auth │  │ (Vercel KV)      │ │
│  └─────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│        │              │                  │           │
│  ┌─────┴──────────────┴──────────────────┴────────┐ │
│  │              API Routes                         │ │
│  │  /api/analyze  → Claude Streaming               │ │
│  │  /api/analyses → CRUD                           │ │
│  │  /api/auth     → Registration + Login           │ │
│  └─────────────────────┬──────────────────────────┘ │
│                        │                             │
│  ┌─────────────────────┴──────────────────────────┐ │
│  │           Anthropic Claude API                  │ │
│  │  System Prompt + Module Context + State         │ │
│  │  → Streaming SSE Response                       │ │
│  │  → State Update Parsing                         │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| AI Engine | Claude Sonnet 4 via Anthropic SDK |
| Auth | NextAuth v5 (Credentials) |
| State DB | Upstash Redis (Vercel KV) |
| Client State | Zustand |
| Styling | Tailwind CSS |
| Streaming | Server-Sent Events (SSE) |
| Deploy | Vercel |

## Kurulum

### 1. Repo'yu klonla

```bash
git clone <repo-url>
cd fikir-analiz-fabrikasi
npm install
```

### 2. Ortam değişkenlerini ayarla

```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenle:

```env
# Anthropic API Key — https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Upstash Redis — https://console.upstash.com/
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# NextAuth — rastgele bir secret üret: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Upstash Redis oluştur

1. [Upstash Console](https://console.upstash.com/) → Create Database
2. Region: `eu-west-1` (Frankfurt — Türkiye'ye yakın)
3. REST URL ve Token'ı `.env.local`'e yapıştır

### 4. Çalıştır

```bash
npm run dev
```

http://localhost:3000 adresini aç.

## Vercel'e Deploy

### 1. Vercel CLI

```bash
npm i -g vercel
vercel
```

### 2. Environment Variables

Vercel Dashboard → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST Token |
| `NEXTAUTH_SECRET` | Random 32+ char secret |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` |

### 3. Deploy

```bash
vercel --prod
```

Veya GitHub repo'nu Vercel'e bağla — her push otomatik deploy olur.

## Uygulama Akışı

```
Kayıt/Giriş → Yeni Analiz (mod seç) → Fikir yaz
  → Claude API streaming başlar
  → Modül A: Keşif & Pazar (TAM/SAM/SOM, timing, Lean Canvas)
  → Checkpoint ✅ → "devam"
  → Modül B: Rekabet (Porter, SWOT, Blue Ocean, moat)
  → Checkpoint ✅ → "devam"
  → Modül C: Strateji & Skor (GTM, birim ekonomisi, risk, skorlama)
  → Checkpoint ✅ → "devam"
  → Modül D: Final (projeksiyon, exit, fonlama, dashboard)
  → Dosya menüsü gösterilir
```

## Dosya Yapısı

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind + custom styles
│   ├── (auth)/
│   │   ├── layout.tsx              # Auth layout (centered)
│   │   ├── login/page.tsx          # Login
│   │   └── register/page.tsx       # Register
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout (sidebar)
│   │   ├── analyses/page.tsx       # Analysis list
│   │   ├── analyses/[id]/page.tsx  # Analysis workspace
│   │   └── new/page.tsx            # New analysis
│   └── api/
│       ├── analyze/route.ts        # 🔥 Streaming analysis endpoint
│       ├── analyses/route.ts       # List + Create analyses
│       ├── analyses/[id]/route.ts  # Get + Delete analysis
│       └── auth/
│           ├── [...nextauth]/route.ts
│           └── register/route.ts
├── components/
│   ├── analysis/
│   │   ├── ChatPanel.tsx           # Chat messages + input
│   │   ├── StatePanel.tsx          # Live state sidebar
│   │   ├── ModuleProgress.tsx      # A→B→C→D progress bar
│   │   └── ScoreGauge.tsx          # Radial score gauge
│   └── layout/
│       └── DashboardShell.tsx      # Sidebar + content shell
├── hooks/
│   └── useAnalysis.ts              # SSE streaming + state hook
├── lib/
│   ├── anthropic.ts                # Claude API + parsing
│   ├── auth.ts                     # NextAuth config
│   ├── prompts.ts                  # System prompt builder
│   ├── redis.ts                    # Upstash Redis client
│   └── store.ts                    # Zustand store
└── types/
    └── index.ts                    # All TypeScript types
```

## Geliştirme Notları

### Doküman Üretimi (Modül E)
Sistem prompt'taki doküman üretim komutları (exec summary üret, pitch deck üret vb.)
şu anda Claude'un sohbet yanıtı olarak içerik üretmesi şeklinde çalışır.
Gerçek .docx/.xlsx/.pptx dosya üretimi için sunucu tarafında ek kütüphaneler
(docx, exceljs, pptxgenjs) entegre edilebilir.

### Rate Limiting
Upstash Ratelimit paketi projeye dahil. API route'lara eklemek için:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import redis from '@/lib/redis';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1m'), // 10 req/min
});
```

### Token Kullanımı
Her analiz yanıtı ~2000-8000 token kullanır. Tam bir analiz (A→D) yaklaşık
25,000-40,000 output token tüketir. Maliyet takibi için Anthropic Console'u
kullanabilirsiniz.

## Lisans

MIT
