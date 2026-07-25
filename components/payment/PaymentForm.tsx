"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector";
import { createPaymentRequest } from "@/lib/payment-client";
import { formatMmk } from "@/lib/payment-products";
import type { PaymentMethod, PaymentProduct } from "@/types/payment";

const PAYMENT_DETAILS = {
  kpay: {
    label: "KBZPay",
    image: "/payment/kbzpay-qr.png",
    accountName: "DAW INNGYIN HMWE",
    note: "KBZPay QR ကို scan လုပ်ပြီး ငွေပေးချေပါ။",
  },
  qrpay: {
    label: "PromptPay",
    image: "/payment/promptpay-qr.png",
    accountName: "MISS MYA THINZAR KHIN",
    note: "Thai banking app ဖြင့် PromptPay QR ကို scan လုပ်ပါ။",
  },
} as const;

export default function PaymentForm({
  product,
}: {
  product: PaymentProduct;
}) {
  const router = useRouter();

  const [method, setMethod] = useState<PaymentMethod>("kpay");
  const [slip, setSlip] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selected =
    method === "kpay"
      ? PAYMENT_DETAILS.kpay
      : PAYMENT_DETAILS.qrpay;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!slip) {
      setMessage("ငွေလွှဲပြီး Payment slip ကို upload လုပ်ပေးပါ။");
      return;
    }

    if (slip.size > 5 * 1024 * 1024) {
      setMessage("Payment slip file size သည် 5 MB ထက် မကျော်ရပါ။");
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

      router.push("/dashboard/payments?submitted=1");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Payment submission မအောင်မြင်ပါ။",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      <PaymentMethodSelector value={method} onChange={setMethod} />

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
        <div className="border-b border-white/10 p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-300">
            Scan and Pay
          </p>
          <h3 className="mt-2 text-2xl font-black">{selected.label}</h3>
          <p className="mt-2 text-sm text-white/50">{selected.note}</p>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,420px)_1fr] md:items-center">
          <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl bg-white p-2">
            <Image
              src={selected.image}
              alt={`${selected.label} payment QR`}
              width={900}
              height={1200}
              priority
              className="h-auto w-full rounded-2xl object-contain"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-white/40">Account name</p>
            <p className="mt-2 text-xl font-black">{selected.accountName}</p>

            <div className="mt-5 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-4">
              <p className="text-sm text-white/55">Amount to pay</p>
              <p className="mt-1 text-3xl font-black text-fuchsia-200">
                {formatMmk(product.priceMmk)}
              </p>
            </div>

            <ol className="mt-5 space-y-2 text-sm leading-6 text-white/55">
              <li>1. QR ကို banking app ဖြင့် scan လုပ်ပါ။</li>
              <li>2. Amount ကိုစစ်ပြီး ငွေလွှဲပါ။</li>
              <li>3. Payment slip screenshot ကို save လုပ်ပါ။</li>
              <li>4. အောက်တွင် slip upload လုပ်ပြီး Submit နှိပ်ပါ။</li>
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
          onChange={(event) =>
            setSlip(event.target.files?.[0] ?? null)
          }
          className="mt-4 block w-full rounded-xl border border-white/10 bg-black/20 p-3"
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
        <p className="rounded-2xl bg-red-500/10 p-4 text-red-100">
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
          : `Submit ${formatMmk(product.priceMmk)} Payment`}
      </button>
    </form>
  );
}
