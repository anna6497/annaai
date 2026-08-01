"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  PaymentMethod,
  PaymentRequestRow,
} from "@/types/payment";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

const PENDING_PAYMENT_MESSAGE =
  "သင့် Payment Request ကို Admin စစ်ဆေးနေဆဲဖြစ်ပါတယ်။ Approved သို့မဟုတ် Rejected လုပ်ပြီးမှ နောက်ထပ် Payment တင်နိုင်ပါမယ်။";

type CreatePaymentRequestInput = {
  productCode: string;
  productTitle: string;
  amountMmk: number;
  paymentMethod: PaymentMethod;
  slip: File;
};

export type PendingPaymentResult = {
  hasPendingPayment: boolean;
  payment: PaymentRequestRow | null;
};

function validateSlip(slip: File): void {
  if (!ALLOWED_TYPES.includes(
    slip.type as (typeof ALLOWED_TYPES)[number],
  )) {
    throw new Error(
      "Only JPG, PNG, WEBP or PDF slips are allowed.",
    );
  }

  if (slip.size > MAX_FILE_SIZE) {
    throw new Error("Slip file must be 5 MB or smaller.");
  }

  if (slip.size <= 0) {
    throw new Error("The selected slip file is empty.");
  }
}

function getFileExtension(file: File): string {
  const extension = file.name
    .split(".")
    .pop()
    ?.trim()
    .toLowerCase();

  if (extension) {
    return extension;
  }

  switch (file.type) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "application/pdf":
      return "pdf";

    default:
      return "jpg";
  }
}

function createSlipPath(
  userId: string,
  file: File,
): string {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(
    now.getUTCMonth() + 1,
  ).padStart(2, "0");

  const extension = getFileExtension(file);

  return [
    userId,
    String(year),
    month,
    `${crypto.randomUUID()}.${extension}`,
  ].join("/");
}

export async function getMyPendingPaymentRequest():
  Promise<PendingPaymentResult> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    return {
      hasPendingPayment: false,
      payment: null,
    };
  }

  const { data, error } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    hasPendingPayment: Boolean(data),
    payment: data
      ? (data as PaymentRequestRow)
      : null,
  };
}

export async function createPaymentRequest(
  input: CreatePaymentRequestInput,
): Promise<PaymentRequestRow> {
  validateSlip(input.slip);

  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "Please log in before submitting payment.",
    );
  }

  /*
   * Slip upload မလုပ်ခင် pending payment ရှိ/မရှိစစ်ပါတယ်။
   */
  const {
    data: existingPending,
    error: pendingError,
  } = await supabase
    .from("payment_requests")
    .select("id, status, product_code, product_title, created_at")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (pendingError) {
    throw new Error(
      `Could not check pending payments: ${pendingError.message}`,
    );
  }

  if (existingPending) {
    throw new Error(PENDING_PAYMENT_MESSAGE);
  }

  const slipPath = createSlipPath(
    user.id,
    input.slip,
  );

  const { error: uploadError } =
    await supabase.storage
      .from("payment-slips")
      .upload(slipPath, input.slip, {
        cacheControl: "3600",
        contentType: input.slip.type,
        upsert: false,
      });

  if (uploadError) {
    throw new Error(
      `Payment slip upload failed: ${uploadError.message}`,
    );
  }

  const { data, error: insertError } =
    await supabase
      .from("payment_requests")
      .insert({
        user_id: user.id,
        product_code: input.productCode,
        product_title: input.productTitle,
        amount_mmk: input.amountMmk,
        payment_method: input.paymentMethod,
        slip_path: slipPath,
        status: "pending",
      })
      .select("*")
      .single();

  if (insertError) {
    /*
     * Payment request insert မအောင်မြင်ရင်
     * orphan slip မကျန်အောင် upload ကိုဖျက်ပါတယ်။
     */
    const { error: cleanupError } =
      await supabase.storage
        .from("payment-slips")
        .remove([slipPath]);

    if (cleanupError) {
      console.error(
        "Failed to remove unused payment slip:",
        cleanupError,
      );
    }

    /*
     * PostgreSQL unique violation:
     * တပြိုင်တည်း submit နှစ်ခုဝင်လာတဲ့ race condition ကို
     * database unique index ကတားလိုက်တဲ့အခါ ဖြစ်ပါတယ်။
     */
    if (insertError.code === "23505") {
      throw new Error(PENDING_PAYMENT_MESSAGE);
    }

    throw new Error(
      `Payment submission failed: ${insertError.message}`,
    );
  }

  return data as PaymentRequestRow;
}

export async function getMyPaymentRequests():
  Promise<PaymentRequestRow[]> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PaymentRequestRow[];
}