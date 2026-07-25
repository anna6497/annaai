"use client";

import { PAYMENT_CONFIG } from "@/lib/payment-config";
import type { PaymentMethod } from "@/types/payment";

const METHODS: PaymentMethod[] = ["kpay", "qr_pay"];

export default function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {METHODS.map((method) => {
        const config = PAYMENT_CONFIG[method];
        const selected = value === method;

        return (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            aria-pressed={selected}
            className={`rounded-3xl border p-5 text-left transition duration-200 ${
              selected
                ? "border-emerald-300/70 bg-emerald-400/10 shadow-[0_0_28px_rgba(52,211,153,0.12)]"
                : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                  Payment method
                </p>
                <h3 className="mt-2 text-xl font-black">{config.label}</h3>
              </div>

              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  selected
                    ? "border-emerald-400"
                    : "border-white/25"
                }`}
              >
                {selected ? (
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                ) : null}
              </span>
            </div>

            <p className="mt-3 text-sm text-white/50">
              {method === "kpay"
                ? "Pay in Myanmar Kyat"
                : "Pay in Thai Baht"}
            </p>
          </button>
        );
      })}
    </div>
  );
}
