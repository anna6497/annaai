import fs from "node:fs/promises";
import path from "node:path";

const inputPath = path.join(
  process.cwd(),
  "data",
  "translations",
  "myanmar-meanings.generated.json",
);

const outputPath = path.join(
  process.cwd(),
  "data",
  "translations",
  "myanmar-review-sample.json",
);

const rows = JSON.parse(
  await fs.readFile(inputPath, "utf8"),
);

if (!Array.isArray(rows)) {
  throw new Error("Generated translation file is invalid.");
}

const sampleSize = Math.min(200, rows.length);
const shuffled = [...rows];

for (
  let index = shuffled.length - 1;
  index > 0;
  index -= 1
) {
  const random = Math.floor(
    Math.random() * (index + 1),
  );

  [shuffled[index], shuffled[random]] = [
    shuffled[random],
    shuffled[index],
  ];
}

const sample = shuffled
  .slice(0, sampleSize)
  .map((row) => ({
    ...row,
    approved: false,
    reviewerNote: "",
  }));

await fs.writeFile(
  outputPath,
  JSON.stringify(sample, null, 2),
  "utf8",
);

console.log(
  `Created ${sampleSize}-word review sample: ${outputPath}`,
);
