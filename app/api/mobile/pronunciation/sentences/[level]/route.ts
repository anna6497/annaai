import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSpeakingPracticeSentences } from "@/lib/speaking-practice/loader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    level: string;
  }>;
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

export async function GET(
  request: Request,
  context: RouteContext,
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

    const accessToken =
      authorization
        .slice(7)
        .trim();

    if (!accessToken) {
      return unauthorized();
    }

    const admin =
      createSupabaseAdminClient();

    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await admin.auth.getUser(
        accessToken,
      );

    if (
      userError ||
      !user
    ) {
      return unauthorized();
    }

    const {
      level:
        rawLevel,
    } =
      await context.params;

    const level =
      Number(rawLevel);

    if (
      !Number.isInteger(
        level,
      ) ||
      level < 1 ||
      level > 6
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid HSK level.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Your Laoshi requires
     * an active AI Speaking plan.
     */
    const now =
      new Date()
        .toISOString();

    const {
      data:
        subscription,
      error:
        subscriptionError,
    } =
      await admin
        .from(
          "ai_speaking_subscriptions",
        )
        .select(
          "id",
        )
        .eq(
          "user_id",
          user.id,
        )
        .eq(
          "status",
          "active",
        )
        .lte(
          "starts_at",
          now,
        )
        .gt(
          "expires_at",
          now,
        )
        .limit(1)
        .maybeSingle();

    if (
      subscriptionError
    ) {
      console.error(
        "Pronunciation subscription error:",
        subscriptionError.message,
      );

      return NextResponse.json(
        {
          error:
            "Unable to check AI Speaking access.",
        },
        {
          status: 500,
        },
      );
    }

    if (!subscription) {
      return NextResponse.json(
        {
          allowed:
            false,

          error:
            "Active AI Speaking plan required.",
        },
        {
          status: 403,
        },
      );
    }

    const sentences =
      getSpeakingPracticeSentences(
        level,
      ).map(
        (
          sentence,
        ) => ({
          id:
            sentence.id,

          level:
            sentence.level,

          lesson:
            sentence.lesson,

          category:
            sentence.category,

          hanzi:
            sentence.hanzi,

          pinyin:
            sentence.pinyin,

          myanmar:
            sentence.myanmar,

          english:
            sentence.english,

          difficulty:
            sentence.difficulty,

          keywords:
            sentence.keywords ??
            [],

          grammar:
            sentence.grammar ??
            [],
        }),
      );

    return NextResponse.json(
      {
        allowed:
          true,

        level,

        count:
          sentences.length,

        sentences,
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "Mobile pronunciation sentences error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load pronunciation sentences.",
      },
      {
        status: 500,
      },
    );
  }
}