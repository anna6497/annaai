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

let actualTotal = 0;
const report = [];

for (const [level, filename] of Object.entries(files)) {
  const filePath = path.join(root, "data", "hsk", filename);
  const words = JSON.parse(await fs.readFile(filePath, "utf8"));
  const actual = words.length;
  const expected = config.expectedIncrementalCounts[level];
  actualTotal += actual;

  report.push({
    level,
    filename,
    actual,
    expected,
    difference: actual - expected,
    matches: actual === expected,
  });
}

console.table(report);
console.log(`Actual total: ${actualTotal}`);
console.log(`Expected total: ${config.expectedTotal}`);
console.log(`Total difference: ${actualTotal - config.expectedTotal}`);

await fs.mkdir(path.join(root, "data", "audit"), { recursive: true });
await fs.writeFile(
  path.join(root, "data", "audit", "hsk-2026-count-audit.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      actualTotal,
      expectedTotal: config.expectedTotal,
      report,
    },
    null,
    2,
  ),
  "utf8",
);

if (report.some((row) => !row.matches)) {
  process.exitCode = 2;
}
