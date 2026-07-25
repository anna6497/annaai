import AdminDashboard from "../../components/admin/AdminDashboard";

import type {
  AdminUserRow,
  DashboardSummary,
} from "../../components/admin/types";

import { requireAdmin } from "../../lib/admin-auth";

import {
  getPlanConfig,
  type PlanType,
} from "../../lib/plans";

import {
  createSupabaseAdminClient,
} from "../../lib/supabase/admin";

export const dynamic = "force-dynamic";

interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;

  subscription_status: string | null;
  plan_type: string | null;

  trial_ends_at: string | null;
  subscription_ends_at: string | null;

  monthly_used_seconds: number | null;
  monthly_limit_seconds: number | null;

  standard_used_seconds: number | null;
  standard_limit_seconds: number | null;

  realtime_used_seconds: number | null;
  realtime_limit_seconds: number | null;
}

interface DailyUsageRow {
  user_id: string;
  used_seconds: number | null;
  active_started_at: string | null;
}

const VALID_PLANS: PlanType[] = [
  "trial",
  "plus",
  "premium",
  "yearly",
  "family",
];

function normalizePlan(
  value: unknown,
): PlanType {
  if (
    typeof value === "string" &&
    VALID_PLANS.includes(value as PlanType)
  ) {
    return value as PlanType;
  }

  // Support old database value.
  if (value === "monthly") {
    return "plus";
  }

  return "trial";
}

function toPositiveNumber(
  value: unknown,
): number {
  const result = Number(value ?? 0);

  if (!Number.isFinite(result)) {
    return 0;
  }

  return Math.max(0, result);
}

export default async function AdminPage() {
  const identity = await requireAdmin();

  const admin =
    createSupabaseAdminClient();

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const [
    profilesResult,
    usageResult,
    authUsersResult,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id,name,email,role,subscription_status,plan_type,trial_ends_at,subscription_ends_at,monthly_used_seconds,monthly_limit_seconds,standard_used_seconds,standard_limit_seconds,realtime_used_seconds,realtime_limit_seconds",
      ),

    admin
      .from("daily_voice_usage")
      .select(
        "user_id,used_seconds,active_started_at",
      )
      .eq("usage_date", today),

    admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),
  ]);

  if (profilesResult.error) {
    throw new Error(
      profilesResult.error.message,
    );
  }

  if (usageResult.error) {
    throw new Error(
      usageResult.error.message,
    );
  }

  if (authUsersResult.error) {
    throw new Error(
      authUsersResult.error.message,
    );
  }

  /*
   * Supabase generated types may not yet contain the
   * newly added quota columns. Cast the validated result
   * to the local database row shape.
   */
  const profiles =
    (profilesResult.data ??
      []) as unknown as ProfileRow[];

  const dailyUsage =
    (usageResult.data ??
      []) as unknown as DailyUsageRow[];

  const authUsers =
    authUsersResult.data.users;

  const authMap = new Map(
    authUsers.map((user) => [
      user.id,
      user,
    ]),
  );

  const usageMap =
    new Map<string, number>();

  for (const row of dailyUsage) {
    const activeSeconds =
      row.active_started_at
        ? Math.max(
            0,
            Math.floor(
              (
                Date.now() -
                new Date(
                  row.active_started_at,
                ).getTime()
              ) / 1000,
            ),
          )
        : 0;

    usageMap.set(
      row.user_id,
      toPositiveNumber(
        row.used_seconds,
      ) + activeSeconds,
    );
  }

  const users: AdminUserRow[] =
    profiles.map((profile) => {
      const planType =
        normalizePlan(
          profile.plan_type,
        );

      const planConfig =
        getPlanConfig(planType);

      const dailyLimitSeconds =
        Math.max(
          0,
          Math.floor(
            (
              planConfig.standardMinutes +
              planConfig.realtimeMinutes
            ) * 60,
          ),
        );

      const todayUsedSeconds =
        Math.min(
          dailyLimitSeconds,
          toPositiveNumber(
            usageMap.get(profile.id),
          ),
        );

      const monthlyUsedSeconds =
        toPositiveNumber(
          profile.monthly_used_seconds,
        );

      const monthlyLimitSeconds =
        toPositiveNumber(
          profile.monthly_limit_seconds,
        );

      const standardUsedSeconds =
        toPositiveNumber(
          profile.standard_used_seconds,
        );

      const standardLimitSeconds =
        toPositiveNumber(
          profile.standard_limit_seconds,
        );

      const realtimeUsedSeconds =
        toPositiveNumber(
          profile.realtime_used_seconds,
        );

      const realtimeLimitSeconds =
        toPositiveNumber(
          profile.realtime_limit_seconds,
        );

      const authUser =
        authMap.get(profile.id);

      return {
        id: profile.id,

        name:
          profile.name ??
          "",

        email:
          profile.email ??
          authUser?.email ??
          "",

        role:
          profile.role ??
          "user",

        subscriptionStatus:
          profile.subscription_status ??
          "trial",

        planType,

        trialEndsAt:
          profile.trial_ends_at,

        subscriptionEndsAt:
          profile.subscription_ends_at,

        createdAt:
          authUser?.created_at ??
          null,

        lastSignInAt:
          authUser?.last_sign_in_at ??
          null,

        todayUsedSeconds,

        todayRemainingSeconds:
          Math.max(
            0,
            dailyLimitSeconds -
              todayUsedSeconds,
          ),

        dailyLimitSeconds,

        monthlyUsedSeconds,

        monthlyRemainingSeconds:
          Math.max(
            0,
            monthlyLimitSeconds -
              monthlyUsedSeconds,
          ),

        monthlyLimitSeconds,

        standardUsedSeconds,

        standardRemainingSeconds:
          Math.max(
            0,
            standardLimitSeconds -
              standardUsedSeconds,
          ),

        standardLimitSeconds,

        realtimeUsedSeconds,

        realtimeRemainingSeconds:
          Math.max(
            0,
            realtimeLimitSeconds -
              realtimeUsedSeconds,
          ),

        realtimeLimitSeconds,
      };
    });

  users.sort((first, second) => {
    const firstCreatedAt =
      first.createdAt
        ? new Date(
            first.createdAt,
          ).getTime()
        : 0;

    const secondCreatedAt =
      second.createdAt
        ? new Date(
            second.createdAt,
          ).getTime()
        : 0;

    return (
      secondCreatedAt -
      firstCreatedAt
    );
  });

  const summary: DashboardSummary = {
    totalUsers:
      users.length,

    trialUsers:
      users.filter(
        (user) =>
          user.planType === "trial",
      ).length,

    paidUsers:
      users.filter(
        (user) =>
          user.planType !== "trial",
      ).length,

    plusUsers:
      users.filter(
        (user) =>
          user.planType === "plus",
      ).length,

    premiumUsers:
      users.filter(
        (user) =>
          user.planType === "premium",
      ).length,

    yearlyUsers:
      users.filter(
        (user) =>
          user.planType === "yearly",
      ).length,

    familyUsers:
      users.filter(
        (user) =>
          user.planType === "family",
      ).length,

    activeToday:
      users.filter(
        (user) =>
          user.todayUsedSeconds > 0,
      ).length,

    todayVoiceSeconds:
      users.reduce(
        (total, user) =>
          total +
          user.todayUsedSeconds,
        0,
      ),
  };

  return (
    <AdminDashboard
      adminEmail={
        identity.user.email ?? ""
      }
      users={users}
      summary={summary}
    />
  );
}