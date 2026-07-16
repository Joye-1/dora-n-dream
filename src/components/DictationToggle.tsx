import { useNavigate, useParams } from "react-router-dom";
import { useDictationStore } from "../stores/dictationStore";
import { cn } from "../lib/utils";
import { Eye, EyeOff, Headphones, Shuffle, Pencil } from "lucide-react";

export function DictationToggle() {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const { mode, setMode, hideEnglish, hideChinese, toggleHideEnglish, toggleHideChinese, memoryTyping, toggleMemoryTyping } =
    useDictationStore();

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {/* 浏览模式按钮 */}
      <button
        onClick={() => setMode("browse")}
        className={cn(
          "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          mode === "browse"
            ? "bg-notion-accent text-white"
            : "bg-notion-sidebar text-notion-muted hover:text-notion-text dark:bg-notion-sidebar-dark"
        )}
      >
        浏览模式
      </button>

      {/* 隐藏/显示英文 */}
      <button
        onClick={toggleHideEnglish}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          hideEnglish
            ? "bg-notion-accent text-white"
            : "bg-notion-sidebar text-notion-muted hover:text-notion-text dark:bg-notion-sidebar-dark"
        )}
      >
        {hideEnglish ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        隐藏英文
      </button>

      {/* 隐藏/显示中文 */}
      <button
        onClick={toggleHideChinese}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          hideChinese
            ? "bg-notion-accent text-white"
            : "bg-notion-sidebar text-notion-muted hover:text-notion-text dark:bg-notion-sidebar-dark"
        )}
      >
        {hideChinese ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        隐藏中文
      </button>

      {/* 记忆输入 */}
      <button
        onClick={toggleMemoryTyping}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          memoryTyping
            ? "bg-purple-500 text-white"
            : "bg-notion-sidebar text-notion-muted hover:text-notion-text dark:bg-notion-sidebar-dark"
        )}
      >
        ✍️ 记忆输入
      </button>

      <div className="mx-1 h-5 w-px bg-notion-border dark:bg-notion-border-dark" />

      <button onClick={() => navigate(`/book/${bookId}/listen`)} className="flex items-center gap-1.5 rounded-md bg-notion-sidebar px-3 py-1.5 text-xs font-medium text-notion-muted hover:text-notion-text dark:bg-notion-sidebar-dark">
        <Headphones className="h-3.5 w-3.5" />听音默写
      </button>
      <button onClick={() => navigate(`/book/${bookId}/review`)} className="flex items-center gap-1.5 rounded-md bg-notion-sidebar px-3 py-1.5 text-xs font-medium text-notion-muted hover:text-notion-text dark:bg-notion-sidebar-dark">
        <Shuffle className="h-3.5 w-3.5" />随机抽查
      </button>
    </div>
  );
}
