import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model =
  process.env.MYANMAR_TRANSLATION_MODEL ??
  "gpt-4.1-mini";

const batchSize = Number(
  process.env.MYANMAR_TRANSLATION_BATCH_SIZE ?? 20,
);

const delayMs = Number(
  process.env.MYANMAR_TRANSLATION_DELAY_MS ?? 1200,
);

const projectRoot = process.cwd();

const hskFiles = [
  "hsk1.json",
  "hsk2.json",
  "hsk3.json",
  "hsk4.json",
  "hsk5.json",
  "hsk6.json",
  "hsk7-9.json",
];

const outputPath = path.join(
  projectRoot,
  "data",
  "translations",
  "myanmar-meanings.generated.json",
);

const progressPath = path.join(
  projectRoot,
  "data",
  "translations",
  "myanmar-translation-progress.json",
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function splitAlternativeHanzi(value) {
  return cleanText(value)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean)[0] ?? cleanText(value);
}

function extractJsonArray(text) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("[");
    const end = trimmed.lastIndexOf("]");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error(
        "The model response did not contain a JSON array.",
      );
    }

    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

async function loadAllWords() {
  const all = [];

  for (const filename of hskFiles) {
    const filePath = path.join(
      projectRoot,
      "data",
      "hsk",
      filename,
    );

    const words = JSON.parse(
      await fs.readFile(filePath, "utf8"),
    );

    for (const word of words) {
      const english = cleanText(
        word.meaning ?? word.english,
      );

      if (!english) {
        continue;
      }

      all.push({
        id: String(word.id),
        hanzi: splitAlternativeHanzi(word.hanzi),
        pinyin: cleanText(word.pinyin),
        english,
        level: String(word.level),
      });
    }
  }

  return all;
}

async function loadExisting() {
  try {
    const rows = JSON.parse(
      await fs.readFile(outputPath, "utf8"),
    );

    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

async function saveRows(rows) {
  await fs.mkdir(path.dirname(outputPath), {
    recursive: true,
  });

  await fs.writeFile(
    outputPath,
    JSON.stringify(rows, null, 2),
    "utf8",
  );
}

async function saveProgress(progress) {
  await fs.writeFile(
    progressPath,
    JSON.stringify(progress, null, 2),
    "utf8",
  );
}

async function translateBatch(batch) {
  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content:
          "You are a professional Chinese-to-Myanmar dictionary editor. " +
          "Translate each vocabulary item's English dictionary meaning into concise, natural Myanmar language. " +
          "Use the Hanzi and Pinyin to disambiguate meaning. " +
          "Do not add explanations, examples, numbering, markdown, or romanization. " +
          "Return only a valid JSON array. " +
          "Each output object must contain exactly: id, hanzi, meaningMyanmar. " +
          "Preserve every id exactly. " +
          "Prefer short dictionary-style Myanmar meanings separated by Burmese commas.",
      },
      {
        role: "user",
        content: JSON.stringify(batch),
      },
    ],
  });

  const parsed = extractJsonArray(response.output_text);

  if (!Array.isArray(parsed)) {
    throw new Error("Translation response is not an array.");
  }

  const expectedIds = new Set(
    batch.map((item) => item.id),
  );

  const valid = parsed
    .map((item) => ({
      id: cleanText(item.id),
      hanzi: cleanText(item.hanzi),
      meaningMyanmar: cleanText(
        item.meaningMyanmar,
      ),
    }))
    .filter(
      (item) =>
        expectedIds.has(item.id) &&
        item.meaningMyanmar,
    );

  if (valid.length !== batch.length) {
    const returned = new Set(
      valid.map((item) => item.id),
    );

    const missing = batch
      .filter((item) => !returned.has(item.id))
      .map((item) => item.id);

    throw new Error(
      `Translation batch incomplete. Missing: ${missing.join(", ")}`,
    );
  }

  return valid;
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    "OPENAI_API_KEY is missing from .env.local or the terminal environment.",
  );
}

if (
  !Number.isInteger(batchSize) ||
  batchSize < 1 ||
  batchSize > 50
) {
  throw new Error(
    "MYANMAR_TRANSLATION_BATCH_SIZE must be between 1 and 50.",
  );
}

const allWords = await loadAllWords();
const existing = await loadExisting();

const completedIds = new Set(
  existing
    .filter((row) => cleanText(row.meaningMyanmar))
    .map((row) => cleanText(row.id)),
);

const pending = allWords.filter(
  (word) => !completedIds.has(word.id),
);

console.log(`Model: ${model}`);
console.log(`Words with English meanings: ${allWords.length}`);
console.log(`Already translated: ${completedIds.size}`);
console.log(`Remaining: ${pending.length}`);
console.log(`Batch size: ${batchSize}`);

let output = [...existing];
let completedThisRun = 0;

for (
  let index = 0;
  index < pending.length;
  index += batchSize
) {
  const batch = pending.slice(
    index,
    index + batchSize,
  );

  const batchNumber =
    Math.floor(index / batchSize) + 1;

  const totalBatches = Math.ceil(
    pending.length / batchSize,
  );

  console.log(
    `Translating batch ${batchNumber}/${totalBatches}...`,
  );

  let translated;
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      translated = await translateBatch(batch);
      break;
    } catch (error) {
      lastError = error;

      console.error(
        `Attempt ${attempt} failed:`,
        error instanceof Error
          ? error.message
          : String(error),
      );

      if (attempt < 3) {
        await sleep(delayMs * attempt * 2);
      }
    }
  }

  if (!translated) {
    await saveRows(output);
    await saveProgress({
      model,
      completed: output.length,
      failedBatch: batch.map((item) => item.id),
      error:
        lastError instanceof Error
          ? lastError.message
          : String(lastError),
      updatedAt: new Date().toISOString(),
    });

    throw lastError;
  }

  output.push(...translated);
  completedThisRun += translated.length;

  const unique = new Map();

  for (const row of output) {
    unique.set(String(row.id), row);
  }

  output = [...unique.values()];

  await saveRows(output);
  await saveProgress({
    model,
    totalEnglishWords: allWords.length,
    translated: output.length,
    completedThisRun,
    remaining:
      allWords.length - output.length,
    updatedAt: new Date().toISOString(),
  });

  console.log(
    `Saved ${output.length}/${allWords.length}`,
  );

  await sleep(delayMs);
}

console.log("");
console.log("Myanmar translation generation complete.");
console.log(`Output: ${outputPath}`);
console.log("");
console.log(
  "Review the generated translations before importing them.",
);
console.log(
  "Then run: npm run meanings:myanmar:apply",
);
