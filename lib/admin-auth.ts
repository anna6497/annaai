import { redirect } from "next/navigation";
import { createClient as createServerClient } from "./supabase/server";
import { createSupabaseAdminClient } from "./supabase/admin";

export async function requireAdmin() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : "";

  if (error || !userId) redirect("/login");

  const admin = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id,email,role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") redirect("/call");

  return {
    userId,
    email: typeof profile.email === "string" ? profile.email : "",
  };
}
