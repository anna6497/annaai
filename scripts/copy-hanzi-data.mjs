import {
  access,
  cp,
  mkdir,
  readdir,
  rm,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();

const sourceDirectory = path.join(
  projectRoot,
  "node_modules",
  "hanzi-writer-data"
);

const outputDirectory = path.join(
  projectRoot,
  "public",
  "hanzi-data"
);

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyHanziData() {
  const sourceExists =
    await pathExists(sourceDirectory);

  if (!sourceExists) {
    console.warn(
      "⚠️ hanzi-writer-data is not installed yet. Skipping copy."
    );

    return;
  }

  await rm(outputDirectory, {
    recursive: true,
    force: true
  });

  await mkdir(outputDirectory, {
    recursive: true
  });

  const entries = await readdir(sourceDirectory, {
    withFileTypes: true
  });

  let copiedFiles = 0;

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    if (!entry.name.endsWith(".json")) {
      continue;
    }

    const sourceFile = path.join(
      sourceDirectory,
      entry.name
    );

    const destinationFile = path.join(
      outputDirectory,
      entry.name
    );

    await cp(sourceFile, destinationFile);

    copiedFiles += 1;
  }

  console.log(
    `✅ Copied ${copiedFiles} Hanzi stroke files to public/hanzi-data`
  );
}

copyHanziData().catch((error) => {
  console.error(
    "❌ Failed to copy Hanzi stroke data:",
    error
  );

  process.exitCode = 1;
});