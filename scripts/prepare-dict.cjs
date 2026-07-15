#!/usr/bin/env node

/**
 * ECDICT 词典数据预处理脚本（使用本地 npm 包数据）
 *
 * 从 node_modules/ecdict/data/dict.json 读取数据
 * 筛选 tag 包含 "ielts" 的词条，输出到 src/data/ecdict_ielts.json
 */

const fs = require("fs");
const path = require("path");

const DICT_PATH = path.join(__dirname, "..", "node_modules", "ecdict", "data", "dict.json");
const OUTPUT_PATH = path.join(__dirname, "..", "public", "data", "ecdict_ielts.json");
const DATA_DIR = path.join(__dirname, "..", "public", "data");

function main() {
  console.log("=== ECDICT 词典数据预处理 ===\n");

  if (!fs.existsSync(DICT_PATH)) {
    console.error("错误: 找不到 dict.json，请先运行 npm install");
    process.exit(1);
  }

  // 读取数据
  console.log("正在读取词典数据...");
  const allData = JSON.parse(fs.readFileSync(DICT_PATH, "utf-8"));
  console.log(`总词条: ${Object.keys(allData).length.toLocaleString()}`);

  // 筛选各类考试词汇：中考/高考/四级/六级/考研/雅思/托福/GRE
  const TARGET_TAGS = ["zk", "gk", "cet4", "cet6", "ky", "ielts", "toefl", "gre"];
  console.log("筛选考试词汇:", TARGET_TAGS.join(", "));
  const words = [];

  function extractPos(definition) {
    if (!definition) return "";
    const match = definition.match(/^([a-z]+\.)/);
    return match ? match[1] : "";
  }

  for (const [key, entry] of Object.entries(allData)) {
    const tag = (entry.tag || "").toLowerCase();
    if (TARGET_TAGS.some((t) => tag.includes(t))) {
      words.push({
        word: entry.word || key,
        phonetic: entry.phonetic || "",
        definition: entry.definition || "",
        translation: entry.translation || "",
        pos: entry.pos || extractPos(entry.definition),
        collins: parseInt(entry.collins) || 0,
        oxford: parseInt(entry.oxford) || 0,
        bnc: parseInt(entry.bnc) || 0,
        frq: parseInt(entry.frq) || 0,
        tag: entry.tag || "",
        exchange: entry.exchange || "",
      });
    }
  }

  console.log(`筛选结果: ${words.length.toLocaleString()} 词条`);

  // 确保目录存在
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 写入 JSON
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(words, null, 2), "utf-8");
  const stats = fs.statSync(OUTPUT_PATH);

  console.log(`\n输出文件: ${OUTPUT_PATH}`);
  console.log(`文件大小: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`词条数: ${words.length.toLocaleString()}`);
  console.log("\n完成 ✓");
}

main();
