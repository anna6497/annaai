"use client";

import { createClient } from "@/lib/supabase/client";
import type { VoiceTrialStatus } from "@/types/access";

function normalize(row: Record<string, unknown>): VoiceTrialStatus {
  const secondsLimit = Number(row.seconds_limit) || 300;
  const secondsUsed = Number(row.seconds_used) || 0;
  return {
    startedAt: typeof row.started_at === "string" ? row.started_at : null,
    expiresAt: typeof row.expires_at === "string" ? row.expires_at : null,
    secondsLimit,
    secondsUsed,
    secondsRemaining: Math.max(0, secondsLimit - secondsUsed),
    expired: Boolean(row.expired),
    exhausted: Boolean(row.exhausted),
    available: Boolean(row.available),
  };
}

export async function ensureVoiceTrial(): Promise<VoiceTrialStatus> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in to use AI Speaking.");
  const { data, error } = await supabase.rpc("ensure_voice_trial");
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Voice trial status was not returned.");
  return normalize(row as Record<string, unknown>);
}

export async function consumeVoiceSeconds(seconds: number): Promise<VoiceTrialStatus> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("consume_voice_trial_seconds", { p_seconds: Math.max(1, Math.ceil(seconds)) });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Updated voice trial status was not returned.");
  return normalize(row as Record<string, unknown>);
}
