import AdminDashboard from "../../components/admin/AdminDashboard";
import type { AdminUserRow, DashboardSummary, PlanType } from "../../components/admin/types";
import { requireAdmin } from "../../lib/admin-auth";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";

export const dynamic = "force-dynamic";

const PLAN_LIMITS: Record<PlanType, number> = {
  trial: 300,
  monthly: 1200,
  yearly: 1800,
  premium: 7200,
};

function normalizePlan(value: unknown): PlanType {
  return value === "monthly" || value === "yearly" || value === "premium"
    ? value
    : "trial";
}

export default async function AdminPage() {
  const identity = await requireAdmin();
  const admin = createSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const [profilesResult, usageResult, authUsersResult] = await Promise.all([
    admin.from("profiles").select(
      "id,name,email,role,subscription_status,plan_type,trial_started_at,trial_ends_at,subscription_ends_at"
    ),
    admin.from("daily_voice_usage")
      .select("user_id,used_seconds,active_started_at")
      .eq("usage_date", today),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  if (profilesResult.error) throw new Error(profilesResult.error.message);
  if (usageResult.error) throw new Error(usageResult.error.message);
  if (authUsersResult.error) throw new Error(authUsersResult.error.message);

  const authMap = new Map(authUsersResult.data.users.map((user) => [user.id, user]));
  const usageMap = new Map(
    (usageResult.data ?? []).map((row) => {
      const elapsed = row.active_started_at
        ? Math.max(0, Math.floor((Date.now() - new Date(row.active_started_at).getTime()) / 1000))
        : 0;
      return [row.user_id, Number(row.used_seconds ?? 0) + elapsed];
    })
  );

  const users: AdminUserRow[] = (profilesResult.data ?? []).map((profile) => {
    const planType = normalizePlan(profile.plan_type);
    const dailyLimitSeconds = PLAN_LIMITS[planType];
    const todayUsedSeconds = Math.min(dailyLimitSeconds, Number(usageMap.get(profile.id) ?? 0));
    const authUser = authMap.get(profile.id);

    return {
      id: profile.id,
      name: typeof profile.name === "string" ? profile.name : "",
      email: typeof profile.email === "string" ? profile.email : authUser?.email ?? "",
      role: typeof profile.role === "string" ? profile.role : "user",
      subscriptionStatus: typeof profile.subscription_status === "string" ? profile.subscription_status : "trial",
      planType,
      trialEndsAt: profile.trial_ends_at ?? null,
      subscriptionEndsAt: profile.subscription_ends_at ?? null,
      createdAt: authUser?.created_at ?? null,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
      todayUsedSeconds,
      todayRemainingSeconds: Math.max(0, dailyLimitSeconds - todayUsedSeconds),
      dailyLimitSeconds,
    };
  }).sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  const summary: DashboardSummary = {
    totalUsers: users.length,
    trialUsers: users.filter((user) => user.planType === "trial").length,
    paidUsers: users.filter((user) => user.planType !== "trial").length,
    activeToday: users.filter((user) => user.todayUsedSeconds > 0).length,
    todayVoiceSeconds: users.reduce((total, user) => total + user.todayUsedSeconds, 0),
  };

  return <AdminDashboard adminEmail={identity.email} users={users} summary={summary} />;
}
