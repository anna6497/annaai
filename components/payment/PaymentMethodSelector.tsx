"use client";

import Image from "next/image";
import { PAYMENT_CONFIG } from "@/lib/payment-config";
import type { PaymentMethod } from "@/types/payment";

export default function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(["kpay", "qr_pay"] as PaymentMethod[]).map((method) => {
        const config = PAYMENT_CONFIG[method];
        const selected = value === method;

        return (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={`rounded-3xl border p-5 text-left transition ${
              selected
                ? "border-emerald-300/60 bg-emerald-400/10"
                : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">{config.label}</h3>
              <span className={`h-5 w-5 rounded-full border-4 ${
                selected ? "border-emerald-400 bg-white" : "border-white/20"
              }`} />
            </div>

            <div className="relative mx-auto mt-5 aspect-square max-w-[220px] overflow-hidden rounded-2xl bg-white">
              <Image
                src={config.qrImage}
                alt={`${config.label} QR`}
                fill
                sizes="220px"
                className="object-contain p-3"
              />
            </div>

            <p className="mt-4 font-bold">{config.accountName}</p>
            <p className="text-sm text-white/55">{config.accountNumber}</p>
          </button>
        );
      })}
    </div>
  );
}
