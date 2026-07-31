import hsk1Sentences from "@/data/speaking-practice/hsk1.json";

import type {
  SpeakingPracticeSentence,
} from "@/lib/speaking-practice/types";

const speakingPracticeByLevel: Record<
  number,
  SpeakingPracticeSentence[]
> = {
  1: hsk1Sentences as SpeakingPracticeSentence[],
};

export function getSpeakingPracticeSentences(
  level: number
): SpeakingPracticeSentence[] {
  return speakingPracticeByLevel[level] ?? [];
}

export function getSpeakingPracticeSentence(
  level: number,
  sentenceId: string
): SpeakingPracticeSentence | null {
  const sentences =
    getSpeakingPracticeSentences(level);

  return (
    sentences.find(
      (sentence) =>
        sentence.id === sentenceId
    ) ?? null
  );
}

export function getSpeakingPracticeLessons(
  level: number
): number[] {
  const sentences =
    getSpeakingPracticeSentences(level);

  return Array.from(
    new Set(
      sentences.map(
        (sentence) => sentence.lesson
      )
    )
  ).sort((first, second) => first - second);
}

export function getSpeakingPracticeByLesson(
  level: number,
  lesson: number
): SpeakingPracticeSentence[] {
  return getSpeakingPracticeSentences(
    level
  ).filter(
    (sentence) =>
      sentence.lesson === lesson
  );
}