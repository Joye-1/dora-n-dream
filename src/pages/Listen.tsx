import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWordStore } from "../stores/wordStore";
import { playPronunciation } from "../lib/pronunciation";
import { db, getToday, getWeekStart } from "../lib/db";
import { ArrowLeft } from "lucide-react";

export function Listen() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { allWords, loadAllWords } = useWordStore();

  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    if (bookId) loadAllWords(bookId);
  }, [bookId, loadAllWords]);

  const words = allWords;
  const currentWord = words[index];

  // 播放当前单词
  const playCurrent = useCallback(() => {
    if (currentWord) {
      playPronunciation(currentWord.word, 0);
      setTimeout(() => inputRef.current?.focus(), 600);
    }
  }, [currentWord]);

  // 开始
  const handleStart = () => {
    setStarted(true);
    setIndex(0);
    setResults({});
    setDone(false);
    setValue("");
    hasAutoPlayed.current = false;
    // 自动播放第一个
    setTimeout(() => {
      playCurrent();
      hasAutoPlayed.current = true;
    }, 400);
  };

  // index 变化后自动播放
  useEffect(() => {
    if (started && hasAutoPlayed.current) {
      setTimeout(() => playCurrent(), 200);
    }
  }, [index]);

  // 提交答案
  const handleSubmit = async () => {
    if (!currentWord || !value.trim()) return;

    const isCorrect =
      value.trim().toLowerCase() === currentWord.word.toLowerCase();
    const id = currentWord.id || currentWord.word;
    setResults((prev) => ({ ...prev, [id]: isCorrect }));

    // 错词集：只增不减，答对不修改错词率
    try {
      if (!isCorrect) {
        await updateErrorWord(currentWord.word, bookId || "", "listening");
      }
    } catch (err) {
      console.error("Error book update failed:", err);
    }

    // 清空并跳下一词（无论对错）
    setValue("");
    if (index < words.length - 1) {
      setIndex(index + 1);
      hasAutoPlayed.current = true;
    } else {
      setDone(true);
      setStarted(false);
    }
  };

  // 完成页
  if (done) {
    const correctCount = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h1 className="mb-2 text-2xl font-bold">
          {correctCount === total ? "全部正确！" : "完成！"}
        </h1>
        <p className="mb-2 text-4xl font-bold text-notion-accent">
          {total > 0 ? Math.round((correctCount / total) * 100) : 0}%
        </p>
        <p className="mb-6 text-notion-muted">
          正确 {correctCount} / {total}
        </p>
        <div className="flex gap-3">
          <button onClick={handleStart} className="btn-primary">
            再练一次
          </button>
          <button
            onClick={() => navigate(`/book/${bookId}`)}
            className="btn-ghost"
          >
            返回单词本
          </button>
        </div>
      </div>
    );
  }

  // 开始前
  if (!started) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h1 className="mb-2 text-xl font-bold">听音默写</h1>
        <p className="mb-2 text-notion-muted">共 {words.length} 个单词</p>
        <p className="mb-6 text-sm text-notion-muted">
          点击开始后，播放读音 → 写出英文 → 回车下一词
        </p>
        <button
          onClick={handleStart}
          className="btn-primary px-8 py-3 text-lg"
        >
          开始
        </button>
        <button
          onClick={() => navigate(`/book/${bookId}`)}
          className="btn-ghost mt-3"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回
        </button>
      </div>
    );
  }

  // 答题中
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <p className="mb-8 text-sm text-notion-muted">
        {index + 1} / {words.length}
      </p>

      {/* 播放按钮 */}
      <button
        onClick={playCurrent}
        className="mb-6 rounded-full bg-notion-accent p-6 text-white shadow-lg hover:bg-notion-accent-hover"
      >
        <span className="text-2xl">🔊</span>
      </button>

      <p className="mb-4 text-sm text-notion-muted">
        听读音写出英文单词
      </p>

      {/* 输入区 */}
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          className="input-field w-64 text-center text-xl"
          placeholder="输入英文..."
          {...({ inputMode: "latin" } as any)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          lang="en"
          autoFocus
        />
        <button onClick={handleSubmit} className="btn-primary">
          确认
        </button>
      </div>

      {/* 上一题结果 */}
      {index > 0 && (
        <p
          className={`mt-4 text-sm ${
            results[words[index - 1]?.id || words[index - 1]?.word]
              ? "text-notion-green"
              : "text-notion-red"
          }`}
        >
          {results[words[index - 1]?.id || words[index - 1]?.word]
            ? "✓ 上一题正确"
            : `✗ 上一题错误 → ${words[index - 1]?.word}`}
        </p>
      )}
    </div>
  );
}

/** 工具函数：增加错词率 */
async function updateErrorWord(
  word: string,
  bookId: string,
  errorType: "cnToEn" | "enToCn" | "listening"
) {
  const today = getToday();
  const weekStart = getWeekStart();
  // 使用简单的 filter 查询，兼容所有 Dexie 版本
  const all = await db.errorBook
    .where("bookId")
    .equals(bookId)
    .toArray();
  const existing = all.find((e) => e.word === word);

  if (existing?.id) {
    const newRate = Math.min(existing.errorRate + 5, 100);
    await db.errorBook.update(existing.id, {
      errorRate: newRate,
      errorTypes: {
        ...existing.errorTypes,
        [errorType]: (existing.errorTypes[errorType] || 0) + 1,
      },
      lastErrorDate: today,
      weekStart,
    });
  } else {
    await db.errorBook.put({
      bookId,
      word,
      errorRate: 5,
      errorTypes: {
        cnToEn: errorType === "cnToEn" ? 1 : 0,
        enToCn: errorType === "enToCn" ? 1 : 0,
        listening: errorType === "listening" ? 1 : 0,
      },
      lastErrorDate: today,
      weekStart,
      reviewed: false,
    });
  }
}

