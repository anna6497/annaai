import {
  createClient,
} from "@/lib/supabase/server";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";

import {
  AI_SPEAKING_PLANS,
  isAiSpeakingPlanId,
  type AiSpeakingPlanId,
} from "@/lib/ai-speaking-plans";

export type LaoshiAccess = {
  active: boolean;

  source:
    | "ai_speaking"
    | "hsk"
    | null;

  aiSpeaking: boolean;
  hskPaid: boolean;

  aiPlanCode:
    | AiSpeakingPlanId
    | null;

  hskProducts: string[];
};

const EMPTY_ACCESS: LaoshiAccess = {
  active: false,
  source: null,

  aiSpeaking: false,
  hskPaid: false,

  aiPlanCode: null,
  hskProducts: [],
};

export async function getLaoshiAccess(): Promise<LaoshiAccess> {
  /*
   * Get the currently authenticated user.
   */
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
    error:
      authError,
  } =
    await supabase.auth.getUser();

  if (
    authError ||
    !user
  ) {
    if (authError) {
      console.error(
        "Laoshi authentication error:",
        authError.message,
      );
    }

    return EMPTY_ACCESS;
  }

  const admin =
    createSupabaseAdminClient();

  const now =
    new Date()
      .toISOString();

  /*
   * Check both access systems together:
   *
   * 1. AI Speaking subscription
   * 2. Paid HSK entitlement
   */
  const [
    aiResult,
    hskResult,
  ] =
    await Promise.all([
      admin
        .from(
          "ai_speaking_subscriptions",
        )
        .select(
          `
            plan_code,
            starts_at,
            expires_at,
            status
          `,
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
        .order(
          "expires_at",
          {
            ascending:
              false,
          },
        )
        .limit(1)
        .maybeSingle(),

      admin
        .from(
          "user_hsk_access",
        )
        .select(
          `
            product_code,
            level,
            lifetime
          `,
        )
        .eq(
          "user_id",
          user.id,
        ),
    ]);

  /*
   * AI Speaking
   */
  if (
    aiResult.error
  ) {
    console.error(
      "Laoshi AI access query error:",
      aiResult.error.message,
    );
  }

  let aiSpeaking =
    false;

  let aiPlanCode:
    AiSpeakingPlanId | null =
    null;

  if (
    aiResult.data
  ) {
    const rawPlanCode =
      aiResult.data
        .plan_code;

    if (
      typeof rawPlanCode ===
        "string" &&
      isAiSpeakingPlanId(
        rawPlanCode,
      )
    ) {
      aiSpeaking =
        true;

      aiPlanCode =
        rawPlanCode;

      /*
       * Keep this lookup so invalid/missing
       * plan configuration cannot silently
       * become Laoshi access.
       */
      void AI_SPEAKING_PLANS[
        aiPlanCode
      ];
    }
  }

  /*
   * HSK paid access
   *
   * IMPORTANT:
   * Do NOT use hasHskLevelAccess(1).
   *
   * HSK 1 is free in Anna AI, so Laoshi should
   * only unlock when an actual entitlement row
   * exists in user_hsk_access.
   */
  if (
    hskResult.error
  ) {
    console.error(
      "Laoshi HSK access query error:",
      hskResult.error.message,
    );
  }

  const hskRows =
    hskResult.data ??
    [];

  const paidHskRows =
    hskRows.filter(
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
         * Full package always counts.
         */
        if (
          productCode ===
          "hsk_full"
        ) {
          return true;
        }

        /*
         * Individual purchased HSK levels.
         *
         * HSK 1 is intentionally excluded
         * because it is the free level.
         */
        const level =
          Number(
            row.level,
          );

        if (
          Number.isInteger(
            level,
          ) &&
          level >= 2 &&
          level <= 9
        ) {
          return true;
        }

        /*
         * Also support product codes such as
         * hsk_2 ... hsk_9.
         */
        return /^hsk_[2-9]$/.test(
          productCode,
        );
      },
    );

  const hskPaid =
    paidHskRows.length >
    0;

  const hskProducts =
    Array.from(
      new Set(
        paidHskRows
          .map(
            (
              row,
            ) =>
              typeof row.product_code ===
              "string"
                ? row.product_code
                : "",
          )
          .filter(
            Boolean,
          ),
      ),
    );

  const active =
    aiSpeaking ||
    hskPaid;

  return {
    active,

    source:
      aiSpeaking
        ? "ai_speaking"
        : hskPaid
          ? "hsk"
          : null,

    aiSpeaking,
    hskPaid,

    aiPlanCode,
    hskProducts,
  };
}