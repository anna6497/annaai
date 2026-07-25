import { createClient } from "@/lib/supabase/server";

export interface ServerHskAccessResult {
  allowed: boolean;
  reason: string;
  userId: string | null;
  source: "free" | "admin" | "level" | "full" | "none";
}

export async function getServerHskAccess(
  level: number,
): Promise<ServerHskAccessResult> {
  if (!Number.isInteger(level) || level < 1 || level > 9) {
    return {
      allowed: false,
      reason: "Invalid HSK level.",
      userId: null,
      source: "none",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // HSK 1 stays publicly accessible.
  if (level === 1) {
    return {
      allowed: true,
      reason: "HSK 1 is free.",
      userId: user?.id ?? null,
      source: "free",
    };
  }

  if (userError || !user) {
    return {
      allowed: false,
      reason: "Please log in to access this HSK level.",
      userId: null,
      source: "none",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return {
      allowed: true,
      reason: "Admin access.",
      userId: user.id,
      source: "admin",
    };
  }

  const { data: accessRows, error: accessError } = await supabase
    .from("user_hsk_access")
    .select("product_code,level")
    .eq("user_id", user.id);

  if (accessError) {
    return {
      allowed: false,
      reason: accessError.message,
      userId: user.id,
      source: "none",
    };
  }

  const rows = accessRows ?? [];

  if (rows.some((row) => row.product_code === "hsk_full")) {
    return {
      allowed: true,
      reason: "Full package access granted.",
      userId: user.id,
      source: "full",
    };
  }

  if (
    rows.some(
      (row) =>
        row.product_code === `hsk_${level}` ||
        Number(row.level) === level,
    )
  ) {
    return {
      allowed: true,
      reason: `HSK ${level} access granted.`,
      userId: user.id,
      source: "level",
    };
  }

  return {
    allowed: false,
    reason: `HSK ${level} has not been purchased.`,
    userId: user.id,
    source: "none",
  };
}
