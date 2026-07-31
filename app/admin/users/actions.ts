"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-auth";
import {
  AI_SPEAKING_PLANS,
  isAiSpeakingPlanId,
  type AiSpeakingPlanId,
} from "@/lib/ai-speaking-plans";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const VALID_PRODUCTS = [
  "hsk_2",
  "hsk_3",
  "hsk_4",
  "hsk_5",
  "hsk_6",
  "hsk_7",
  "hsk_8",
  "hsk_9",
  "hsk_full",
] as const;

type ProductCode = (typeof VALID_PRODUCTS)[number];

const AI_LIFETIME_EXPIRY = "2099-12-31T23:59:59.999Z";

export type ChangePasswordState = {
  success: boolean;
  message: string;
};

export const initialChangePasswordState: ChangePasswordState = {
  success: false,
  message: "",
};

function readHskInput(formData: FormData) {
  const userId = String(formData.get("userId") ?? "").trim();
  const productCode = String(formData.get("productCode") ?? "").trim();

  if (!userId) throw new Error("User ID is required.");
  if (!VALID_PRODUCTS.includes(productCode as ProductCode)) {
    throw new Error("Invalid product.");
  }

  return { userId, productCode: productCode as ProductCode };
}

function readAiInput(formData: FormData): {
  userId: string;
  planCode: AiSpeakingPlanId;
} {
  const userId = String(formData.get("userId") ?? "").trim();
  const planCode = String(formData.get("aiPlanCode") ?? "").trim();

  if (!userId) throw new Error("User ID is required.");
  if (!isAiSpeakingPlanId(planCode)) {
    throw new Error("Invalid AI Speaking plan.");
  }

  return { userId, planCode };
}

function readAiUserId(formData: FormData): string {
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) throw new Error("User ID is required.");
  return userId;
}

function levelFromProduct(productCode: ProductCode) {
  if (productCode === "hsk_full") return null;
  return Number(productCode.replace("hsk_", ""));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function refreshAdminPages() {
  [
    "/admin",
    "/admin/users",
    "/admin/payments",
    "/dashboard",
    "/dashboard/ai",
    "/dashboard/ai/pricing",
    "/hsk",
    "/hsk/store",
  ].forEach((path) => revalidatePath(path));
}

export async function grantLifetimeAccess(formData: FormData) {
  const { user } = await requireAdmin();
  const { userId, productCode } = readHskInput(formData);
  const admin = createSupabaseAdminClient();

  const { data: existing, error: findError } = await admin
    .from("user_hsk_access")
    .select("id")
    .eq("user_id", userId)
    .eq("product_code", productCode)
    .limit(1);

  if (findError) throw new Error(findError.message);

  if ((existing?.length ?? 0) === 0) {
    const { error } = await admin.from("user_hsk_access").insert({
      user_id: userId,
      product_code: productCode,
      level: levelFromProduct(productCode),
      lifetime: true,
      granted_at: new Date().toISOString(),
      granted_by: user.id,
      notes: "Granted manually by admin",
      source: "admin_manual",
    });

    if (error) throw new Error(error.message);
  }

  refreshAdminPages();
}

export async function revokeLifetimeAccess(formData: FormData) {
  await requireAdmin();
  const { userId, productCode } = readHskInput(formData);
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("user_hsk_access")
    .delete()
    .eq("user_id", userId)
    .eq("product_code", productCode);

  if (error) throw new Error(error.message);
  refreshAdminPages();
}

export async function grantAiSpeakingAccess(formData: FormData) {
  const { user: adminUser } = await requireAdmin();
  const { userId, planCode } = readAiInput(formData);
  const admin = createSupabaseAdminClient();
  const plan = AI_SPEAKING_PLANS[planCode];
  const now = new Date();

  const expiresAt =
    plan.lifetime || plan.durationDays === null
      ? AI_LIFETIME_EXPIRY
      : addDays(now, plan.durationDays).toISOString();

  const { error: revokeExistingError } = await admin
    .from("ai_speaking_subscriptions")
    .update({ status: "revoked" })
    .eq("user_id", userId)
    .eq("status", "active");

  if (revokeExistingError) throw new Error(revokeExistingError.message);

  const { error: insertError } = await admin
    .from("ai_speaking_subscriptions")
    .insert({
      user_id: userId,
      payment_id: null,
      plan_code: planCode,
      starts_at: now.toISOString(),
      expires_at: expiresAt,
      status: "active",
    });

  if (insertError) throw new Error(insertError.message);

  console.info("AI Speaking plan manually granted", {
    userId,
    planCode,
    grantedBy: adminUser.id,
    expiresAt,
  });

  refreshAdminPages();
}

export async function revokeAiSpeakingAccess(formData: FormData) {
  await requireAdmin();
  const userId = readAiUserId(formData);
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("ai_speaking_subscriptions")
    .update({ status: "revoked" })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) throw new Error(error.message);
  refreshAdminPages();
}

export async function changeUserPassword(
  _previousState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  try {
    await requireAdmin();

    const userId = String(formData.get("userId") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!userId) {
      return { success: false, message: "User ID is missing." };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        message: "Password must contain at least 8 characters.",
      };
    }

    if (newPassword.length > 72) {
      return {
        success: false,
        message: "Password must not exceed 72 characters.",
      };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: "The passwords do not match." };
    }

    const admin = createSupabaseAdminClient();

    const { data: userResult, error: userLookupError } =
      await admin.auth.admin.getUserById(userId);

    if (userLookupError || !userResult.user) {
      return {
        success: false,
        message: userLookupError?.message ?? "User was not found.",
      };
    }

    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) return { success: false, message: error.message };

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `${userResult.user.email ?? "User"} password changed successfully.`,
    };
  } catch (error) {
    console.error("Password update failed:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not change the password.",
    };
  }
}