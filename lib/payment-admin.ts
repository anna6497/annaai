"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Admin access required.");
  return { admin, user };
}

export async function getAdminPayments() {
  const { admin } = await requireAdmin();
  const { data, error } = await admin
    .from("payment_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return Promise.all((data ?? []).map(async (row) => {
    const { data: signed } = await admin.storage
      .from("payment-slips")
      .createSignedUrl(row.slip_path, 900);

    return { ...row, slip_signed_url: signed?.signedUrl ?? null };
  }));
}

export async function reviewPaymentRequest(
  paymentId: string,
  decision: "approved" | "rejected",
  adminNote = "",
) {
  const { admin, user } = await requireAdmin();

  const { error } = await admin.rpc("review_payment_request", {
    p_payment_id: paymentId,
    p_decision: decision,
    p_admin_note: adminNote || null,
    p_reviewer: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard/payments");
  revalidatePath("/hsk");
}
