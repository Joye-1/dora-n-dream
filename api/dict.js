/**
 * Vercel Serverless Function - 词典代理
 */
export default async function handler(req, res) {
  const { word } = req.query;
  if (!word) return res.status(400).json({ error: "Missing word" });

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    if (!response.ok) return res.status(200).json(null);
    const data = await response.json();
    return res.status(200).json(data);
  } catch {
    return res.status(200).json(null);
  }
}
