"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../lib/admin-auth";
import { createSupabaseAdminClient } from "../../../lib/supabase/admin";

export async function saveMaintenanceSettings(
  formData: FormData
) {
  const adminIdentity = await requireAdmin();
  const admin = createSupabaseAdminClient();

  const enabled =
    formData.get("maintenanceMode") === "on";

  const rawMessage =
    String(formData.get("message") || "").trim();

  const message =
    rawMessage ||
    "We're improving Anna AI. Please come back later. Thank you ❤️";

  const { error } = await admin
    .from("app_settings")
    .upsert(
      {
        id: "global",
        maintenance_mode: enabled,
        maintenance_message: message,
        updated_at: new Date().toISOString(),
        updated_by: adminIdentity.userId,
      },
      {
        onConflict: "id",
      }
    );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/maintenance");
  revalidatePath("/maintenance");
}
