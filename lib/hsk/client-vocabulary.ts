"use client";

import type {
  HskLevel,
  HskVocabularyItem,
} from "@/types/hsk-vocabulary";

export async function loadVocabulary(
  level: HskLevel,
): Promise<HskVocabularyItem[]> {
  switch (level) {
    case 1:
      return (await import("@/data/hsk/hsk1.json")).default as HskVocabularyItem[];
    case 2:
      return (await import("@/data/hsk/hsk2.json")).default as HskVocabularyItem[];
    case 3:
      return (await import("@/data/hsk/hsk3.json")).default as HskVocabularyItem[];
    case 4:
      return (await import("@/data/hsk/hsk4.json")).default as HskVocabularyItem[];
    case 5:
      return (await import("@/data/hsk/hsk5.json")).default as HskVocabularyItem[];
    case 6:
      return (await import("@/data/hsk/hsk6.json")).default as HskVocabularyItem[];
    case 7:
    case 8:
    case 9:
      return (await import("@/data/hsk/hsk7-9.json")).default as HskVocabularyItem[];
  }
}
