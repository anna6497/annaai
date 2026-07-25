import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const mappingPath =
  process.argv[2] ??
  path.join(
    root,
    "data",
    "import",
    "hsk-2026-official-mapping.json",
  );

const config = JSON.parse(
  await fs.readFile(
    path.join(root, "config", "hsk-2026-counts.json"),
    "utf8",
  ),
);

const sourceFiles = [
  "hsk1.json",
  "hsk2.json",
  "hsk3.json",
  "hsk4.json",
  "hsk5.json",
  "hsk6.json",
  "hsk7-9.json",
];

const sourceWords = [];

for (const filename of sourceFiles) {
  const words = JSON.parse(
    await fs.readFile(
      path.join(root, "data", "hsk", filename),
      "utf8",
    ),
  );
  sourceWords.push(...words);
}

const mapping = JSON.parse(
  await fs.readFile(mappingPath, "utf8"),
);

if (!Array.isArray(mapping)) {
  throw new Error("Official mapping must be a JSON array.");
}

const validLevels = new Set([
  "1", "2", "3", "4", "5", "6", "7-9",
]);

for (const row of mapping) {
  if (!row.hanzi || !validLevels.has(String(row.targetLevel))) {
    throw new Error(
      `Invalid mapping row: ${JSON.stringify(row)}`,
    );
  }
}

const byId = new Map(
  sourceWords.map((word) => [String(word.id), word]),
);

const byHanziPinyin = new Map();

for (const word of sourceWords) {
  const key = `${word.hanzi}@@${word.pinyin}`;
  const rows = byHanziPinyin.get(key) ?? [];
  rows.push(word);
  byHanziPinyin.set(key, rows);
}

const output = {
  "1": [],
  "2": [],
  "3": [],
  "4": [],
  "5": [],
  "6": [],
  "7-9": [],
};

const missing = [];
const usedSourceIds = new Set();

for (const row of mapping) {
  let source = null;

  if (row.sourceId && byId.has(String(row.sourceId))) {
    source = byId.get(String(row.sourceId));
  }

  if (!source) {
    const exact =
      byHanziPinyin.get(`${row.hanzi}@@${row.pinyin ?? ""}`) ??
      [];

    if (exact.length === 1) {
      source = exact[0];
    }
  }

  if (!source) {
    const matches = sourceWords.filter(
      (word) => word.hanzi === row.hanzi,
    );

    if (matches.length === 1) {
      source = matches[0];
    }
  }

  if (!source) {
    missing.push(row);
    continue;
  }

  usedSourceIds.add(String(source.id));

  output[String(row.targetLevel)].push({
    ...source,
    level: String(row.targetLevel),
    official2026Level: String(row.targetLevel),
    official2026SourceId: row.id ?? null,
  });
}

const countErrors = [];

for (const [level, expected] of Object.entries(
  config.expectedIncrementalCounts,
)) {
  const actual = output[level].length;

  if (actual !== expected) {
    countErrors.push({
      level,
      actual,
      expected,
      difference: actual - expected,
    });
  }
}

if (missing.length || countErrors.length) {
  await fs.mkdir(
    path.join(root, "data", "audit"),
    { recursive: true },
  );

  await fs.writeFile(
    path.join(
      root,
      "data",
      "audit",
      "hsk-2026-import-errors.json",
    ),
    JSON.stringify(
      {
        missing,
        countErrors,
      },
      null,
      2,
    ),
    "utf8",
  );

  throw new Error(
    `Import blocked. Missing mappings: ${missing.length}; count errors: ${countErrors.length}.`,
  );
}

const targets = {
  "1": "hsk1.json",
  "2": "hsk2.json",
  "3": "hsk3.json",
  "4": "hsk4.json",
  "5": "hsk5.json",
  "6": "hsk6.json",
  "7-9": "hsk7-9.json",
};

for (const [level, filename] of Object.entries(targets)) {
  await fs.writeFile(
    path.join(root, "data", "hsk", filename),
    JSON.stringify(output[level]),
    "utf8",
  );

  console.log(
    `Wrote ${filename}: ${output[level].length} words`,
  );
}

const extras = sourceWords.filter(
  (word) => !usedSourceIds.has(String(word.id)),
);

await fs.mkdir(
  path.join(root, "data", "archive"),
  { recursive: true },
);

await fs.writeFile(
  path.join(
    root,
    "data",
    "archive",
    "hsk-2021-unmapped-extras.json",
  ),
  JSON.stringify(extras, null, 2),
  "utf8",
);

console.log(`Archived unmapped source entries: ${extras.length}`);
console.log("HSK 2026 import completed successfully.");
