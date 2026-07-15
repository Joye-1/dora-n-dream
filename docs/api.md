# API 接口文档

## 有道词典发音 API

**用途**: 获取英文单词真人发音 MP3

**接口**: `GET https://dict.youdao.com/dictvoice`

**参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| type | int | 0=美式, 1=英式, 2=英式女声, 3=美式女声 |
| audio | string | 单词（URL 编码） |

**示例**:
```
https://dict.youdao.com/dictvoice?type=0&audio=apple
```

**响应**: `audio/mpeg` (MP3 音频流)

**限制**: 约 1000 次/天/IP，个人学习使用免费

---

## Free Dictionary API

**用途**: 获取单词英文释义、例句、同义词

**接口**: `GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}`

**示例**:
```
https://api.dictionaryapi.dev/api/v2/entries/en/abandon
```

**响应格式**:
```json
[{
  "word": "abandon",
  "phonetic": "/əˈbændən/",
  "phonetics": [{
    "text": "/əˈbændən/",
    "audio": "https://..."
  }],
  "meanings": [{
    "partOfSpeech": "verb",
    "definitions": [{
      "definition": "give up completely",
      "example": "he abandoned his plan",
      "synonyms": ["give up", "discontinue"]
    }]
  }]
}]
```

**限制**: 无认证，公开免费使用

---

## 使用方式

```typescript
// 发音
import { playPronunciation } from "@/lib/pronunciation";
playPronunciation("apple", 0); // 美式发音

// 查词
import { fetchWordDetails } from "@/lib/api";
const result = await fetchWordDetails("abandon");
// → { phrases: [...], synonyms: [...] }
```

## 词典数据处理

### ECDICT 数据下载

- 仓库: https://github.com/skywind3000/ECDICT
- 文件: `ecdict.csv`
- 格式: CSV (UTF-8)

### CSV 字段说明

| 字段 | 说明 |
|------|------|
| word | 单词 |
| phonetic | 音标 |
| definition | 英文释义 |
| translation | 中文释义 |
| pos | 词性 |
| collins | 柯林斯星级 |
| oxford | 牛津核心词标记 |
| tag | 考试标签 (ielts/toefl/cet4/cet6/...) |
| bnc | BNC词频 |
| frq | COCA词频 |
| exchange | 时态变换 |
| detail | 扩展JSON信息 |

### 筛选逻辑

```javascript
// 筛选 tag 包含 "ielts" 的词条
if (row.tag && row.tag.includes('ielts')) {
  // 保留
}
```

预计筛选后约 5000-8000 个雅思核心词汇。
