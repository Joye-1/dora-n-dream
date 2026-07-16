import Dexie, { type Table } from "dexie";

// ============ 单词本 ============
export interface WordBook {
  id?: string;
  userId?: string;
  name: string;
  createdAt?: string;
}

// ============ 每日单词 ============
export interface DailyWord {
  id?: string;
  bookId: string;
  userId?: string;
  date: string;
  word: string;
  phonetic: string;
  pos: string;
  translation: string;
  collins: number;
  bnc: number;
  frq: number;
  mnemonic: string;
  orderIndex?: number;
  createdAt?: string;
}

// ============ 短语 ============
export interface WordPhrase {
  id?: string;
  word: string;
  phrase: string;
  translation: string;
  source: "manual" | "api";
  createdAt?: string;
}

// ============ 同义词 ============
export interface WordSynonym {
  id?: string;
  word: string;
  synonym: string;
  source: "manual" | "api";
  createdAt?: string;
}

// ============ 错词集（按单词聚合，不重复记入）============
export interface ErrorWord {
  id?: string;
  userId?: string;
  bookId: string;
  word: string;
  errorRate: number;         // 0-100, 步长 5%，错+5/对-5
  errorTypes: {              // 各题型错误次数明细
    cnToEn: number;
    enToCn: number;
    listening: number;
  };
  lastErrorDate: string;      // 最后一次错误日期
  weekStart: string;          // 所属周的周一日期
  reviewed: boolean;
  createdAt?: string;
}

// ============ 学习时长 ============
export interface LearningSession {
  id?: string;
  userId?: string;
  bookId: string;
  date: string;
  durationSeconds: number;
}

// ============ 复习记录 ============
export interface ReviewLog {
  id?: string;
  userId?: string;
  bookId: string;
  date: string;
  phase: "free_review" | "spot_check";
  mode: "cn_to_en" | "en_to_cn" | "listening" | "mixed";
  totalWords: number;
  correctCount: number;
  completed: boolean;
  createdAt?: string;
}

// ============ ECDICT 词典缓存 ============
export interface DictCacheEntry {
  word: string;
  data: unknown;
}

class VocabDB extends Dexie {
  wordBooks!: Table<WordBook, string>;
  dailyWords!: Table<DailyWord, string>;
  wordPhrases!: Table<WordPhrase, string>;
  wordSynonyms!: Table<WordSynonym, string>;
  errorBook!: Table<ErrorWord, string>;
  learningSessions!: Table<LearningSession, string>;
  reviewLog!: Table<ReviewLog, string>;
  dictCache!: Table<DictCacheEntry, string>;

  constructor() {
    super("DoraNDreamDB_v5");

    this.version(3).stores({
      wordBooks: "id, userId",
      dailyWords: "id, [bookId+date], date, word",
      wordPhrases: "id, word",
      wordSynonyms: "id, word",
      errorBook: "id, [bookId+word], bookId, word, errorRate, weekStart",
      learningSessions: "id, [bookId+date], bookId, date",
      reviewLog: "id, bookId, date, phase",
      dictCache: "word",
    });
  }
}

export const db = new VocabDB();

// ============ 工具函数 ============

/** 获取周一日期 */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

/** 获取今天日期 */
export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

/** 修复旧数据：给没有 orderIndex 的单词分配递增序号 */
export async function fixWordOrder() {
  try {
    const words = await db.dailyWords.toArray();
    const needsFix = words.filter((w) => !w.orderIndex);
    if (needsFix.length === 0) return;

    // 找到已有序号最大值，从那里开始递增
    let maxOrder = words.reduce((max, w) => Math.max(max, w.orderIndex || 0), 0);
    for (const w of words) {
      if (!w.orderIndex) {
        maxOrder++;
        await db.dailyWords.update(w.id!, { orderIndex: maxOrder });
      }
    }
    console.log(`Fixed word order: ${needsFix.length} words`);
  } catch (err) {
    console.error("fixWordOrder:", err);
  }
}
