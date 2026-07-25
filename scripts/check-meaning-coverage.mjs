import fs from "node:fs/promises";
import path from "node:path";

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
let english = 0;
let myanmar = 0;

for (const filename of files) {
  const fullPath = path.join(
    process.cwd(),
    "data",
    "hsk",
    filename,
  );

  const words = JSON.parse(await fs.readFile(fullPath, "utf8"));

  for (const word of words) {
    total += 1;

    if (String(word.meaning ?? word.english ?? "").trim()) {
      english += 1;
    }

    if (String(word.meaningMyanmar ?? word.myanmar ?? "").trim()) {
      myanmar += 1;
    }
  }
}

console.log(`Total vocabulary: ${total}`);
console.log(`English meanings: ${english}`);
console.log(`Myanmar meanings: ${myanmar}`);
console.log(
  `English coverage: ${((english / total) * 100).toFixed(2)}%`,
);
console.log(
  `Myanmar coverage: ${((myanmar / total) * 100).toFixed(2)}%`,
);
