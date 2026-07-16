export type PlanType = "trial" | "monthly" | "yearly" | "premium";

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
}

export interface DashboardSummary {
  totalUsers: number;
  trialUsers: number;
  paidUsers: number;
  activeToday: number;
  todayVoiceSeconds: number;
}
