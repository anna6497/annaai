export {
  getVocabulary as getVocabularyByLevel,
  getVocabularyById as getVocabularyItem,
  getVocabularyCount,
  getVocabularyLessons,
  getWritingCharacters,
  getWritingUrl,
} from "@/lib/hsk/vocabulary";

import type { HskVocabularyItem } from "@/types/hsk-vocabulary";

export function searchVocabulary(
  items: HskVocabularyItem[],
  query: string,
): HskVocabularyItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter((item) =>
    [
      item.hanzi,
      item.traditional ?? "",
      item.pinyin,
      item.pinyinSearch ?? "",
      item.english ?? "",
      item.meaning ?? "",
      item.myanmar ?? "",
      item.meaningMyanmar ?? "",
      ...(item.tags ?? []),
      ...(item.partOfSpeech ?? []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}
