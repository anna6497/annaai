"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../lib/admin-auth";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";

type Plan = "trial" | "monthly" | "yearly" | "premium";

function isPlan(value: FormDataEntryValue | null): value is Plan {
  return value === "trial" || value === "monthly" || value === "yearly" || value === "premium";
}

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

function addYears(date: Date, years: number) {
  const result = new Date(date);
  result.setUTCFullYear(result.getUTCFullYear() + years);
  return result;
}

export async function updateUserPlan(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") || "");
  const plan = formData.get("plan");
  if (!userId || !isPlan(plan)) throw new Error("Invalid user or plan.");

  const now = new Date();
  const update = plan === "trial"
    ? {
        subscription_status: "trial",
        plan_type: "trial",
        trial_started_at: now.toISOString(),
        trial_ends_at: new Date(now.getTime() + 86400000).toISOString(),
        subscription_ends_at: null,
      }
    : {
        subscription_status: "premium",
        plan_type: plan,
        trial_started_at: null,
        trial_ends_at: null,
        subscription_ends_at: plan === "yearly"
          ? addYears(now, 1).toISOString()
          : addMonths(now, 1).toISOString(),
      };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("profiles").update(update).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function resetTodayUsage(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  if (!userId) throw new Error("User ID is missing.");

  const today = new Date().toISOString().slice(0, 10);
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("daily_voice_usage")
    .delete()
    .eq("user_id", userId)
    .eq("usage_date", today);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function toggleUserRole(formData: FormData) {
  const currentAdmin = await requireAdmin();
  const userId = String(formData.get("userId") || "");
  const nextRole = String(formData.get("nextRole") || "");

  if (!userId || !["user", "admin"].includes(nextRole)) {
    throw new Error("Invalid role update.");
  }

  if (userId === currentAdmin.userId && nextRole !== "admin") {
    throw new Error("You cannot remove your own admin access.");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("profiles").update({ role: nextRole }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
