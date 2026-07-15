import { useEffect, useRef } from "react";
import { db, getToday } from "../lib/db";
import { useTimerStore } from "../stores/timerStore";

interface Props {
  bookId: string;
}

export function LearningTimer({ bookId }: Props) {
  const { seconds, isActive, tick } = useTimerStore();
  const savedRef = useRef(0);

  // 计时
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isActive, tick]);

  // 每10秒保存一次
  useEffect(() => {
    if (!isActive || seconds === 0) return;
    const elapsed = seconds - savedRef.current;
    if (elapsed < 10) return;
    savedRef.current = seconds;

    const today = getToday();
    console.log(`[计时器] 正在保存 ${elapsed} 秒到 ${today}...`);
    db.learningSessions
      .toArray()
      .then((all) => {
        console.log(`[计时器] learningSessions 总记录: ${all.length}`);
        const existing = all.find((s) => s.bookId === bookId && s.date === today);
        if (existing?.id) {
          console.log(`[计时器] 更新已有记录 +${elapsed}s`);
          db.learningSessions.update(existing.id, {
            durationSeconds: existing.durationSeconds + elapsed,
          });
        } else {
          console.log(`[计时器] 创建新记录`);
          db.learningSessions.put({ id: crypto.randomUUID(), bookId, date: today, durationSeconds: elapsed });
        }
      })
      .catch((err) => console.error("[计时器] 保存失败:", err));
  }, [seconds, bookId, isActive]);

  // 保存函数
  const saveElapsed = () => {
    const elapsed = seconds - savedRef.current;
    if (elapsed <= 0) return;
    savedRef.current = seconds;
    const today = getToday();
    db.learningSessions
      .toArray()
      .then((all) => {
        const existing = all.find((s) => s.bookId === bookId && s.date === today);
        if (existing?.id) {
          db.learningSessions.update(existing.id, {
            durationSeconds: existing.durationSeconds + elapsed,
          });
        } else {
          db.learningSessions.put({ bookId, date: today, durationSeconds: elapsed });
        }
      })
      .catch(() => {});
  };

  // 页面卸载时保存
  useEffect(() => {
    window.addEventListener("beforeunload", saveElapsed);
    // 页面隐藏时也保存（切换 tab、锁屏等）
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) saveElapsed();
    });
    return () => {
      window.removeEventListener("beforeunload", saveElapsed);
      document.removeEventListener("visibilitychange", saveElapsed);
    };
  }, [seconds, bookId]);

  // 组件卸载时保存（页面内导航切换）
  useEffect(() => {
    return () => { saveElapsed(); };
  }, [bookId]);

  const formatTime = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // 始终显示，一旦开始计时就保持可见
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-md bg-blue-50 px-3 py-1.5 text-xs text-blue-600 shadow-sm dark:bg-blue-950 dark:text-blue-300">
      {formatTime(seconds)}
    </div>
  );
}
