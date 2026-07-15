import { create } from "zustand";

export type DictationMode = "browse" | "listening" | "spot_check";

interface DictationState {
  mode: DictationMode;
  hideEnglish: boolean;   // 浏览模式下隐藏英文
  hideChinese: boolean;   // 浏览模式下隐藏中文
  answers: Record<string, string>;
  results: Record<string, boolean>;

  setMode: (mode: DictationMode) => void;
  toggleHideEnglish: () => void;
  toggleHideChinese: () => void;
  setAnswer: (wordId: string, answer: string) => void;
  setResult: (wordId: string, correct: boolean) => void;
  reset: () => void;
}

export const useDictationStore = create<DictationState>((set) => ({
  mode: "browse",
  hideEnglish: false,
  hideChinese: false,
  answers: {},
  results: {},

  setMode: (mode) => set({ mode, answers: {}, results: {} }),

  toggleHideEnglish: () =>
    set((s) => ({ hideEnglish: !s.hideEnglish, answers: {}, results: {} })),

  toggleHideChinese: () =>
    set((s) => ({ hideChinese: !s.hideChinese, answers: {}, results: {} })),

  setAnswer: (wordId, answer) =>
    set((state) => ({ answers: { ...state.answers, [wordId]: answer } })),

  setResult: (wordId, correct) =>
    set((state) => ({ results: { ...state.results, [wordId]: correct } })),

  reset: () =>
    set({
      mode: "browse",
      hideEnglish: false,
      hideChinese: false,
      answers: {},
      results: {},
    }),
}));
