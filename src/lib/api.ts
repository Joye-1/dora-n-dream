const DICT_API = "https://api.dictionaryapi.dev/api/v2/entries/en";

export interface DictAPIResult {
  word: string;
  phonetic?: string;
  phonetics: Array<{ text?: string; audio?: string }>;
  meanings: Array<{
    partOfSpeech: string;
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
    const res = await fetch(`${DICT_API}/${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    const data: DictAPIResult[] = await res.json();
    if (!data.length) return null;

    const synonyms: string[] = [];
    const phrases: { phrase: string; translation: string }[] = [];

    for (const entry of data) {
      for (const meaning of entry.meanings) {
        for (const def of meaning.definitions) {
          for (const syn of def.synonyms || []) {
            if (!synonyms.includes(syn)) synonyms.push(syn);
          }
        }
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
