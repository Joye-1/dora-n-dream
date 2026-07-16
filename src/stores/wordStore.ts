import { create } from "zustand";
import { db, type DailyWord, type WordBook, getToday } from "../lib/db";

interface WordState {
  // 单词本
  books: WordBook[];
  currentBookId: string | null;
  loadBooks: () => Promise<void>;
  createBook: (name: string) => Promise<WordBook>;
  deleteBook: (id: string) => Promise<void>;
  setCurrentBook: (id: string) => void;

  // 单词
  todayWords: DailyWord[];
  allWords: DailyWord[];
  loading: boolean;
  loadTodayWords: (bookId: string, date?: string) => Promise<void>;
  loadAllWords: (bookId: string) => Promise<void>;
  addWord: (word: DailyWord) => Promise<void>;
  removeWord: (id: string) => Promise<void>;
}

export const useWordStore = create<WordState>((set, get) => ({
  books: [],
  currentBookId: null,

  loadBooks: async () => {
    const books = await db.wordBooks.toArray();
    set({ books, currentBookId: books[0]?.id || null });
  },

  createBook: async (name) => {
    const book: WordBook = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    };
    await db.wordBooks.put(book);
    await get().loadBooks();
    set({ currentBookId: book.id });
    return book;
  },

  deleteBook: async (id) => {
    await db.wordBooks.delete(id);
    // 删除该单词本下的所有数据
    await db.dailyWords.where("bookId").equals(id).delete();
    await db.errorBook.where("bookId").equals(id).delete();
    await db.learningSessions.where("bookId").equals(id).delete();
    await db.reviewLog.where("bookId").equals(id).delete();
    await get().loadBooks();
    const { books, currentBookId } = get();
    if (currentBookId === id) {
      set({ currentBookId: books[0]?.id || null });
    }
  },

  setCurrentBook: (id) => set({ currentBookId: id }),

  // 单词
  todayWords: [],
  allWords: [],
  loading: false,

  loadTodayWords: async (bookId, date?: string) => {
    const targetDate = date || getToday();
    set({ loading: true });
    const words = await db.dailyWords
      .where("[bookId+date]")
      .equals([bookId, targetDate])
      .toArray();
    words.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    set({ todayWords: words, loading: false });
  },

  loadAllWords: async (bookId) => {
    set({ loading: true });
    const words = await db.dailyWords
      .where("bookId")
      .equals(bookId)
      .toArray();
    words.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    set({ allWords: words, loading: false });
  },

  addWord: async (word) => {
    // 全局递增序号，确保顺序绝对正确
    const all = await db.dailyWords.toArray();
    const maxOrder = all.reduce((max, w) => Math.max(max, w.orderIndex || 0), 0);
    const newWord = { ...word, id: crypto.randomUUID(), orderIndex: maxOrder + 1, createdAt: new Date().toISOString() };
    await db.dailyWords.put(newWord);
    set((state) => ({
      todayWords: [...state.todayWords, newWord],
      allWords: [...state.allWords, newWord],
    }));
  },

  removeWord: async (id) => {
    const word = await db.dailyWords.get(id);
    await db.dailyWords.delete(id);
    // 同步删除错词集中对应单词
    if (word?.bookId) {
      try {
        const allErrors = await db.errorBook.toArray();
        const match = allErrors.find(
          (e) => e.bookId === word.bookId && e.word === word.word
        );
        if (match?.id) {
          await db.errorBook.delete(match.id);
          console.log("同步删除错词集:", word.word);
        }
      } catch (err) {
        console.error("删除错词失败:", err);
      }
    }
    set((state) => ({
      todayWords: state.todayWords.filter((w) => w.id !== id),
      allWords: state.allWords.filter((w) => w.id !== id),
    }));
  },
}));
