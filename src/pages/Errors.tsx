import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, getToday, getWeekStart, type ErrorWord } from "../lib/db";
import { Shuffle } from "lucide-react";
import { PronunciationBtn } from "../components/PronunciationBtn";
import { playPronunciation } from "../lib/pronunciation";

type EQuizMode = "cn_to_en" | "en_to_cn" | "listening";

function pickMode(): EQuizMode {
  const modes: EQuizMode[] = ["cn_to_en", "en_to_cn", "listening"];
  return modes[Math.floor(Math.random() * 3)];
}

export function Errors() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<ErrorWord[]>([]);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizValue, setQuizValue] = useState("");
  const [quizScore, setQuizScore] = useState({ correct: 0, wrong: 0 });
  const [currentQuizMode, setCurrentQuizMode] = useState<EQuizMode>("cn_to_en");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadErrors = async () => {
    // 直接查全部，不加 filter，确保不丢数据
    const raw = await db.errorBook.toArray();
    console.log("错词集原始数据:", raw.length, "条", raw.map(e => `${e.word}:${e.errorRate}%`));
    const data = raw
      .filter((e) => e.bookId === (bookId || ""))
      .filter((e) => e.errorRate > 0);
    // 按错误率降序
    data.sort((a, b) => b.errorRate - a.errorRate);
    setErrors(data);
  };

  useEffect(() => {
    loadErrors();
  }, [bookId]);

  // 每周清理0%错词
  useEffect(() => {
    const today = getToday();
    const todayWeekStart = getWeekStart();
    // 如果今天是周日，清理上周残留
    if (new Date().getDay() === 0) {
      db.errorBook
        .where("weekStart")
        .below(todayWeekStart)
        .and((e) => e.errorRate === 0)
        .delete()
        .then(() => loadErrors());
    }
  }, []);

  // 混合抽查
  const startQuiz = () => {
    setQuizMode(true);
    setQuizIndex(0);
    setQuizScore({ correct: 0, wrong: 0 });
    setQuizValue("");
    const firstMode = pickMode();
    setCurrentQuizMode(firstMode);
    if (firstMode === "listening" && errors.length > 0) {
      setTimeout(() => playPronunciation(errors[0].word), 500);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleQuizSubmit = async () => {
    const word = errors[quizIndex];
    if (!word || !quizValue.trim()) return;

    let isCorrect = false;
    switch (currentQuizMode) {
      case "cn_to_en":
      case "listening":
        isCorrect = quizValue.trim().toLowerCase() === word.word.toLowerCase();
        break;
      case "en_to_cn": {
        const input = quizValue.trim().toLowerCase();
        // 从 dailyWords 获取翻译进行模糊匹配
        const dw = await db.dailyWords.where("word").equals(word.word).first();
        const trans = dw?.translation || "";
        const translations = trans.split(/[；;，,]/).map((t) => t.trim().toLowerCase());
        isCorrect = translations.some((t) => t.includes(input) || input.includes(t));
        break;
      }
    }

    if (isCorrect) {
      setQuizScore((s) => ({ ...s, correct: s.correct + 1 }));
      const newRate = Math.max(word.errorRate - 5, 0);
      if (newRate === 0) {
        await db.errorBook.delete(word.id!);
      } else {
        await db.errorBook.update(word.id!, { errorRate: newRate });
      }
    } else {
      setQuizScore((s) => ({ ...s, wrong: s.wrong + 1 }));
      const newRate = Math.min(word.errorRate + 5, 100);
      await db.errorBook.update(word.id!, {
        errorRate: newRate,
        lastErrorDate: getToday(),
        weekStart: getWeekStart(),
      });
    }

    setQuizValue("");
    if (quizIndex < errors.length - 1) {
      const next = quizIndex + 1;
      setQuizIndex(next);
      const nextMode = pickMode();
      setCurrentQuizMode(nextMode);
      if (nextMode === "listening") {
        setTimeout(() => playPronunciation(errors[next].word), 200);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      await loadErrors();
      setQuizMode(false);
    }
  };

  if (quizMode && errors.length > 0) {
    const word = errors[quizIndex];
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="mb-2 text-sm text-notion-muted">
          错词抽查 {quizIndex + 1} / {errors.length} · 错误率: {word.errorRate}%
        </p>
        <p className="mb-1 text-xs text-notion-muted">
          {currentQuizMode === "cn_to_en" ? "看中文拼英文" : currentQuizMode === "en_to_cn" ? "看英文默中文" : "听音拼英文"}
        </p>

        {currentQuizMode === "listening" && (
          <div className="mb-4">
            <PronunciationBtn word={word.word} />
          </div>
        )}
        {currentQuizMode === "en_to_cn" && (
          <p className="mb-4 text-2xl font-bold">{word.word}</p>
        )}
        {currentQuizMode === "cn_to_en" && (
          <p className="mb-4 text-xl text-notion-muted">
            {/* 从 dailyWords 查翻译 */}
            <ErrorWordTranslation word={word.word} />
          </p>
        )}

        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={quizValue}
            onChange={(e) => setQuizValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuizSubmit()}
            className="input-field w-64 text-center text-lg"
            placeholder={currentQuizMode === "en_to_cn" ? "输入中文..." : "输入英文..."}
            {...({ inputMode: "latin" } as any)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            lang="en"
          />
          <button onClick={handleQuizSubmit} className="btn-primary">确认</button>
        </div>
      </div>
    );
  }

  // 小工具组件：异步查翻译
  function ErrorWordTranslation({ word: w }: { word: string }) {
    const [trans, setTrans] = useState("");
    useEffect(() => {
      db.dailyWords.where("word").equals(w).first().then((dw) => {
        if (dw) setTrans(dw.translation);
      });
    }, [w]);
    return <>{trans || w}</>;
  }

  if (errors.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="mb-2 text-xl font-bold">错词集</h1>
        <p className="text-notion-muted">暂无错词，继续保持！</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          错词集
          <span className="ml-2 text-sm font-normal text-notion-muted">
            {errors.length} 个错词
          </span>
        </h1>
        <button onClick={startQuiz} className="btn-primary gap-1.5">
          <Shuffle className="h-4 w-4" />
          混合抽查错词
        </button>
      </div>

      <div className="rounded-lg border border-notion-border dark:border-notion-border-dark">
        {errors.map((err) => (
          <div
            key={err.id}
            className="flex items-center gap-4 border-b border-notion-border px-4 py-3 text-sm last:border-b-0 dark:border-notion-border-dark"
          >
            {/* 错误率进度条 */}
            <div className="w-24">
              <div className="mb-0.5 flex justify-between text-xs text-notion-muted">
                <span>错误率</span>
                <span>{err.errorRate}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-notion-border dark:bg-notion-border-dark">
                <div
                  className="h-full rounded-full bg-notion-red transition-all"
                  style={{ width: `${err.errorRate}%` }}
                />
              </div>
            </div>

            <span className="min-w-[80px] font-medium">{err.word}</span>

            {/* 题型分布 */}
            <span className="text-xs text-notion-muted">
              拼{err.errorTypes.cnToEn}次 | 默{err.errorTypes.enToCn}次 | 听{err.errorTypes.listening}次
            </span>

            <PronunciationBtn word={err.word} />

            {err.errorRate >= 100 && (
              <span className="ml-auto text-xs font-medium text-notion-red">
                需连对20次
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
