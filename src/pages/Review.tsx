import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWordStore } from "../stores/wordStore";
import { db, getToday, getWeekStart, type DailyWord } from "../lib/db";
import { PronunciationBtn } from "../components/PronunciationBtn";
import { playPronunciation } from "../lib/pronunciation";

type QuizMode = "cn_to_en" | "en_to_cn" | "listening" | "mixed";
type Phase = "select" | "quiz" | "feedback" | "result";

export function Review() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { allWords, loadAllWords } = useWordStore();
  const inputRef = useRef<HTMLInputElement>(null);
  // 用 ref 缓存当前题的模式，避免渲染时重新随机
  const currentModeRef = useRef<QuizMode>("cn_to_en");

  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<QuizMode>("mixed");
  const [words, setWords] = useState<DailyWord[]>([]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [lastResult, setLastResult] = useState<boolean | null>(null);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState("");

  useEffect(() => {
    if (bookId) loadAllWords(bookId);
  }, [bookId, loadAllWords]);

  const startQuiz = async (selectedMode: QuizMode) => {
    setMode(selectedMode);
    const errorWords = await db.errorBook.where("bookId").equals(bookId || "").toArray();
    const errorCount: Record<string, number> = {};
    for (const e of errorWords) errorCount[e.word] = e.errorRate;

    const scored = allWords.map((w) => ({
      word: w,
      score:
        (errorCount[w.word] || 0) * 0.6 +
        ((w.collins || 0) * 1.2 +
          (w.bnc > 0 ? Math.max(0, 5 - Math.log10(w.bnc)) : 0) * 0.8) *
          0.4,
    }));
    scored.sort((a, b) => b.score - a.score);

    const count = Math.max(
      Math.ceil(allWords.length * 0.5),
      Math.min(Math.ceil(allWords.length * 0.8), allWords.length)
    );
    const selected = scored
      .slice(0, count)
      .map((s) => s.word)
      .sort(() => Math.random() - 0.5);
    setWords(selected);
    setIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setValue("");
    setLastResult(null);
    setLastCorrectAnswer("");
    // 第一题模式
    currentModeRef.current = selectedMode === "mixed" ? pickMode() : selectedMode;
    setPhase("quiz");

    if (currentModeRef.current === "listening" && selected.length > 0) {
      setTimeout(() => playPronunciation(selected[0].word), 500);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const pickMode = (): QuizMode => {
    if (mode !== "mixed") return mode;
    const modes: QuizMode[] = ["cn_to_en", "en_to_cn", "listening"];
    return modes[Math.floor(Math.random() * 3)];
  };

  // 每次切题时确定本題模式
  const currentWord = words[index];
  const currentMode = currentModeRef.current;

  const handleSubmit = async () => {
    if (!currentWord || !value.trim()) return;

    let isCorrect = false;
    switch (currentMode) {
      case "cn_to_en":
      case "listening":
        isCorrect = value.trim().toLowerCase() === currentWord.word.toLowerCase();
        break;
      case "en_to_cn": {
        const input = value.trim().toLowerCase();
        const translations = currentWord.translation
          .split(/[；;，,]/)
          .map((t) => t.trim().toLowerCase());
        isCorrect = translations.some((t) => t.includes(input) || input.includes(t));
        break;
      }
    }

    if (isCorrect) {
      setScore((s) => ({ ...s, correct: s.correct + 1 }));
    } else {
      setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
      await increaseErrorRate(currentWord, currentMode);
    }

    // 每题显示反馈
    setLastResult(isCorrect);
    setLastCorrectAnswer(`${currentWord.word}: ${currentWord.translation}`);
    setPhase("feedback");

    // 1.2 秒后自动进入下一题
    setTimeout(() => {
      setValue("");
      setLastResult(null);
      setLastCorrectAnswer("");
      if (index < words.length - 1) {
        const next = index + 1;
        setIndex(next);
        currentModeRef.current = mode === "mixed" ? pickMode() : mode;
        setPhase("quiz");
        if (currentModeRef.current === "listening") {
          setTimeout(() => playPronunciation(words[next].word), 200);
        }
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        setPhase("result");
      }
    }, 1200);
  };

  if (phase === "select") {
    return (
      <div>
        <h1 className="mb-6 text-xl font-bold">复习抽查</h1>
        <p className="mb-6 text-sm text-notion-muted">共 {allWords.length} 个单词</p>
        <div className="space-y-3">
          {(["cn_to_en", "en_to_cn", "listening", "mixed"] as QuizMode[]).map((m) => (
            <button key={m} onClick={() => startQuiz(m)} className="btn-ghost mr-2">
              {m === "cn_to_en" && "拼写英文"}
              {m === "en_to_cn" && "默写中文"}
              {m === "listening" && "听音默写"}
              {m === "mixed" && "混合模式"}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "quiz" && currentWord) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="mb-4 text-sm text-notion-muted">
          {index + 1} / {words.length}
        </p>

        {/* 听音模式：只显示播放按钮，不显示单词和中文 */}
        {currentMode === "listening" && (
          <div className="mb-4">
            <PronunciationBtn word={currentWord.word} />
          </div>
        )}
        {/* 拼英文：只显示中文 */}
        {currentMode === "cn_to_en" && (
          <p className="mb-4 text-xl">{currentWord.translation}</p>
        )}
        {/* 默中文：只显示英文 */}
        {currentMode === "en_to_cn" && (
          <p className="mb-4 text-2xl font-bold">{currentWord.word}</p>
        )}

        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="input-field w-64 text-center text-lg"
            placeholder={currentMode === "en_to_cn" ? "输入中文..." : "输入英文..."}
            {...({ inputMode: "latin" } as any)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            lang="en"
          />
          <button onClick={handleSubmit} className="btn-primary">确认</button>
        </div>
      </div>
    );
  }

  if (phase === "feedback") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className={`mb-2 text-2xl font-bold ${lastResult ? "text-notion-green" : "text-notion-red"}`}>
          {lastResult ? "✓ 正确！" : "✗ 错误"}
        </p>
        {!lastResult && (
          <p className="text-sm text-notion-muted">
            正确答案：{lastCorrectAnswer}
          </p>
        )}
      </div>
    );
  }

  if (phase === "result") {
    const total = score.correct + score.wrong;
    const rate = total > 0 ? Math.round((score.correct / total) * 100) : 0;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-2xl font-bold">
          {rate >= 80 ? "🎉 太棒了！" : rate >= 60 ? "💪 继续加油！" : "📚 多多练习！"}
        </h1>
        <p className="mb-2 text-4xl font-bold text-notion-accent">{rate}%</p>
        <p className="mb-6 text-notion-muted">
          正确 {score.correct} / 错误 {score.wrong} / 总计 {total}
        </p>
        <div className="flex gap-3">
          <button onClick={() => setPhase("select")} className="btn-primary">再来一次</button>
          <button onClick={() => { setPhase("select"); setWords([]); }} className="btn-ghost">返回复习选择</button>
        </div>
      </div>
    );
  }
}

async function increaseErrorRate(word: DailyWord, mode: string) {
  const today = getToday();
  const weekStart = getWeekStart();
  const all = await db.errorBook.where("bookId").equals(word.bookId).toArray();
  const existing = all.find((e) => e.word === word.word);
  const errorKey = (
    mode === "cn_to_en" ? "cnToEn" : mode === "en_to_cn" ? "enToCn" : "listening"
  ) as "cnToEn" | "enToCn" | "listening";

  if (existing?.id) {
    const newRate = Math.min(existing.errorRate + 5, 100);
    await db.errorBook.update(existing.id, {
      errorRate: newRate,
      errorTypes: {
        ...existing.errorTypes,
        [errorKey]: (existing.errorTypes[errorKey] || 0) + 1,
      },
      lastErrorDate: today,
      weekStart,
    });
  } else {
    await db.errorBook.put({
      bookId: word.bookId, word: word.word, errorRate: 5,
      errorTypes: { cnToEn: errorKey === "cnToEn" ? 1 : 0, enToCn: errorKey === "enToCn" ? 1 : 0, listening: errorKey === "listening" ? 1 : 0 },
      lastErrorDate: today, weekStart, reviewed: false,
    });
  }
}
