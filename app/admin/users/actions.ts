"use server";

import { revalidatePath } from "next/cache";

import type { ChangePasswordState } from "@/app/admin/users/action-state";
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

function readHskInput(formData: FormData): {
  userId: string;
  productCode: ProductCode;
} {
  const userId = String(formData.get("userId") ?? "").trim();
  const productCode = String(formData.get("productCode") ?? "").trim();

  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!VALID_PRODUCTS.includes(productCode as ProductCode)) {
    throw new Error("Invalid HSK product.");
  }

  return {
    userId,
    productCode: productCode as ProductCode,
  };
}

function readAiInput(formData: FormData): {
  userId: string;
  planCode: AiSpeakingPlanId;
} {
  const userId = String(formData.get("userId") ?? "").trim();
  const planCode = String(formData.get("aiPlanCode") ?? "").trim();

  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!isAiSpeakingPlanId(planCode)) {
    throw new Error("Invalid AI Speaking plan.");
  }

  return {
    userId,
    planCode,
  };
}

function readAiUserId(formData: FormData): string {
  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    throw new Error("User ID is required.");
  }

  return userId;
}

function levelFromProduct(productCode: ProductCode): number | null {
  if (productCode === "hsk_full") {
    return null;
  }

  const level = Number(productCode.replace("hsk_", ""));

  if (!Number.isInteger(level) || level < 2 || level > 9) {
    throw new Error("Invalid HSK level.");
  }

  return level;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);

  return result;
}

function refreshHskPages(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
  revalidatePath("/hsk");
  revalidatePath("/hsk/store");
}

function refreshAiSpeakingPages(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ai");
  revalidatePath("/dashboard/ai/pricing");
}

export async function grantLifetimeAccess(
  formData: FormData,
): Promise<void> {
  try {
    const { user: adminUser } = await requireAdmin();
    const { userId, productCode } = readHskInput(formData);
    const admin = createSupabaseAdminClient();

    const { data: existingRows, error: findError } = await admin
      .from("user_hsk_access")
      .select("id")
      .eq("user_id", userId)
      .eq("product_code", productCode)
      .limit(1);

    if (findError) {
      console.error("HSK access lookup failed:", {
        userId,
        productCode,
        error: findError,
      });
      return;
    }

    if ((existingRows?.length ?? 0) > 0) {
      console.info("User already has selected HSK access:", {
        userId,
        productCode,
      });

      refreshHskPages();
      return;
    }

    const { error: insertError } = await admin
      .from("user_hsk_access")
      .insert({
        user_id: userId,
        product_code: productCode,
        level: levelFromProduct(productCode),
        lifetime: true,
        granted_at: new Date().toISOString(),
        granted_by: adminUser.id,
        notes: "Granted manually by admin",
        source: "admin_manual",
      });

    if (insertError) {
      console.error("HSK access grant failed:", {
        userId,
        productCode,
        adminUserId: adminUser.id,
        error: insertError,
      });
      return;
    }

    console.info("HSK access granted successfully:", {
      userId,
      productCode,
      grantedBy: adminUser.id,
    });

    refreshHskPages();
  } catch (error) {
    console.error("grantLifetimeAccess failed:", error);
  }
}

export async function revokeLifetimeAccess(
  formData: FormData,
): Promise<void> {
  try {
    await requireAdmin();

    const { userId, productCode } = readHskInput(formData);
    const admin = createSupabaseAdminClient();

    const { data: existingRows, error: findError } = await admin
      .from("user_hsk_access")
      .select("id")
      .eq("user_id", userId)
      .eq("product_code", productCode);

    if (findError) {
      console.error("HSK revoke lookup failed:", {
        userId,
        productCode,
        error: findError,
      });
      return;
    }

    if (!existingRows || existingRows.length === 0) {
      console.info("No matching HSK access found:", {
        userId,
        productCode,
      });

      refreshHskPages();
      return;
    }

    const idsToDelete = existingRows.map((row) => String(row.id));

    const { error: deleteError } = await admin
      .from("user_hsk_access")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      console.error("HSK revoke delete failed:", {
        userId,
        productCode,
        idsToDelete,
        error: deleteError,
      });
      return;
    }

    const { data: remainingRows, error: verifyError } = await admin
      .from("user_hsk_access")
      .select("id")
      .eq("user_id", userId)
      .eq("product_code", productCode)
      .limit(1);

    if (verifyError) {
      console.error("HSK revoke verification failed:", {
        userId,
        productCode,
        error: verifyError,
      });
      return;
    }

    if ((remainingRows?.length ?? 0) > 0) {
      console.error("HSK access still exists after deletion:", {
        userId,
        productCode,
      });
      return;
    }

    console.info("HSK access revoked successfully:", {
      userId,
      productCode,
      deletedRows: idsToDelete.length,
    });

    refreshHskPages();
  } catch (error) {
    console.error("revokeLifetimeAccess failed:", error);
  }
}

export async function grantAiSpeakingAccess(
  formData: FormData,
): Promise<void> {
  try {
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
      .update({
        status: "revoked",
      })
      .eq("user_id", userId)
      .eq("status", "active");

    if (revokeExistingError) {
      console.error("Existing AI subscription revoke failed:", {
        userId,
        planCode,
        error: revokeExistingError,
      });
      return;
    }

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

    if (insertError) {
      console.error("AI Speaking plan grant failed:", {
        userId,
        planCode,
        error: insertError,
      });
      return;
    }

    console.info("AI Speaking plan manually granted:", {
      userId,
      planCode,
      grantedBy: adminUser.id,
      expiresAt,
    });

    refreshAiSpeakingPages();
  } catch (error) {
    console.error("grantAiSpeakingAccess failed:", error);
  }
}

export async function revokeAiSpeakingAccess(
  formData: FormData,
): Promise<void> {
  try {
    await requireAdmin();

    const userId = readAiUserId(formData);
    const admin = createSupabaseAdminClient();

    const { data: activeRows, error: findError } = await admin
      .from("ai_speaking_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active");

    if (findError) {
      console.error("AI subscription lookup failed:", {
        userId,
        error: findError,
      });
      return;
    }

    if (!activeRows || activeRows.length === 0) {
      console.info("User has no active AI Speaking subscription:", {
        userId,
      });

      refreshAiSpeakingPages();
      return;
    }

    const { error: updateError } = await admin
      .from("ai_speaking_subscriptions")
      .update({
        status: "revoked",
      })
      .eq("user_id", userId)
      .eq("status", "active");

    if (updateError) {
      console.error("AI Speaking revoke failed:", {
        userId,
        error: updateError,
      });
      return;
    }

    console.info("AI Speaking access revoked successfully:", {
      userId,
      affectedRows: activeRows.length,
    });

    refreshAiSpeakingPages();
  } catch (error) {
    console.error("revokeAiSpeakingAccess failed:", error);
  }
}

export async function changeUserPassword(
  _previousState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  try {
    await requireAdmin();

    const userId = String(formData.get("userId") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(
      formData.get("confirmPassword") ?? "",
    );

    if (!userId) {
      return {
        success: false,
        message: "User ID is missing.",
      };
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
      return {
        success: false,
        message: "The passwords do not match.",
      };
    }

    const admin = createSupabaseAdminClient();

    const { data: userResult, error: userLookupError } =
      await admin.auth.admin.getUserById(userId);

    if (userLookupError || !userResult.user) {
      return {
        success: false,
        message:
          userLookupError?.message ?? "User was not found.",
      };
    }

    const { error: passwordError } =
      await admin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

    if (passwordError) {
      return {
        success: false,
        message: passwordError.message,
      };
    }

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `${
        userResult.user.email ?? "User"
      } password changed successfully.`,
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