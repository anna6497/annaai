import { createClient } from "@/lib/supabase/server";

export async function getAiSpeakingAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { active: false, expiresAt: null as string | null };

  const { data, error } = await supabase
    .from("ai_speaking_subscriptions")
    .select("expires_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("AI Speaking access error:", error);
    return { active: false, expiresAt: null };
  }

  return { active: Boolean(data), expiresAt: data?.expires_at ?? null };
}
