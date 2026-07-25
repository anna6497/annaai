"use client";

import { createClient } from "@/lib/supabase/client";
import type { HskProductCode, UserHskAccess } from "@/types/access";

export async function getUserHskAccess(): Promise<UserHskAccess[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_hsk_access")
    .select("id,user_id,product_code,level,lifetime,granted_at")
    .eq("user_id", user.id)
    .order("granted_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as UserHskAccess[];
}

export function hasHskLevelAccess(level: number, rows: UserHskAccess[]): boolean {
  if (level === 1) return true;
  return rows.some((item) => item.product_code === "hsk_full" || item.level === level || item.product_code === (`hsk_${level}` as HskProductCode));
}
