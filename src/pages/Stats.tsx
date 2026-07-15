import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../lib/db";

export function Stats() {
  const { bookId } = useParams<{ bookId: string }>();
  const [stats, setStats] = useState({
    totalDays: 0,
    totalWords: 0,
    totalErrors: 0,
    totalDuration: 0,
    topErrors: [] as { word: string; rate: number }[],
  });

  const loadData = async () => {
    if (!bookId) return;
    const allWords = await db.dailyWords.toArray();
    const allErrors = await db.errorBook.toArray();
    const allSessions = await db.learningSessions.toArray();
    const words = allWords.filter((w) => w.bookId === bookId);
    const errors = allErrors.filter((e) => e.bookId === bookId);
    const sessions = allSessions.filter((s) => s.bookId === bookId);

      const dates = new Set(words.map((w) => w.date));
    const totalDuration = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
    const topErrors = errors
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10)
      .map((e) => ({ word: e.word, rate: e.errorRate }));

    setStats({
      totalDays: dates.size,
      totalWords: words.length,
      totalErrors: errors.length,
      totalDuration,
      topErrors,
    });
  };

  useEffect(() => {
    loadData();
    // 每30秒自动刷新
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [bookId]);

  const totalMinutes = Math.round(stats.totalDuration / 60);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">学习统计</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="累计天数" value={stats.totalDays} unit="天" />
        <StatCard label="累计单词" value={stats.totalWords} unit="个" />
        <StatCard label="错词数" value={stats.totalErrors} unit="个" />
        <StatCard label="学习时长" value={totalMinutes} unit="分钟" />
      </div>

      {stats.topErrors.length > 0 && (
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold">高频错词 TOP 10</h2>
          <div className="space-y-1.5">
            {stats.topErrors.map(({ word, rate }, i) => (
              <div key={word}
                className="flex items-center gap-3 rounded px-3 py-1.5 text-sm hover:bg-notion-sidebar dark:hover:bg-notion-sidebar-dark">
                <span className="w-5 text-right text-xs text-notion-muted">{i + 1}</span>
                <span className="font-medium">{word}</span>
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-notion-border dark:bg-notion-border-dark">
                    <div className="h-full rounded-full bg-notion-red/50" style={{ width: `${rate}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs text-notion-muted">{rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: number | string; unit: string }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-notion-muted">{unit ? `${label} (${unit})` : label}</p>
    </div>
  );
}
