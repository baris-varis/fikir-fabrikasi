// ─── Analysis State Types ───────────────────────────────
// Mirrors the JSON state schema from the system prompt

export type Kapsam = 'Yerel' | 'Glocal' | 'Global';
export type Mod = 'tam' | 'hizli';
export type Karar = 'GO' | 'CONDITIONAL GO' | 'NO-GO';
export type TehditSeviye = 'Yüksek' | 'Orta' | 'Düşük';
export type MoatSuresi = 'Kısa' | 'Orta' | 'Uzun';

export interface AnalysisMeta {
  fikir_adi: string;
  sektor: string;
  kapsam: Kapsam;
  mod: Mod;
  dil: 'tr' | 'en';
  usd_try_kur: number;
  tarih: string;
  tamamlanan_moduller: string[];
  aktif_modul: string;
  ham_skor: number;
  timing_carpani: number;
  final_skor: number;
  karar: Karar | '';
}

export interface LeanCanvas {
  problemler: string[];
  musteri_segmentleri: string;
  uvp: string;
  cozumler: string[];
  kanallar: string;
  gelir_akislari: string;
  maliyet_yapisi: string;
  anahtar_metrikler: string[];
  haksiz_avantaj: string;
}

export interface TimingAnalysis {
  skor: number;
  teknolojik: string;
  duzenleyici: string;
  davranis: string;
  makro: string;
}

export interface GlobalPazar {
  kuzey_amerika: string;
  avrupa: string;
  apac: string;
  mena: string;
  latam: string;
  toplam: string;
  megatrendler: string[];
  tr_avantaji: string;
}

export interface APazar {
  problem: string;
  cozum: string;
  uvp: string;
  hedef_kitle: string;
  is_modeli_ozet: string;
  varsayimlar: string[];
  tam_tr: string;
  tam_tr_kaynak: string;
  tam_global: string;
  tam_global_kaynak: string;
  sam: string;
  som_3yil: string;
  cagr_tr: string;
  cagr_global: string;
  timing: TimingAnalysis;
  buyume_suruculeri: string[];
  frenleyiciler: string[];
  duzenleyici_ortam: string;
  musteri_segmentleri: {
    birincil: string;
    ikincil: string;
    erken_benimseyenler: string;
  };
  turkiyeye_ozel: string;
  lean_canvas: LeanCanvas;
  global_pazar: GlobalPazar;
}

export interface Rakip {
  ad: string;
  fonlama: string;
  kullanici_mrr: string;
  guclu_yon: string;
  zayif_yon: string;
  tehdit: TehditSeviye;
}

export interface GlobalRakip {
  ad: string;
  merkez: string;
  fonlama: string;
  model: string;
  guclu_yon: string;
  tr_tehdidi: string;
}

export interface Porter {
  yeni_girisimci: string;
  tedarikci: string;
  alici: string;
  ikame: string;
  mevcut_rekabet: string;
}

export interface SWOT {
  S: string[];
  W: string[];
  O: string[];
  T: string[];
}

export interface BlueOcean {
  tetiklendi: boolean;
  eleme: string;
  azaltma: string;
  artirma: string;
  yaratma: string;
  sonuc: string;
}

export interface BRekabet {
  rakipler: Rakip[];
  dolyli_rakipler: string;
  porter: Porter;
  uvp: string;
  moat_tipi: string;
  moat_suresi: MoatSuresi;
  swot: SWOT;
  tows: { so: string; st: string; wo: string; wt: string };
  blue_ocean: BlueOcean;
  global_rakipler: GlobalRakip[];
  beyaz_alan: string;
}

export interface Fiyat {
  katman: string;
  fiyat_tl: string;
  hedef_segment: string;
  ozellikler: string;
}

export interface Kanal {
  kanal: string;
  tahmini_cac_tl: string;
  olceklenebilirlik: string;
  hiz: string;
  oncelik: string;
}

export interface Plan90Gun {
  ay: number;
  hedef: string;
  aksiyon: string;
  kpi: string;
}

export interface BirimEkonomisi {
  arpu_tl: number;
  cac_tl: number;
  cac_organik_tl: number;
  cac_ucretli_tl: number;
  churn_aylik: number;
  brut_marj: number;
  ltv: number;
  ltv_cac: string;
  payback_ay: number;
  hosting_musteri_basi_tl: number;
  odeme_komisyon_pct: number;
}

export interface Risk {
  no: number;
  tanim: string;
  kategori: string;
  olasilik: number;
  etki: number;
  skor: number;
  mitigation: string;
}

export interface PreMortem {
  senaryo: string;
  ne_oldu: string;
  kor_nokta: string;
  erken_uyari: string;
  test_90gun: string;
}

export interface SkorlamaBoyut {
  ad: string;
  agirlik_pct: number;
  puan: number;
  agirlikli_puan: number;
  gerekce: string;
}

export interface PivotOneri {
  zayif_boyut: string;
  puan: number;
  pivot_a: string;
  pivot_b: string;
  tahmini_artis: number;
}

export interface CStrateji {
  is_modeli: {
    tip: string;
    fiyatlar: Fiyat[];
  };
  gtm: {
    icp: string;
    beachhead: string;
    buyume_motoru: string;
    kanallar: Kanal[];
    plan_90gun: Plan90Gun[];
  };
  birim_ekonomisi: BirimEkonomisi;
  genisleme: Array<{
    faz: number;
    zaman: string;
    pazar: string;
    strateji: string;
    hazilik: string;
  }>;
  riskler: {
    kill_risk: { var_mi: boolean; aciklama: string; test: string };
    top: Risk[];
    pre_mortem: PreMortem[];
  };
  skorlama: {
    boyutlar: SkorlamaBoyut[];
    ham_skor: number;
    timing_carpani: number;
    final_skor: number;
    karar: Karar;
    guclu_yonler: string[];
    zayif_yonler: string[];
    ilk_90_gun: string[];
    pivot: {
      gerekli_mi: boolean;
      oneriler: PivotOneri[];
      pivot_sonrasi_tahmini_skor: number;
      en_etkili_pivot: string;
    };
  };
}

export interface Kadro {
  rol: string;
  sayi: number;
  baslangic_ay: number;
  brut_maas_tl: number;
}

export interface ProjeksiyonAylik {
  ay: number;
  yeni_musteri: number;
  churned: number;
  aktif_musteri: number;
  mrr_tl: string;
  gelir_tl: string;
  gider_tl: string;
  ebitda_tl: string;
  nakit_tl: string;
  runway_ay: number;
}

export interface ProjeksiyonYillik {
  yil: number;
  musteri: number;
  arr_tl: string;
  brut_gelir_tl: string;
  cogs_tl: string;
  brut_kar_tl: string;
  brut_marj_pct: number;
  personel_gider_tl: string;
  pazarlama_gider_tl: string;
  genel_gider_tl: string;
  ebitda_tl: string;
  ebitda_marj_pct: number;
  net_nakit_akisi_tl: string;
  donem_sonu_nakit_tl: string;
}

export interface ExitSenaryo {
  sira: string;
  yontem: string;
  alici: string;
  zaman: string;
  olasilik: string;
  deger: string;
  yatirimci_getiri: string;
}

export interface DFinal {
  finansal: {
    varsayimlar: {
      arpu_tl: number;
      buyume_aylik_pct: number;
      churn_aylik_pct: number;
      brut_marj_pct: number;
      cac_tl: number;
      cac_organik_tl: number;
      cac_ucretli_tl: number;
      yillik_fiyat_artisi_pct: number;
      upsell_orani_pct: number;
      hosting_musteri_basi_tl: number;
      odeme_komisyon_pct: number;
      genel_giderler_aylik_tl: number;
      mevcut_nakit_tl: number;
    };
    kadro: Kadro[];
    projeksiyon_aylik: ProjeksiyonAylik[];
    projeksiyon_yillik: ProjeksiyonYillik[];
    breakeven_ay: number;
    cashout_ay: number;
    senaryo: {
      kotumser: {
        buyume_carpan: number;
        churn_carpan: number;
        cac_carpan: number;
        arr_yil3: string;
        arr_yil5: string;
        breakeven_ay: number;
      };
      gercekci: {
        arr_yil3: string;
        arr_yil5: string;
        breakeven_ay: number;
      };
      iyimser: {
        buyume_carpan: number;
        churn_carpan: number;
        cac_carpan: number;
        arr_yil3: string;
        arr_yil5: string;
        breakeven_ay: number;
      };
    };
    fonlama: Array<{
      tur: string;
      tutar: string;
      donem: string;
      kullanim: string;
      milestones: string;
    }>;
    use_of_funds: {
      urun_pct: number;
      pazarlama_pct: number;
      ekip_pct: number;
      genel_pct: number;
    };
  };
  exit: ExitSenaryo[];
  comparable_exits: Array<{
    sirket: string;
    sektor: string;
    alici: string;
    deger: string;
    carpan: string;
    yil: string;
  }>;
  basari_faktorleri: string[];
  ilk_30_gun: Array<{ sira: number; aksiyon: string }>;
  yonetici_ozeti: string;
}

export interface AnalysisState {
  meta: AnalysisMeta;
  A_pazar: Partial<APazar>;
  B_rekabet: Partial<BRekabet>;
  C_strateji: Partial<CStrateji>;
  D_final: Partial<DFinal>;
}

// ─── Chat / UI Types ────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  module?: string;
  checkpoint?: boolean;
}

export interface Analysis {
  id: string;
  userId: string;
  title: string;
  state: AnalysisState;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'completed' | 'archived';
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: number;
  analysisCount: number;
}

// ─── API Types ──────────────────────────────────────────

export interface AnalyzeRequest {
  analysisId: string;
  message: string;
  command?: string;
}

export interface AnalyzeResponse {
  content: string;
  state: AnalysisState;
  module?: string;
  checkpoint?: boolean;
  completed?: boolean;
}

export interface StreamChunk {
  type: 'text' | 'state_update' | 'checkpoint' | 'module_change' | 'error' | 'done';
  content?: string;
  state?: Partial<AnalysisState>;
  module?: string;
}
