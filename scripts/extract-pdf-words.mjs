#!/usr/bin/env node

/**
 * 从 PDF 中提取英文单词，匹配 ECDICT 词典，补充到词库
 * 用法：node scripts/extract-pdf-words.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PDF_PATH = path.join(__dirname, "..", "雅思真经_all_1783222290359.pdf");
const DICT_PATH = path.join(__dirname, "..", "node_modules", "ecdict", "data", "dict.json");
const CURRENT_JSON = path.join(__dirname, "..", "public", "data", "ecdict_ielts.json");

async function main() {
  console.log("=== PDF 单词提取工具 ===\n");

  console.log("正在解析 PDF...");
  const pdfBuffer = new Uint8Array(fs.readFileSync(PDF_PATH));
  const doc = await getDocument({ data: pdfBuffer }).promise;
  console.log(`PDF 页数: ${doc.numPages}`);

  let allText = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    allText += pageText + "\n";
    if (i % 10 === 0) process.stdout.write(`\r解析中... ${i}/${doc.numPages} 页`);
  }
  console.log(`\r解析完成: ${doc.numPages} 页, ${allText.length.toLocaleString()} 字符\n`);

  console.log("提取英文单词...");
  const wordRegex = /\b[a-zA-Z]{2,}\b/g;
  const rawWords = allText.match(wordRegex) || [];
  const uniqueWords = [...new Set(rawWords.map((w) => w.toLowerCase()))];
  const stopWords = new Set(["the","and","for","are","but","not","you","all","can","had","her","was","one","our","out","has","have","been","were","its","also","such","than","that","this","with","from","they","will","would","there","their","which","about","these","other","after","some","could","them","then","those","over","into","more","each","what","when","make","like","just","very","come","only","see","use","get","may","who","how","new","any","way","day","now","say","set","put","got","let","etc","ie","eg","per","via","due","ago"]);
  const filteredWords = uniqueWords.filter((w) => w.length >= 3 && !stopWords.has(w));
  console.log(`提取单词: ${uniqueWords.length.toLocaleString()} → 过滤后: ${filteredWords.length.toLocaleString()}\n`);

  console.log("加载现有词库...");
  const currentDict = JSON.parse(fs.readFileSync(CURRENT_JSON, "utf-8"));
  const existingWords = new Set(currentDict.map((e) => e.word.toLowerCase()));
  console.log(`现有词库: ${existingWords.size.toLocaleString()} 词条\n`);

  console.log("匹配 ECDICT 词典...");
  const ecdict = JSON.parse(fs.readFileSync(DICT_PATH, "utf-8"));
  const ecdictMap = {};
  for (const [key, entry] of Object.entries(ecdict)) {
    ecdictMap[(entry.word || key).toLowerCase()] = entry;
  }
  console.log(`ECDICT 总量: ${Object.keys(ecdict).length.toLocaleString()}`);

  let added = 0;
  let notFound = 0;

  function extractPos(def) {
    if (!def) return "";
    const match = def.match(/^([a-z]+\.)/);
    return match ? match[1] : "";
  }

  for (const word of filteredWords) {
    if (existingWords.has(word)) continue;
    const entry = ecdictMap[word];
    if (entry) {
      currentDict.push({
        word: entry.word || word,
        phonetic: entry.phonetic || "",
        definition: entry.definition || "",
        translation: entry.translation || "",
        pos: entry.pos || extractPos(entry.definition),
        collins: parseInt(entry.collins) || 0,
        oxford: parseInt(entry.oxford) || 0,
        bnc: parseInt(entry.bnc) || 0,
        frq: parseInt(entry.frq) || 0,
        tag: (entry.tag || "") + " pdf-ielts",
        exchange: entry.exchange || "",
      });
      added++;
      existingWords.add(word);
    } else {
      notFound++;
    }
  }

  fs.writeFileSync(CURRENT_JSON, JSON.stringify(currentDict, null, 2), "utf-8");
  const stats = fs.statSync(CURRENT_JSON);

  console.log(`\n=== 结果 ===`);
  console.log(`PDF 新增词条: ${added.toLocaleString()}`);
  console.log(`ECDICT 也找不到的: ${notFound.toLocaleString()}`);
  console.log(`词库总数: ${currentDict.length.toLocaleString()}`);
  console.log(`文件大小: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log("\n完成 ✓");
}

main().catch((err) => {
  console.error("处理失败:", err.message);
  process.exit(1);
});
