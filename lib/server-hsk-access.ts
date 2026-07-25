import { createClient } from "@/lib/supabase/server";
import type { HskLevel } from "@/types/hsk-vocabulary";

export type ServerHskAccessResult = {
  allowed: boolean;
  reason: "free" | "authenticated" | "purchase_required";
};

export async function getServerHskAccess(
  level: HskLevel,
): Promise<ServerHskAccessResult> {
  if (level === 1) {
    return { allowed: true, reason: "free" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, reason: "authenticated" };
  }

  const { data, error } = await supabase
    .from("user_hsk_access")
    .select("product_code,level,lifetime")
    .eq("user_id", user.id)
    .or(`product_code.eq.hsk_full,product_code.eq.hsk_${level},level.eq.${level}`)
    .limit(1);

  if (error) {
    console.error("HSK access check failed:", error);
    return { allowed: false, reason: "purchase_required" };
  }

  return {
    allowed: (data?.length ?? 0) > 0,
    reason: (data?.length ?? 0) > 0 ? "free" : "purchase_required",
  };
}
