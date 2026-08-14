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
    /*
     * ------------------------------------------------
     * 1. Authenticate user from Bearer token
     * ------------------------------------------------
     */

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

    /*
     * ------------------------------------------------
     * 2. Validate requested HSK level
     * ------------------------------------------------
     */

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
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    /*
     * ------------------------------------------------
     * 3. Your Laoshi access
     * ------------------------------------------------
     *
     * User is allowed when:
     *
     *   Active AI Speaking
     *          OR
     *   Paid HSK entitlement
     *
     * HSK 1 free access alone does NOT unlock
     * Your Laoshi.
     */

    const now =
      new Date()
        .toISOString();

    const [
      subscriptionResult,
      hskResult,
    ] =
      await Promise.all([
        admin
          .from(
            "ai_speaking_subscriptions",
          )
          .select(
            "id,plan_code",
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
          .maybeSingle(),

        admin
          .from(
            "user_hsk_access",
          )
          .select(
            "product_code,level,lifetime",
          )
          .eq(
            "user_id",
            user.id,
          ),
      ]);

    /*
     * AI Speaking query error
     */

    if (
      subscriptionResult.error
    ) {
      console.error(
        "Pronunciation AI Speaking access error:",
        subscriptionResult
          .error
          .message,
      );

      return NextResponse.json(
        {
          error:
            "Unable to check AI Speaking access.",
        },
        {
          status: 500,
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    /*
     * HSK query error
     */

    if (
      hskResult.error
    ) {
      console.error(
        "Pronunciation HSK access error:",
        hskResult
          .error
          .message,
      );

      return NextResponse.json(
        {
          error:
            "Unable to check HSK access.",
        },
        {
          status: 500,
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    /*
     * ------------------------------------------------
     * 4. AI Speaking access
     * ------------------------------------------------
     */

    const hasAiSpeakingAccess =
      Boolean(
        subscriptionResult.data,
      );

    /*
     * ------------------------------------------------
     * 5. Paid HSK access
     * ------------------------------------------------
     *
     * IMPORTANT:
     *
     * HSK 1 is free in Anna AI.
     *
     * Therefore:
     *
     *   HSK 1 free only
     *       -> NO Laoshi
     *
     *   HSK 2-9 purchased
     *       -> YES Laoshi
     *
     *   HSK Full Package
     *       -> YES Laoshi
     */

    const hskRows =
      hskResult.data ??
      [];

    const hasPaidHskAccess =
      hskRows.some(
        (
          row,
        ) => {
          const productCode =
            typeof row.product_code ===
            "string"
              ? row.product_code
                  .trim()
                  .toLowerCase()
              : "";

          /*
           * Full HSK package
           */
          if (
            productCode ===
            "hsk_full"
          ) {
            return true;
          }

          /*
           * Purchased individual level
           */
          const purchasedLevel =
            Number(
              row.level,
            );

          if (
            Number.isInteger(
              purchasedLevel,
            ) &&
            purchasedLevel >= 2 &&
            purchasedLevel <= 9
          ) {
            return true;
          }

          /*
           * Support product codes:
           *
           * hsk_2
           * hsk_3
           * ...
           * hsk_9
           */
          if (
            /^hsk_[2-9]$/.test(
              productCode,
            )
          ) {
            return true;
          }

          return false;
        },
      );

    /*
     * ------------------------------------------------
     * 6. Final Laoshi authorization
     * ------------------------------------------------
     */

    const hasLaoshiAccess =
      hasAiSpeakingAccess ||
      hasPaidHskAccess;

    if (
      !hasLaoshiAccess
    ) {
      return NextResponse.json(
        {
          allowed:
            false,

          error:
            "AI Speaking Plan or Paid HSK Plan required.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control":
              "private, no-store, max-age=0",
          },
        },
      );
    }

    /*
     * ------------------------------------------------
     * 7. Load pronunciation sentences
     * ------------------------------------------------
     */

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

    /*
     * ------------------------------------------------
     * 8. Success
     * ------------------------------------------------
     */

    return NextResponse.json(
      {
        allowed:
          true,

        access: {
          aiSpeaking:
            hasAiSpeakingAccess,

          hskPaid:
            hasPaidHskAccess,
        },

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
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}