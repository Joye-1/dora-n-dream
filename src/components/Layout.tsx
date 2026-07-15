import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { LearningTimer } from "./LearningTimer";
import { useTimerStore } from "../stores/timerStore";

export function Layout() {
  const { bookId } = useParams<{ bookId: string }>();

  // 进入主页就开始计时
  useEffect(() => {
    useTimerStore.getState().start();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar bookId={bookId} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-xs text-notion-muted dark:text-notion-muted-dark">
              {new Date().toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </div>
            <ThemeToggle />
          </div>
          <Outlet />
        </div>
      </main>
      {/* 全局学习时长 */}
      <LearningTimer bookId={bookId || ""} />
    </div>
  );
}
