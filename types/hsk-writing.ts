export interface WritingLessonListItem {
  lessonNumber: number;
  title: string;
  subtitle: string;
  characterCount: number;
  characters: string[];
  bestScore: number;
  stars: number;
  completed: boolean;
  attemptsCount: number;
  unlocked: boolean;
}

export interface WritingLevelProgressSummary {
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  totalStars: number;
  maximumStars: number;
  nextLessonNumber: number | null;
}
