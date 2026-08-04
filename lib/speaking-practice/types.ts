export type SpeakingAudioFiles = {
  normal: string;
  slow: string;
};

export type SpeakingPracticeSentence = {
  id: string;
  level: number;
  lesson: number;
  category: string;

  hanzi: string;
  pinyin: string;
  pinyinNumbered: string;
  myanmar: string;
  english: string;

  difficulty: number;
  keywords: string[];
  grammar: string[];
  tones: number[];

  targetDuration: number;
  audio: SpeakingAudioFiles;
};

export type IncorrectCharacter = {
  expected: string;
  recognized: string;
};

export type PronunciationCoach = {
  title: string;
  message: string;
  focusCharacters: string[];
  toneScoringAvailable: boolean;
  toneNote: string;
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
  incorrectCharacters: IncorrectCharacter[];
};