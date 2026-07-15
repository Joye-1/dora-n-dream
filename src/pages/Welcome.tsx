import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWordStore } from "../stores/wordStore";
import { useTimerStore } from "../stores/timerStore";
import { BookOpen, Plus, Trash2 } from "lucide-react";

export function Welcome() {
  const navigate = useNavigate();
  const { books, loadBooks, createBook, deleteBook, setCurrentBook } =
    useWordStore();
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadBooks();
    useTimerStore.getState().reset(); // 回到首页清零计时
  }, [loadBooks]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    const book = await createBook(name);
    setNewName("");
    navigate(`/book/${book.id}`);
  };

  const handleEnter = (bookId: string) => {
    setCurrentBook(bookId);
    navigate(`/book/${bookId}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-notion-sidebar dark:bg-notion-sidebar-dark">
      <div className="w-full max-w-md text-center">
        {/* 记忆面包插图 */}
        <div className="mb-6 flex justify-center">
          <img
            src="/images/memory-bread.png"
            alt="记忆面包"
            className="mx-auto h-56 w-auto"
          />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-notion-text dark:text-notion-text-dark">
          哆啦N梦
        </h1>
        <p className="mb-8 text-sm text-notion-muted">
          考试就能得到的东西就像天下掉馅饼一样😼
        </p>

        {/* 已有单词本 */}
        {books.length > 0 && (
          <div className="mb-6 space-y-2">
            {books.map((book) => (
              <div
                key={book.id}
                className="flex items-center rounded-lg border border-notion-border px-4 py-3 hover:bg-notion-sidebar dark:border-notion-border-dark dark:hover:bg-notion-sidebar-dark"
              >
                <BookOpen className="mr-3 h-4 w-4 text-notion-muted" />
                <button
                  onClick={() => handleEnter(book.id!)}
                  className="flex-1 text-left text-sm font-medium text-notion-text hover:text-notion-accent dark:text-notion-text-dark"
                >
                  {book.name}
                </button>
                <button
                  onClick={() => deleteBook(book.id!)}
                  className="text-notion-muted hover:text-notion-red"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 新建单词本 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="输入单词本名称..."
            className="input-field flex-1 text-center"
            autoFocus
          />
          <button onClick={handleCreate} className="btn-primary gap-1.5">
            <Plus className="h-4 w-4" />
            创建
          </button>
        </div>
      </div>
    </div>
  );
}
