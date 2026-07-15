import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const hasConfig = Boolean(supabaseUrl && supabaseAnonKey);

// 未配置时创建一个安全的占位客户端，等配置好后替换
export const supabase: SupabaseClient = hasConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

export function isSupabaseReady(): boolean {
  return hasConfig;
}
