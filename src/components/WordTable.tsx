import { useState, useRef, useCallback } from "react";
import { DailyWord } from "../lib/db";
import { InlineDictation } from "./InlineDictation";
import { PronunciationBtn } from "./PronunciationBtn";
import { useWordStore } from "../stores/wordStore";

interface Props {
  words: DailyWord[];
  hideEnglish: boolean;
  hideChinese: boolean;
  onWordClick: (word: string) => void;
}

export function WordTable({ words, hideEnglish, hideChinese, onWordClick }: Props) {
  const { removeWord } = useWordStore();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    wordId: string;
  } | null>(null);
  // 自动聚焦下一行：用计数器触发
  const [focusIndex, setFocusIndex] = useState(0);

  const handleSubmitted = useCallback(() => {
    setFocusIndex((i) => i + 1);
  }, []);

  if (words.length === 0) {
    return (
      <div className="py-16 text-center text-notion-muted dark:text-notion-muted-dark">
        <p className="text-lg">还没有添加单词</p>
        <p className="mt-1 text-sm">在上方输入英文单词开始学习</p>
      </div>
    );
  }

  const showEnglish = !hideEnglish;
  const showChinese = !hideChinese;
  const showPhonetic = !hideEnglish; // 隐藏英文时同时隐藏音标

  const handleContextMenu = (e: React.MouseEvent, wordId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, wordId });
  };

  const handleDelete = (wordId: string) => {
    removeWord(wordId);
    setContextMenu(null);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-notion-border dark:border-notion-border-dark">
      <table className="w-full">
        <thead>
          <tr className="border-b border-notion-border bg-notion-sidebar dark:border-notion-border-dark dark:bg-notion-sidebar-dark">
            <th className="table-header w-8 text-center">#</th>
            <th className="table-header w-10">发音</th>
            {showEnglish && <th className="table-header text-left">单词</th>}
            {showPhonetic && <th className="table-header text-left">音标</th>}
            <th className="table-header text-left">词性</th>
            {showChinese && <th className="table-header text-left">中文意思</th>}
            {(hideEnglish || hideChinese) && <th className="table-header text-left">默写</th>}
          </tr>
        </thead>
        <tbody>
          {words.map((word, index) => (
            <tr
              key={word.id}
              className="group border-b border-notion-border transition-colors hover:bg-notion-sidebar dark:border-notion-border-dark dark:hover:bg-notion-sidebar-dark"
              onContextMenu={(e) => word.id && handleContextMenu(e, word.id)}
            >
              <td className="table-cell text-center text-xs text-notion-muted">
                {index + 1}
              </td>

              {/* 发音在最前面 */}
              <td className="table-cell text-center">
                <PronunciationBtn word={word.word} />
              </td>

              {showEnglish && (
                <td className="table-cell">
                  <button
                    onClick={() => onWordClick(word.word)}
                    className="font-medium text-notion-accent hover:text-notion-accent-hover hover:underline"
                  >
                    {word.word}
                  </button>
                </td>
              )}

              {showPhonetic && (
                <td className="table-cell font-mono text-xs text-notion-muted">
                  {word.phonetic}
                </td>
              )}

              <td className="table-cell">
                <span className="rounded bg-notion-border px-1.5 py-0.5 text-xs dark:bg-notion-border-dark">
                  {word.pos}
                </span>
              </td>

              {showChinese && (
                <td className="table-cell">{word.translation}</td>
              )}

              {(hideEnglish || hideChinese) && (
                <td className="table-cell min-w-[180px]">
                  <InlineDictation
                    word={word}
                    hideEnglish={hideEnglish}
                    hideChinese={hideChinese}
                    onSubmitted={handleSubmitted}
                    autoFocus={index === focusIndex}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 rounded-md border border-notion-border bg-notion-bg py-1 shadow-lg dark:border-notion-border-dark dark:bg-notion-bg-dark"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => handleDelete(contextMenu.wordId)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-notion-red hover:bg-notion-sidebar dark:hover:bg-notion-sidebar-dark"
            >
              删除此行
            </button>
          </div>
        </>
      )}
    </div>
  );
}
