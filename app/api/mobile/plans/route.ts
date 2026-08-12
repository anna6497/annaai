import {
  NextResponse,
} from "next/server";

import {
  AI_SPEAKING_PLAN_IDS,
  AI_SPEAKING_PLANS,
} from "@/lib/ai-speaking-plans";

import {
  PAYMENT_PRODUCTS,
} from "@/lib/payment-products";

import {
  PAYMENT_CONFIG,
} from "@/lib/payment-config";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const aiSpeakingPlans =
      AI_SPEAKING_PLAN_IDS.map(
        (planId) => {
          const plan =
            AI_SPEAKING_PLANS[
              planId
            ];

          return {
            id: plan.id,

            title:
              plan.title,

            shortTitle:
              plan.shortTitle,

            durationLabel:
              plan.durationLabel,

            durationDays:
              plan.durationDays,

            priceMmk:
              plan.priceMmk,

            originalPriceMmk:
              plan.originalPriceMmk,

            badge:
              plan.badge,
          };
        },
      );

    const hskPlans =
      PAYMENT_PRODUCTS
        .filter(
          (product) =>
            product.active,
        )
        .map(
          (product) => ({
            code:
              product.code,

            title:
              product.title,

            description:
              product.description,

            level:
              product.level,

            priceMmk:
              product.priceMmk,

            priceThb:
              product.priceThb,

            originalPriceMmk:
              product.originalPriceMmk,

            originalPriceThb:
              product.originalPriceThb,
          }),
        );

    const paymentMethods = [
      {
        id: "kpay",

        label:
          PAYMENT_CONFIG.kpay
            .label,

        accountName:
          PAYMENT_CONFIG.kpay
            .accountName,

        accountNumber:
          PAYMENT_CONFIG.kpay
            .accountNumber,

        qrImageUrl:
          "https://www.annaai.online/payments/kbzpay-qr.png",
      },

      {
        id: "qr_pay",

        label:
          PAYMENT_CONFIG.qr_pay
            .label,

        accountName:
          PAYMENT_CONFIG.qr_pay
            .accountName,

        accountNumber:
          PAYMENT_CONFIG.qr_pay
            .accountNumber,

        qrImageUrl:
          "https://www.annaai.online/payments/promptpay-qr.png",
      },
    ];

    return NextResponse.json(
      {
        aiSpeakingPlans,
        hskPlans,
        paymentMethods,
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=300, s-maxage=300",
        },
      },
    );
  } catch (error) {
    console.error(
      "Mobile plans endpoint error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load plans.",
      },
      {
        status: 500,
      },
    );
  }
}