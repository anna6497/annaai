import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

interface CsvRow {
  hanzi: string;
  pinyin: string;
  myanmar: string;
  radical: string;
  example: string;
  examplePinyin: string;
  exampleMyanmar: string;
}

interface WritingCharacter {
  hanzi: string;
  pinyin: string;
  myanmar: string;
  radical: string;
  example: string;
  examplePinyin: string;
  exampleMyanmar: string;
}

interface LevelResult {
  level: number;
  sourceFile: string;
  outputFile: string;
  totalRows: number;
  validRows: number;
  duplicateCharacters: string[];
  missingStrokeData: string[];
  invalidRows: string[];
  skipped: boolean;
}

const PROJECT_ROOT = process.cwd();

const RAW_DATA_DIRECTORY = path.join(
  PROJECT_ROOT,
  "data",
  "raw",
);

const OUTPUT_DIRECTORY = path.join(
  PROJECT_ROOT,
  "data",
  "hsk-writing",
);

const HANZI_DATA_DIRECTORY = path.join(
  PROJECT_ROOT,
  "public",
  "hanzi-data",
);

const REQUIRED_HEADERS = [
  "hanzi",
  "pinyin",
  "myanmar",
  "radical",
  "example",
  "examplePinyin",
  "exampleMyanmar",
] as const;

function normaliseHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/\s+/g, "");
}

function cleanValue(value: string | undefined): string {
  return (value ?? "").replace(/^\uFEFF/, "").trim();
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];

  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        currentValue += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (character === "," && !insideQuotes) {
      values.push(currentValue);
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  values.push(currentValue);

  return values.map(cleanValue);
}

function parseCsvContent(content: string): string[][] {
  const rows: string[][] = [];

  let currentLine = "";
  let insideQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"') {
      currentLine += character;

      if (insideQuotes && nextCharacter === '"') {
        currentLine += nextCharacter;
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (
      (character === "\n" || character === "\r") &&
      !insideQuotes
    ) {
      if (
        character === "\r" &&
        nextCharacter === "\n"
      ) {
        index += 1;
      }

      if (currentLine.trim().length > 0) {
        rows.push(parseCsvLine(currentLine));
      }

      currentLine = "";
      continue;
    }

    currentLine += character;
  }

  if (currentLine.trim().length > 0) {
    rows.push(parseCsvLine(currentLine));
  }

  return rows;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isSingleChineseCharacter(value: string): boolean {
  const characters = Array.from(value);

  if (characters.length !== 1) {
    return false;
  }

  return /\p{Script=Han}/u.test(characters[0]);
}

function createHeaderMap(headers: string[]): Map<string, number> {
  const headerMap = new Map<string, number>();

  headers.forEach((header, index) => {
    headerMap.set(normaliseHeader(header), index);
  });

  return headerMap;
}

function validateHeaders(headerMap: Map<string, number>): void {
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headerMap.has(header),
  );

  if (missingHeaders.length > 0) {
    throw new Error(
      `Missing CSV headers: ${missingHeaders.join(", ")}`,
    );
  }
}

function getColumnValue(
  row: string[],
  headerMap: Map<string, number>,
  header: (typeof REQUIRED_HEADERS)[number],
): string {
  const columnIndex = headerMap.get(header);

  if (columnIndex === undefined) {
    return "";
  }

  return cleanValue(row[columnIndex]);
}

function convertRow(
  row: string[],
  headerMap: Map<string, number>,
): CsvRow {
  return {
    hanzi: getColumnValue(row, headerMap, "hanzi"),
    pinyin: getColumnValue(row, headerMap, "pinyin"),
    myanmar: getColumnValue(row, headerMap, "myanmar"),
    radical: getColumnValue(row, headerMap, "radical"),
    example: getColumnValue(row, headerMap, "example"),
    examplePinyin: getColumnValue(
      row,
      headerMap,
      "examplePinyin",
    ),
    exampleMyanmar: getColumnValue(
      row,
      headerMap,
      "exampleMyanmar",
    ),
  };
}

function validateRow(
  row: CsvRow,
  rowNumber: number,
): string[] {
  const errors: string[] = [];

  if (!row.hanzi) {
    errors.push(`Row ${rowNumber}: hanzi is missing.`);
  } else if (!isSingleChineseCharacter(row.hanzi)) {
    errors.push(
      `Row ${rowNumber}: "${row.hanzi}" must be one Chinese character.`,
    );
  }

  if (!row.pinyin) {
    errors.push(
      `Row ${rowNumber}: pinyin is missing for "${row.hanzi}".`,
    );
  }

  if (!row.myanmar) {
    errors.push(
      `Row ${rowNumber}: Myanmar meaning is missing for "${row.hanzi}".`,
    );
  }

  if (!row.radical) {
    errors.push(
      `Row ${rowNumber}: radical is missing for "${row.hanzi}".`,
    );
  }

  if (!row.example) {
    errors.push(
      `Row ${rowNumber}: example is missing for "${row.hanzi}".`,
    );
  }

  if (!row.examplePinyin) {
    errors.push(
      `Row ${rowNumber}: examplePinyin is missing for "${row.hanzi}".`,
    );
  }

  if (!row.exampleMyanmar) {
    errors.push(
      `Row ${rowNumber}: exampleMyanmar is missing for "${row.hanzi}".`,
    );
  }

  return errors;
}

async function hasStrokeData(
  hanzi: string,
): Promise<boolean> {
  const strokeFilePath = path.join(
    HANZI_DATA_DIRECTORY,
    `${hanzi}.json`,
  );

  return fileExists(strokeFilePath);
}

function toWritingCharacter(
  row: CsvRow,
): WritingCharacter {
  return {
    hanzi: row.hanzi,
    pinyin: row.pinyin,
    myanmar: row.myanmar,
    radical: row.radical,
    example: row.example,
    examplePinyin: row.examplePinyin,
    exampleMyanmar: row.exampleMyanmar,
  };
}

async function generateLevel(
  level: number,
): Promise<LevelResult> {
  const sourceFile = path.join(
    RAW_DATA_DIRECTORY,
    `hsk-${level}.csv`,
  );

  const outputFile = path.join(
    OUTPUT_DIRECTORY,
    `level-${level}.json`,
  );

  const result: LevelResult = {
    level,
    sourceFile,
    outputFile,
    totalRows: 0,
    validRows: 0,
    duplicateCharacters: [],
    missingStrokeData: [],
    invalidRows: [],
    skipped: false,
  };

  if (!(await fileExists(sourceFile))) {
    result.skipped = true;
    return result;
  }

  const rawContent = await readFile(sourceFile, "utf8");
  const parsedRows = parseCsvContent(rawContent);

  if (parsedRows.length === 0) {
    throw new Error(
      `HSK ${level} CSV file is empty: ${sourceFile}`,
    );
  }

  const [headerRow, ...dataRows] = parsedRows;

  const headerMap = createHeaderMap(headerRow);
  validateHeaders(headerMap);

  result.totalRows = dataRows.length;

  const uniqueCharacters = new Map<
    string,
    WritingCharacter
  >();

  for (
    let index = 0;
    index < dataRows.length;
    index += 1
  ) {
    const rowNumber = index + 2;
    const rawRow = dataRows[index];

    const row = convertRow(rawRow, headerMap);
    const rowErrors = validateRow(row, rowNumber);

    if (rowErrors.length > 0) {
      result.invalidRows.push(...rowErrors);
      continue;
    }

    if (uniqueCharacters.has(row.hanzi)) {
      result.duplicateCharacters.push(row.hanzi);
      continue;
    }

    if (!(await hasStrokeData(row.hanzi))) {
      result.missingStrokeData.push(row.hanzi);
    }

    uniqueCharacters.set(
      row.hanzi,
      toWritingCharacter(row),
    );
  }

  const outputCharacters = Array.from(
    uniqueCharacters.values(),
  );

  result.validRows = outputCharacters.length;

  await writeFile(
    outputFile,
    `${JSON.stringify(outputCharacters, null, 2)}\n`,
    "utf8",
  );

  return result;
}

function printLevelResult(result: LevelResult): void {
  console.log("");
  console.log(`HSK Level ${result.level}`);

  if (result.skipped) {
    console.log(
      `  ⚠️ CSV not found. Skipped: ${result.sourceFile}`,
    );
    return;
  }

  console.log(`  Source rows: ${result.totalRows}`);
  console.log(`  Generated characters: ${result.validRows}`);
  console.log(`  Output: ${result.outputFile}`);

  if (result.duplicateCharacters.length > 0) {
    const duplicates = Array.from(
      new Set(result.duplicateCharacters),
    );

    console.warn(
      `  ⚠️ Duplicate Hanzi: ${duplicates.join(", ")}`,
    );
  } else {
    console.log("  ✅ No duplicate Hanzi");
  }

  if (result.missingStrokeData.length > 0) {
    const missing = Array.from(
      new Set(result.missingStrokeData),
    );

    console.warn(
      `  ⚠️ Missing stroke JSON: ${missing.join(", ")}`,
    );
  } else {
    console.log("  ✅ All stroke JSON files found");
  }

  if (result.invalidRows.length > 0) {
    console.warn("  ⚠️ Invalid rows:");

    for (const error of result.invalidRows) {
      console.warn(`     - ${error}`);
    }
  } else {
    console.log("  ✅ All rows are valid");
  }
}

async function main(): Promise<void> {
  console.log("Generating HSK writing JSON files...");
  console.log(`Project root: ${PROJECT_ROOT}`);

  await mkdir(RAW_DATA_DIRECTORY, {
    recursive: true,
  });

  await mkdir(OUTPUT_DIRECTORY, {
    recursive: true,
  });

  if (!(await fileExists(HANZI_DATA_DIRECTORY))) {
    console.warn("");
    console.warn(
      `⚠️ Hanzi data folder was not found: ${HANZI_DATA_DIRECTORY}`,
    );
    console.warn(
      "Run npm run copy:hanzi before generating HSK data.",
    );
  }

  const results: LevelResult[] = [];

  for (let level = 1; level <= 9; level += 1) {
    const result = await generateLevel(level);

    results.push(result);
    printLevelResult(result);
  }

  const generatedLevels = results.filter(
    (result) => !result.skipped,
  );

  const skippedLevels = results.filter(
    (result) => result.skipped,
  );

  const totalCharacters = generatedLevels.reduce(
    (total, result) => total + result.validRows,
    0,
  );

  const invalidRowCount = generatedLevels.reduce(
    (total, result) =>
      total + result.invalidRows.length,
    0,
  );

  const missingStrokeCount = generatedLevels.reduce(
    (total, result) =>
      total +
      new Set(result.missingStrokeData).size,
    0,
  );

  console.log("");
  console.log("========================================");
  console.log("HSK generation completed");
  console.log("========================================");
  console.log(
    `Generated levels: ${
      generatedLevels.length > 0
        ? generatedLevels
            .map((result) => result.level)
            .join(", ")
        : "none"
    }`,
  );
  console.log(
    `Skipped levels: ${
      skippedLevels.length > 0
        ? skippedLevels
            .map((result) => result.level)
            .join(", ")
        : "none"
    }`,
  );
  console.log(`Total characters: ${totalCharacters}`);
  console.log(`Validation errors: ${invalidRowCount}`);
  console.log(
    `Missing stroke files: ${missingStrokeCount}`,
  );

  if (invalidRowCount > 0) {
    console.error("");
    console.error(
      "❌ Generation finished with invalid CSV rows.",
    );

    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log("✅ HSK writing data generated successfully.");
}

main().catch((error: unknown) => {
  console.error("");
  console.error("❌ HSK generation failed.");

  if (error instanceof Error) {
    console.error(error.message);
    console.error(error.stack);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});