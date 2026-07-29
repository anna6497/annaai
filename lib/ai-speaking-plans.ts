export type AiSpeakingPlanId = "ai-monthly" | "ai-six-months" | "ai-yearly";

export type AiSpeakingPlan = {
  id: AiSpeakingPlanId;
  title: string;
  shortTitle: string;
  durationLabel: string;
  durationDays: number;
  priceMmk: number;
  originalPriceMmk: number;
  badge: string;
};

export const AI_SPEAKING_PLANS: Record<AiSpeakingPlanId, AiSpeakingPlan> = {
  "ai-monthly": {
    id: "ai-monthly",
    title: "AI Speaking Monthly",
    shortTitle: "Monthly",
    durationLabel: "30 Days",
    durationDays: 30,
    priceMmk: 29_999,
    originalPriceMmk: 50_000,
    badge: "Launch Price",
  },
  "ai-six-months": {
    id: "ai-six-months",
    title: "AI Speaking 6 Months",
    shortTitle: "6 Months",
    durationLabel: "180 Days",
    durationDays: 180,
    priceMmk: 149_999,
    originalPriceMmk: 300_000,
    badge: "Most Popular",
  },
  "ai-yearly": {
    id: "ai-yearly",
    title: "AI Speaking Yearly",
    shortTitle: "Yearly",
    durationLabel: "365 Days",
    durationDays: 365,
    priceMmk: 299_999,
    originalPriceMmk: 600_000,
    badge: "Best Value",
  },
};

export const AI_SPEAKING_PLAN_IDS = Object.keys(AI_SPEAKING_PLANS) as AiSpeakingPlanId[];

export function isAiSpeakingPlanId(value: string | null | undefined): value is AiSpeakingPlanId {
  return Boolean(value && Object.prototype.hasOwnProperty.call(AI_SPEAKING_PLANS, value));
}

export function formatMmk(amount: number): string {
  return `${amount.toLocaleString("en-US")} MMK`;
}

export function getDiscountPercent(plan: AiSpeakingPlan): number {
  return Math.round((1 - plan.priceMmk / plan.originalPriceMmk) * 100);
}
