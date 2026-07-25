import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const dictionaryPath = path.join(
  projectRoot,
  "data",
  "dictionary",
  "cedict_ts.u8",
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

function normalizePinyin(value) {
  return value
    .toLowerCase()
    .replaceAll("u:", "ü")
    .replaceAll("v", "ü")
    .replace(/[1-5]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDefinition(value) {
  return value
    .replace(/\bCL:[^/]+/gi, "")
    .replace(/\bvariant of [^/]+/gi, "")
    .replace(/\bsee also [^/]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCedict(contents) {
  const entries = new Map();

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(
      /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/$/,
    );

    if (!match) {
      continue;
    }

    const [, traditional, simplified, pinyin, definitionBlock] = match;

    const definitions = definitionBlock
      .split("/")
      .map(cleanDefinition)
      .filter(Boolean)
      .filter(
        (definition) =>
          !definition.toLowerCase().startsWith("surname "),
      );

    if (definitions.length === 0) {
      continue;
    }

    const entry = {
      traditional,
      simplified,
      pinyin,
      normalizedPinyin: normalizePinyin(pinyin),
      definitions,
    };

    const existing = entries.get(simplified) ?? [];
    existing.push(entry);
    entries.set(simplified, existing);
  }

  return entries;
}

function chooseEntry(word, candidates) {
  if (!candidates || candidates.length === 0) {
    return null;
  }

  const normalizedWordPinyin = normalizePinyin(word.pinyin ?? "");

  const pinyinMatch = candidates.find(
    (candidate) =>
      normalizedWordPinyin &&
      candidate.normalizedPinyin === normalizedWordPinyin,
  );

  return pinyinMatch ?? candidates[0];
}

const dictionaryContents = await fs.readFile(dictionaryPath, "utf8");
const dictionary = parseCedict(dictionaryContents);

let total = 0;
let matched = 0;
let unmatched = 0;

const unmatchedRows = [];

for (const filename of hskFiles) {
  const filePath = path.join(projectRoot, "data", "hsk", filename);
  const words = JSON.parse(await fs.readFile(filePath, "utf8"));

  const enriched = words.map((word) => {
    total += 1;

    const candidates = dictionary.get(word.hanzi);
    const match = chooseEntry(word, candidates);

    if (!match) {
      unmatched += 1;
      unmatchedRows.push({
        id: word.id,
        hanzi: word.hanzi,
        pinyin: word.pinyin,
        level: word.level,
      });
      return word;
    }

    matched += 1;

    return {
      ...word,
      traditional: word.traditional || match.traditional,
      meaning: match.definitions.slice(0, 6).join("; "),
      english: match.definitions.slice(0, 6).join("; "),
      dictionaryPinyin: match.pinyin,
      meaningSource: "CC-CEDICT",
    };
  });

  await fs.writeFile(
    filePath,
    JSON.stringify(enriched),
    "utf8",
  );

  console.log(`Updated ${filename}: ${enriched.length} entries`);
}

const unmatchedPath = path.join(
  projectRoot,
  "data",
  "translations",
  "unmatched-cedict.json",
);

await fs.mkdir(path.dirname(unmatchedPath), { recursive: true });
await fs.writeFile(
  unmatchedPath,
  JSON.stringify(unmatchedRows, null, 2),
  "utf8",
);

console.log("");
console.log(`Total HSK entries: ${total}`);
console.log(`Matched: ${matched}`);
console.log(`Unmatched: ${unmatched}`);
console.log(`Unmatched report: ${unmatchedPath}`);
