import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 已登录则跳转首页
  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) {
      setError("请填写邮箱和密码");
      return;
    }
    setLoading(true);
    try {
      const result = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);
      setLoading(false);
      if (result.error) {
        setError(result.error);
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      setLoading(false);
      setError("网络连接失败，云同步服务暂不可用。请使用离线模式——数据会保存在本地浏览器中。");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-notion-sidebar dark:bg-notion-sidebar-dark">
      <div className="w-full max-w-sm rounded-lg border border-notion-border bg-notion-bg p-8 shadow-sm dark:border-notion-border-dark dark:bg-notion-bg-dark">
        <h1 className="mb-1 text-center text-xl font-bold">
          哆啦N梦
        </h1>
        <p className="mb-6 text-center text-sm text-notion-muted">
          雅思背单词助手
        </p>

        <div className="mb-4 flex rounded-lg bg-notion-sidebar p-1 dark:bg-notion-sidebar-dark">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              isLogin
                ? "bg-notion-bg text-notion-text shadow-sm dark:bg-notion-bg-dark dark:text-notion-text-dark"
                : "text-notion-muted"
            }`}
          >
            登录
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              !isLogin
                ? "bg-notion-bg text-notion-text shadow-sm dark:bg-notion-bg-dark dark:text-notion-text-dark"
                : "text-notion-muted"
            }`}
          >
            注册
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <input
            type="password"
            placeholder="密码（至少6位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          {error && (
            <p className="text-xs text-notion-red">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "处理中..." : isLogin ? "登录" : "注册"}
          </button>
        </div>

        <button
          onClick={() => navigate("/", { replace: true })}
          className="mt-4 w-full text-center text-xs text-notion-muted hover:text-notion-text"
        >
          跳过，离线使用
        </button>
      </div>
    </div>
  );
}
