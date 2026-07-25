export type PlanType =
  | "trial"
  | "plus"
  | "premium"
  | "yearly"
  | "family";

export interface PlanConfig {
  id: PlanType;

  displayName: string;

  priceMMK: number;

  durationDays: number;

  trialDays?: number;

  monthlyQuotaMinutes: number;

  realtimeMinutes: number;

  standardMinutes: number;

  allowRealtime: boolean;
}

export const PLAN_CONFIG: Record<
  PlanType,
  PlanConfig
> = {
  trial: {
    id: "trial",

    displayName: "Trial",

    priceMMK: 0,

    durationDays: 3,

    trialDays: 3,

    monthlyQuotaMinutes: 15,

    realtimeMinutes: 0,

    standardMinutes: 15,

    allowRealtime: false,
  },

  plus: {
    id: "plus",

    displayName: "Plus",

    priceMMK: 20000,

    durationDays: 30,

    monthlyQuotaMinutes: 180,

    realtimeMinutes: 0,

    standardMinutes: 180,

    allowRealtime: false,
  },

  premium: {
    id: "premium",

    displayName: "Premium",

    priceMMK: 50000,

    durationDays: 30,

    monthlyQuotaMinutes: 240,

    realtimeMinutes: 90,

    standardMinutes: 150,

    allowRealtime: true,
  },

  yearly: {
    id: "yearly",

    displayName: "Yearly",

    priceMMK: 200000,

    durationDays: 365,

    monthlyQuotaMinutes: 180,

    realtimeMinutes: 0,

    standardMinutes: 180,

    allowRealtime: false,
  },

  family: {
    id: "family",

    displayName: "Family",

    priceMMK: 150000,

    durationDays: 30,

    monthlyQuotaMinutes: 720,

    realtimeMinutes: 240,

    standardMinutes: 480,

    allowRealtime: true,
  },
};

export function getPlanConfig(
  plan: PlanType
) {
  return PLAN_CONFIG[plan];
}