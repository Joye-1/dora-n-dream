# 数据模型

## Supabase 数据库表

### daily_words（每日单词）

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户ID (FK → auth.users) |
| date | date | 学习日期 |
| word | text | 英文单词 |
| phonetic | text | 音标 |
| pos | text | 词性 |
| translation | text | 中文释义 |
| collins | int | 柯林斯星级 (0-5) |
| bnc | int | BNC词频排名 |
| frq | int | COCA词频排名 |
| created_at | timestamptz | 创建时间 |

**RLS 策略**: 用户只能读写自己的 `user_id` 数据

### word_phrases（单词短语）

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| word | text | 关联单词 |
| phrase | text | 短语内容 |
| translation | text | 中文翻译 |
| source | text | 来源 (manual/api) |
| created_at | timestamptz | 创建时间 |

### word_synonyms（同义词）

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| word | text | 关联单词 |
| synonym | text | 同义词 |
| source | text | 来源 (manual/api) |
| created_at | timestamptz | 创建时间 |

### error_book（错题集）

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户ID (FK → auth.users) |
| word | text | 单词 |
| error_type | text | 错误类型: cn_to_en / en_to_cn / listening |
| wrong_answer | text | 错误答案 |
| correct_answer | text | 正确答案 |
| date | date | 日期 |
| reviewed | boolean | 是否已复习 |
| created_at | timestamptz | 创建时间 |

**RLS 策略**: 用户只能读写自己的 `user_id` 数据

### review_daily_log（每日复习记录）

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户ID (FK → auth.users) |
| date | date | 日期 |
| phase | text | 阶段: free_review / spot_check |
| mode | text | 模式: cn_to_en / en_to_cn / listening / mixed |
| total_words | int | 总题数 |
| correct_count | int | 正确数 |
| completed | boolean | 是否完成 |
| created_at | timestamptz | 创建时间 |

**RLS 策略**: 用户只能读写自己的 `user_id` 数据

## IndexedDB 表（本地）

与 Supabase 表结构基本一致，Dexie.js 管理：

```typescript
// src/lib/db.ts
class VocabDB extends Dexie {
  dailyWords!: Table<DailyWord>;
  wordPhrases!: Table<WordPhrase>;
  wordSynonyms!: Table<WordSynonym>;
  errorBook!: Table<ErrorRecord>;
  reviewLog!: Table<ReviewLog>;
  dictCache!: Table<{ word: string; data: DictEntry }>; // ECDICT 词典缓存
}
```

## 数据同步策略

1. **登录时**: 从 Supabase 拉取全部数据 → 覆盖本地 IndexedDB
2. **数据变更时**: 先写入 IndexedDB → 异步推送 Supabase
3. **冲突解决**: 以最后修改时间为准，云端优先
4. **离线时**: 仅操作 IndexedDB，联网后自动同步
