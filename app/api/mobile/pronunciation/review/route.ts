import { NextResponse } from "next/server";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AttemptRow = {
  sentence_id: string;
  target_text: string;
  overall_score: number;
  missing_characters: string[] | null;
  incorrect_characters: unknown;
  created_at: string;
};

type ReviewAccumulator = {
  sentenceId: string;
  targetText: string;
  scores: number[];
  attemptCount: number;
  mistakeCount: number;
  latestScore: number;
  lastPracticedAt: string;
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

function countIncorrectCharacters(
  value: unknown,
): number {
  if (!Array.isArray(value)) {
    return 0;
  }

  return value.filter(
    (item) =>
      item &&
      typeof item === "object" &&
      "expected" in item,
  ).length;
}

export async function GET(
  request: Request,
) {
  try {
    const authorization =
      request.headers.get("authorization");

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

    const {
      data,
      error,
    } =
      await admin
        .from(
          "ai_speaking_pronunciation_attempts",
        )
        .select(
          `
            sentence_id,
            target_text,
            overall_score,
            missing_characters,
            incorrect_characters,
            created_at
          `,
        )
        .eq(
          "user_id",
          user.id,
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        )
        .limit(500);

    if (error) {
      throw error;
    }

    const attempts =
      (data as AttemptRow[] | null) ??
      [];

    const grouped =
      new Map<
        string,
        ReviewAccumulator
      >();

    for (
      const attempt
      of attempts
    ) {
      const mistakes =
        countIncorrectCharacters(
          attempt.incorrect_characters,
        ) +
        (
          attempt.missing_characters
            ?.length ??
          0
        );

      const existing =
        grouped.get(
          attempt.sentence_id,
        );

      if (!existing) {
        grouped.set(
          attempt.sentence_id,
          {
            sentenceId:
              attempt.sentence_id,

            targetText:
              attempt.target_text,

            scores: [
              Number(
                attempt.overall_score,
              ),
            ],

            attemptCount:
              1,

            mistakeCount:
              mistakes,

            latestScore:
              Number(
                attempt.overall_score,
              ),

            lastPracticedAt:
              attempt.created_at,
          },
        );

        continue;
      }

      existing.scores.push(
        Number(
          attempt.overall_score,
        ),
      );

      existing.attemptCount +=
        1;

      existing.mistakeCount +=
        mistakes;
    }

    const items =
      Array.from(
        grouped.values(),
      )
        .map(
          (item) => {
            const averageScore =
              Math.round(
                item.scores.reduce(
                  (
                    sum,
                    score,
                  ) =>
                    sum +
                    score,
                  0,
                ) /
                  item.scores.length,
              );

            return {
              sentenceId:
                item.sentenceId,

              targetText:
                item.targetText,

              attemptCount:
                item.attemptCount,

              mistakeCount:
                item.mistakeCount,

              averageScore,

              latestScore:
                item.latestScore,

              lastPracticedAt:
                item.lastPracticedAt,
            };
          },
        )
        .filter(
          (item) =>
            item.averageScore <
              85 ||
            item.mistakeCount >
              0,
        )
        .sort(
          (
            first,
            second,
          ) => {
            if (
              second.mistakeCount !==
              first.mistakeCount
            ) {
              return (
                second.mistakeCount -
                first.mistakeCount
              );
            }

            return (
              first.averageScore -
              second.averageScore
            );
          },
        )
        .slice(
          0,
          10,
        );

    return NextResponse.json(
      {
        items,
        count:
          items.length,
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
      "Mobile Smart Review error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load Smart Review.",
      },
      {
        status: 500,
      },
    );
  }
}