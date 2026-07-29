"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const AI_PLAN_DAYS: Record<string, number> = {
  "ai-monthly": 30,
  "ai-six-months": 180,
  "ai-yearly": 365,
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

async function reviewAiPayment(
  paymentId: string,
  decision: "approved" | "rejected",
  adminNote: string,
) {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  const { data: payment, error: paymentError } = await admin
    .from("payment_requests")
    .select("id, user_id, product_code, status")
    .eq("id", paymentId)
    .single();

  if (paymentError || !payment) {
    throw new Error(paymentError?.message ?? "Payment not found.");
  }

  if (payment.status !== "pending") {
    throw new Error("This payment was already reviewed.");
  }

  const now = new Date();

  if (decision === "approved") {
    const durationDays = AI_PLAN_DAYS[String(payment.product_code)];
    if (!durationDays) throw new Error("Unknown AI Speaking plan.");

    const { data: current } = await admin
      .from("ai_speaking_subscriptions")
      .select("expires_at")
      .eq("user_id", payment.user_id)
      .eq("status", "active")
      .gt("expires_at", now.toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const base = current?.expires_at && new Date(current.expires_at) > now
      ? new Date(current.expires_at)
      : now;

    const { error: subscriptionError } = await admin
      .from("ai_speaking_subscriptions")
      .insert({
        user_id: payment.user_id,
        payment_id: payment.id,
        plan_code: payment.product_code,
        starts_at: now.toISOString(),
        expires_at: addDays(base, durationDays).toISOString(),
        status: "active",
      });

    if (subscriptionError) throw new Error(subscriptionError.message);
  }

  const { error: updateError } = await admin
    .from("payment_requests")
    .update({
      status: decision,
      admin_note: adminNote || null,
      reviewed_at: now.toISOString(),
    })
    .eq("id", payment.id)
    .eq("status", "pending");

  if (updateError) throw new Error(updateError.message);
}

async function reviewExistingHskPayment(
  paymentId: string,
  decision: "approved" | "rejected",
  adminNote: string,
) {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  const { error } = await admin.rpc("review_payment_request", {
    p_payment_id: paymentId,
    p_decision: decision,
    p_admin_note: adminNote || null,
    p_reviewer: null,
  });

  if (error) throw new Error(error.message);
}

async function reviewFromForm(
  formData: FormData,
  decision: "approved" | "rejected",
) {
  const paymentId = String(formData.get("paymentId") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  if (!paymentId) throw new Error("Payment ID is required.");

  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { data: payment, error } = await admin
    .from("payment_requests")
    .select("product_code")
    .eq("id", paymentId)
    .single();

  if (error || !payment) throw new Error(error?.message ?? "Payment not found.");

  if (String(payment.product_code).startsWith("ai-")) {
    await reviewAiPayment(paymentId, decision, adminNote);
  } else {
    await reviewExistingHskPayment(paymentId, decision, adminNote);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard/ai");
  revalidatePath("/dashboard/ai/pricing");
  revalidatePath("/dashboard");
  revalidatePath("/hsk");
}

export async function approvePayment(formData: FormData) {
  await reviewFromForm(formData, "approved");
}

export async function rejectPayment(formData: FormData) {
  await reviewFromForm(formData, "rejected");
}
