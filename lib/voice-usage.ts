import {
  createClient as createServerClient,
} from "./supabase/server";

import {
  createSupabaseAdminClient,
} from "./supabase/admin";

export type VoicePlan =
  | "monthly"
  | "yearly"
  | "premium";

export interface VoiceUsageResult {
  allowed: boolean;
  plan: VoicePlan | null;
  limitSeconds: number;
  usedSeconds: number;
  remainingSeconds: number;
}

async function getAuthenticatedUserId() {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.auth.getClaims();

  const userId =
    data?.claims?.sub;

  if (
    error ||
    !userId
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  return userId;
}

function normalizeResult(
  data: unknown,
): VoiceUsageResult {
  const row =
    Array.isArray(data)
      ? data[0]
      : data;

  if (
    !row ||
    typeof row !== "object"
  ) {
    return {
      allowed: false,
      plan: null,
      limitSeconds: 0,
      usedSeconds: 0,
      remainingSeconds: 0,
    };
  }

  const value =
    row as Record<
      string,
      unknown
    >;

  const rawPlan =
    value.plan;

  const plan: VoicePlan | null =
    rawPlan === "monthly" ||
    rawPlan === "yearly" ||
    rawPlan === "premium"
      ? rawPlan
      : null;

  const limitSeconds =
    Math.max(
      0,
      Number(
        value.limit_seconds ??
          0,
      ),
    );

  const usedSeconds =
    Math.max(
      0,
      Number(
        value.used_seconds ??
          0,
      ),
    );

  const remainingSeconds =
    Math.max(
      0,
      Number(
        value.remaining_seconds ??
          0,
      ),
    );

  /*
   * Important:
   * Trial / unknown plans are not allowed.
   *
   * Even if the legacy database RPC returns
   * allowed=true for a trial row, Anna AI
   * will reject it here.
   */
  const allowed =
    Boolean(value.allowed) &&
    plan !== null &&
    remainingSeconds > 0;

  return {
    allowed,
    plan,
    limitSeconds,
    usedSeconds,
    remainingSeconds,
  };
}

export async function getVoiceUsageStatus() {
  const userId =
    await getAuthenticatedUserId();

  const admin =
    createSupabaseAdminClient();

  const {
    data,
    error,
  } =
    await admin.rpc(
      "get_voice_usage_status",
      {
        p_user_id:
          userId,
      },
    );

  if (error) {
    throw error;
  }

  return normalizeResult(
    data,
  );
}

export async function startVoiceUsage() {
  const userId =
    await getAuthenticatedUserId();

  const admin =
    createSupabaseAdminClient();

  const {
    data,
    error,
  } =
    await admin.rpc(
      "start_voice_usage",
      {
        p_user_id:
          userId,
      },
    );

  if (error) {
    throw error;
  }

  return normalizeResult(
    data,
  );
}

export async function stopVoiceUsage() {
  const userId =
    await getAuthenticatedUserId();

  const admin =
    createSupabaseAdminClient();

  const {
    data,
    error,
  } =
    await admin.rpc(
      "stop_voice_usage",
      {
        p_user_id:
          userId,
      },
    );

  if (error) {
    throw error;
  }

  return normalizeResult(
    data,
  );
}