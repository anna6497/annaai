"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
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

type HskProductCode = (typeof VALID_PRODUCTS)[number];

function parseLevel(productCode: HskProductCode): number | null {
  if (productCode === "hsk_full") return null;
  const level = Number(productCode.replace("hsk_", ""));
  return Number.isInteger(level) && level >= 2 && level <= 9 ? level : null;
}

function revalidateAdminPaths() {
  [
    "/admin",
    "/admin/payments",
    "/admin/users",
    "/dashboard",
    "/dashboard/payments",
    "/hsk/store",
  ].forEach((path) => revalidatePath(path));
}

export async function approvePayment(formData: FormData) {
  const paymentId = String(formData.get("paymentId") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (!paymentId) throw new Error("Payment ID is required.");

  const { user } = await requireAdmin();
  const admin = createSupabaseAdminClient();

  const { data: payment, error: paymentError } = await admin
    .from("payment_requests")
    .select("id,user_id,product_code,status")
    .eq("id", paymentId)
    .single();

  if (paymentError || !payment) {
    throw new Error(paymentError?.message ?? "Payment request not found.");
  }

  const productCode = String(payment.product_code) as HskProductCode;
  if (!VALID_PRODUCTS.includes(productCode)) {
    throw new Error("This payment has an unsupported product code.");
  }

  if (payment.status === "rejected") {
    throw new Error("A rejected payment cannot be approved directly.");
  }

  const reviewedAt = new Date().toISOString();

  const { error: updateError } = await admin
    .from("payment_requests")
    .update({
      status: "approved",
      admin_note: adminNote || null,
      reviewed_at: reviewedAt,
      reviewed_by: user.id,
    })
    .eq("id", paymentId);

  if (updateError) throw new Error(updateError.message);

  const { data: existingAccess, error: existingError } = await admin
    .from("user_hsk_access")
    .select("id")
    .eq("user_id", payment.user_id)
    .eq("product_code", productCode)
    .limit(1);

  if (existingError) {
    await admin
      .from("payment_requests")
      .update({
        status: "pending",
        reviewed_at: null,
        reviewed_by: null,
      })
      .eq("id", paymentId);
    throw new Error(existingError.message);
  }

  if ((existingAccess?.length ?? 0) === 0) {
    const { error: insertError } = await admin.from("user_hsk_access").insert({
      user_id: payment.user_id,
      product_code: productCode,
      level: parseLevel(productCode),
      lifetime: true,
      granted_at: reviewedAt,
      granted_by: user.id,
      notes: adminNote || `Approved payment ${paymentId}`,
      source: "payment",
    });

    if (insertError) {
      await admin
        .from("payment_requests")
        .update({
          status: "pending",
          reviewed_at: null,
          reviewed_by: null,
        })
        .eq("id", paymentId);
      throw new Error(insertError.message);
    }
  }

  revalidateAdminPaths();
}

export async function rejectPayment(formData: FormData) {
  const paymentId = String(formData.get("paymentId") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (!paymentId) throw new Error("Payment ID is required.");

  const { user } = await requireAdmin();
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("payment_requests")
    .update({
      status: "rejected",
      admin_note: adminNote || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", paymentId)
    .eq("status", "pending");

  if (error) throw new Error(error.message);

  revalidateAdminPaths();
}
