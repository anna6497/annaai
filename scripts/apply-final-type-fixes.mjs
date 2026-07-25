import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function patch(filePath, transform) {
  const full = path.join(root, filePath);
  if (!fs.existsSync(full)) {
    console.warn(`Skipped missing file: ${filePath}`);
    return;
  }
  const before = fs.readFileSync(full, "utf8");
  const after = transform(before);
  fs.writeFileSync(full, after, "utf8");
  console.log(`Patched: ${filePath}`);
}

function addHskLevel(content) {
  if (!content.includes('import type { HskLevel } from "@/types/hsk-vocabulary";')) {
    content = 'import type { HskLevel } from "@/types/hsk-vocabulary";\n' + content;
  }
  return content
    .replace(/interface Props\s*\{\s*level:\s*number;\s*\}/m, "interface Props {\n  level: HskLevel;\n}")
    .replace(/\{\s*level:\s*number\s*\}/g, "{ level: HskLevel }");
}

patch("app/hsk/flashcards/[level]/FlashcardsClient.tsx", addHskLevel);
patch("app/hsk/writing/[level]/WritingClient.tsx", addHskLevel);

patch("app/hsk/writing/[level]/lessons/page.tsx", (content) => {
  content = content.replace(
    /interface WritingLesson\s*\{([\s\S]*?)\n\}/m,
    (match, body) =>
      /\bsubtitle\s*\??\s*:/.test(body)
        ? match
        : `interface WritingLesson {${body}\n  subtitle?: string;\n}`,
  );

  content = content.replace(
    /type WritingLesson\s*=\s*\{([\s\S]*?)\n\};/m,
    (match, body) =>
      /\bsubtitle\s*\??\s*:/.test(body)
        ? match
        : `type WritingLesson = {${body}\n  subtitle?: string;\n};`,
  );

  return content;
});

patch("components.example/FlashcardsDataExample.tsx", (content) =>
  content
    .replace(/word\.meaning\.toLowerCase\(\)/g, '(word.meaning ?? "").toLowerCase()')
    .replace(/word\.meaningMyanmar\.includes\(([^)]+)\)/g, '(word.meaningMyanmar ?? "").includes($1)'),
);

console.log("Done. Run: npm run type-check");
