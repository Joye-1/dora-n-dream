/**
 * 有道词典真人发音 API
 * type: 0=美式, 1=英式, 2=英式女声, 3=美式女声
 */
export function getPronunciationUrl(word: string, type: 0 | 1 = 0): string {
  return `https://dict.youdao.com/dictvoice?type=${type}&audio=${encodeURIComponent(word)}`;
}

export function playPronunciation(word: string, type: 0 | 1 = 0): void {
  const audio = new Audio(getPronunciationUrl(word, type));
  audio.play().catch(console.error);
}
