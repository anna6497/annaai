import { notFound } from "next/navigation";

import WritingClient from "../WritingClient";

import type { HskLevel } from "@/types/hsk-vocabulary";

interface PageProps {
  params: Promise<{
    level: string;
    character: string;
  }>;
}

function isValidHskLevel(
  value: number,
): value is HskLevel {
  return (
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 9
  );
}

function isChineseCharacter(
  value: string,
): boolean {
  return /^[\u3400-\u4DBF\u4E00-\u9FFF]$/u.test(
    value,
  );
}

export default async function WritingCharacterPage({
  params,
}: PageProps) {
  const resolvedParams =
    await params;

  const level =
    Number(
      resolvedParams.level,
    );

  let character = "";

  try {
    character =
      decodeURIComponent(
        resolvedParams.character,
      );
  } catch {
    notFound();
  }

  if (
    !isValidHskLevel(level)
  ) {
    notFound();
  }

  if (
    !isChineseCharacter(
      character,
    )
  ) {
    notFound();
  }

  return (
    <WritingClient
      level={level}
      requestedCharacter={
        character
      }
    />
  );
}