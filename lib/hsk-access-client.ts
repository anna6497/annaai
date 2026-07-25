"use client";

import { createClient } from "@/lib/supabase/client";

export async function getClientHskAccess(level: number) {
  if (level === 1) {
    return {
      allowed: true,
      source: "free" as const,
    };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      allowed: false,
      source: "none" as const,
    };
  }

  const { data, error } = await supabase
    .from("user_hsk_access")
    .select("product_code,level")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];

  if (rows.some((row) => row.product_code === "hsk_full")) {
    return {
      allowed: true,
      source: "full" as const,
    };
  }

  return {
    allowed: rows.some(
      (row) =>
        row.product_code === `hsk_${level}` ||
        row.level === level,
    ),
    source: "level" as const,
  };
}
