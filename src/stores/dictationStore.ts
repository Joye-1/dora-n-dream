import { create } from "zustand";

export type DictationMode = "browse" | "listening" | "spot_check";

interface DictationState {
  mode: DictationMode;
  hideEnglish: boolean;
  hideChinese: boolean;
  memoryTyping: boolean;
  answers: Record<string, string>;
  results: Record<string, boolean>;

  setMode: (mode: DictationMode) => void;
  toggleHideEnglish: () => void;
  toggleHideChinese: () => void;
  toggleMemoryTyping: () => void;
  setAnswer: (wordId: string, answer: string) => void;
  setResult: (wordId: string, correct: boolean) => void;
  reset: () => void;
}

export const useDictationStore = create<DictationState>((set) => ({
  mode: "browse",
  hideEnglish: false,
  hideChinese: false,
  memoryTyping: false,
  answers: {},
  results: {},

  setMode: (mode) => set({ mode, answers: {}, results: {} }),

  toggleHideEnglish: () =>
    set((s) => ({ hideEnglish: !s.hideEnglish, answers: {}, results: {} })),

  toggleHideChinese: () =>
    set((s) => ({ hideChinese: !s.hideChinese, answers: {}, results: {} })),

  toggleMemoryTyping: () =>
    set((s) => ({ memoryTyping: !s.memoryTyping, hideEnglish: false, hideChinese: false, answers: {}, results: {} })),

  setAnswer: (wordId, answer) =>
    set((state) => ({ answers: { ...state.answers, [wordId]: answer } })),

  setResult: (wordId, correct) =>
    set((state) => ({ results: { ...state.results, [wordId]: correct } })),

  reset: () =>
    set({
      mode: "browse",
      hideEnglish: false,
      hideChinese: false,
      memoryTyping: false,
      answers: {},
      results: {},
    }),
}));
