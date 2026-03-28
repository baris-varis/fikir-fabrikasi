import { useState, useCallback, useRef } from 'react';
import { useAnalysisStore } from '@/lib/store';
import { ChatMessage, AnalysisState } from '@/types';

export function useAnalysis() {
  const {
    currentAnalysis,
    isStreaming,
    streamContent,
    setAnalysis,
    addMessage,
    updateState,
    setStreaming,
    appendStream,
    clearStream,
  } = useAnalysisStore();

  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!currentAnalysis || isStreaming) return;

      setError(null);
      setStreaming(true);
      clearStream();

      // Optimistically add user message
      const userMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: Date.now(),
        module: currentAnalysis.state.meta.aktif_modul,
      };
      addMessage(userMsg);

      // Start SSE
      abortRef.current = new AbortController();

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysisId: currentAnalysis.id,
            message,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process SSE events
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6);

            try {
              const event = JSON.parse(jsonStr);

              switch (event.type) {
                case 'text':
                  appendStream(event.content);
                  break;

                case 'state_update':
                  updateState(event.state as AnalysisState);
                  break;

                case 'checkpoint':
                  // Checkpoint visual cue handled by component
                  break;

                case 'error':
                  setError(event.content);
                  break;

                case 'done': {
                  // Finalize: add assistant message from stream content
                  const store = useAnalysisStore.getState();
                  const assistantMsg: ChatMessage = {
                    id: `msg-${Date.now()}`,
                    role: 'assistant',
                    content: store.streamContent,
                    timestamp: Date.now(),
                    module: currentAnalysis.state.meta.aktif_modul,
                  };
                  addMessage(assistantMsg);
                  clearStream();
                  break;
                }
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('Bağlantı hatası. Tekrar deneyin.');
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [currentAnalysis, isStreaming, setStreaming, clearStream, addMessage, appendStream, updateState],
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
    // Finalize partial stream
    const store = useAnalysisStore.getState();
    if (store.streamContent) {
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: store.streamContent + '\n\n*[Yanıt kesildi]*',
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);
      clearStream();
    }
  }, [setStreaming, addMessage, clearStream]);

  const loadAnalysis = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/analyses/${id}`);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setAnalysis(data);
        return data;
      } catch {
        setError('Analiz yüklenemedi.');
        return null;
      }
    },
    [setAnalysis],
  );

  const createAnalysis = useCallback(
    async (title: string, mode: 'tam' | 'hizli' = 'tam') => {
      try {
        const res = await fetch('/api/analyses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, mode }),
        });
        if (!res.ok) throw new Error('Failed to create');
        const data = await res.json();
        setAnalysis(data);
        return data;
      } catch {
        setError('Analiz oluşturulamadı.');
        return null;
      }
    },
    [setAnalysis],
  );

  return {
    analysis: currentAnalysis,
    isStreaming,
    streamContent,
    error,
    sendMessage,
    stopStreaming,
    loadAnalysis,
    createAnalysis,
  };
}
