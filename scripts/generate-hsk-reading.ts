import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

type HskReadingStorySource = {
  id: string;
  level: number;
  order: number;

  title: string;
  pinyinTitle: string;
  myanmarTitle: string;

  category:
    | "daily-life"
    | "school"
    | "friends"
    | "shopping"
    | "travel";

  difficulty:
    | "easy"
    | "medium"
    | "hard";

  estimatedMinutes: number;

  paragraphs: string[];
  pinyinParagraphs: string[];
  myanmarParagraphs: string[];

  keywords: string[];

  audioUrl: string | null;
  audioText: string;
};

const ROOT = process.cwd();

const SOURCE_DIR = path.join(
  ROOT,
  "data",
  "hsk-reading",
  "source",
);

const OUTPUT_DIR = path.join(
  ROOT,
  "data",
  "hsk-reading",
);

function validateStories(
  level: number,
  stories: HskReadingStorySource[],
) {
  const ids = new Set<string>();
  const orders = new Set<number>();

  for (const story of stories) {
    if (story.level !== level) {
      throw new Error(
        `Level mismatch: ${story.id} says level ${story.level}, expected ${level}`,
      );
    }

    if (!story.id.trim()) {
      throw new Error(
        `Missing story id in HSK ${level}`,
      );
    }

    if (ids.has(story.id)) {
      throw new Error(
        `Duplicate story id: ${story.id}`,
      );
    }

    ids.add(story.id);

    if (orders.has(story.order)) {
      throw new Error(
        `Duplicate story order in HSK ${level}: ${story.order}`,
      );
    }

    orders.add(story.order);

    if (!story.title.trim()) {
      throw new Error(
        `Missing title: ${story.id}`,
      );
    }

    if (!story.pinyinTitle.trim()) {
      throw new Error(
        `Missing pinyinTitle: ${story.id}`,
      );
    }

    if (!story.myanmarTitle.trim()) {
      throw new Error(
        `Missing myanmarTitle: ${story.id}`,
      );
    }

    if (story.paragraphs.length === 0) {
      throw new Error(
        `Missing paragraphs: ${story.id}`,
      );
    }

    if (
      story.paragraphs.length !==
      story.pinyinParagraphs.length
    ) {
      throw new Error(
        `Paragraph/Pinyin mismatch: ${story.id}`,
      );
    }

    if (
      story.paragraphs.length !==
      story.myanmarParagraphs.length
    ) {
      throw new Error(
        `Paragraph/Myanmar mismatch: ${story.id}`,
      );
    }

    if (story.keywords.length === 0) {
      throw new Error(
        `Missing keywords: ${story.id}`,
      );
    }

    if (!story.audioText.trim()) {
      throw new Error(
        `Missing audioText: ${story.id}`,
      );
    }
  }
}

async function loadLevel(
  level: number,
): Promise<HskReadingStorySource[]> {
  const sourcePath = path.join(
    SOURCE_DIR,
    `hsk${level}.ts`,
  );

  if (!fs.existsSync(sourcePath)) {
    console.warn(
      `HSK ${level}: source file not found, skipped.`,
    );

    return [];
  }

  const sourceUrl =
    pathToFileURL(sourcePath).href;

  const module =
    await import(sourceUrl);

  const exportName =
    `HSK${level}_READING_STORIES`;

  const stories =
    module[exportName] as
      | HskReadingStorySource[]
      | undefined;

  if (!Array.isArray(stories)) {
    throw new Error(
      `${exportName} export not found in ${sourcePath}`,
    );
  }

  const sorted =
    [...stories].sort(
      (a, b) =>
        a.order - b.order,
    );

  validateStories(
    level,
    sorted,
  );

  return sorted;
}

function writeLevel(
  level: number,
  stories: HskReadingStorySource[],
) {
  fs.mkdirSync(
    OUTPUT_DIR,
    {
      recursive: true,
    },
  );

  const outputPath =
    path.join(
      OUTPUT_DIR,
      `hsk${level}.json`,
    );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      stories,
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    `HSK ${level}: ${stories.length} stories`,
  );
}

async function main() {
  let total = 0;

  for (
    let level = 1;
    level <= 9;
    level += 1
  ) {
    const stories =
      await loadLevel(level);

    if (
      stories.length === 0
    ) {
      continue;
    }

    writeLevel(
      level,
      stories,
    );

    total +=
      stories.length;
  }

  console.log(
    `HSK Reading generation complete.`,
  );

  console.log(
    `Total stories: ${total}`,
  );
}

main().catch(
  (error) => {
    console.error(
      "HSK Reading generation failed:",
      error,
    );

    process.exit(1);
  },
);