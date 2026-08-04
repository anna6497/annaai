import hsk1Sentences from "@/data/speaking-practice/hsk1.json";
import hsk2Sentences from "@/data/speaking-practice/hsk2.json";
import hsk3Sentences from "@/data/speaking-practice/hsk3.json";
import hsk4Sentences from "@/data/speaking-practice/hsk4.json";
import hsk5Sentences from "@/data/speaking-practice/hsk5.json";
import hsk6Sentences from "@/data/speaking-practice/hsk6.json";

import type { SpeakingPracticeSentence } from "@/lib/speaking-practice/types";

const speakingPracticeByLevel: Record<number, SpeakingPracticeSentence[]> = {
  1: hsk1Sentences as SpeakingPracticeSentence[],
  2: hsk2Sentences as SpeakingPracticeSentence[],
  3: hsk3Sentences as SpeakingPracticeSentence[],
  4: hsk4Sentences as SpeakingPracticeSentence[],
  5: hsk5Sentences as SpeakingPracticeSentence[],
  6: hsk6Sentences as SpeakingPracticeSentence[],
};

export function getSpeakingPracticeLevels(): number[] {
  return Object.keys(speakingPracticeByLevel)
    .map(Number)
    .filter((level) => (speakingPracticeByLevel[level]?.length ?? 0) > 0)
    .sort((a, b) => a - b);
}

export function getSpeakingPracticeSentences(level: number): SpeakingPracticeSentence[] {
  return speakingPracticeByLevel[level] ?? [];
}

export function getSpeakingPracticeSentence(
  level: number,
  sentenceId: string
): SpeakingPracticeSentence | null {
  return getSpeakingPracticeSentences(level).find(
    (sentence) => sentence.id === sentenceId
  ) ?? null;
}

export function getSpeakingPracticeLessons(level: number): number[] {
  return Array.from(
    new Set(getSpeakingPracticeSentences(level).map((sentence) => sentence.lesson))
  ).sort((a, b) => a - b);
}

export function getSpeakingPracticeByLesson(
  level: number,
  lesson: number
): SpeakingPracticeSentence[] {
  return getSpeakingPracticeSentences(level).filter(
    (sentence) => sentence.lesson === lesson
  );
}

export function getSpeakingPracticeCategories(level: number): string[] {
  return Array.from(
    new Set(getSpeakingPracticeSentences(level).map((sentence) => sentence.category))
  ).sort((a, b) => a.localeCompare(b));
}
