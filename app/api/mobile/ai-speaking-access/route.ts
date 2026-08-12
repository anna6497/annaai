import { NextRequest, NextResponse } from "next/server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  AI_SPEAKING_PLANS,
  isAiSpeakingPlanId,
} from "@/lib/ai-speaking-plans";


export async function GET(
  request: NextRequest,
) {
  try {
    const authorization =
      request.headers.get(
        "authorization",
      );

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer ",
      )
    ) {
      return NextResponse.json(
        {
          active: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }


    const accessToken =
      authorization
        .slice(
          "Bearer ".length,
        )
        .trim();


    if (!accessToken) {
      return NextResponse.json(
        {
          active: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }


    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL
        ?.trim();


    const supabasePublicKey =
      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ?.trim() ||
      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY
        ?.trim();


    if (
      !supabaseUrl ||
      !supabasePublicKey
    ) {
      console.error(
        "Supabase public configuration is missing.",
      );

      return NextResponse.json(
        {
          active: false,
          error:
            "Server configuration error",
        },
        {
          status: 500,
        },
      );
    }


    /**
     * Public-key auth client used only
     * to verify the mobile user's JWT.
     */
    const authClient =
      createSupabaseClient(
        supabaseUrl,
        supabasePublicKey,
        {
          auth: {
            persistSession:
              false,

            autoRefreshToken:
              false,

            detectSessionInUrl:
              false,
          },
        },
      );


    const {
      data: {
        user,
      },
      error:
        authError,
    } =
      await authClient
        .auth
        .getUser(
          accessToken,
        );


    if (
      authError ||
      !user
    ) {
      console.warn(
        "Mobile access token verification failed:",
        authError?.message,
      );

      return NextResponse.json(
        {
          active: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }


    /**
     * Safe here because this code runs
     * only on the server.
     *
     * Never send this key to mobile.
     */
    const admin =
      createSupabaseAdminClient();


    const now =
      new Date()
        .toISOString();


    const {
      data,
      error,
    } =
      await admin
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
        .limit(
          1,
        )
        .maybeSingle();


    if (error) {
      console.error(
        "Mobile AI Speaking subscription query failed:",
        {
          userId:
            user.id,

          message:
            error.message,
        },
      );

      return NextResponse.json(
        {
          active: false,
          error:
            "Subscription check failed",
        },
        {
          status: 500,
        },
      );
    }


    if (!data) {
      return NextResponse.json(
        {
          active: false,
          planCode: null,
          planTitle: null,
          durationLabel: null,
          startsAt: null,
          expiresAt: null,
          lifetime: false,
        },
      );
    }


    const planCode =
      typeof data.plan_code ===
        "string" &&
      isAiSpeakingPlanId(
        data.plan_code,
      )
        ? data.plan_code
        : null;


    if (!planCode) {
      console.error(
        "Invalid AI Speaking plan code:",
        data.plan_code,
      );

      return NextResponse.json(
        {
          active: false,
          error:
            "Invalid plan",
        },
        {
          status: 500,
        },
      );
    }


    const plan =
      AI_SPEAKING_PLANS[
        planCode
      ];


    return NextResponse.json(
      {
        active: true,

        planCode,

        planTitle:
          plan.title,

        durationLabel:
          plan.durationLabel,

        startsAt:
          data.starts_at ??
          null,

        expiresAt:
          data.expires_at ??
          null,

        lifetime:
          Boolean(
            plan.lifetime,
          ),
      },
    );
  } catch (
    error
  ) {
    console.error(
      "Mobile AI Speaking access endpoint error:",
      error,
    );

    return NextResponse.json(
      {
        active: false,
        error:
          "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}