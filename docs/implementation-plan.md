# 实施计划

## 分步执行

### 第一步：项目初始化 ✅
- [x] Vite + React + TypeScript 脚手架
- [ ] 安装所有依赖包（`npm install`）
- [x] 配置 Tailwind + PostCSS
- [x] 配置 Vite + PWA 插件
- [x] 创建入口文件、路由、全局样式
- [x] 创建 .env.example 环境变量模板
- [ ] 验证：`npm run dev` 能正常启动

### 第二步：词典数据处理
- [ ] 下载 ECDICT CSV 数据（从 GitHub 或 CDN）
- [ ] 编写 `scripts/prepare-dict.js` 筛选脚本
- [ ] 筛选 `tag` 包含 `ielts` 的词条
- [ ] 转为 JSON 格式
- [ ] 验证：能成功导入 IndexedDB 并查询

### 第三步：Supabase 后端配置
- [ ] 创建 Supabase 项目
- [ ] 配置 Email Auth（启用邮箱注册）
- [ ] 执行 SQL 创建数据库表
- [ ] 配置 Row Level Security 策略
- [ ] 获取 API keys 填入 .env
- [ ] 验证：能成功连接并操作数据库

### 第四步：核心 UI 开发 ✅
- [x] Layout（Notion 风格侧边栏 + 主内容区）
- [x] Sidebar（导航链接）
- [x] ThemeToggle（暗色模式切换）
- [x] WordInput（单词输入 + 自动补全）
- [x] WordTable（单词列表表格）
- [x] PronunciationBtn（发音播放按钮）
- [x] DictationToggle（默写模式切换）
- [ ] 验证：无词典数据时默认空状态正常显示

### 第五步：默写功能 ✅
- [x] 行内默写输入组件（InlineDictation）
- [x] 中文模糊匹配判定
- [x] 答对/答错视觉反馈
- [x] 错题自动入错题集
- [x] 听音模式（隐藏英文+中文）
- [ ] 验证：各模式切换正确、错题集记录准确

### 第六步：复习 + 智能抽查 ✅
- [x] 每日全量自由复习
- [x] 智能单词筛选算法（权重计算）
- [x] 混合随机出题引擎
- [x] 成绩统计报告
- [x] 学习统计页
- [ ] 验证：抽查权重计算正确、模式混合随机

### 第七步：云同步 ✅
- [x] 登录注册页面（Auth）
- [x] Supabase Auth 集成
- [x] 双向同步逻辑（sync.ts）
- [x] 离线功能（IndexedDB 优先）
- [ ] 验证：登录后数据同步、离线可用

### 第八步：部署上线
- [ ] 构建测试（`npm run build`）
- [ ] Vercel 部署配置
- [ ] 环境变量配置
- [ ] PWA 安装测试
- [ ] 跨浏览器兼容性测试
- [ ] 验证：URL 可访问、PWA 可安装

## 验收标准

每步完成后运行以下检查：

1. `npm run build` 无错误
2. 新增功能可用
3. 已有功能不受影响（回归测试）
4. 开发日志记录完整
