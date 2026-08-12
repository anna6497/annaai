import { NextResponse } from "next/server";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AttemptRow = {
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

function unauthorized() {
  return NextResponse.json(
    {
      error: "Unauthorized",
    },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function dateKey(
  value: string | Date,
): string {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

function calculateStreak(
  attempts: AttemptRow[],
): number {
  const practiced =
    new Set(
      attempts.map(
        (attempt) =>
          dateKey(
            attempt.created_at,
          ),
      ),
    );

  if (
    practiced.size ===
    0
  ) {
    return 0;
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  const yesterday =
    new Date(
      today,
    );

  yesterday.setDate(
    yesterday.getDate() -
      1,
  );

  let cursor:
    Date;

  if (
    practiced.has(
      dateKey(
        today,
      ),
    )
  ) {
    cursor =
      today;
  } else if (
    practiced.has(
      dateKey(
        yesterday,
      ),
    )
  ) {
    cursor =
      yesterday;
  } else {
    return 0;
  }

  let streak =
    0;

  while (
    practiced.has(
      dateKey(
        cursor,
      ),
    )
  ) {
    streak +=
      1;

    cursor =
      new Date(
        cursor,
      );

    cursor.setDate(
      cursor.getDate() -
        1,
    );
  }

  return streak;
}

function parseIncorrect(
  value: unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value.flatMap(
    (item) => {
      if (
        !item ||
        typeof item !==
          "object" ||
        !(
          "expected" in
          item
        )
      ) {
        return [];
      }

      const expected =
        typeof item.expected ===
        "string"
          ? item.expected.trim()
          : "";

      return expected
        ? [expected]
        : [];
    },
  );
}

export async function GET(
  request: Request,
) {
  try {
    const authorization =
      request.headers.get(
        "authorization",
      );

    if (
      !authorization?.startsWith(
        "Bearer ",
      )
    ) {
      return unauthorized();
    }

    const token =
      authorization
        .slice(7)
        .trim();

    if (!token) {
      return unauthorized();
    }

    const admin =
      createSupabaseAdminClient();

    const {
      data: { user },
      error: userError,
    } =
      await admin.auth.getUser(
        token,
      );

    if (
      userError ||
      !user
    ) {
      return unauthorized();
    }

    const since =
      new Date();

    since.setDate(
      since.getDate() -
        90,
    );

    const [
      attemptsResult,
      preferenceResult,
    ] =
      await Promise.all([
        admin
          .from(
            "ai_speaking_pronunciation_attempts",
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
            `,
          )
          .eq(
            "user_id",
            user.id,
          )
          .gte(
            "created_at",
            since.toISOString(),
          )
          .order(
            "created_at",
            {
              ascending: false,
            },
          )
          .limit(
            1000,
          ),

        admin
          .from(
            "ai_speaking_preferences",
          )
          .select(
            "daily_goal",
          )
          .eq(
            "user_id",
            user.id,
          )
          .maybeSingle(),
      ]);

    if (
      attemptsResult.error
    ) {
      throw attemptsResult.error;
    }

    if (
      preferenceResult.error
    ) {
      throw preferenceResult.error;
    }

    const attempts =
      (
        attemptsResult.data as
          | AttemptRow[]
          | null
      ) ??
      [];

    const rawGoal =
      Number(
        preferenceResult
          .data
          ?.daily_goal,
      );

    const todayGoal =
      rawGoal === 5 ||
      rawGoal === 10 ||
      rawGoal === 20
        ? rawGoal
        : 10;

    const today =
      dateKey(
        new Date(),
      );

    const todaySentences =
      new Set(
        attempts
          .filter(
            (attempt) =>
              dateKey(
                attempt.created_at,
              ) ===
              today,
          )
          .map(
            (attempt) =>
              attempt.sentence_id,
          ),
      );

    const practicedSentences =
      new Set(
        attempts.map(
          (attempt) =>
            attempt.sentence_id,
        ),
      );

    const totalScore =
      attempts.reduce(
        (
          total,
          attempt,
        ) =>
          total +
          Number(
            attempt.overall_score ??
              0,
          ),
        0,
      );

    const averageScore =
      attempts.length >
      0
        ? Math.round(
            totalScore /
              attempts.length,
          )
        : 0;

    const weakMap =
      new Map<
        string,
        number
      >();

    for (
      const attempt
      of attempts
    ) {
      const characters =
        [
          ...parseIncorrect(
            attempt.incorrect_characters,
          ),
          ...(
            attempt.missing_characters ??
            []
          ),
        ];

      for (
        const character
        of characters
      ) {
        const normalized =
          character.trim();

        if (!normalized) {
          continue;
        }

        weakMap.set(
          normalized,
          (
            weakMap.get(
              normalized,
            ) ??
            0
          ) +
            1,
        );
      }
    }

    const weakCharacters =
      Array.from(
        weakMap.entries(),
      )
        .map(
          ([
            character,
            mistakeCount,
          ]) => ({
            character,
            mistakeCount,
          }),
        )
        .sort(
          (
            first,
            second,
          ) =>
            second.mistakeCount -
            first.mistakeCount,
        )
        .slice(
          0,
          8,
        );

    const todayCompleted =
      todaySentences.size;

    return NextResponse.json(
      {
        todayGoal,

        todayCompleted,

        todayProgressPercentage:
          Math.min(
            100,
            Math.round(
              (
                todayCompleted /
                todayGoal
              ) *
                100,
            ),
          ),

        currentStreak:
          calculateStreak(
            attempts,
          ),

        averageScore,

        totalAttempts:
          attempts.length,

        practicedSentenceCount:
          practicedSentences.size,

        weakCharacters,

        recentAttempts:
          attempts
            .slice(
              0,
              10,
            )
            .map(
              (attempt) => ({
                id:
                  attempt.id,

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
              }),
            ),
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Mobile Speaking Progress error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load speaking progress.",
      },
      {
        status: 500,
      },
    );
  }
}