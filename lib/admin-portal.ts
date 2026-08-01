import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminPortalSummary = {
  totalUsers: number;
  hskPaidUsers: number;
  aiSpeakingUsers: number;
  totalPaidUsers: number;
  freeUsers: number;
  pendingPayments: number;
  approvedPayments: number;
  rejectedPayments: number;
  totalSalesMmk: number;
};

export type AdminUserAccessRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  entitlements: string[];
};

export async function getAdminPortalSummary(): Promise<AdminPortalSummary> {
  const admin = createSupabaseAdminClient();

  const [
    usersResult,
    pendingResult,
    approvedResult,
    rejectedResult,
    salesResult,
    hskAccessResult,
    aiAccessResult,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      }),

    admin
      .from("payment_requests")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending"),

    admin
      .from("payment_requests")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "approved"),

    admin
      .from("payment_requests")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "rejected"),

    admin
      .from("payment_requests")
      .select("amount_mmk")
      .eq("status", "approved"),

    admin
      .from("user_hsk_access")
      .select("user_id"),

    admin
      .from("ai_speaking_subscriptions")
      .select("user_id")
      .eq("status", "active"),
  ]);

  const errors = [
    usersResult.error,
    pendingResult.error,
    approvedResult.error,
    rejectedResult.error,
    salesResult.error,
    hskAccessResult.error,
    aiAccessResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(
      errors[0]?.message ??
        "Failed to load admin portal summary.",
    );
  }

  const totalUsers = usersResult.count ?? 0;

  const hskUserIds = new Set(
    (hskAccessResult.data ?? []).map((row) =>
      String(row.user_id),
    ),
  );

  const aiSpeakingUserIds = new Set(
    (aiAccessResult.data ?? []).map((row) =>
      String(row.user_id),
    ),
  );

  /*
   * HSK နဲ့ AI Speaking နှစ်ခုလုံးရှိတဲ့ user ကို
   * Total Paid Users မှာ တစ်ယောက်ပဲတွက်မယ်။
   */
  const allPaidUserIds = new Set<string>([
    ...hskUserIds,
    ...aiSpeakingUserIds,
  ]);

  const totalPaidUsers = allPaidUserIds.size;
  const freeUsers = Math.max(
    0,
    totalUsers - totalPaidUsers,
  );

  const totalSalesMmk = (
    salesResult.data ?? []
  ).reduce(
    (total, row) =>
      total + Number(row.amount_mmk ?? 0),
    0,
  );

  return {
    totalUsers,
    hskPaidUsers: hskUserIds.size,
    aiSpeakingUsers: aiSpeakingUserIds.size,
    totalPaidUsers,
    freeUsers,
    pendingPayments: pendingResult.count ?? 0,
    approvedPayments: approvedResult.count ?? 0,
    rejectedPayments: rejectedResult.count ?? 0,
    totalSalesMmk,
  };
}

export async function getAdminUsers(): Promise<
  AdminUserAccessRow[]
> {
  const admin = createSupabaseAdminClient();

  const [
    profilesResult,
    authResult,
    accessResult,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id,name,email,role,created_at",
      )
      .order("created_at", {
        ascending: false,
      }),

    admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),

    admin
      .from("user_hsk_access")
      .select(
        "user_id,product_code,level,lifetime,granted_at",
      )
      .order("granted_at", {
        ascending: false,
      }),
  ]);

  if (profilesResult.error) {
    throw new Error(
      profilesResult.error.message,
    );
  }

  if (authResult.error) {
    throw new Error(
      authResult.error.message,
    );
  }

  if (accessResult.error) {
    throw new Error(
      accessResult.error.message,
    );
  }

  const authMap = new Map(
    authResult.data.users.map((user) => [
      user.id,
      user,
    ]),
  );

  const accessMap = new Map<
    string,
    string[]
  >();

  for (const row of accessResult.data ?? []) {
    const userId = String(row.user_id);
    const list =
      accessMap.get(userId) ?? [];

    const code = String(
      row.product_code,
    );

    if (!list.includes(code)) {
      list.push(code);
    }

    accessMap.set(userId, list);
  }

  return (
    profilesResult.data ?? []
  ).map((profile) => {
    const id = String(profile.id);
    const authUser = authMap.get(id);

    return {
      id,

      email: String(
        profile.email ??
          authUser?.email ??
          "No email",
      ),

      name:
        String(
          profile.name ?? "",
        ).trim() ||
        String(
          authUser?.user_metadata?.name ??
            "",
        ).trim() ||
        "Anna Learner",

      role: String(
        profile.role ?? "user",
      ),

      createdAt:
        profile.created_at ??
        authUser?.created_at ??
        null,

      lastSignInAt:
        authUser?.last_sign_in_at ??
        null,

      entitlements:
        accessMap.get(id) ?? [],
    };
  });
}