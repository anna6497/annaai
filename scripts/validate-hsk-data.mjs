import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "hsk1.json",
  "hsk2.json",
  "hsk3.json",
  "hsk4.json",
  "hsk5.json",
  "hsk6.json",
  "hsk7-9.json",
];

let total = 0;
const ids = new Set();

for (const filename of files) {
  const fullPath = path.join(root, "data", "hsk", filename);
  const words = JSON.parse(fs.readFileSync(fullPath, "utf8"));

  if (!Array.isArray(words)) {
    throw new Error(`${filename} must contain an array.`);
  }

  for (const word of words) {
    if (!word.id || !word.hanzi || !word.pinyin) {
      throw new Error(`Invalid record in ${filename}`);
    }

    if (ids.has(word.id)) {
      throw new Error(`Duplicate vocabulary ID: ${word.id}`);
    }

    ids.add(word.id);
  }

  total += words.length;
  console.log(`${filename}: ${words.length}`);
}

console.log(`Total vocabulary: ${total}`);
console.log("HSK vocabulary validation passed.");
