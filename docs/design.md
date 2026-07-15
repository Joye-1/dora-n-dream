# 设计规范

## 设计原则

- **简约克制**：Notion 风格，去除多余装饰，以内容为中心
- **一致性**：间距、字号、颜色遵循统一规范
- **可访问性**：足够的对比度，清晰的交互反馈

## 颜色系统

### 亮色模式

| 用途 | 色值 | Tailwind Class |
|------|------|---------------|
| 页面背景 | `#ffffff` | `bg-notion-bg` |
| 侧边栏背景 | `#fbfbfa` | `bg-notion-sidebar` |
| 主文字 | `#37352f` | `text-notion-text` |
| 次要文字 | `#9b9a97` | `text-notion-muted` |
| 边框 | `#e9e9e7` | `border-notion-border` |
| 主题色（链接） | `#2383e2` | `text-notion-accent` |
| 正确/成功 | `#0f7b6c` | `text-notion-green` |
| 错误/危险 | `#e03e3e` | `text-notion-red` |
| 警告 | `#dfab01` | `text-notion-yellow` |

### 暗色模式

| 用途 | 色值 | Tailwind Class |
|------|------|---------------|
| 页面背景 | `#191919` | `dark:bg-notion-bg-dark` |
| 侧边栏背景 | `#1a1a1a` | `dark:bg-notion-sidebar-dark` |
| 主文字 | `#e5e5e5` | `dark:text-notion-text-dark` |
| 次要文字 | `#6b6b6b` | `dark:text-notion-muted-dark` |
| 边框 | `#2f2f2f` | `dark:border-notion-border-dark` |

## 字体

- **主字体**: Inter, system-ui, sans-serif
- **字号层级**:
  - `xs` (12px): 标签、辅助信息
  - `sm` (14px): 正文、按钮、表格内容
  - `base` (15px): 默认正文
  - `lg` (17px): 页面标题
  - `xl` (20px): 大标题
  - `2xl` (24px): 超大标题
- **行高**: 默认 1.5

## 间距

- **组件内间距**: 4px / 8px / 12px / 16px
- **组件间间距**: 16px / 24px / 32px
- **页面边距**: 24px (移动端 16px)
- **侧边栏宽度**: 208px (52 * 4)

## 圆角

- 按钮/输入框: `rounded-md` (6px)
- 卡片: `rounded-lg` (8px)
- 标签: `rounded-md` (6px)

## 组件规范

### 按钮
- **主要按钮** `btn-primary`: 蓝色背景、白色文字、圆角 6px
- **幽灵按钮** `btn-ghost`: 透明背景、灰色文字、悬停显示背景

### 输入框
- **基础样式** `input-field`: 边框、圆角、聚焦蓝色光圈

### 侧边栏导航
- **链接** `sidebar-link`: 图标+文字、悬停高亮
- **激活态** `sidebar-link.active`: 背景高亮

### 卡片
- **基础卡片** `card`: 边框、圆角、内边距

### 表格
- **表头** `table-header`: 大写、小字、灰色
- **单元格** `table-cell`: 底部分割线、内边距

## 交互反馈

| 操作 | 反馈 |
|------|------|
| 按钮悬停 | 背景色变化，100ms 过渡 |
| 输入框聚焦 | 蓝色光圈（ring-2） |
| 答对 | 绿色文字 "✓ 正确" |
| 答错 | 红色文字 "✗ 错误"，显示重试按钮 |
| 加载中 | 文字提示 "加载中..." |
| 空状态 | 居中灰色文字提示 |

## 响应式断点

- **移动端**: < 768px（侧边栏收起）
- **桌面端**: >= 768px（完整侧边栏）
