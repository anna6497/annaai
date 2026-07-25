import level1 from "@/data/hsk-writing/level-1.json";
import level2 from "@/data/hsk-writing/level-2.json";
import level3 from "@/data/hsk-writing/level-3.json";
import level4 from "@/data/hsk-writing/level-4.json";
import level5 from "@/data/hsk-writing/level-5.json";
import level6 from "@/data/hsk-writing/level-6.json";
import level7 from "@/data/hsk-writing/level-7.json";
import level8 from "@/data/hsk-writing/level-8.json";
import level9 from "@/data/hsk-writing/level-9.json";

export interface WritingCharacter {
  hanzi: string;
  pinyin: string;
  myanmar: string;
  radical: string;
  example: string;
  examplePinyin: string;
  exampleMyanmar: string;
}

export interface WritingLesson {
  lessonNumber: number;
  level: number;
  title: string;
  characters: WritingCharacter[];
  characterCount: number;
}

const CHARACTERS_PER_LESSON = 5;

const HSK_WRITING_DATA: Record<number, WritingCharacter[]> = {
  1: level1 as WritingCharacter[],
  2: level2 as WritingCharacter[],
  3: level3 as WritingCharacter[],
  4: level4 as WritingCharacter[],
  5: level5 as WritingCharacter[],
  6: level6 as WritingCharacter[],
  7: level7 as WritingCharacter[],
  8: level8 as WritingCharacter[],
  9: level9 as WritingCharacter[],
};

export function isValidHskLevel(level: number): boolean {
  return Number.isInteger(level) && level >= 1 && level <= 9;
}

export function getWritingCharacters(
  level: number,
): WritingCharacter[] {
  if (!isValidHskLevel(level)) {
    return [];
  }

  return HSK_WRITING_DATA[level] ?? [];
}

export function getWritingCharacter(
  level: number,
  index: number,
): WritingCharacter | null {
  const characters = getWritingCharacters(level);

  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= characters.length
  ) {
    return null;
  }

  return characters[index] ?? null;
}

export function getWritingCharacterCount(
  level: number,
): number {
  return getWritingCharacters(level).length;
}

export function isWritingLevelAvailable(
  level: number,
): boolean {
  return getWritingCharacterCount(level) > 0;
}

export function getWritingLessonCount(
  level: number,
): number {
  const totalCharacters = getWritingCharacterCount(level);

  if (totalCharacters === 0) {
    return 0;
  }

  return Math.ceil(
    totalCharacters / CHARACTERS_PER_LESSON,
  );
}

export function getWritingLessons(
  level: number,
): WritingLesson[] {
  const characters = getWritingCharacters(level);

  if (characters.length === 0) {
    return [];
  }

  const lessons: WritingLesson[] = [];

  for (
    let startIndex = 0;
    startIndex < characters.length;
    startIndex += CHARACTERS_PER_LESSON
  ) {
    const lessonCharacters = characters.slice(
      startIndex,
      startIndex + CHARACTERS_PER_LESSON,
    );

    const lessonNumber =
      Math.floor(startIndex / CHARACTERS_PER_LESSON) + 1;

    lessons.push({
      lessonNumber,
      level,
      title: `Lesson ${lessonNumber}`,
      characters: lessonCharacters,
      characterCount: lessonCharacters.length,
    });
  }

  return lessons;
}

export function getWritingLesson(
  level: number,
  lessonNumber: number,
): WritingLesson | null {
  if (
    !Number.isInteger(lessonNumber) ||
    lessonNumber < 1
  ) {
    return null;
  }

  const lessons = getWritingLessons(level);

  return (
    lessons.find(
      (lesson) =>
        lesson.lessonNumber === lessonNumber,
    ) ?? null
  );
}

export function getCharacterGlobalIndex(
  lessonNumber: number,
  characterIndex: number,
): number {
  return (
    (lessonNumber - 1) * CHARACTERS_PER_LESSON +
    characterIndex
  );
}

export function getLessonNumberFromCharacterIndex(
  characterIndex: number,
): number {
  if (
    !Number.isInteger(characterIndex) ||
    characterIndex < 0
  ) {
    return 1;
  }

  return (
    Math.floor(
      characterIndex / CHARACTERS_PER_LESSON,
    ) + 1
  );
}

export function getCharacterIndexInsideLesson(
  globalCharacterIndex: number,
): number {
  if (
    !Number.isInteger(globalCharacterIndex) ||
    globalCharacterIndex < 0
  ) {
    return 0;
  }

  return (
    globalCharacterIndex % CHARACTERS_PER_LESSON
  );
}

export function getNextWritingCharacter(
  level: number,
  currentIndex: number,
): WritingCharacter | null {
  return getWritingCharacter(level, currentIndex + 1);
}

export function getPreviousWritingCharacter(
  level: number,
  currentIndex: number,
): WritingCharacter | null {
  return getWritingCharacter(level, currentIndex - 1);
}

export function getCharactersPerLesson(): number {
  return CHARACTERS_PER_LESSON;
}