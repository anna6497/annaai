import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(
  await fs.readFile(
    path.join(root, "config", "hsk-2026-counts.json"),
    "utf8",
  ),
);

const files = {
  "1": "hsk1.json",
  "2": "hsk2.json",
  "3": "hsk3.json",
  "4": "hsk4.json",
  "5": "hsk5.json",
  "6": "hsk6.json",
  "7-9": "hsk7-9.json",
};

let total = 0;
let missingPinyin = 0;
let missingEnglish = 0;
let missingMyanmar = 0;
let duplicateIds = 0;

const ids = new Set();

for (const [level, filename] of Object.entries(files)) {
  const words = JSON.parse(
    await fs.readFile(
      path.join(root, "data", "hsk", filename),
      "utf8",
    ),
  );

  const expected =
    config.expectedIncrementalCounts[level];

  if (words.length !== expected) {
    throw new Error(
      `${filename}: expected ${expected}, got ${words.length}`,
    );
  }

  total += words.length;

  for (const word of words) {
    const id = String(word.id);

    if (ids.has(id)) duplicateIds += 1;
    ids.add(id);

    if (!String(word.pinyin ?? "").trim()) {
      missingPinyin += 1;
    }

    if (!String(
      word.meaning ?? word.english ?? "",
    ).trim()) {
      missingEnglish += 1;
    }

    if (!String(
      word.meaningMyanmar ?? word.myanmar ?? "",
    ).trim()) {
      missingMyanmar += 1;
    }
  }
}

console.log({
  total,
  expectedTotal: config.expectedTotal,
  missingPinyin,
  missingEnglish,
  missingMyanmar,
  duplicateIds,
});

if (
  total !== config.expectedTotal ||
  duplicateIds > 0
) {
  process.exitCode = 1;
}
