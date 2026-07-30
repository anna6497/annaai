import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  AI_SPEAKING_PLANS,
  isAiSpeakingPlanId,
  type AiSpeakingPlanId,
} from "@/lib/ai-speaking-plans";

export type AiSpeakingAccess = {
  active: boolean;
  planCode: AiSpeakingPlanId | null;
  planTitle: string | null;
  durationLabel: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  lifetime: boolean;
};

const EMPTY_ACCESS: AiSpeakingAccess = {
  active: false,
  planCode: null,
  planTitle: null,
  durationLabel: null,
  startsAt: null,
  expiresAt: null,
  lifetime: false,
};

export async function getAiSpeakingAccess(): Promise<AiSpeakingAccess> {
  /*
   * Use the normal server client only to confirm
   * which user is currently signed in.
   */
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error(
      "AI Speaking authentication error:",
      authError.message,
    );

    return EMPTY_ACCESS;
  }

  if (!user) {
    return EMPTY_ACCESS;
  }

  /*
   * Use the admin client for the subscription query.
   *
   * This avoids an RLS policy blocking the signed-in
   * user from reading their own subscription.
   *
   * Security is preserved because the query is always
   * restricted to the authenticated user's ID.
   */
  const admin = createSupabaseAdminClient();

  const now = new Date().toISOString();

  const { data, error } = await admin
    .from("ai_speaking_subscriptions")
    .select(
      `
        plan_code,
        starts_at,
        expires_at,
        status
      `,
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .lte("starts_at", now)
    .gt("expires_at", now)
    .order("expires_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "AI Speaking subscription query error:",
      {
        userId: user.id,
        email: user.email,
        message: error.message,
      },
    );

    return EMPTY_ACCESS;
  }

  if (!data) {
    console.info(
      "No active AI Speaking subscription:",
      {
        userId: user.id,
        email: user.email,
      },
    );

    return EMPTY_ACCESS;
  }

  const planCode =
    typeof data.plan_code === "string" &&
    isAiSpeakingPlanId(data.plan_code)
      ? data.plan_code
      : null;

  if (!planCode) {
    console.error(
      "Invalid AI Speaking plan code:",
      data.plan_code,
    );

    return EMPTY_ACCESS;
  }

  const plan = AI_SPEAKING_PLANS[planCode];

  return {
    active: true,
    planCode,
    planTitle: plan.title,
    durationLabel: plan.durationLabel,
    startsAt: data.starts_at ?? null,
    expiresAt: data.expires_at ?? null,
    lifetime: Boolean(plan.lifetime),
  };
}