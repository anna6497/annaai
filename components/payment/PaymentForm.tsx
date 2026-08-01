"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector";
import { PAYMENT_CONFIG } from "@/lib/payment-config";
import {
  createPaymentRequest,
  getMyPendingPaymentRequest,
} from "@/lib/payment-client";
import {
  formatMmk,
  formatThb,
} from "@/lib/payment-products";
import type {
  PaymentMethod,
  PaymentProduct,
  PaymentRequestRow,
} from "@/types/payment";

const PENDING_PAYMENT_MESSAGE =
  "သင့် Payment Request ကို Admin စစ်ဆေးနေဆဲဖြစ်ပါတယ်။ Approved သို့မဟုတ် Rejected လုပ်ပြီးမှ နောက်ထပ် Payment တင်နိုင်ပါမယ်။";

function formatPendingDate(
  value: unknown,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentForm({
  product,
}: {
  product: PaymentProduct;
}) {
  const router = useRouter();

  const [method, setMethod] =
    useState<PaymentMethod>("kpay");

  const [slip, setSlip] =
    useState<File | null>(null);

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [checkingPending, setCheckingPending] =
    useState(true);

  const [pendingPayment, setPendingPayment] =
    useState<PaymentRequestRow | null>(null);

  const config = PAYMENT_CONFIG[method];

  const displayAmount =
    method === "kpay"
      ? formatMmk(product.priceMmk)
      : formatThb(product.priceThb);

  useEffect(() => {
    let cancelled = false;

    async function checkPendingPayment() {
      try {
        setCheckingPending(true);

        const result =
          await getMyPendingPaymentRequest();

        if (cancelled) {
          return;
        }

        setPendingPayment(result.payment);

        if (result.hasPendingPayment) {
          setMessage(PENDING_PAYMENT_MESSAGE);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Pending payment check failed:",
          error,
        );

        setMessage(
          error instanceof Error
            ? error.message
            : "Payment status စစ်ဆေး၍မရပါ။",
        );
      } finally {
        if (!cancelled) {
          setCheckingPending(false);
        }
      }
    }

    void checkPendingPayment();

    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMessage("");

    if (checkingPending) {
      setMessage(
        "Payment status စစ်ဆေးနေပါတယ်။ ခဏစောင့်ပါ။",
      );
      return;
    }

    if (pendingPayment) {
      setMessage(PENDING_PAYMENT_MESSAGE);
      return;
    }

    if (!slip) {
      setMessage(
        "ငွေလွှဲပြီး Payment slip ကို upload လုပ်ပေးပါ။",
      );
      return;
    }

    try {
      setSubmitting(true);

      await createPaymentRequest({
        productCode: product.code,
        productTitle: product.title,
        amountMmk: product.priceMmk,
        paymentMethod: method,
        slip,
      });

      router.push(
        "/dashboard/payments?submitted=1",
      );

      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment submission မအောင်မြင်ပါ။";

      setMessage(errorMessage);

      /*
       * Duplicate pending ဖြစ်သွားရင်
       * UI ကိုလည်း ချက်ချင်း lock လုပ်ပေးပါတယ်။
       */
      if (
        errorMessage.includes(
          "Admin စစ်ဆေးနေဆဲ",
        )
      ) {
        try {
          const result =
            await getMyPendingPaymentRequest();

          setPendingPayment(result.payment);
        } catch (pendingError) {
          console.error(
            "Could not refresh pending payment:",
            pendingError,
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  const pendingCreatedAt =
    pendingPayment &&
    "created_at" in pendingPayment
      ? formatPendingDate(
          pendingPayment.created_at,
        )
      : "";

  const pendingProductTitle =
    pendingPayment &&
    "product_title" in pendingPayment &&
    typeof pendingPayment.product_title ===
      "string"
      ? pendingPayment.product_title
      : "Payment Request";

  if (checkingPending) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />

        <p className="mt-4 font-black text-white">
          Checking payment status...
        </p>

        <p className="mt-2 text-sm text-white/45">
          ယခင် Payment Request ရှိ/မရှိ
          စစ်ဆေးနေပါတယ်။
        </p>
      </div>
    );
  }

  if (pendingPayment) {
    return (
      <section className="rounded-[2rem] border border-amber-300/20 bg-amber-400/[0.06] p-7">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/15 text-2xl">
          ⏳
        </div>

        <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-amber-300">
          Waiting for Admin Review
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          Payment Request Pending
        </h2>

        <p className="mt-3 leading-7 text-white/60">
          {PENDING_PAYMENT_MESSAGE}
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-white/35">
            Submitted Product
          </p>

          <p className="mt-2 font-black text-white">
            {pendingProductTitle}
          </p>

          {pendingCreatedAt ? (
            <p className="mt-2 text-sm text-white/40">
              Submitted: {pendingCreatedAt}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() =>
            router.push("/dashboard/payments")
          }
          className="mt-6 w-full rounded-2xl border border-amber-300/20 bg-amber-400/10 px-6 py-4 font-black text-amber-100 transition hover:bg-amber-400/15"
        >
          View My Payments
        </button>
      </section>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-7"
    >
      <PaymentMethodSelector
        value={method}
        onChange={setMethod}
      />

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
        <div className="border-b border-white/10 p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-300">
            Scan QR
          </p>

          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black">
                {config.label}
              </h3>

              <p className="mt-1 text-sm text-white/50">
                {method === "kpay"
                  ? "KBZPay ဖြင့် Myanmar Kyat ပေးချေပါ။"
                  : "Thai banking app ဖြင့် Thai Baht ပေးချေပါ။"}
              </p>
            </div>

            <div className="rounded-2xl bg-fuchsia-500/10 px-4 py-3 text-right">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                Amount
              </p>

              <p className="mt-1 text-2xl font-black text-fuchsia-200">
                {displayAmount}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,420px)_1fr] md:items-center">
          <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl bg-white p-3">
            <Image
              key={config.qrImage}
              src={config.qrImage}
              alt={`${config.label} payment QR`}
              width={900}
              height={1200}
              priority
              className="h-auto w-full rounded-2xl object-contain"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-white/40">
              Account name
            </p>

            <p className="mt-2 text-xl font-black">
              {config.accountName}
            </p>

            <p className="mt-1 text-sm text-white/50">
              {config.accountNumber}
            </p>

            <ol className="mt-6 space-y-2 text-sm leading-6 text-white/55">
              <li>
                1. အပေါ်က payment method ကိုရွေးပါ။
              </li>

              <li>
                2. ပြောင်းလဲလာတဲ့ QR ကို scan လုပ်ပါ။
              </li>

              <li>
                3. ပြထားတဲ့ amount အတိုင်း ငွေလွှဲပါ။
              </li>

              <li>
                4. Payment slip ကို upload လုပ်ပြီး Submit နှိပ်ပါ။
              </li>
            </ol>
          </div>
        </div>
      </section>

      <label className="block rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <span className="font-black text-emerald-300">
          Upload payment slip
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          disabled={submitting}
          onChange={(event) => {
            setSlip(
              event.target.files?.[0] ?? null,
            );

            setMessage("");
          }}
          className="mt-4 block w-full rounded-xl border border-white/10 bg-black/20 p-3 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <p className="mt-2 text-xs text-white/40">
          JPG, PNG, WEBP or PDF · Maximum 5 MB
        </p>

        {slip ? (
          <p className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200">
            Selected: {slip.name}
          </p>
        ) : null}
      </label>

      {message ? (
        <p className="rounded-2xl border border-red-300/15 bg-red-500/10 p-4 text-red-100">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-fuchsia-600 px-6 py-4 text-lg font-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Submitting..."
          : `Submit ${displayAmount} Payment`}
      </button>
    </form>
  );
}