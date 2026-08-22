import hsk1 from "@/data/hsk-reading/hsk1.json";
import hsk2 from "@/data/hsk-reading/hsk2.json";
import hsk3 from "@/data/hsk-reading/hsk3.json";
import hsk4 from "@/data/hsk-reading/hsk4.json";
import hsk5 from "@/data/hsk-reading/hsk5.json";
import hsk6 from "@/data/hsk-reading/hsk6.json";
import hsk7 from "@/data/hsk-reading/hsk7.json";
import hsk8 from "@/data/hsk-reading/hsk8.json";
import hsk9 from "@/data/hsk-reading/hsk9.json";

export type HskReadingStory = {
  id: string;
  level: number;
  order: number;

  title: string;
  pinyinTitle: string;
  myanmarTitle: string;

  category:
    | "daily-life"
    | "school"
    | "friends"
    | "shopping"
    | "travel";

  difficulty:
    | "easy"
    | "medium"
    | "hard";

  estimatedMinutes: number;

  paragraphs: string[];
  pinyinParagraphs: string[];
  myanmarParagraphs: string[];

  keywords: string[];

  audioUrl: string | null;
  audioText: string;
};

const HSK_READING_BY_LEVEL:
  Record<
    number,
    HskReadingStory[]
  > = {
  1:
    hsk1 as
      HskReadingStory[],

  2:
    hsk2 as
      HskReadingStory[],

  3:
    hsk3 as
      HskReadingStory[],

  4:
    hsk4 as
      HskReadingStory[],

  5:
    hsk5 as
      HskReadingStory[],

  6:
    hsk6 as
      HskReadingStory[],

  7:
    hsk7 as
      HskReadingStory[],

  8:
    hsk8 as
      HskReadingStory[],

  9:
    hsk9 as
      HskReadingStory[],
};

export function getHskReadingStories(
  level: number,
): HskReadingStory[] {
  const stories =
    HSK_READING_BY_LEVEL[
      level
    ] ?? [];

  return [
    ...stories,
  ].sort(
    (a, b) =>
      a.order - b.order,
  );
}

export function getHskReadingStory(
  level: number,
  storyId: string,
): HskReadingStory | null {
  return (
    getHskReadingStories(
      level,
    ).find(
      (story) =>
        story.id ===
        storyId,
    ) ?? null
  );
}

export function getHskReadingStoryCount(
  level: number,
): number {
  return (
    getHskReadingStories(
      level,
    ).length
  );
}

export function hasHskReadingContent(
  level: number,
): boolean {
  return (
    getHskReadingStoryCount(
      level,
    ) > 0
  );
}