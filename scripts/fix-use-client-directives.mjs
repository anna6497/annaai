import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

const targetFiles = [
  "app/hsk/flashcards/[level]/FlashcardsClient.tsx",
  "app/hsk/writing/[level]/WritingClient.tsx",
];

function fixUseClientDirective(relativePath) {
  const fullPath = path.join(
    projectRoot,
    relativePath,
  );

  if (!fs.existsSync(fullPath)) {
    console.error(
      `File not found: ${relativePath}`,
    );

    process.exitCode = 1;
    return;
  }

  let content = fs.readFileSync(
    fullPath,
    "utf8",
  );

  // Remove BOM when present.
  content = content.replace(
    /^\uFEFF/,
    "",
  );

  // Remove every existing use-client directive,
  // regardless of its current position.
  content = content.replace(
    /^\s*["']use client["'];?\s*/gm,
    "",
  );

  // Remove excessive blank lines at the beginning.
  content = content.replace(
    /^\s+/,
    "",
  );

  // Add the directive as the first expression.
  const fixedContent =
    `"use client";\n\n${content}`;

  fs.writeFileSync(
    fullPath,
    fixedContent,
    "utf8",
  );

  console.log(
    `Fixed: ${relativePath}`,
  );
}

for (const targetFile of targetFiles) {
  fixUseClientDirective(targetFile);
}

console.log("");
console.log(
  'Both client directives were moved to line 1.',
);