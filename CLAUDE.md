# 哆啦N梦 - 记忆面包背单词

## 项目概述
跨平台（Mac/iPad/Windows）PWA 背单词应用，专注于雅思备考。

## 快速开始

```bash
# 安装依赖
npm install

# 准备词典数据（首次运行）
npm run prepare-dict

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目文档

所有标准文档位于 [docs/](docs/) 目录：

| 文档 | 路径 | 说明 |
|------|------|------|
| 产品需求文档 | [docs/requirements.md](docs/requirements.md) | 功能需求、用户场景 |
| 技术架构文档 | [docs/architecture.md](docs/architecture.md) | 技术栈、架构设计 |
| 设计规范 | [docs/design.md](docs/design.md) | UI/UX 设计规范 |
| 数据模型 | [docs/data-model.md](docs/data-model.md) | 数据库表结构 |
| 实施计划 | [docs/implementation-plan.md](docs/implementation-plan.md) | 分步开发计划 |
| API 接口文档 | [docs/api.md](docs/api.md) | 外部 API 说明 |

## 开发日志

每日开发记录在 [devlog/](devlog/) 目录，格式：`YYYY-MM-DD.md`

## 工作约定

1. **分步推进**：按 `docs/implementation-plan.md` 中的步骤执行，每步确认验收后进入下一步
2. **开发日志**：每次开发结束后更新 `devlog/` 中当天的日志文件
3. **先读文档**：开始任何开发前先阅读 `docs/` 中对应的标准文档
4. **代码规范**：遵循 `docs/design.md` 中的 UI 设计规范
5. **数据操作**：所有增删改操作参考 `docs/data-model.md`
6. **API 调用**：外部 API 使用参考 `docs/api.md`

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS + shadcn/ui (Notion 风格)
- **状态管理**: Zustand
- **本地存储**: Dexie.js (IndexedDB)
- **云服务**: Supabase (Auth + PostgreSQL)
- **发音**: 有道 DictVoice API
- **词典数据**: ECDICT (IELTS 筛选)
- **部署**: Vercel

## 环境变量

复制 `.env.example` 为 `.env` 并填入 Supabase 配置：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
