import type {
  HskLevel,
  HskVocabularyItem,
} from "@/types/hsk-vocabulary";

import hsk1 from "@/data/hsk/hsk1.json";
import hsk2 from "@/data/hsk/hsk2.json";
import hsk3 from "@/data/hsk/hsk3.json";
import hsk4 from "@/data/hsk/hsk4.json";
import hsk5 from "@/data/hsk/hsk5.json";
import hsk6 from "@/data/hsk/hsk6.json";
import hskAdvanced from "@/data/hsk/hsk7-9.json";

function isHskLevel(
  value: unknown,
): value is HskLevel {
  const level = Number(value);

  return (
    Number.isInteger(level) &&
    level >= 1 &&
    level <= 9
  );
}

function normalize(
  item: HskVocabularyItem,
  fallbackLevel: HskLevel,
): HskVocabularyItem {
  const firstExample =
    item.examples?.[0];

  const originalLevel =
    Number(item.level);

  const level: HskLevel =
    isHskLevel(originalLevel)
      ? originalLevel
      : fallbackLevel;

  return {
    ...item,

    level,

    lesson:
      typeof item.lesson === "number"
        ? item.lesson
        : null,

    english:
      item.meaning ??
      item.english ??
      "Meaning pending",

    myanmar:
      item.meaningMyanmar ??
      item.myanmar ??
      "မြန်မာအဓိပ္ပာယ် မထည့်ရသေးပါ",

    example:
      firstExample?.hanzi ??
      item.example ??
      "",

    examplePinyin:
      firstExample?.pinyin ??
      item.examplePinyin ??
      "",

    exampleMyanmar:
      firstExample?.meaningMyanmar ??
      firstExample?.meaning ??
      item.exampleMyanmar ??
      "",

    tags:
      item.partOfSpeech ??
      item.tags ??
      [],
  };
}

/*
 * HSK 1-6
 */

const BASIC_RAW: Record<
  1 | 2 | 3 | 4 | 5 | 6,
  HskVocabularyItem[]
> = {
  1: hsk1 as unknown as HskVocabularyItem[],
  2: hsk2 as unknown as HskVocabularyItem[],
  3: hsk3 as unknown as HskVocabularyItem[],
  4: hsk4 as unknown as HskVocabularyItem[],
  5: hsk5 as unknown as HskVocabularyItem[],
  6: hsk6 as unknown as HskVocabularyItem[],
};

const ADVANCED_RAW =
  hskAdvanced as unknown as HskVocabularyItem[];

/*
 * Get one HSK level
 */

export function getVocabulary(
  level: HskLevel,
): HskVocabularyItem[] {
  if (level <= 6) {
    return BASIC_RAW[
      level as 1 | 2 | 3 | 4 | 5 | 6
    ].map((item) =>
      normalize(item, level),
    );
  }

  return ADVANCED_RAW
    .filter(
      (item) =>
        Number(item.level) === level,
    )
    .map((item) =>
      normalize(item, level),
    );
}

/*
 * All vocabulary
 *
 * Used by global Dictionary.
 */

export function getAllVocabulary():
  HskVocabularyItem[] {
  const basic =
    (
      [
        1,
        2,
        3,
        4,
        5,
        6,
      ] as HskLevel[]
    ).flatMap((level) =>
      getVocabulary(level),
    );

  const advanced =
    ADVANCED_RAW.map((item) => {
      const actualLevel =
        isHskLevel(item.level)
          ? (Number(
              item.level,
            ) as HskLevel)
          : 7;

      return normalize(
        item,
        actualLevel,
      );
    });

  const seen =
    new Set<string>();

  return [
    ...basic,
    ...advanced,
  ].filter((item) => {
    const key =
      `${item.level}:${item.id}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

export function getVocabularyCount(
  level: HskLevel,
): number {
  return getVocabulary(level).length;
}

export function getVocabularyById(
  level: HskLevel,
  id: string,
): HskVocabularyItem | null {
  return (
    getVocabulary(level).find(
      (word) =>
        String(word.id) === id,
    ) ?? null
  );
}

/*
 * Search inside one HSK level
 */

export function searchVocabulary(
  level: HskLevel,
  query: string,
): HskVocabularyItem[] {
  const q =
    normalizeSearchText(query);

  const words =
    getVocabulary(level);

  if (!q) {
    return words;
  }

  return words.filter((word) =>
    getSearchText(word).includes(q),
  );
}

/*
 * Global dictionary search
 */

export function searchAllVocabulary(
  query: string,
  limit = 50,
): HskVocabularyItem[] {
  const q =
    normalizeSearchText(query);

  if (!q) {
    return [];
  }

  const words =
    getAllVocabulary();

  const scored =
    words
      .map((word) => ({
        word,
        score:
          getSearchScore(
            word,
            q,
          ),
      }))
      .filter(
        (item) =>
          item.score > 0,
      )
      .sort((a, b) => {
        if (
          b.score !== a.score
        ) {
          return (
            b.score -
            a.score
          );
        }

        return (
          Number(
            a.word.level,
          ) -
          Number(
            b.word.level,
          )
        );
      });

  return scored
    .slice(0, limit)
    .map(
      (item) =>
        item.word,
    );
}

/*
 * Recommendations while typing
 */

export function getVocabularyRecommendations(
  query: string,
  limit = 8,
): HskVocabularyItem[] {
  return searchAllVocabulary(
    query,
    limit,
  );
}

/*
 * Search helpers
 */

function normalizeSearchText(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[\s'’\-]+/g,
      "",
    );
}

function getSearchText(
  word: HskVocabularyItem,
): string {
  return normalizeSearchText(
    [
      word.hanzi,
      word.traditional ?? "",
      word.primaryHanzi ?? "",

      word.pinyin,
      word.primaryPinyin ?? "",
      word.pinyinSearch ?? "",
      word.pinyinNumber ?? "",

      word.meaning ?? "",
      word.english ?? "",

      word.meaningMyanmar ?? "",
      word.myanmar ?? "",

      ...(word.partOfSpeech ??
        []),

      ...(word.tags ?? []),

      ...(word.searchKeywords ??
        []),
    ].join(" "),
  );
}

function getSearchScore(
  word: HskVocabularyItem,
  query: string,
): number {
  const hanzi =
    normalizeSearchText(
      word.hanzi,
    );

  const traditional =
    normalizeSearchText(
      word.traditional ?? "",
    );

  const pinyin =
    normalizeSearchText(
      word.primaryPinyin ??
        word.pinyin,
    );

  const english =
    normalizeSearchText(
      word.meaning ??
        word.english ??
        "",
    );

  const myanmar =
    normalizeSearchText(
      word.meaningMyanmar ??
        word.myanmar ??
        "",
    );

  const all =
    getSearchText(word);

  if (
    hanzi === query ||
    traditional === query
  ) {
    return 100;
  }

  if (pinyin === query) {
    return 95;
  }

  if (
    english === query ||
    myanmar === query
  ) {
    return 90;
  }

  if (
    hanzi.startsWith(
      query,
    ) ||
    traditional.startsWith(
      query,
    )
  ) {
    return 80;
  }

  if (
    pinyin.startsWith(
      query,
    )
  ) {
    return 75;
  }

  if (
    english.startsWith(
      query,
    ) ||
    myanmar.startsWith(
      query,
    )
  ) {
    return 70;
  }

  if (
    all.includes(query)
  ) {
    return 50;
  }

  return 0;
}

/*
 * Writing characters
 */

export function getWritingCharacters(
  level: HskLevel,
): string[] {
  const seen =
    new Set<string>();

  const characters:
    string[] = [];

  for (
    const word of getVocabulary(
      level,
    )
  ) {
    for (
      const character of Array.from(
        word.hanzi,
      )
    ) {
      if (
        /[\u3400-\u4DBF\u4E00-\u9FFF]/u.test(
          character,
        ) &&
        !seen.has(
          character,
        )
      ) {
        seen.add(
          character,
        );

        characters.push(
          character,
        );
      }
    }
  }

  return characters;
}

/*
 * Lessons
 */

export function getVocabularyLessons(
  level: HskLevel,
  wordsPerLesson = 20,
): HskVocabularyItem[][] {
  const words =
    getVocabulary(level);

  const lessons:
    HskVocabularyItem[][] =
    [];

  for (
    let i = 0;
    i < words.length;
    i += wordsPerLesson
  ) {
    lessons.push(
      words.slice(
        i,
        i + wordsPerLesson,
      ),
    );
  }

  return lessons;
}

/*
 * Writing URL
 */

export function getWritingUrl(
  item: HskVocabularyItem,
): string {
  const params =
    new URLSearchParams({
      word: item.hanzi,
      vocabId: String(
        item.id,
      ),
    });

  return `/hsk/writing/${item.level}?${params.toString()}`;
}

/*
 * Find dictionary word
 * by simplified / primary /
 * traditional Hanzi.
 */

export function getVocabularyByHanzi(
  hanzi: string,
): HskVocabularyItem | null {
  const normalized =
    hanzi.trim();

  if (!normalized) {
    return null;
  }

  return (
    getAllVocabulary().find(
      (word) =>
        word.hanzi === normalized ||
        word.primaryHanzi ===
          normalized ||
        word.traditional ===
          normalized,
    ) ?? null
  );
}