import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Trash2, Loader2, Brain, Network } from "lucide-react";
import { PronunciationBtn } from "../components/PronunciationBtn";
import { db, type WordPhrase, type WordSynonym } from "../lib/db";
import { fetchWordDetails } from "../lib/api";
import { findMnemonicAsync } from "../lib/wordroots";

export function WordDetail() {
  const { word } = useParams<{ word: string }>();
  const navigate = useNavigate();
  const decodedWord = decodeURIComponent(word || "");

  const [phrases, setPhrases] = useState<WordPhrase[]>([]);
  const [synonyms, setSynonyms] = useState<WordSynonym[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [showPhraseInput, setShowPhraseInput] = useState(false);
  const [showSynonymInput, setShowSynonymInput] = useState(false);
  const [newPhrase, setNewPhrase] = useState({ phrase: "", translation: "" });
  const [newSynonym, setNewSynonym] = useState("");

  useEffect(() => {
    loadLocalData();
  }, [decodedWord]);

  // 首次进入自动联网查询（延迟确保 DOM ready）
  useEffect(() => {
    if (!autoLoaded && decodedWord) {
      const timer = setTimeout(() => {
        handleFetchOnline();
        setAutoLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [decodedWord]);

  const loadLocalData = async () => {
    const p = await db.wordPhrases.where("word").equals(decodedWord).toArray();
    const s = await db.wordSynonyms.where("word").equals(decodedWord).toArray();
    setPhrases(p);
    setSynonyms(s);
  };

  const handleFetchOnline = async () => {
    setLoading(true);
    try {
      const data = await fetchWordDetails(decodedWord);
      if (data) {
        for (const p of data.phrases) {
          await db.wordPhrases.put({
            word: decodedWord,
            phrase: p.phrase,
            translation: p.translation,
            source: "api",
          });
        }
        for (const s of data.synonyms) {
          await db.wordSynonyms.put({
            word: decodedWord,
            synonym: s,
            source: "api",
          });
        }
        await loadLocalData();
      }
    } catch (err) {
      console.error("Failed to fetch word details:", err);
    }
    setLoading(false);
  };

  const handleAddPhrase = async () => {
    if (!newPhrase.phrase.trim()) return;
    await db.wordPhrases.put({
      word: decodedWord,
      phrase: newPhrase.phrase,
      translation: newPhrase.translation,
      source: "manual",
    });
    setNewPhrase({ phrase: "", translation: "" });
    setShowPhraseInput(false);
    await loadLocalData();
  };

  const handleAddSynonym = async () => {
    if (!newSynonym.trim()) return;
    await db.wordSynonyms.put({
      word: decodedWord,
      synonym: newSynonym,
      source: "manual",
    });
    setNewSynonym("");
    setShowSynonymInput(false);
    await loadLocalData();
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 gap-1.5">
        <ArrowLeft className="h-4 w-4" />返回
      </button>

      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-bold">{decodedWord}</h1>
        <PronunciationBtn word={decodedWord} type={0} />
        <PronunciationBtn word={decodedWord} type={1} />
      </div>

      {/* 联想记忆 */}
      <MnemonicEditor word={decodedWord} />

      {/* 单词家族 */}
      <WordFamily word={decodedWord} />

      {/* 短语区 */}
      <section className="card mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">短语搭配</h2>
          <div className="flex gap-2">
            <button onClick={handleFetchOnline} disabled={loading} className="btn-ghost gap-1 text-xs">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              {loading ? "查询中..." : "联网查询"}
            </button>
            <button onClick={() => setShowPhraseInput(!showPhraseInput)} className="btn-ghost gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" />添加短语
            </button>
          </div>
        </div>

        {showPhraseInput && (
          <div className="mb-3 flex gap-2">
            <input className="input-field" placeholder="短语" value={newPhrase.phrase}
              onChange={(e) => setNewPhrase({ ...newPhrase, phrase: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAddPhrase()} />
            <input className="input-field" placeholder="中文翻译" value={newPhrase.translation}
              onChange={(e) => setNewPhrase({ ...newPhrase, translation: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAddPhrase()} />
            <button onClick={handleAddPhrase} className="btn-primary text-xs">确认</button>
          </div>
        )}

        {loading && phrases.length === 0 ? (
          <p className="text-sm text-notion-muted">联网查询中...</p>
        ) : phrases.length === 0 ? (
          <p className="text-sm text-notion-muted">
            暂无短语，可手动添加或查询：
            <span className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
              <DictLink href={`https://dict.eudic.net/dicts/en/${encodeURIComponent(decodedWord)}`} label="欧陆词典" />
              <DictLink href={`https://www.youdao.com/result?word=${encodeURIComponent(decodedWord)}&lang=en`} label="有道词典" />
            </span>
          </p>
        ) : (
          <ul className="space-y-2">
            {phrases.map((p) => (
              <li key={p.id}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-notion-sidebar dark:hover:bg-notion-sidebar-dark">
                <span className="font-medium">{p.phrase}</span>
                <div className="flex items-center gap-3">
                  <span className="text-notion-muted">{p.translation}</span>
                  <span className="text-xs text-notion-muted">{p.source === "api" ? "自动" : "手动"}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 同义词区 */}
      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">同义词</h2>
          <button onClick={() => setShowSynonymInput(!showSynonymInput)} className="btn-ghost gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />添加同义词
          </button>
        </div>
        {showSynonymInput && (
          <div className="mb-3 flex gap-2">
            <input className="input-field" placeholder="输入同义词" value={newSynonym}
              onChange={(e) => setNewSynonym(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSynonym()} />
            <button onClick={handleAddSynonym} className="btn-primary text-xs">确认</button>
          </div>
        )}
        {loading && synonyms.length === 0 ? (
          <p className="text-sm text-notion-muted">联网查询中...</p>
        ) : synonyms.length === 0 ? (
          <p className="text-sm text-notion-muted">
            暂无同义词，可查询：
            <span className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
              <DictLink href={`https://www.thesaurus.com/browse/${encodeURIComponent(decodedWord)}`} label="Thesaurus" />
            </span>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {synonyms.map((s) => (
              <span key={s.id}
                className="inline-flex items-center gap-1 rounded-full bg-notion-sidebar px-3 py-1 text-sm dark:bg-notion-sidebar-dark">
                {s.synonym}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** 联想记忆：优先手写词库，算法兜底 */
async function autoGenerateMnemonic(w: string): Promise<string> {
  return findMnemonicAsync(w);
}

/** 联想记忆编辑器 */
function MnemonicEditor({ word }: { word: string }) {
  const [mnemonic, setMnemonic] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    db.dailyWords.where("word").equals(word).first().then(async (dw) => {
      if (dw?.mnemonic) {
        setMnemonic(dw.mnemonic);
      } else {
        const auto = await autoGenerateMnemonic(word);
        if (auto) setMnemonic(auto);
      }
    });
  }, [word]);

  const handleSave = async () => {
    const dw = await db.dailyWords.where("word").equals(word).first();
    if (dw?.id) {
      await db.dailyWords.update(dw.id, { mnemonic: mnemonic.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  return (
    <section className="card mb-4">
      <div className="mb-2 flex items-center gap-2">
        <Brain className="h-4 w-4 text-purple-500" />
        <h2 className="text-sm font-semibold">联想记忆</h2>
      </div>
      <div className="flex gap-2">
        <textarea
          className="input-field flex-1"
          rows={2}
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
          placeholder="自动生成中..."
        />
        <button onClick={handleSave} className="btn-primary text-xs self-end">
          {saved ? "已保存 ✓" : "保存"}
        </button>
      </div>
    </section>
  );
}

/** 单词家族：展示词性转换相关词 */
function WordFamily({ word }: { word: string }) {
  const [family, setFamily] = useState<Array<{ word: string; meaning: string }>>([]);

  useEffect(() => {
    fetch("/data/wordfamilies.json")
      .then((r) => r.json())
      .then((data) => {
        const lower = word.toLowerCase();
        // 查这个词本身和它的变形
        const result = data[lower] || [];
        // 也查是否作为派生词出现在其他词下
        if (result.length === 0) {
          for (const [base, derived] of Object.entries(data) as [string, any][]) {
            if (derived.some((d: any) => d.word === lower)) {
              result.push({ word: base, meaning: "原形" });
              result.push(...derived.filter((d: any) => d.word !== lower));
              break;
            }
          }
        }
        setFamily(result);
      })
      .catch(() => {});
  }, [word]);

  if (family.length === 0) return null;

  return (
    <section className="card mb-4">
      <div className="mb-2 flex items-center gap-2">
        <Network className="h-4 w-4 text-green-500" />
        <h2 className="text-sm font-semibold">单词家族</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {family.map((f, i) => (
          <span key={i} className="rounded-full bg-green-50 px-3 py-1 text-sm dark:bg-green-900/30">
            <span className="font-medium">{f.word}</span>
            <span className="ml-1 text-xs text-notion-muted">{f.meaning}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/** 词典链接小组件 */
function DictLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" className="text-xs text-notion-accent hover:underline whitespace-nowrap">
      {label} →
    </a>
  );
}
