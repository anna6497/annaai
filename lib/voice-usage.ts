import { createClient as createServerClient } from "./supabase/server";
import { createSupabaseAdminClient } from "./supabase/admin";

export type VoicePlan =
  | "trial"
  | "monthly"
  | "yearly"
  | "premium";

export interface VoiceUsageResult {
  allowed: boolean;
  plan: VoicePlan;
  limitSeconds: number;
  usedSeconds: number;
  remainingSeconds: number;
}

async function getAuthenticatedUserId() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getClaims();

  const userId = data?.claims?.sub;

  if (error || !userId) {
    throw new Error("UNAUTHORIZED");
  }

  return userId;
}

function normalizeResult(data: unknown): VoiceUsageResult {
  const row = Array.isArray(data) ? data[0] : data;

  if (!row || typeof row !== "object") {
    throw new Error("Voice usage result is missing.");
  }

  const value = row as Record<string, unknown>;

  return {
    allowed: Boolean(value.allowed),
    plan:
      value.plan === "monthly" ||
      value.plan === "yearly" ||
      value.plan === "premium"
        ? value.plan
        : "trial",
    limitSeconds: Number(value.limit_seconds ?? 0),
    usedSeconds: Number(value.used_seconds ?? 0),
    remainingSeconds: Number(value.remaining_seconds ?? 0),
  };
}

export async function getVoiceUsageStatus() {
  const userId = await getAuthenticatedUserId();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.rpc(
    "get_voice_usage_status",
    {
      p_user_id: userId,
    }
  );

  if (error) {
    throw error;
  }

  return normalizeResult(data);
}

export async function startVoiceUsage() {
  const userId = await getAuthenticatedUserId();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.rpc(
    "start_voice_usage",
    {
      p_user_id: userId,
    }
  );

  if (error) {
    throw error;
  }

  return normalizeResult(data);
}

export async function stopVoiceUsage() {
  const userId = await getAuthenticatedUserId();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.rpc(
    "stop_voice_usage",
    {
      p_user_id: userId,
    }
  );

  if (error) {
    throw error;
  }

  return normalizeResult(data);
}
