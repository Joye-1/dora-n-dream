import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWordStore } from "../stores/wordStore";
import { useDictationStore } from "../stores/dictationStore";
import { DictationToggle } from "../components/DictationToggle";
import { WordInput } from "../components/WordInput";
import { WordTable } from "../components/WordTable";
import { initDictionary, type DictEntry } from "../lib/dict";
import { db, getToday, fixWordOrder } from "../lib/db";
import { Search } from "lucide-react";

export function Home() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { todayWords, books, loadBooks, loadTodayWords, addWord } = useWordStore();
  const bookName = books.find((b) => b.id === bookId)?.name || "单词本";
  const { mode, hideEnglish, hideChinese, memoryTyping } = useDictationStore();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [hasWords, setHasWords] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightWord, setHighlightWord] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initDictionary();
    loadBooks();
    fixWordOrder(); // 修复旧单词排序
  }, []);

  useEffect(() => {
    if (bookId) {
      loadTodayWords(bookId, selectedDate);
    }
  }, [bookId, selectedDate, loadTodayWords]);

  useEffect(() => {
    setHasWords(todayWords.length > 0);
  }, [todayWords]);

  const handleAddWord = async (entry: DictEntry) => {
    if (!bookId) return;
    await addWord({
      bookId,
      date: selectedDate,
      word: entry.word,
      phonetic: entry.phonetic,
      pos: entry.pos,
      translation: entry.translation,
      collins: entry.collins || 0,
      bnc: entry.bnc || 0,
      frq: entry.frq || 0,
      mnemonic: "",
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setShowDatePicker(false);
  };

  // 搜索单词
  const handleSearch = async () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !bookId) return;
    const all = await db.dailyWords.where("bookId").equals(bookId).toArray();
    const found = all.find((w) => w.word.toLowerCase() === q);
    if (found) {
      setSelectedDate(found.date);
      setHighlightWord(found.word);
      setSearchQuery("");
      setTimeout(() => setHighlightWord(""), 2000);
    } else {
      alert(`未找到单词「${searchQuery.trim()}」`);
    }
  };

  return (
    <div>
      {/* 顶部：标题 + 搜索 + 日期 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-notion-text dark:text-notion-text-dark">
            {bookName}
          </h1>
          <div className="relative">
            <button
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setTimeout(() => dateInputRef.current?.showPicker?.(), 100);
              }}
              className="flex items-center gap-1.5 rounded-md bg-notion-sidebar px-3 py-1.5 text-sm text-notion-text hover:bg-notion-border dark:bg-notion-sidebar-dark dark:text-notion-text-dark dark:hover:bg-notion-border-dark"
            >
              📅 {selectedDate}
              {selectedDate === getToday() && (
                <span className="text-xs text-notion-muted">(今天)</span>
              )}
            </button>
            {showDatePicker && (
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="absolute left-0 top-full z-50 mt-1 rounded-md border border-notion-border p-2 text-sm dark:border-notion-border-dark dark:bg-notion-bg-dark dark:text-notion-text-dark"
              />
            )}
          </div>
        </div>

        {/* 搜索框 */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="搜索单词..."
            className="input-field w-36 py-1 text-xs"
          />
          <button onClick={handleSearch} className="btn-ghost p-1.5">
            <Search className="h-4 w-4" />
          </button>
          <span className="text-xs text-notion-muted">
            {todayWords.length} 词
          </span>
        </div>
      </div>

      <WordInput onAdd={handleAddWord} />
      <DictationToggle />
      <WordTable
        words={todayWords}
        hideEnglish={hideEnglish}
        hideChinese={hideChinese}
        memoryTyping={memoryTyping}
        highlightWord={highlightWord}
        onWordClick={(word) => navigate(`/word/${encodeURIComponent(word)}`)}
      />
    </div>
  );
}
