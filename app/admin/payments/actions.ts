"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ReviewDecision =
  | "approved"
  | "rejected";

type PaymentRequestRow = {
  id: string;
  user_id: string;
  product_code: string;
  status: string;
};

const AI_PLAN_DAYS: Record<
  string,
  number
> = {
  "ai-monthly": 30,
  "ai-six-months": 180,
  "ai-yearly": 365,
};

const AI_LIFETIME_EXPIRY =
  "2099-12-31T23:59:59.999Z";

function addDays(
  date: Date,
  days: number,
): Date {
  const result = new Date(date);

  result.setUTCDate(
    result.getUTCDate() + days,
  );

  return result;
}

function normalizeProductCode(
  value: unknown,
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function getHskLevel(
  productCode: string,
): number | null {
  /*
   * Supported examples:
   *
   * hsk_2
   * hsk-2
   * hsk_level_2
   * hsk-level-2
   * hsk2
   */
  const match = productCode.match(
    /^hsk(?:[_-]?level)?[_-]?([1-9])$/,
  );

  if (!match) {
    return null;
  }

  const level = Number(match[1]);

  if (
    !Number.isInteger(level) ||
    level < 1 ||
    level > 9
  ) {
    return null;
  }

  return level;
}

async function getPendingPayment(
  paymentId: string,
): Promise<PaymentRequestRow> {
  const admin =
    createSupabaseAdminClient();

  const {
    data: payment,
    error,
  } = await admin
    .from("payment_requests")
    .select(
      "id,user_id,product_code,status",
    )
    .eq("id", paymentId)
    .single();

  if (error || !payment) {
    throw new Error(
      error?.message ??
        "Payment request not found.",
    );
  }

  if (payment.status !== "pending") {
    throw new Error(
      "This payment was already reviewed.",
    );
  }

  return payment as PaymentRequestRow;
}

async function updatePaymentStatus({
  paymentId,
  decision,
  adminNote,
  reviewedAt,
}: {
  paymentId: string;
  decision: ReviewDecision;
  adminNote: string;
  reviewedAt: string;
}) {
  const admin =
    createSupabaseAdminClient();

  const { data, error } = await admin
    .from("payment_requests")
    .update({
      status: decision,
      admin_note:
        adminNote.length > 0
          ? adminNote
          : null,
      reviewed_at: reviewedAt,

      /*
       * Keep this null unless requireAdmin()
       * returns an authenticated admin UUID
       * that you explicitly want to save.
       */
      reviewed_by: null,
    })
    .eq("id", paymentId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to update payment: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "Payment status was not updated. It may already have been reviewed.",
    );
  }
}

async function approveAiPayment(
  payment: PaymentRequestRow,
  now: Date,
) {
  const admin =
    createSupabaseAdminClient();

  const productCode =
    normalizeProductCode(
      payment.product_code,
    );

  const isLifetime =
    productCode === "ai-lifetime";

  const durationDays =
    AI_PLAN_DAYS[productCode];

  if (
    !isLifetime &&
    !durationDays
  ) {
    throw new Error(
      `Unknown AI Speaking plan: ${productCode}`,
    );
  }

  /*
   * Prevent duplicate access if an earlier
   * attempt inserted the subscription but the
   * payment update failed afterward.
   */
  const {
    data: existingPaymentSubscription,
    error:
      existingPaymentSubscriptionError,
  } = await admin
    .from(
      "ai_speaking_subscriptions",
    )
    .select("id")
    .eq("payment_id", payment.id)
    .maybeSingle();

  if (
    existingPaymentSubscriptionError
  ) {
    throw new Error(
      existingPaymentSubscriptionError.message,
    );
  }

  if (existingPaymentSubscription) {
    return;
  }

  let expiresAt: string;

  if (isLifetime) {
    expiresAt =
      AI_LIFETIME_EXPIRY;
  } else {
    const {
      data: current,
      error: currentError,
    } = await admin
      .from(
        "ai_speaking_subscriptions",
      )
      .select("expires_at")
      .eq(
        "user_id",
        payment.user_id,
      )
      .eq("status", "active")
      .gt(
        "expires_at",
        now.toISOString(),
      )
      .order("expires_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (currentError) {
      throw new Error(
        currentError.message,
      );
    }

    const currentExpiry =
      current?.expires_at
        ? new Date(
            current.expires_at,
          )
        : null;

    const baseDate =
      currentExpiry &&
      !Number.isNaN(
        currentExpiry.getTime(),
      ) &&
      currentExpiry > now
        ? currentExpiry
        : now;

    expiresAt = addDays(
      baseDate,
      durationDays,
    ).toISOString();
  }

  const {
    error: subscriptionError,
  } = await admin
    .from(
      "ai_speaking_subscriptions",
    )
    .insert({
      user_id: payment.user_id,
      payment_id: payment.id,
      plan_code: productCode,
      starts_at: now.toISOString(),
      expires_at: expiresAt,
      status: "active",
    });

  if (subscriptionError) {
    throw new Error(
      `Unable to grant AI Speaking access: ${subscriptionError.message}`,
    );
  }
}

async function approveHskPayment(
  payment: PaymentRequestRow,
  adminNote: string,
  now: Date,
) {
  const admin =
    createSupabaseAdminClient();

  const productCode =
    normalizeProductCode(
      payment.product_code,
    );

  const isFullPackage =
    productCode === "hsk_full" ||
    productCode === "hsk-full";

  const level = isFullPackage
    ? null
    : getHskLevel(productCode);

  if (
    !isFullPackage &&
    level === null
  ) {
    throw new Error(
      `Unknown HSK product: ${productCode}`,
    );
  }

  /*
   * Check whether access from this exact
   * payment was already created.
   *
   * notes includes the payment ID in the
   * existing database format.
   */
  const {
    data: existingPaymentAccess,
    error:
      existingPaymentAccessError,
  } = await admin
    .from("user_hsk_access")
    .select("id")
    .eq("user_id", payment.user_id)
    .eq("source", "payment")
    .ilike(
      "notes",
      `%${payment.id}%`,
    )
    .limit(1)
    .maybeSingle();

  if (existingPaymentAccessError) {
    throw new Error(
      existingPaymentAccessError.message,
    );
  }

  if (existingPaymentAccess) {
    return;
  }

  /*
   * Also prevent duplicate lifetime access
   * when the same user already owns the same
   * HSK product through another payment.
   */
  let existingAccessQuery = admin
    .from("user_hsk_access")
    .select("id")
    .eq("user_id", payment.user_id)
    .eq(
      "product_code",
      isFullPackage
        ? "hsk_full"
        : productCode,
    )
    .eq("lifetime", true);

  if (isFullPackage) {
    existingAccessQuery =
      existingAccessQuery.is(
        "level",
        null,
      );
  } else {
    existingAccessQuery =
      existingAccessQuery.eq(
        "level",
        level,
      );
  }

  const {
    data: existingAccess,
    error: existingAccessError,
  } = await existingAccessQuery
    .limit(1)
    .maybeSingle();

  if (existingAccessError) {
    throw new Error(
      existingAccessError.message,
    );
  }

  /*
   * If the user already has this access,
   * do not insert a duplicate row. The
   * payment will still be marked approved.
   */
  if (existingAccess) {
    return;
  }

  const notes = adminNote
    ? `Approved payment ${payment.id}. Admin note: ${adminNote}`
    : `Approved payment ${payment.id}`;

  const {
    error: accessError,
  } = await admin
    .from("user_hsk_access")
    .insert({
      user_id: payment.user_id,

      /*
       * Store the canonical code used by
       * the existing successful row.
       */
      product_code: isFullPackage
        ? "hsk_full"
        : productCode,

      level,
      lifetime: true,
      granted_at: now.toISOString(),

      /*
       * Existing schema accepts a UUID here.
       * Keep it null because the current
       * requireAdmin implementation has not
       * been confirmed to return an admin ID.
       */
      granted_by: null,

      notes,
      source: "payment",
    });

  if (accessError) {
    throw new Error(
      `Unable to grant HSK access: ${accessError.message}`,
    );
  }
}

async function reviewFromForm(
  formData: FormData,
  decision: ReviewDecision,
) {
  await requireAdmin();

  const paymentId = String(
    formData.get("paymentId") ?? "",
  ).trim();

  const adminNote = String(
    formData.get("adminNote") ?? "",
  ).trim();

  if (!paymentId) {
    throw new Error(
      "Payment ID is required.",
    );
  }

  const payment =
    await getPendingPayment(
      paymentId,
    );

  const productCode =
    normalizeProductCode(
      payment.product_code,
    );

  const now = new Date();

  if (decision === "approved") {
    if (
      productCode.startsWith(
        "ai-",
      )
    ) {
      await approveAiPayment(
        payment,
        now,
      );
    } else {
      await approveHskPayment(
        payment,
        adminNote,
        now,
      );
    }
  }

  await updatePaymentStatus({
    paymentId: payment.id,
    decision,
    adminNote,
    reviewedAt:
      now.toISOString(),
  });

  revalidatePath(
    "/admin/payments",
  );

  revalidatePath(
    "/admin/users",
  );

  revalidatePath(
    "/dashboard",
  );

  revalidatePath(
    "/dashboard/ai",
  );

  revalidatePath(
    "/dashboard/ai/pricing",
  );

  revalidatePath("/hsk");

  revalidatePath(
    "/hsk/store",
  );

  revalidatePath(
    "/hsk/flashcards",
  );

  revalidatePath(
    "/hsk/writing",
  );
}

export async function approvePayment(
  formData: FormData,
) {
  await reviewFromForm(
    formData,
    "approved",
  );
}

export async function rejectPayment(
  formData: FormData,
) {
  await reviewFromForm(
    formData,
    "rejected",
  );
}