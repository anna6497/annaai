import fs from "node:fs";
import path from "node:path";

import {
  HSK1_READING_STORIES,
} from "../data/hsk-reading/hsk1";

const root =
  process.cwd();

const outputPath =
  path.join(
    root,
    "data",
    "hsk-reading",
    "hsk1.json",
  );

function main() {
  if (
    !Array.isArray(
      HSK1_READING_STORIES,
    )
  ) {
    throw new Error(
      "HSK1_READING_STORIES is invalid.",
    );
  }

  fs.mkdirSync(
    path.dirname(
      outputPath,
    ),
    {
      recursive: true,
    },
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      HSK1_READING_STORIES,
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    "HSK Reading JSON generated successfully.",
  );

  console.log(
    `Stories: ${HSK1_READING_STORIES.length}`,
  );

  console.log(
    `Output: ${outputPath}`,
  );
}

try {
  main();
} catch (error) {
  console.error(
    "Generation failed:",
    error,
  );

  process.exit(1);
}