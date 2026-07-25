"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../lib/admin-auth";
import { getPlanConfig, type PlanType } from "../../lib/plans";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";

const VALID_PLANS: PlanType[] = ["trial", "plus", "premium", "yearly", "family"];

function isPlan(value: FormDataEntryValue | null): value is PlanType {
  return typeof value === "string" && VALID_PLANS.includes(value as PlanType);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function minutesToSeconds(minutes: number) {
  return Math.max(0, Math.floor(minutes * 60));
}

export async function updateUserPlan(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const planValue = formData.get("plan");

  if (!userId) throw new Error("User ID is missing.");
  if (!isPlan(planValue)) throw new Error("Invalid subscription plan.");

  const plan = planValue;
  const config = getPlanConfig(plan);
  const now = new Date();
  const expiresAt = addDays(now, config.durationDays);

  const quotaUpdate = {
    monthly_limit_seconds: minutesToSeconds(config.monthlyQuotaMinutes),
    monthly_used_seconds: 0,
    standard_limit_seconds: minutesToSeconds(config.standardMinutes),
    standard_used_seconds: 0,
    realtime_limit_seconds: minutesToSeconds(config.realtimeMinutes),
    realtime_used_seconds: 0,
    family_owner: null,
    family_slots: plan === "family" ? 4 : 0,
  };

  const profileUpdate =
    plan === "trial"
      ? {
          ...quotaUpdate,
          subscription_status: "trial",
          plan_type: "trial",
          plan: "trial",
          trial_started_at: now.toISOString(),
          trial_ends_at: expiresAt.toISOString(),
          subscription_started_at: null,
          subscription_ends_at: null,
        }
      : {
          ...quotaUpdate,
          subscription_status: "premium",
          plan_type: plan,
          plan,
          trial_started_at: null,
          trial_ends_at: null,
          subscription_started_at: now.toISOString(),
          subscription_ends_at: expiresAt.toISOString(),
        };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("profiles").update(profileUpdate).eq("id", userId);
  if (error) throw new Error(`Plan update failed: ${error.message}`);

  revalidatePath("/admin");
  return { success: true };
}

export async function resetTodayUsage(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) throw new Error("User ID is missing.");

  const today = new Date().toISOString().slice(0, 10);
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("daily_voice_usage")
    .delete()
    .eq("user_id", userId)
    .eq("usage_date", today);

  if (error) throw new Error(`Usage reset failed: ${error.message}`);

  revalidatePath("/admin");
  return { success: true };
}

export async function toggleUserRole(formData: FormData) {
  const currentAdmin = await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const nextRole = String(formData.get("nextRole") ?? "").trim();

  if (!userId || !["user", "admin"].includes(nextRole)) {
    throw new Error("Invalid role update.");
  }

  if (userId === currentAdmin.user.id && nextRole !== "admin") {
    throw new Error("You cannot remove your own admin access.");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("profiles").update({ role: nextRole }).eq("id", userId);

  if (error) throw new Error(`Role update failed: ${error.message}`);

  revalidatePath("/admin");
  return { success: true };
}
