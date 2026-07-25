"use client";

import { createClient } from "@/lib/supabase/client";
import type { PaymentMethod, PaymentRequestRow } from "@/types/payment";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function createPaymentRequest(input: {
  productCode: string;
  productTitle: string;
  amountMmk: number;
  paymentMethod: PaymentMethod;
  slip: File;
}) {
  if (!ALLOWED_TYPES.includes(input.slip.type)) {
    throw new Error("Only JPG, PNG, WEBP or PDF slips are allowed.");
  }
  if (input.slip.size > MAX_FILE_SIZE) {
    throw new Error("Slip file must be 5 MB or smaller.");
  }

  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Please log in before submitting payment.");

  const ext = input.slip.name.split(".").pop()?.toLowerCase() || "jpg";
  const now = new Date();
  const path = `${user.id}/${now.getUTCFullYear()}/${String(now.getUTCMonth()+1).padStart(2,"0")}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-slips")
    .upload(path, input.slip, {
      cacheControl: "3600",
      contentType: input.slip.type,
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase
    .from("payment_requests")
    .insert({
      user_id: user.id,
      product_code: input.productCode,
      product_title: input.productTitle,
      amount_mmk: input.amountMmk,
      payment_method: input.paymentMethod,
      slip_path: path,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from("payment-slips").remove([path]);
    throw new Error(error.message);
  }

  return data as PaymentRequestRow;
}

export async function getMyPaymentRequests() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as PaymentRequestRow[];
}
