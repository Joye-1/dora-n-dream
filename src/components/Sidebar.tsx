import { NavLink } from "react-router-dom";
import { BookOpen, RotateCw, AlertCircle, BarChart3, Home } from "lucide-react";
import { useProfileStore } from "../stores/profileStore";

interface Props {
  bookId?: string;
}

export function Sidebar({ bookId }: Props) {
  const { profileName } = useProfileStore();
  if (!bookId) return null;

  const navItems = [
    { to: `/book/${bookId}`, icon: BookOpen, label: "单词本", end: true },
    { to: `/book/${bookId}/review`, icon: RotateCw, label: "复习抽查" },
    { to: `/book/${bookId}/errors`, icon: AlertCircle, label: "错词集" },
    { to: `/book/${bookId}/stats`, icon: BarChart3, label: "学习统计" },
  ];

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
      <div className="flex h-12 items-center px-4">
        <NavLink
          to="/welcome"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-notion-text hover:text-notion-accent dark:text-notion-text-dark"
        >
          <Home className="h-4 w-4" />
          哆啦N梦
        </NavLink>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-blue-200 px-3 py-3 dark:border-blue-900">
        <div className="rounded-md bg-blue-100 px-3 py-2 text-center text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          👤 {profileName || "本地"}
        </div>
        <NavLink to="/welcome" className="sidebar-link w-full text-xs">
          切换单词本
        </NavLink>
      </div>
    </aside>
  );
}
