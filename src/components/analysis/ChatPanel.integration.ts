// ═══════════════════════════════════════════════════════════
// Ideactory.ai v6.2 — ChatPanel Entegrasyon Rehberi
//
// Bu dosya direkt kullanılmaz. Mevcut ChatPanel.tsx'e 
// doküman indirme özelliğinin nasıl ekleneceğini gösterir.
// ═══════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────
// 1. IMPORT EKLE (ChatPanel.tsx üstüne)
// ──────────────────────────────────────────────────────────

/*
import { 
  detectFrontendDocCommand, 
  DocDownloadCard, 
  DocBatchPanel, 
  DocMenu 
} from './DocDownload';
*/

// ──────────────────────────────────────────────────────────
// 2. MESAJ GÖNDERİM HOOK'UNDA DOKÜMAN KOMUT ALGILAMA
// ──────────────────────────────────────────────────────────

/*
// Mevcut handleSend fonksiyonunun içinde, mesaj gönderilmeden önce:

const handleSend = async (message: string) => {
  // Doküman komutu mu kontrol et
  const docCmd = detectFrontendDocCommand(message);
  
  if (docCmd) {
    // Analiz state'i al (Zustand store'dan veya API'den)
    const state = useAnalysisStore.getState().currentState;
    
    if (!state || !state.meta?.tamamlanan_moduller?.includes('D')) {
      // State yoksa veya analiz tamamlanmamışsa uyar
      addMessage({
        role: 'assistant',
        content: 'Doküman üretmek için önce analizi tamamlamanız gerekiyor. Bir fikir paylaşarak başlayın.',
      });
      return;
    }
    
    // Kullanıcı mesajını göster
    addMessage({ role: 'user', content: message });
    
    // Doküman indirme kartını göster (yeni mesaj tipi)
    addMessage({
      role: 'assistant',
      content: '',
      type: 'doc_download',
      docCommand: docCmd,
    });
    
    return; // Claude API'ye gönderme
  }
  
  // ... normal Claude API çağrısı devam eder
};
*/

// ──────────────────────────────────────────────────────────
// 3. MESAJ RENDER'INDA DOKÜMAN KARTI
// ──────────────────────────────────────────────────────────

/*
// Mevcut mesaj render fonksiyonunda:

function renderMessage(msg: Message) {
  // Doküman indirme kartı
  if (msg.type === 'doc_download' && msg.docCommand) {
    const state = useAnalysisStore.getState().currentState;
    
    if (msg.docCommand.type === 'batch') {
      return (
        <DocBatchPanel
          commandKeys={msg.docCommand.commandKeys}
          state={state}
          lang={msg.docCommand.lang}
          label={msg.docCommand.label}
        />
      );
    }
    
    return (
      <DocDownloadCard
        commandKey={msg.docCommand.commandKeys[0]}
        state={state}
        lang={msg.docCommand.lang}
      />
    );
  }
  
  // Normal metin mesajı
  return <MarkdownContent content={msg.content} />;
}
*/

// ──────────────────────────────────────────────────────────
// 4. ANALİZ TAMAMLANDIĞINDA DOSYA MENÜSÜ GÖSTER
// ──────────────────────────────────────────────────────────

/*
// Modül D tamamlandığında (state güncelleme hook'unda):

useEffect(() => {
  if (state?.meta?.aktif_modul === 'D' && state?.meta?.tamamlanan_moduller?.includes('D')) {
    // Dosya menüsünü göster
    addMessage({
      role: 'assistant',
      content: '',
      type: 'doc_menu',
    });
  }
}, [state?.meta?.tamamlanan_moduller]);

// Ve render'da:
if (msg.type === 'doc_menu') {
  return <DocMenu state={state} />;
}
*/

// ──────────────────────────────────────────────────────────
// 5. MESSAGE TYPE GÜNCELLEMESİ (types/index.ts)
// ──────────────────────────────────────────────────────────

/*
// types/index.ts'e ekle:

export interface DocCommandResult {
  type: 'single' | 'batch';
  commandKeys: string[];
  lang: 'tr' | 'en';
  label: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'doc_download' | 'doc_menu';  // YENİ
  docCommand?: DocCommandResult;                  // YENİ
  timestamp?: string;
}
*/

// ──────────────────────────────────────────────────────────
// 6. ZUSTAND STORE GÜNCELLEMESİ (lib/store.ts)
// ──────────────────────────────────────────────────────────

/*
// store.ts'e ekle veya güncelle:

interface AnalysisState {
  // ... mevcut alanlar
  currentState: any;          // Analiz state JSON
  setCurrentState: (s: any) => void;
}
*/

// ──────────────────────────────────────────────────────────
// SONUÇ
// ──────────────────────────────────────────────────────────
// 
// Bu entegrasyonla:
// 1. Kullanıcı "exec summary üret" yazınca → indirme kartı görünür
// 2. Kullanıcı "tablolar üret" yazınca → 4 dosyanın toplu kartı görünür  
// 3. Kullanıcı "hepsini üret" yazınca → 12 dosya kartı görünür
// 4. Analiz tamamlandığında → tam dosya menüsü otomatik görünür
// 5. Her kart bağımsız olarak indirme + loading + success/error gösterir
// 6. Dosyalar API'den binary olarak gelir, tarayıcı download'u tetiklenir
//
// NOT: State'in Redis/Zustand'dan doğru şekilde çekilmesi gerekir.
// API route şu an state'i POST body'de bekliyor. Redis entegrasyonu
// için route.ts'teki placeholder'ı implement edin.

export {};
