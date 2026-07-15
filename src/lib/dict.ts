/**
 * ECDICT 词典查询工具
 * 从 IndexedDB 的 dictCache 中查询单词信息
 * 如果本地不存在，返回 null（需要预处理导入）
 */

import { db } from "./db";

export interface DictEntry {
  word: string;
  phonetic: string;
  definition: string;
  translation: string;
  pos: string;
  collins: number;
  oxford: number;
  bnc: number;
  frq: number;
  tag: string;
  exchange: string;
}

/** 在本地词典中搜索单词 */
export async function searchWord(
  query: string
): Promise<DictEntry | null> {
  const cached = await db.dictCache.get(query.toLowerCase());
  if (cached) return cached.data as DictEntry;
  return null;
}

/** 模糊搜索（输入时自动补全） */
export async function searchSuggestions(
  query: string
): Promise<DictEntry[]> {
  if (!query || query.length < 1) return [];

  const lower = query.toLowerCase();
  // 从 dictCache 中前缀匹配
  const all = await db.dictCache
    .where("word")
    .between(lower, lower + "￿")
    .limit(8)
    .toArray();

  return all.map((entry) => entry.data as DictEntry);
}

/** 批量导入词典数据到 IndexedDB */
export async function importDictData(entries: DictEntry[]): Promise<void> {
  // Dexie bulkPut 分批处理，避免一次写入过多导致浏览器卡顿
  const BATCH_SIZE = 500;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE).map((e) => ({
      word: e.word.toLowerCase(),
      data: e,
    }));
    await db.dictCache.bulkPut(batch);
  }
  console.log(`Imported ${entries.length} entries to dictCache`);
}

/** 初始化词典：如果本地没有数据，从静态文件加载 */
let initPromise: Promise<void> | null = null;

export async function initDictionary(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const count = await db.dictCache.count();
    if (count > 0) {
      console.log(`Dictionary already loaded: ${count} entries`);
      return;
    }

    console.log("Loading dictionary data...");
    try {
      const res = await fetch("/data/ecdict_ielts.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const entries: DictEntry[] = await res.json();
      await importDictData(entries);
      console.log(`Dictionary initialized with ${entries.length} entries`);
    } catch (err) {
      console.error("Failed to load dictionary:", err);
    }
  })();

  return initPromise;
}
