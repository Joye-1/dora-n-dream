// 使用 Vercel 服务端代理，避免国内浏览器直接访问被墙
const DICT_API = "/api/dict";

export interface DictAPIResult {
  word: string;
  phonetic?: string;
  phonetics: Array<{ text?: string; audio?: string }>;
  meanings: Array<{
    partOfSpeech: string;
    synonyms: string[];
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms: string[];
    }>;
  }>;
}

export interface WordDetails {
  phrases: { phrase: string; translation: string }[];
  synonyms: string[];
}

export async function fetchWordDetails(word: string): Promise<WordDetails | null> {
  try {
    const res = await fetch(`${DICT_API}?word=${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    const data: DictAPIResult[] = await res.json();
    if (!data.length) return null;

    const synonyms: string[] = [];
    const phrases: { phrase: string; translation: string }[] = [];

    for (const entry of data) {
      for (const meaning of entry.meanings) {
        // 同义词在 meaning 级别
        for (const syn of meaning.synonyms || []) {
          if (!synonyms.includes(syn)) synonyms.push(syn);
        }
        // 例句 + 释义
        for (const def of meaning.definitions) {
          if (def.example) {
            const clean = def.example.replace(new RegExp(word, "gi"), "___");
            phrases.push({ phrase: clean, translation: def.definition });
          }
        }
      }
    }

    return {
      phrases: phrases.slice(0, 10),
      synonyms: synonyms.slice(0, 20),
    };
  } catch {
    return null;
  }
}
