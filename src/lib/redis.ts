import { Redis } from '@upstash/redis';
import { Analysis, AnalysisState, User } from '@/types';

// ─── Redis Client (lazy) ───────────────────────────────

let _redis: Redis | undefined;

export function getRedisClient(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
  }
  return _redis;
}

const redis = { get client() { return getRedisClient(); } };

export default redis.client;

// ─── Key Helpers ────────────────────────────────────────

const keys = {
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  analysis: (id: string) => `analysis:${id}`,
  userAnalyses: (userId: string) => `user:${userId}:analyses`,
  analysisMessages: (id: string) => `analysis:${id}:messages`,
};

// ─── User Operations ───────────────────────────────────

export async function createUser(user: User): Promise<void> {
  const r = getRedisClient();
  const pipeline = r.pipeline();
  pipeline.set(keys.user(user.id), JSON.stringify(user));
  pipeline.set(keys.userByEmail(user.email), user.id);
  await pipeline.exec();
}

export async function getUserById(id: string): Promise<User | null> {
  const r = getRedisClient();
  const data = await r.get<string>(keys.user(id));
  return data ? (typeof data === 'string' ? JSON.parse(data) : data as unknown as User) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const r = getRedisClient();
  const userId = await r.get<string>(keys.userByEmail(email));
  if (!userId) return null;
  return getUserById(userId);
}

// ─── Analysis Operations ────────────────────────────────

export async function createAnalysis(analysis: Analysis): Promise<void> {
  const r = getRedisClient();
  const pipeline = r.pipeline();
  const { messages, ...analysisMeta } = analysis;
  pipeline.set(keys.analysis(analysis.id), JSON.stringify(analysisMeta));
  pipeline.zadd(keys.userAnalyses(analysis.userId), {
    score: analysis.createdAt,
    member: analysis.id,
  });
  if (messages.length > 0) {
    pipeline.set(keys.analysisMessages(analysis.id), JSON.stringify(messages));
  }
  await pipeline.exec();
}

export async function getAnalysis(id: string): Promise<Analysis | null> {
  const r = getRedisClient();
  const [metaRaw, messagesRaw] = await Promise.all([
    r.get<string>(keys.analysis(id)),
    r.get<string>(keys.analysisMessages(id)),
  ]);
  if (!metaRaw) return null;
  const meta = typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw;
  const messages = messagesRaw
    ? (typeof messagesRaw === 'string' ? JSON.parse(messagesRaw) : messagesRaw)
    : [];
  return { ...meta, messages } as Analysis;
}

export async function updateAnalysisState(id: string, state: AnalysisState): Promise<void> {
  const r = getRedisClient();
  const analysis = await getAnalysis(id);
  if (!analysis) throw new Error('Analysis not found');
  analysis.state = state;
  analysis.updatedAt = Date.now();
  const { messages, ...meta } = analysis;
  await r.set(keys.analysis(id), JSON.stringify(meta));
}

export async function addMessages(analysisId: string, newMessages: Analysis['messages']): Promise<void> {
  const r = getRedisClient();
  const existing = await r.get<string>(keys.analysisMessages(analysisId));
  const messages = existing
    ? (typeof existing === 'string' ? JSON.parse(existing) : existing)
    : [];
  messages.push(...newMessages);
  const trimmed = messages.slice(-200);
  await r.set(keys.analysisMessages(analysisId), JSON.stringify(trimmed));
}

export async function getUserAnalyses(userId: string, limit = 20): Promise<Analysis[]> {
  const r = getRedisClient();
  const ids = await r.zrange(keys.userAnalyses(userId), 0, limit - 1, { rev: true });
  if (!ids.length) return [];
  const analyses = await Promise.all(ids.map((id) => getAnalysis(id as string)));
  return analyses.filter(Boolean) as Analysis[];
}

export async function deleteAnalysis(id: string, userId: string): Promise<void> {
  const r = getRedisClient();
  const pipeline = r.pipeline();
  pipeline.del(keys.analysis(id));
  pipeline.del(keys.analysisMessages(id));
  pipeline.zrem(keys.userAnalyses(userId), id);
  await pipeline.exec();
}

// ─── State Helpers ──────────────────────────────────────

export function createEmptyState(): AnalysisState {
  return {
    meta: {
      fikir_adi: '',
      sektor: '',
      kapsam: 'Yerel',
      mod: 'tam',
      tarih: new Date().toISOString().split('T')[0],
      tamamlanan_moduller: [],
      aktif_modul: 'A',
      ham_skor: 0,
      timing_carpani: 0,
      final_skor: 0,
      karar: '',
    },
    A_pazar: {},
    B_rekabet: {},
    C_strateji: {},
    D_final: {},
  };
}
