export interface HskVocabulary {
  id: number;
  level: number;
  word_order: number;
  hanzi: string;
  pinyin: string;
  english: string;
  myanmar: string;
  part_of_speech: string | null;
  example_hanzi: string | null;
  example_pinyin: string | null;
  example_english: string | null;
  example_myanmar: string | null;
  category: string | null;
}