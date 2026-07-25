import fs from "node:fs";
import path from "node:path";

const wordsPerLesson = Number(process.argv[2] ?? 20);
const root = process.cwd();
const filenames = [
  "hsk1.json",
  "hsk2.json",
  "hsk3.json",
  "hsk4.json",
  "hsk5.json",
  "hsk6.json",
  "hsk7-9.json",
];

if (!Number.isInteger(wordsPerLesson) || wordsPerLesson < 1) {
  throw new Error("Words per lesson must be a positive integer.");
}

for (const filename of filenames) {
  const fullPath = path.join(root, "data", "hsk", filename);
  const words = JSON.parse(fs.readFileSync(fullPath, "utf8"));

  const updated = words.map((word, index) => ({
    ...word,
    lesson: Math.floor(index / wordsPerLesson) + 1,
  }));

  fs.writeFileSync(
    fullPath,
    JSON.stringify(updated),
    "utf8",
  );

  console.log(`Updated ${filename}`);
}
