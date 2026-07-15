import { create } from "zustand";
import { supabase, isSupabaseReady } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),

  signUp: async (_email, _password) => {
    if (!isSupabaseReady()) return { error: "云同步未配置" };
    const { error } = await supabase.auth.signUp({
      email: _email,
      password: _password,
    });
    return { error: error?.message };
  },

  signIn: async (_email, _password) => {
    if (!isSupabaseReady()) return { error: "云同步未配置" };
    const { error } = await supabase.auth.signInWithPassword({
      email: _email,
      password: _password,
    });
    return { error: error?.message };
  },

  signOut: async () => {
    if (!isSupabaseReady()) return;
    await supabase.auth.signOut();
    set({ user: null });
  },

  init: async () => {
    if (!isSupabaseReady()) {
      set({ user: null, loading: false });
      return;
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, loading: false });
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null });
      });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
