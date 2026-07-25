import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { promisify } from "node:util";

const gunzip = promisify(zlib.gunzip);

const SOURCE_URL =
  "https://cc-cedict.org/editor/editor_export_cedict.php?c=gzip";

const outputDir = path.join(process.cwd(), "data", "dictionary");
const outputFile = path.join(outputDir, "cedict_ts.u8");

await fs.mkdir(outputDir, { recursive: true });

console.log("Downloading the latest CC-CEDICT dictionary...");

const response = await fetch(SOURCE_URL, {
  headers: {
    "User-Agent": "Anna-AI-HSK-Meaning-Importer/1.0",
    "Accept-Encoding": "identity"
  }
});

if (!response.ok) {
  throw new Error(
    `CC-CEDICT download failed: ${response.status} ${response.statusText}`
  );
}

const buffer = Buffer.from(await response.arrayBuffer());

let dictionary;

const isGzip =
  buffer.length >= 2 &&
  buffer[0] === 0x1f &&
  buffer[1] === 0x8b;

if (isGzip) {
  dictionary = await gunzip(buffer);
  console.log("Downloaded gzip file and decompressed it.");
} else {
  dictionary = buffer;
  console.log("Downloaded plain-text dictionary.");
}

const text = dictionary.toString("utf8");

if (
  !text.includes("CC-CEDICT") &&
  !text.match(/^\S+\s+\S+\s+\[[^\]]+\]\s+\/.+\/$/m)
) {
  throw new Error(
    "Downloaded content does not look like a valid CC-CEDICT dictionary."
  );
}

await fs.writeFile(outputFile, dictionary);

console.log(`Saved dictionary to: ${outputFile}`);
console.log(
  `Dictionary size: ${(dictionary.length / 1024 / 1024).toFixed(2)} MB`
);