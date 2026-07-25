"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "../../../lib/admin-auth";
import { createSupabaseAdminClient } from "../../../lib/supabase/admin";

export async function saveMaintenanceSettings(
  formData: FormData,
) {
  await requireAdmin();

  const maintenanceMode =
    formData.get("maintenanceMode") === "on";

  const messageValue = formData.get("message");

  const message =
    typeof messageValue === "string"
      ? messageValue.trim()
      : "";

  const maintenanceMessage =
    message ||
    "We're improving Anna AI. Please come back later. Thank you ❤️";

  if (maintenanceMessage.length > 500) {
    throw new Error(
      "Maintenance message must not exceed 500 characters.",
    );
  }

  const admin =
    createSupabaseAdminClient();

  const { error } = await admin
    .from("app_settings")
    .upsert(
      {
        id: "global",
        maintenance_mode:
          maintenanceMode,
        maintenance_message:
          maintenanceMessage,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    );

  if (error) {
    console.error(
      "Save maintenance settings error:",
      error,
    );

    throw new Error(
      `Failed to save maintenance settings: ${error.message}`,
    );
  }

  revalidatePath(
    "/admin/maintenance",
  );

  revalidatePath("/maintenance");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/call");

  redirect(
    "/admin/maintenance",
  );
}