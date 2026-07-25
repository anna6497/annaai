"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector";
import { createPaymentRequest } from "@/lib/payment-client";
import { formatMmk } from "@/lib/payment-products";
import type { PaymentMethod, PaymentProduct } from "@/types/payment";

export default function PaymentForm({ product }: { product: PaymentProduct }) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("kpay");
  const [slip, setSlip] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!slip) {
      setMessage("Please upload your payment slip.");
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
      setMessage(error instanceof Error ? error.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      <PaymentMethodSelector value={method} onChange={setMethod} />

      <label className="block rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <span className="font-black text-emerald-300">Upload payment slip</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => setSlip(event.target.files?.[0] ?? null)}
          className="mt-4 block w-full"
        />
        <p className="mt-2 text-xs text-white/40">JPG, PNG, WEBP or PDF · Max 5 MB</p>
      </label>

      {message ? <p className="rounded-2xl bg-red-500/10 p-4 text-red-100">{message}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-fuchsia-600 px-6 py-4 text-lg font-black disabled:opacity-50"
      >
        {submitting ? "Submitting..." : `Submit ${formatMmk(product.priceMmk)} Payment`}
      </button>
    </form>
  );
}
