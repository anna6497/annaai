import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const inputPath =
  process.argv[2] ??
  path.join(
    projectRoot,
    "data",
    "translations",
    "myanmar-meanings.json",
  );

const hskFiles = [
  "hsk1.json",
  "hsk2.json",
  "hsk3.json",
  "hsk4.json",
  "hsk5.json",
  "hsk6.json",
  "hsk7-9.json",
];

const translations = JSON.parse(
  await fs.readFile(inputPath, "utf8"),
);

if (!Array.isArray(translations)) {
  throw new Error(
    "Myanmar translation file must contain a JSON array.",
  );
}

const byId = new Map();
const byHanzi = new Map();

for (const row of translations) {
  if (row.id && row.meaningMyanmar) {
    byId.set(String(row.id), String(row.meaningMyanmar).trim());
  }

  if (row.hanzi && row.meaningMyanmar) {
    byHanzi.set(
      String(row.hanzi),
      String(row.meaningMyanmar).trim(),
    );
  }
}

let updatedCount = 0;

for (const filename of hskFiles) {
  const filePath = path.join(projectRoot, "data", "hsk", filename);
  const words = JSON.parse(await fs.readFile(filePath, "utf8"));

  const updated = words.map((word) => {
    const meaningMyanmar =
      byId.get(String(word.id)) ??
      byHanzi.get(String(word.hanzi));

    if (!meaningMyanmar) {
      return word;
    }

    updatedCount += 1;

    return {
      ...word,
      meaningMyanmar,
      myanmar: meaningMyanmar,
    };
  });

  await fs.writeFile(filePath, JSON.stringify(updated), "utf8");
  console.log(`Updated ${filename}`);
}

console.log(`Imported ${updatedCount} Myanmar meanings.`);
