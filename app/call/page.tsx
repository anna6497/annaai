import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getVoiceUsageStatus } from "@/lib/voice-usage";

import CallClient from "./CallClient";

export const dynamic = "force-dynamic";

export default async function CallPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/call");
  }

  try {
    const usage = await getVoiceUsageStatus();

    if (!usage.allowed) {
      redirect("/pricing");
    }

    return (
      <CallClient
        email={user.email ?? ""}
      />
    );
  } catch (error) {
    console.error(
      "Call access check failed:",
      error,
    );

    redirect("/pricing");
  }
}