import { createClient } from "@/lib/supabase/client";

export type SpeakingDailyGoal = 5 | 10 | 20;

const DEFAULT_DAILY_GOAL: SpeakingDailyGoal = 10;

export async function getSpeakingDailyGoal(): Promise<SpeakingDailyGoal> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    return DEFAULT_DAILY_GOAL;
  }

  const { data, error } = await supabase
    .from("ai_speaking_preferences")
    .select("daily_goal")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const dailyGoal = data?.daily_goal;

  if (
    dailyGoal === 5 ||
    dailyGoal === 10 ||
    dailyGoal === 20
  ) {
    return dailyGoal;
  }

  return DEFAULT_DAILY_GOAL;
}

export async function saveSpeakingDailyGoal(
  dailyGoal: SpeakingDailyGoal
): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error(
      "Please sign in before changing your daily goal."
    );
  }

  const { error } = await supabase
    .from("ai_speaking_preferences")
    .upsert(
      {
        user_id: user.id,
        daily_goal: dailyGoal,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    throw new Error(error.message);
  }
}