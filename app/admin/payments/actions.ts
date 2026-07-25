"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";

export async function approvePayment(formData: FormData) {
  const paymentId = String(formData.get("paymentId") ?? "");
  const adminNote = String(formData.get("adminNote") ?? "");

  if (!paymentId) {
    throw new Error("Payment ID is required.");
  }

  const { supabase, user } = await requireAdmin();

  const { error } = await supabase.rpc("review_payment_request", {
    p_payment_id: paymentId,
    p_decision: "approved",
    p_admin_note: adminNote || null,
    p_reviewer: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard/payments");
  revalidatePath("/hsk/store");
}

export async function rejectPayment(formData: FormData) {
  const paymentId = String(formData.get("paymentId") ?? "");
  const adminNote = String(formData.get("adminNote") ?? "");

  if (!paymentId) {
    throw new Error("Payment ID is required.");
  }

  const { supabase, user } = await requireAdmin();

  const { error } = await supabase.rpc("review_payment_request", {
    p_payment_id: paymentId,
    p_decision: "rejected",
    p_admin_note: adminNote || null,
    p_reviewer: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard/payments");
  revalidatePath("/hsk/store");
}
