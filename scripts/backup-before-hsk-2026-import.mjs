import fs from "node:fs/promises";
import path from "node:path";

const source = path.join(process.cwd(), "data", "hsk");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const target = path.join(
  process.cwd(),
  "data",
  "backups",
  `before-hsk-2026-import-${stamp}`,
);

await fs.mkdir(target, { recursive: true });

for (const filename of await fs.readdir(source)) {
  if (!filename.endsWith(".json")) continue;
  await fs.copyFile(
    path.join(source, filename),
    path.join(target, filename),
  );
}

console.log(`Backup created: ${target}`);
