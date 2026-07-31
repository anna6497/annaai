import type { PronunciationScore } from "./types";

function normalizeChineseText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, "")
    .replace(/[，。！？、,.!?;；:“”"'（）()]/g, "");
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculatePronunciationScore(
  targetText: string,
  recognizedText: string,
  durationSeconds?: number
): PronunciationScore {
  const target = Array.from(normalizeChineseText(targetText));
  const recognized = Array.from(normalizeChineseText(recognizedText));

  const maxLength = Math.max(target.length, recognized.length, 1);
  const minLength = Math.min(target.length, recognized.length);

  let correctCount = 0;

  const incorrectCharacters: Array<{
    expected: string;
    recognized: string;
  }> = [];

  for (let index = 0; index < minLength; index += 1) {
    if (target[index] === recognized[index]) {
      correctCount += 1;
    } else {
      incorrectCharacters.push({
        expected: target[index],
        recognized: recognized[index],
      });
    }
  }

  const missingCharacters =
    recognized.length < target.length
      ? target.slice(recognized.length)
      : [];

  const extraCharacters =
    recognized.length > target.length
      ? recognized.slice(target.length)
      : [];

  const accuracy = clampScore((correctCount / maxLength) * 100);

  const completeness = clampScore(
    (Math.min(recognized.length, target.length) / target.length) * 100
  );

  let fluency = 100;

  if (durationSeconds && durationSeconds > 0) {
    const estimatedIdealDuration = Math.max(1.5, target.length * 0.45);
    const durationDifference = Math.abs(
      durationSeconds - estimatedIdealDuration
    );

    fluency = clampScore(
      100 - (durationDifference / estimatedIdealDuration) * 40
    );
  }

  const overall = clampScore(
    accuracy * 0.55 + completeness * 0.3 + fluency * 0.15
  );

  return {
    overall,
    accuracy,
    completeness,
    fluency,
    targetText,
    recognizedText,
    missingCharacters,
    extraCharacters,
    incorrectCharacters,
  };
}