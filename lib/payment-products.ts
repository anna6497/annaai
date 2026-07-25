import type { PaymentProduct } from "@/types/payment";

export const PAYMENT_PRODUCTS: PaymentProduct[] = [
  ...Array.from({ length: 8 }, (_, index) => {
    const level = index + 2;

    return {
      code: `hsk_${level}`,
      title: `HSK ${level} Lifetime Access`,
      description: `Flashcards and Writing practice for HSK ${level}.`,
      level,
      priceMmk: 10000,
      priceThb: 100,
      originalPriceMmk: null,
      originalPriceThb: null,
      active: true,
    };
  }),
  {
    code: "hsk_full",
    title: "HSK 2–9 Full Package",
    description: "Flashcards and Writing for HSK 2 through HSK 9.",
    level: null,
    priceMmk: 25000,
    priceThb: 250,
    originalPriceMmk: 80000,
    originalPriceThb: 800,
    active: true,
  },
];

export function getPaymentProduct(code: string | null) {
  if (!code) return null;

  return (
    PAYMENT_PRODUCTS.find(
      (product) => product.code === code && product.active,
    ) ?? null
  );
}

export function formatMmk(amount: number) {
  return `${new Intl.NumberFormat("en-US").format(amount)} MMK`;
}

export function formatThb(amount: number) {
  return `${new Intl.NumberFormat("en-US").format(amount)} THB`;
}
