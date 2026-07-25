import type { HskProduct, HskProductCode } from "@/types/access";

export const HSK_PRODUCTS: HskProduct[] = [
  { code: "hsk_1_free", level: 1, name: "HSK 1", description: "Flashcards + Writing", priceMmk: 0, originalPriceMmk: null, lifetime: true, isFree: true, active: true },
  ...Array.from({ length: 8 }, (_, index) => {
    const level = index + 2;
    return { code: `hsk_${level}` as HskProductCode, level, name: `HSK ${level}`, description: "Flashcards + Writing", priceMmk: 10000, originalPriceMmk: null, lifetime: true, isFree: false, active: true };
  }),
  { code: "hsk_full", level: null, name: "HSK 2–9 Full Package", description: "Flashcards + Writing for HSK 2 to HSK 9", priceMmk: 25000, originalPriceMmk: 80000, lifetime: true, isFree: false, active: true },
];

export function formatMmk(value: number): string {
  return `${new Intl.NumberFormat("en-US").format(value)} MMK`;
}
