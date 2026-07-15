import { useState, useRef, useEffect } from "react";
import { DailyWord, db, getToday, getWeekStart } from "../lib/db";

interface Props {
  word: DailyWord;
  hideEnglish: boolean;
  hideChinese: boolean;
  onSubmitted?: () => void; // 提交后回调，用于聚焦下一行
  autoFocus?: boolean;
}

export function InlineDictation({ word, hideEnglish, hideChinese, onSubmitted, autoFocus }: Props) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async () => {
    if (!value.trim() || submitted) return;

    let isCorrect = false;
    let errorType: "cnToEn" | "enToCn" = "cnToEn";
    let correctAnswer = "";

    if (hideEnglish) {
      isCorrect = value.trim().toLowerCase() === word.word.toLowerCase();
      correctAnswer = word.word;
      errorType = "cnToEn";
    } else if (hideChinese) {
      const answer = value.trim().toLowerCase();
      const translations = word.translation
        .split(/[；;，,]/)
        .map((t) => t.trim().toLowerCase());
      isCorrect = translations.some((t) => t.includes(answer) || answer.includes(t));
      correctAnswer = word.translation;
      errorType = "enToCn";
    }

    setCorrect(isCorrect);
    setSubmitted(true);

    if (!isCorrect) {
      try {
        await handleError(word, errorType, correctAnswer);
        console.log("错词集已记录:", word.word);
      } catch (err) {
        console.error("错词集写入失败:", err);
      }
    }
    // 提交后通知父组件聚焦下一行
    onSubmitted?.();
  };

  if (submitted) {
    return (
      <span className={correct ? "text-notion-green font-medium" : "text-notion-red font-medium"}>
        {correct ? "✓" : "✗"}
        {!correct && (
          <button
            onClick={() => {
              setSubmitted(false);
              setValue("");
              setCorrect(null);
            }}
            className="ml-2 text-xs text-notion-accent hover:underline"
          >
            重试
          </button>
        )}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSubmit();
      }}
      placeholder={hideEnglish ? "输入英文..." : "输入中文..."}
      className="input-field py-1 text-sm"
      {...({ inputMode: "latin" } as any)}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      lang="en"
      autoFocus={autoFocus}
    />
  );
}

/** 答错：更新错词集错误率 */
async function handleError(
  word: DailyWord,
  errorType: "cnToEn" | "enToCn",
  _correctAnswer: string
) {
  await updateErrorWord(word.bookId, word.word, errorType);
}

/** 答对：降低错误率（-5%，到0%清除） */
async function handleCorrect(word: DailyWord) {
  await reduceErrorWord(word.bookId, word.word);
}

// === 错词集通用工具函数 ===

async function updateErrorWord(
  bookId: string,
  word: string,
  errorType: "cnToEn" | "enToCn" | "listening"
) {
  const today = getToday();
  const weekStart = getWeekStart();
  console.log("错词集写入开始:", { bookId, word, errorType });
  const all = await db.errorBook.where("bookId").equals(bookId).toArray();
  console.log("当前错词集总数:", all.length);
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
    console.log("错词集已更新:", word, newRate + "%");
  } else {
    const id = crypto.randomUUID();
    await db.errorBook.put({
      id,
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
    console.log("错词集新增:", word, "5%");
  }
}

async function reduceErrorWord(bookId: string, word: string) {
  const all = await db.errorBook.where("bookId").equals(bookId).toArray();
  const existing = all.find((e) => e.word === word);
  if (existing?.id && existing.errorRate > 0) {
    const newRate = Math.max(existing.errorRate - 5, 0);
    if (newRate === 0) {
      await db.errorBook.delete(existing.id);
    } else {
      await db.errorBook.update(existing.id, { errorRate: newRate, reviewed: true });
    }
  }
}
