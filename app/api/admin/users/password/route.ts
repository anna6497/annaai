import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PasswordRequestBody = {
  userId?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return jsonError(
        "Your admin session has expired. Please sign in again.",
        401,
      );
    }

    const admin = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (profileError) {
      console.error("Admin profile lookup failed:", profileError);
      return jsonError("Unable to verify admin access.", 500);
    }

    if (profile?.role !== "admin") {
      return jsonError("Admin access is required.", 403);
    }

    let body: PasswordRequestBody;

    try {
      body = (await request.json()) as PasswordRequestBody;
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const userId =
      typeof body.userId === "string"
        ? body.userId.trim()
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    if (!userId) {
      return jsonError("User ID is missing.", 400);
    }

    if (newPassword.length < 8) {
      return jsonError(
        "Password must contain at least 8 characters.",
        400,
      );
    }

    if (newPassword.length > 72) {
      return jsonError(
        "Password must not exceed 72 characters.",
        400,
      );
    }

    if (newPassword !== confirmPassword) {
      return jsonError("The passwords do not match.", 400);
    }

    const {
      data: userResult,
      error: userLookupError,
    } = await admin.auth.admin.getUserById(userId);

    if (userLookupError || !userResult.user) {
      console.error("Target user lookup failed:", userLookupError);

      return jsonError(
        userLookupError?.message ?? "User was not found.",
        404,
      );
    }

    const { error: updateError } =
      await admin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

    if (updateError) {
      console.error("Password update failed:", updateError);
      return jsonError(updateError.message, 400);
    }

    return NextResponse.json({
      success: true,
      message: `${
        userResult.user.email ?? "User"
      } password changed successfully.`,
    });
  } catch (error) {
    console.error("Password API unexpected error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Could not change the password.",
      500,
    );
  }
}