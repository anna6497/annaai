export type HskLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type FlashcardStatus = "new" | "learning" | "known";

export interface HskVocabularyExample {
  hanzi: string;
  pinyin: string;
  meaning?: string;
  meaningMyanmar?: string;
}

export interface HskVocabularyItem {
  id: string;
  hanzi: string;
  traditional?: string;
  pinyin: string;
  level: HskLevel | number | string;
  lesson?: number | null;
  meaning?: string;
  english?: string;
  meaningMyanmar?: string;
  myanmar?: string;
  partOfSpeech?: string[];
  tags?: string[];
  examples?: HskVocabularyExample[];
  example?: string;
  examplePinyin?: string;
  exampleMyanmar?: string;
  primaryHanzi?: string;
  primaryPinyin?: string;
  pinyinNumber?: string;
  pinyinSearch?: string;
  characters?: string[];
  strokeCharacters?: string[];
  audioKey?: string;
  searchKeywords?: string[];
  source?: string;
  meaningSource?: string;
  meaningMyanmarSource?: string;
  datasetVersion?: string;
  finalizedAt?: string;
}

export interface FavoriteVocabularyRow {
  id: string;
  user_id: string;
  vocab_id: string;
  level: number;
  created_at: string;
}

export interface FlashcardProgressRow {
  id: string;
  user_id: string;
  vocab_id: string;
  level: number;
  status: FlashcardStatus;
  review_count: number;
  last_reviewed_at: string | null;
  updated_at: string;
}
