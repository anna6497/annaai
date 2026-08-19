import hsk1 from "@/data/hsk/hsk1.json";
import hsk2 from "@/data/hsk/hsk2.json";
import hsk3 from "@/data/hsk/hsk3.json";
import hsk4 from "@/data/hsk/hsk4.json";
import hsk5 from "@/data/hsk/hsk5.json";
import hsk6 from "@/data/hsk/hsk6.json";
import hsk7to9 from "@/data/hsk/hsk7-9.json";

export type HskDictionaryEntry = {
  id: string;

  hanzi: string;
  traditional?: string;

  pinyin: string;

  level: string | number;

  meaning?: string;
  meaningMyanmar?: string;

  english?: string;
  myanmar?: string;

  primaryHanzi?: string;
  primaryPinyin?: string;

  audioKey?: string;

  partOfSpeech?: string[];

  characters?: string[];
};

export type ReadingDictionaryWord = {
  id: string;

  hanzi: string;
  pinyin: string;
  myanmar: string;
  english: string;

  level: number;

  audioKey: string | null;

  partOfSpeech: string[];
};

const RAW_DICTIONARY = [
  ...(hsk1 as HskDictionaryEntry[]),
  ...(hsk2 as HskDictionaryEntry[]),
  ...(hsk3 as HskDictionaryEntry[]),
  ...(hsk4 as HskDictionaryEntry[]),
  ...(hsk5 as HskDictionaryEntry[]),
  ...(hsk6 as HskDictionaryEntry[]),
  ...(hsk7to9 as HskDictionaryEntry[]),
];

function cleanText(
  value: string | undefined | null,
): string {
  return String(value ?? "").trim();
}

function normalizeHanzi(
  value: string,
): string {
  return value
    .trim()
    .replace(/\s+/g, "");
}

function extractPrimaryHanzi(
  entry: HskDictionaryEntry,
): string {
  const primary =
    cleanText(entry.primaryHanzi);

  if (primary) {
    return normalizeHanzi(primary);
  }

  const raw = cleanText(entry.hanzi);

  if (!raw) {
    return "";
  }

  /*
    Some entries:
    爸爸|爸
    哥哥|哥

    We use the first form as primary.
  */
  const firstVariant =
    raw.split("|")[0]?.trim() ?? "";

  /*
    Some dataset entries may contain:
    第（第二）

    For lookup we keep the original main form
    when possible.
  */
  return normalizeHanzi(firstVariant);
}

function extractPinyin(
  entry: HskDictionaryEntry,
): string {
  const primary =
    cleanText(entry.primaryPinyin);

  if (primary) {
    return primary;
  }

  const raw = cleanText(entry.pinyin);

  if (!raw) {
    return "";
  }

  return (
    raw.split("|")[0]?.trim() ??
    raw
  );
}

function extractMyanmar(
  entry: HskDictionaryEntry,
): string {
  return (
    cleanText(
      entry.meaningMyanmar,
    ) ||
    cleanText(entry.myanmar) ||
    ""
  );
}

function extractEnglish(
  entry: HskDictionaryEntry,
): string {
  return (
    cleanText(entry.meaning) ||
    cleanText(entry.english) ||
    ""
  );
}

function parseLevel(
  entry: HskDictionaryEntry,
): number {
  const parsed = Number(entry.level);

  if (
    Number.isFinite(parsed) &&
    parsed >= 1 &&
    parsed <= 9
  ) {
    return parsed;
  }

  /*
    Fallback from id:
    L1-0001
    L7-0001
  */
  const match =
    entry.id?.match(/^L(\d)/i);

  if (match?.[1]) {
    return Number(match[1]);
  }

  return 0;
}

function isChineseCharacter(
  char: string,
): boolean {
  return /[\u3400-\u4DBF\u4E00-\u9FFF]/u.test(
    char,
  );
}

function containsChinese(
  text: string,
): boolean {
  return Array.from(text).some(
    isChineseCharacter,
  );
}

const normalizedEntries =
  RAW_DICTIONARY.map(
    (
      entry,
    ): ReadingDictionaryWord | null => {
      const hanzi =
        extractPrimaryHanzi(entry);

      if (
        !hanzi ||
        !containsChinese(hanzi)
      ) {
        return null;
      }

      return {
        id: entry.id,

        hanzi,

        pinyin: extractPinyin(entry),

        myanmar:
          extractMyanmar(entry),

        english:
          extractEnglish(entry),

        level: parseLevel(entry),

        audioKey:
          cleanText(entry.audioKey) ||
          null,

        partOfSpeech:
          Array.isArray(
            entry.partOfSpeech,
          )
            ? entry.partOfSpeech
            : [],
      };
    },
  ).filter(
    (
      item,
    ): item is ReadingDictionaryWord =>
      item !== null,
  );

/*
  Deduplicate same Hanzi.

  Example:
  地 = de
  地 = dì

  For now, retain all possibilities in
  dictionaryByHanzi.
*/
const dictionaryByHanzi =
  new Map<
    string,
    ReadingDictionaryWord[]
  >();

for (const entry of normalizedEntries) {
  const existing =
    dictionaryByHanzi.get(
      entry.hanzi,
    ) ?? [];

  existing.push(entry);

  dictionaryByHanzi.set(
    entry.hanzi,
    existing,
  );
}

/*
  Longest words first.

  Example sentence:
  我喜欢看电影。

  Match:
  电影
  instead of:
  电 + 影

  Example:
  打电话
  instead of:
  打 + 电话
*/
const dictionaryWords = Array.from(
  dictionaryByHanzi.keys(),
).sort((a, b) => {
  const lengthDifference =
    Array.from(b).length -
    Array.from(a).length;

  if (lengthDifference !== 0) {
    return lengthDifference;
  }

  return a.localeCompare(b, "zh-CN");
});

export function getReadingDictionaryWord(
  hanzi: string,
): ReadingDictionaryWord[] {
  const normalized =
    normalizeHanzi(hanzi);

  return (
    dictionaryByHanzi.get(
      normalized,
    ) ?? []
  );
}

export function getBestReadingDictionaryWord(
  hanzi: string,
  readingLevel?: number,
): ReadingDictionaryWord | null {
  const matches =
    getReadingDictionaryWord(
      hanzi,
    );

  if (matches.length === 0) {
    return null;
  }

  /*
    Prefer vocabulary not above
    current reading level.
  */
  if (
    readingLevel &&
    readingLevel >= 1
  ) {
    const available =
      matches
        .filter(
          (entry) =>
            entry.level > 0 &&
            entry.level <=
              readingLevel,
        )
        .sort(
          (a, b) =>
            b.level - a.level,
        );

    if (available.length > 0) {
      return available[0];
    }
  }

  return matches[0];
}

export type ReadingToken = {
  text: string;

  type:
    | "word"
    | "text"
    | "punctuation";

  dictionaryEntries:
    ReadingDictionaryWord[];

  bestEntry:
    ReadingDictionaryWord | null;
};

function isChinesePunctuation(
  char: string,
): boolean {
  return /[，。！？；：、“”‘’（）《》〈〉【】—…]/u.test(
    char,
  );
}

export function tokenizeReadingText(
  text: string,
  readingLevel?: number,
): ReadingToken[] {
  if (!text) {
    return [];
  }

  const chars =
    Array.from(text);

  const tokens: ReadingToken[] =
    [];

  let index = 0;

  while (index < chars.length) {
    const current =
      chars[index];

    if (
      isChinesePunctuation(
        current,
      )
    ) {
      tokens.push({
        text: current,
        type: "punctuation",
        dictionaryEntries: [],
        bestEntry: null,
      });

      index += 1;

      continue;
    }

    if (
      !isChineseCharacter(
        current,
      )
    ) {
      let buffer = current;

      index += 1;

      while (
        index < chars.length &&
        !isChineseCharacter(
          chars[index],
        ) &&
        !isChinesePunctuation(
          chars[index],
        )
      ) {
        buffer +=
          chars[index];

        index += 1;
      }

      tokens.push({
        text: buffer,
        type: "text",
        dictionaryEntries: [],
        bestEntry: null,
      });

      continue;
    }

    let matchedWord:
      | string
      | null = null;

    /*
      Longest matching word first.
    */
    for (
      const word of dictionaryWords
    ) {
      const wordChars =
        Array.from(word);

      if (
        wordChars.length >
        chars.length - index
      ) {
        continue;
      }

      let matches = true;

      for (
        let offset = 0;
        offset <
        wordChars.length;
        offset += 1
      ) {
        if (
          chars[
            index + offset
          ] !== wordChars[offset]
        ) {
          matches = false;
          break;
        }
      }

      if (matches) {
        matchedWord = word;
        break;
      }
    }

    if (matchedWord) {
      const entries =
        getReadingDictionaryWord(
          matchedWord,
        );

      tokens.push({
        text: matchedWord,
        type: "word",

        dictionaryEntries:
          entries,

        bestEntry:
          getBestReadingDictionaryWord(
            matchedWord,
            readingLevel,
          ),
      });

      index +=
        Array.from(
          matchedWord,
        ).length;

      continue;
    }

    /*
      Chinese char exists in story
      but not in current HSK dictionary.
    */
    tokens.push({
      text: current,
      type: "text",
      dictionaryEntries: [],
      bestEntry: null,
    });

    index += 1;
  }

  return tokens;
}

export function hasReadingDictionaryWord(
  hanzi: string,
): boolean {
  return (
    getReadingDictionaryWord(
      hanzi,
    ).length > 0
  );
}

export function getReadingDictionarySize(): number {
  return normalizedEntries.length;
}

export function getUniqueReadingWordCount(): number {
  return dictionaryByHanzi.size;
}