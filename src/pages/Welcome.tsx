import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../stores/profileStore";
import { useWordStore } from "../stores/wordStore";
import { BookOpen, Plus, Trash2, User, LogOut } from "lucide-react";

export function Welcome() {
  const navigate = useNavigate();
  const { profileName, profiles, setProfile, addProfile, removeProfile, loadProfiles } =
    useProfileStore();
  const { books, loadBooks, createBook, deleteBook, setCurrentBook } = useWordStore();

  const [newProfileName, setNewProfileName] = useState("");
  const [newBookName, setNewBookName] = useState("");

  useEffect(() => {
    loadProfiles();
    loadBooks();
  }, [loadProfiles, loadBooks]);

  // 选择账户
  const handleSelectProfile = (name: string) => {
    setProfile(name);
  };

  // 创建账户
  const handleCreateProfile = () => {
    const name = newProfileName.trim();
    if (!name) return;
    addProfile(name);
    setProfile(name);
    setNewProfileName("");
  };

  // 退出账户
  const handleLogout = () => {
    setProfile("");
  };

  // 创建单词本
  const handleCreateBook = async () => {
    const name = newBookName.trim();
    if (!name) return;
    const book = await createBook(name);
    setNewBookName("");
    navigate(`/book/${book.id}`);
  };

  // 进入单词本
  const handleEnterBook = (bookId: string) => {
    setCurrentBook(bookId);
    navigate(`/book/${bookId}`);
  };

  // 未选择账户
  if (!profileName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50 dark:bg-blue-950">
        <div className="w-full max-w-md text-center">
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

          {/* 已有账户 */}
          {profiles.length > 0 && (
            <div className="mb-6 space-y-2">
              <p className="text-xs text-notion-muted">选择账户进入：</p>
              {profiles.map((name) => (
                <button
                  key={name}
                  onClick={() => handleSelectProfile(name)}
                  className="flex w-full items-center gap-3 rounded-lg border border-blue-200 bg-white px-4 py-3 text-left hover:bg-blue-50 dark:border-blue-800 dark:bg-blue-900/50 dark:hover:bg-blue-900"
                >
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{name}</span>
                </button>
              ))}
            </div>
          )}

          {/* 创建新账户 */}
          <p className="mb-2 text-xs text-notion-muted">或创建一个新账户：</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateProfile()}
              placeholder="输入你的昵称..."
              className="input-field flex-1 text-center"
              autoFocus
            />
            <button onClick={handleCreateProfile} className="btn-primary gap-1.5">
              <Plus className="h-4 w-4" />
              进入
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 已选择账户 → 显示单词本
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 dark:bg-blue-950">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <img
            src="/images/memory-bread.png"
            alt="记忆面包"
            className="mx-auto h-44 w-auto"
          />
        </div>

        <div className="mb-4 flex items-center justify-center gap-2">
          <User className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">{profileName}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-notion-muted hover:text-notion-red"
            title="切换账户"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>

        <h1 className="mb-2 text-xl font-bold">我的单词本</h1>
        <p className="mb-6 text-sm text-notion-muted">
          考试就能得到的东西就像天下掉馅饼一样😼
        </p>

        {/* 已有的单词本 */}
        {books.length > 0 && (
          <div className="mb-6 space-y-2">
            {books.map((book) => (
              <div
                key={book.id}
                className="flex items-center rounded-lg border border-blue-200 bg-white px-4 py-3 hover:bg-blue-50 dark:border-blue-800 dark:bg-blue-900/50 dark:hover:bg-blue-900"
              >
                <BookOpen className="mr-3 h-4 w-4 text-blue-500" />
                <button
                  onClick={() => handleEnterBook(book.id!)}
                  className="flex-1 text-left text-sm font-medium hover:text-blue-600"
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
            value={newBookName}
            onChange={(e) => setNewBookName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateBook()}
            placeholder="新单词本名称..."
            className="input-field flex-1 text-center"
            autoFocus
          />
          <button onClick={handleCreateBook} className="btn-primary gap-1.5">
            <Plus className="h-4 w-4" />
            创建
          </button>
        </div>

        {/* 删除其他账户 */}
        {profiles.length > 1 && (
          <div className="mt-8 border-t border-blue-200 pt-6 dark:border-blue-800">
            <p className="mb-2 text-xs text-notion-muted">其他账户：</p>
            {profiles
              .filter((p) => p !== profileName)
              .map((name) => (
                <div key={name} className="mb-1 flex items-center justify-center gap-2">
                  <span className="text-sm text-notion-muted">{name}</span>
                  <button
                    onClick={() => removeProfile(name)}
                    className="text-xs text-notion-red hover:underline"
                  >
                    删除
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
