import { createClient } from "@/lib/supabase/client";

import type {
  SpeakingDailyGoal,
} from "@/lib/speaking-practice/preferences";

export type WeakCharacter = {
  character: string;
  mistakeCount: number;
};

export type RecentSpeakingAttempt = {
  id: string;
  sentenceId: string;
  targetText: string;
  recognizedText: string;
  overallScore: number;
  category: string;
  lesson: number;
  createdAt: string;
};

export type SpeakingDashboardData = {
  isAuthenticated: boolean;

  todayGoal: SpeakingDailyGoal;
  todayCompleted: number;
  todayProgressPercentage: number;

  currentStreak: number;
  averageScore: number;
  totalAttempts: number;
  practicedSentenceCount: number;

  weakCharacters: WeakCharacter[];
  recentAttempts: RecentSpeakingAttempt[];
};

type PronunciationAttemptRow = {
  id: string;
  sentence_id: string;
  lesson: number;
  category: string;
  target_text: string;
  recognized_text: string;
  overall_score: number;
  incorrect_characters: unknown;
  missing_characters: string[] | null;
  created_at: string;
};

type PreferenceRow = {
  daily_goal: number;
};

const DEFAULT_DAILY_GOAL: SpeakingDailyGoal = 10;

function normalizeDailyGoal(
  value: number | null | undefined
): SpeakingDailyGoal {
  if (
    value === 5 ||
    value === 10 ||
    value === 20
  ) {
    return value;
  }

  return DEFAULT_DAILY_GOAL;
}

function getLocalDateKey(
  dateValue: string | Date
): string {
  const date =
    dateValue instanceof Date
      ? dateValue
      : new Date(dateValue);

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateDaysAgo(days: number): Date {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);

  return date;
}

function calculateCurrentStreak(
  attempts: PronunciationAttemptRow[]
): number {
  const practicedDates = new Set(
    attempts.map((attempt) =>
      getLocalDateKey(attempt.created_at)
    )
  );

  if (practicedDates.size === 0) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const todayKey = getLocalDateKey(today);
  const yesterdayKey =
    getLocalDateKey(yesterday);

  let cursor: Date;

  if (practicedDates.has(todayKey)) {
    cursor = today;
  } else if (
    practicedDates.has(yesterdayKey)
  ) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;

  while (
    practicedDates.has(
      getLocalDateKey(cursor)
    )
  ) {
    streak += 1;

    cursor = new Date(cursor);

    cursor.setDate(
      cursor.getDate() - 1
    );
  }

  return streak;
}

function parseIncorrectCharacters(
  value: unknown
): Array<{
  expected: string;
  recognized: string;
}> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      !("expected" in item)
    ) {
      return [];
    }

    const expected =
      typeof item.expected === "string"
        ? item.expected.trim()
        : "";

    const recognized =
      "recognized" in item &&
      typeof item.recognized === "string"
        ? item.recognized.trim()
        : "";

    if (!expected) {
      return [];
    }

    return [
      {
        expected,
        recognized,
      },
    ];
  });
}

function calculateWeakCharacters(
  attempts: PronunciationAttemptRow[],
  limit = 8
): WeakCharacter[] {
  const mistakeCounts =
    new Map<string, number>();

  for (const attempt of attempts) {
    const incorrectCharacters =
      parseIncorrectCharacters(
        attempt.incorrect_characters
      );

    for (const item of incorrectCharacters) {
      mistakeCounts.set(
        item.expected,
        (mistakeCounts.get(
          item.expected
        ) ?? 0) + 1
      );
    }

    for (
      const character of
        attempt.missing_characters ?? []
    ) {
      const normalized =
        character.trim();

      if (!normalized) {
        continue;
      }

      mistakeCounts.set(
        normalized,
        (mistakeCounts.get(
          normalized
        ) ?? 0) + 1
      );
    }
  }

  return Array.from(
    mistakeCounts.entries()
  )
    .map(
      ([character, mistakeCount]) => ({
        character,
        mistakeCount,
      })
    )
    .sort(
      (first, second) =>
        second.mistakeCount -
        first.mistakeCount
    )
    .slice(0, limit);
}

export async function getSpeakingDashboardData(): Promise<SpeakingDashboardData> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    return {
      isAuthenticated: false,

      todayGoal: DEFAULT_DAILY_GOAL,
      todayCompleted: 0,
      todayProgressPercentage: 0,

      currentStreak: 0,
      averageScore: 0,
      totalAttempts: 0,
      practicedSentenceCount: 0,

      weakCharacters: [],
      recentAttempts: [],
    };
  }

  const ninetyDaysAgo =
    getDateDaysAgo(90);

  const [
    attemptsResult,
    preferenceResult,
  ] = await Promise.all([
    supabase
      .from(
        "ai_speaking_pronunciation_attempts"
      )
      .select(
        `
          id,
          sentence_id,
          lesson,
          category,
          target_text,
          recognized_text,
          overall_score,
          incorrect_characters,
          missing_characters,
          created_at
        `
      )
      .eq("user_id", user.id)
      .gte(
        "created_at",
        ninetyDaysAgo.toISOString()
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(1000),

    supabase
      .from("ai_speaking_preferences")
      .select("daily_goal")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (attemptsResult.error) {
    throw new Error(
      attemptsResult.error.message
    );
  }

  if (preferenceResult.error) {
    throw new Error(
      preferenceResult.error.message
    );
  }

  const attempts =
    (
      attemptsResult.data as
        | PronunciationAttemptRow[]
        | null
    ) ?? [];

  const preference =
    preferenceResult.data as
      | PreferenceRow
      | null;

  const todayGoal =
    normalizeDailyGoal(
      preference?.daily_goal
    );

  const todayKey =
    getLocalDateKey(new Date());

  const todayAttempts =
    attempts.filter(
      (attempt) =>
        getLocalDateKey(
          attempt.created_at
        ) === todayKey
    );

  const todaySentenceIds = new Set(
    todayAttempts.map(
      (attempt) =>
        attempt.sentence_id
    )
  );

  const allSentenceIds = new Set(
    attempts.map(
      (attempt) =>
        attempt.sentence_id
    )
  );

  const totalScore =
    attempts.reduce(
      (sum, attempt) =>
        sum +
        Number(
          attempt.overall_score ?? 0
        ),
      0
    );

  const averageScore =
    attempts.length > 0
      ? Math.round(
          totalScore /
            attempts.length
        )
      : 0;

  const todayCompleted =
    todaySentenceIds.size;

  const todayProgressPercentage =
    Math.min(
      100,
      Math.round(
        (todayCompleted /
          todayGoal) *
          100
      )
    );

  return {
    isAuthenticated: true,

    todayGoal,
    todayCompleted,
    todayProgressPercentage,

    currentStreak:
      calculateCurrentStreak(
        attempts
      ),

    averageScore,

    totalAttempts:
      attempts.length,

    practicedSentenceCount:
      allSentenceIds.size,

    weakCharacters:
      calculateWeakCharacters(
        attempts
      ),

    recentAttempts:
      attempts
        .slice(0, 10)
        .map((attempt) => ({
          id: attempt.id,

          sentenceId:
            attempt.sentence_id,

          targetText:
            attempt.target_text,

          recognizedText:
            attempt.recognized_text,

          overallScore:
            attempt.overall_score,

          category:
            attempt.category,

          lesson:
            attempt.lesson,

          createdAt:
            attempt.created_at,
        })),
  };
}