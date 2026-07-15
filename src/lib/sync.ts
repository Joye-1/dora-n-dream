import { db } from "./db";
import { supabase, isSupabaseReady } from "./supabase";

export async function pushToCloud(userId: string) {
  if (!userId || !isSupabaseReady()) return;

  const localWords = await db.dailyWords.toArray();
  for (const w of localWords) {
    const { error } = await supabase.from("daily_words").upsert({
      id: w.id, user_id: userId, book_id: w.bookId,
      date: w.date, word: w.word, phonetic: w.phonetic,
      pos: w.pos, translation: w.translation,
      collins: w.collins, bnc: w.bnc, frq: w.frq,
    });
    if (error) console.error("Sync daily_words:", error);
  }

  const localErrors = await db.errorBook.toArray();
  for (const e of localErrors) {
    const { error } = await supabase.from("error_book").upsert({
      id: e.id, user_id: userId, book_id: e.bookId,
      word: e.word, error_rate: e.errorRate,
      error_types: e.errorTypes, last_error_date: e.lastErrorDate,
      week_start: e.weekStart, reviewed: e.reviewed,
    });
    if (error) console.error("Sync error_book:", error);
  }

  const sessions = await db.learningSessions.toArray();
  for (const s of sessions) {
    const { error } = await supabase.from("learning_sessions").upsert({
      id: s.id, user_id: userId, book_id: s.bookId,
      date: s.date, duration_seconds: s.durationSeconds,
    });
    if (error) console.error("Sync learning_sessions:", error);
  }
}

export async function pullFromCloud(userId: string) {
  if (!userId || !isSupabaseReady()) return;
  // 按需实现...
}

export async function syncAll(userId: string) {
  await pullFromCloud(userId);
  await pushToCloud(userId);
}
