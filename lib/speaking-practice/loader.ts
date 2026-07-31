import level1Sentences from "@/data/speaking-practice/level-1.json";
import type { SpeakingPracticeSentence } from "./types";

const speakingPracticeByLevel: Record<
  number,
  SpeakingPracticeSentence[]
> = {
  1: level1Sentences as SpeakingPracticeSentence[],
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
  const sentences = getSpeakingPracticeSentences(level);

  return sentences.find((sentence) => sentence.id === sentenceId) ?? null;
}