import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Trash2, Loader2 } from "lucide-react";
import { PronunciationBtn } from "../components/PronunciationBtn";
import { db, type WordPhrase, type WordSynonym } from "../lib/db";
import { fetchWordDetails } from "../lib/api";

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

  // 首次进入自动联网查询
  useEffect(() => {
    if (!autoLoaded && decodedWord) {
      handleFetchOnline();
      setAutoLoaded(true);
    }
  }, [decodedWord, autoLoaded]);

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
          <p className="text-sm text-notion-muted">暂无短语，可手动添加或点击「联网查询」</p>
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
          <p className="text-sm text-notion-muted">暂无同义词</p>
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
