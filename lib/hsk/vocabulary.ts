import type { HskLevel, HskVocabularyItem } from "@/types/hsk-vocabulary";
import hsk1 from "@/data/hsk/hsk1.json";
import hsk2 from "@/data/hsk/hsk2.json";
import hsk3 from "@/data/hsk/hsk3.json";
import hsk4 from "@/data/hsk/hsk4.json";
import hsk5 from "@/data/hsk/hsk5.json";
import hsk6 from "@/data/hsk/hsk6.json";
import hskAdvanced from "@/data/hsk/hsk7-9.json";

function normalize(item: HskVocabularyItem, requestedLevel: HskLevel): HskVocabularyItem {
  const firstExample = item.examples?.[0];
  return {
    ...item,
    level: requestedLevel,
    lesson: typeof item.lesson === "number" ? item.lesson : null,
    english: item.meaning ?? item.english ?? "Meaning pending",
    myanmar: item.meaningMyanmar ?? item.myanmar ?? "မြန်မာအဓိပ္ပါယ် မထည့်ရသေးပါ",
    example: firstExample?.hanzi ?? item.example ?? "",
    examplePinyin: firstExample?.pinyin ?? item.examplePinyin ?? "",
    exampleMyanmar:
      firstExample?.meaningMyanmar ??
      firstExample?.meaning ??
      item.exampleMyanmar ??
      "",
    tags: item.partOfSpeech ?? item.tags ?? [],
  };
}

const RAW: Record<HskLevel, HskVocabularyItem[]> = {
  1: hsk1 as unknown as HskVocabularyItem[],
  2: hsk2 as unknown as HskVocabularyItem[],
  3: hsk3 as unknown as HskVocabularyItem[],
  4: hsk4 as unknown as HskVocabularyItem[],
  5: hsk5 as unknown as HskVocabularyItem[],
  6: hsk6 as unknown as HskVocabularyItem[],
  7: hskAdvanced as unknown as HskVocabularyItem[],
  8: hskAdvanced as unknown as HskVocabularyItem[],
  9: hskAdvanced as unknown as HskVocabularyItem[],
};

export function getVocabulary(level: HskLevel): HskVocabularyItem[] {
  return RAW[level].map((item) => normalize(item, level));
}

export function getVocabularyCount(level: HskLevel): number {
  return RAW[level].length;
}

export function getVocabularyById(level: HskLevel, id: string): HskVocabularyItem | null {
  return getVocabulary(level).find((word) => String(word.id) === id) ?? null;
}

export function searchVocabulary(level: HskLevel, query: string): HskVocabularyItem[] {
  const q = query.trim().toLowerCase();
  const words = getVocabulary(level);
  if (!q) return words;

  return words.filter((word) =>
    [
      word.hanzi,
      word.traditional ?? "",
      word.pinyin,
      word.pinyinSearch ?? "",
      word.meaning ?? "",
      word.english ?? "",
      word.meaningMyanmar ?? "",
      word.myanmar ?? "",
      ...(word.partOfSpeech ?? []),
      ...(word.tags ?? []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export function getWritingCharacters(level: HskLevel): string[] {
  const seen = new Set<string>();
  const characters: string[] = [];
  for (const word of getVocabulary(level)) {
    for (const character of Array.from(word.hanzi)) {
      if (/[㐀-鿿]/u.test(character) && !seen.has(character)) {
        seen.add(character);
        characters.push(character);
      }
    }
  }
  return characters;
}

export function getVocabularyLessons(
  level: HskLevel,
  wordsPerLesson = 20,
): HskVocabularyItem[][] {
  const words = getVocabulary(level);
  const lessons: HskVocabularyItem[][] = [];
  for (let i = 0; i < words.length; i += wordsPerLesson) {
    lessons.push(words.slice(i, i + wordsPerLesson));
  }
  return lessons;
}

export function getWritingUrl(item: HskVocabularyItem): string {
  const params = new URLSearchParams({
    word: item.hanzi,
    vocabId: String(item.id),
  });
  return `/hsk/writing/${item.level}?${params.toString()}`;
}
