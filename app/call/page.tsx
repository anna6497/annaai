import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CallClient from "./CallClient";

export const dynamic = "force-dynamic";

export default async function CallPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/call");
  const { data, error } = await supabase.rpc("ensure_voice_trial");
  if (error) { console.error(error.message); redirect("/dashboard"); }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.available) redirect("/dashboard");
  return <CallClient email={user.email ?? ""} />;
}
