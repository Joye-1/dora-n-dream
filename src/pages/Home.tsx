import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWordStore } from "../stores/wordStore";
import { useDictationStore } from "../stores/dictationStore";
import { DictationToggle } from "../components/DictationToggle";
import { WordInput } from "../components/WordInput";
import { WordTable } from "../components/WordTable";
import { initDictionary, type DictEntry } from "../lib/dict";
import { getToday } from "../lib/db";

export function Home() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { todayWords, books, loadBooks, loadTodayWords, addWord } = useWordStore();
  const bookName = books.find((b) => b.id === bookId)?.name || "单词本";
  const { mode, hideEnglish, hideChinese } = useDictationStore();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [hasWords, setHasWords] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initDictionary();
    loadBooks();
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
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setShowDatePicker(false);
  };

  return (
    <div>
      {/* 顶部：日期选择 + 标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-notion-text dark:text-notion-text-dark">
            {bookName}
          </h1>

          {/* 日期选择器 */}
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

        <span className="text-xs text-notion-muted">
          {todayWords.length} 个单词
        </span>
      </div>

      {/* 单词输入 */}
      <WordInput onAdd={handleAddWord} />

      {/* 工具栏：隐藏EN/CN + 听音 + 抽查 */}
      <DictationToggle />

      {/* 单词列表 */}
      <WordTable
        words={todayWords}
        hideEnglish={hideEnglish}
        hideChinese={hideChinese}
        onWordClick={(word) => navigate(`/word/${encodeURIComponent(word)}`)}
      />

    </div>
  );
}
