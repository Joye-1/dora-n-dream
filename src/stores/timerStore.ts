import { create } from "zustand";

interface TimerState {
  seconds: number;
  isActive: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  seconds: 0,
  isActive: false,
  start: () => set({ isActive: true }),
  pause: () => set({ isActive: false }),
  reset: () => set({ seconds: 0, isActive: false }),
  tick: () => set((s) => ({ seconds: s.seconds + 1 })),
}));
