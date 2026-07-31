export type SpeakingPracticeWord = {
  hanzi: string;
  pinyin: string;
  pinyinNumbered: string;
  tone: number | number[];
};

export type SpeakingPracticeSentence = {
  id: string;
  level: number;
  category: string;
  hanzi: string;
  pinyin: string;
  pinyinNumbered: string;
  myanmar: string;
  audioUrl: string;
  difficulty: "easy" | "medium" | "hard";
  words: SpeakingPracticeWord[];
};

export type PronunciationScore = {
  overall: number;
  accuracy: number;
  completeness: number;
  fluency: number;
  targetText: string;
  recognizedText: string;
  missingCharacters: string[];
  extraCharacters: string[];
  incorrectCharacters: Array<{
    expected: string;
    recognized: string;
  }>;
};