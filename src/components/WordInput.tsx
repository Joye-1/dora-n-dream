import { useState, useRef, useEffect } from "react";
import { searchSuggestions, type DictEntry } from "../lib/dict";
import { playPronunciation } from "../lib/pronunciation";

interface Props {
  onAdd: (entry: DictEntry) => void;
}

export function WordInput({ onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<DictEntry[]>([]);
  const [selected, setSelected] = useState<DictEntry | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ word: "", phonetic: "", pos: "", translation: "" });
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      setShowManual(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await searchSuggestions(query);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      // 无匹配时允许手动添加
      setShowManual(results.length === 0);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (entry: DictEntry) => {
    playPronunciation(entry.word, 0);
    onAdd(entry);
    setQuery("");
    setSelected(null);
    setShowDropdown(false);
    setShowManual(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleManualAdd = () => {
    const word = query.trim();
    if (!word) return;
    playPronunciation(word, 0);
    onAdd({
      word,
      phonetic: manual.phonetic || "",
      definition: "",
      translation: manual.translation || "",
      pos: manual.pos || "",
      collins: 0, oxford: 0, bnc: 0, frq: 0,
      tag: "manual",
      exchange: "",
    });
    setQuery("");
    setManual({ word: "", phonetic: "", pos: "", translation: "" });
    setShowManual(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="relative mb-4">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
        }}
        placeholder="输入英文单词添加...（无匹配时可手动填写）"
        className="input-field"
        onKeyDown={(e) => {
          if (e.key === "Enter" && query.trim()) {
            if (suggestions.length > 0) {
              handleSelect(suggestions[0]);
            } else if (showManual) {
              handleManualAdd();
            }
          }
        }}
      />

      {/* 自动补全下拉 */}
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-notion-border bg-notion-bg shadow-lg dark:border-notion-border-dark dark:bg-notion-bg-dark">
          {suggestions.slice(0, 6).map((entry) => (
            <button
              key={entry.word}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-notion-sidebar dark:hover:bg-notion-sidebar-dark"
              onClick={() => handleSelect(entry)}
            >
              <span className="font-medium">{entry.word}</span>
              <span className="text-notion-muted">{entry.phonetic}</span>
              <span className="ml-auto truncate text-notion-muted">
                {entry.translation?.split(/[；;，,]/)[0]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 无匹配时手动输入表单 */}
      {showManual && query.trim() && (
        <div className="mt-2 rounded-md border border-notion-yellow/50 bg-notion-yellow/5 p-3 dark:border-notion-yellow/30">
          <p className="mb-2 text-xs text-notion-muted">
            词库中未找到「{query}」，可以手动填写信息后添加：
          </p>
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="音标（可选）"
              value={manual.phonetic}
              onChange={(e) => setManual({ ...manual, phonetic: e.target.value })}
            />
            <input
              className="input-field w-20"
              placeholder="词性"
              value={manual.pos}
              onChange={(e) => setManual({ ...manual, pos: e.target.value })}
            />
            <input
              className="input-field flex-1"
              placeholder="中文翻译"
              value={manual.translation}
              onChange={(e) => setManual({ ...manual, translation: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleManualAdd()}
            />
            <button onClick={handleManualAdd} className="btn-primary text-xs whitespace-nowrap">
              确认添加
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
