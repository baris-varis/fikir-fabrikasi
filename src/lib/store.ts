import { create } from 'zustand';
import { Analysis, AnalysisState, ChatMessage } from '@/types';

interface AnalysisStore {
  // Current analysis
  currentAnalysis: Analysis | null;
  isStreaming: boolean;
  streamContent: string;

  // Actions
  setAnalysis: (analysis: Analysis) => void;
  addMessage: (message: ChatMessage) => void;
  updateState: (state: AnalysisState) => void;
  setStreaming: (streaming: boolean) => void;
  appendStream: (chunk: string) => void;
  clearStream: () => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  currentAnalysis: null,
  isStreaming: false,
  streamContent: '',

  setAnalysis: (analysis) => set({ currentAnalysis: analysis }),

  addMessage: (message) =>
    set((s) => ({
      currentAnalysis: s.currentAnalysis
        ? {
            ...s.currentAnalysis,
            messages: [...s.currentAnalysis.messages, message],
          }
        : null,
    })),

  updateState: (state) =>
    set((s) => ({
      currentAnalysis: s.currentAnalysis
        ? { ...s.currentAnalysis, state }
        : null,
    })),

  setStreaming: (isStreaming) => set({ isStreaming }),
  appendStream: (chunk) =>
    set((s) => ({ streamContent: s.streamContent + chunk })),
  clearStream: () => set({ streamContent: '' }),
  reset: () =>
    set({ currentAnalysis: null, isStreaming: false, streamContent: '' }),
}));
