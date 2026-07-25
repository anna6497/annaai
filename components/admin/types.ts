import type { PlanType } from "../../lib/plans";

export type { PlanType };

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;

  subscriptionStatus: string;
  planType: PlanType;

  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;

  createdAt: string | null;
  lastSignInAt: string | null;

  todayUsedSeconds: number;
  todayRemainingSeconds: number;
  dailyLimitSeconds: number;

  monthlyUsedSeconds: number;
  monthlyRemainingSeconds: number;
  monthlyLimitSeconds: number;

  standardUsedSeconds: number;
  standardRemainingSeconds: number;
  standardLimitSeconds: number;

  realtimeUsedSeconds: number;
  realtimeRemainingSeconds: number;
  realtimeLimitSeconds: number;
}

export interface DashboardSummary {
  totalUsers: number;
  trialUsers: number;
  paidUsers: number;
  activeToday: number;
  todayVoiceSeconds: number;

  plusUsers: number;
  premiumUsers: number;
  yearlyUsers: number;
  familyUsers: number;
}