import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import CallClient from "./CallClient";

export const dynamic = "force-dynamic";

export default async function CallPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) redirect("/login?next=/call");
  const email = typeof data.claims.email === "string" ? data.claims.email : "";
  return <CallClient email={email} />;
}
