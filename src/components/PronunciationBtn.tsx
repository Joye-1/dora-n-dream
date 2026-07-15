import { Volume2 } from "lucide-react";
import { playPronunciation } from "../lib/pronunciation";
import { useState } from "react";

interface Props {
  word: string;
  type?: 0 | 1;
}

export function PronunciationBtn({ word, type = 0 }: Props) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    setPlaying(true);
    playPronunciation(word, type);
    setTimeout(() => setPlaying(false), 800);
  };

  return (
    <button
      onClick={handlePlay}
      className={`btn-ghost p-1.5 ${playing ? "text-notion-accent" : ""}`}
      title={`播放发音 (${type === 0 ? "美式" : "英式"})`}
    >
      <Volume2 className={`h-4 w-4 ${playing ? "scale-110" : ""} transition-transform`} />
    </button>
  );
}
