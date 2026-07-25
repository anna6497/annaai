import { createClient } from "@/lib/supabase/client";

export interface SaveWritingAttemptInput {
  level: number;
  hanzi: string;
  accuracyScore: number;
  totalStrokes: number;
  correctStrokes: number;
}

export interface SavedWritingAttempt {
  id: number;
  user_id: string;
  level: number;
  hanzi: string;
  accuracy_score: number;
  total_strokes: number;
  correct_strokes: number;
  created_at: string;
}

export async function saveWritingAttempt(
  input: SaveWritingAttemptInput
): Promise<SavedWritingAttempt> {
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
      "Writing result သိမ်းရန် Login ဝင်ထားရပါမယ်။"
    );
  }

  const level = Math.min(
    9,
    Math.max(1, Math.floor(input.level))
  );

  const hanzi = input.hanzi.trim();

  const accuracyScore = Math.min(
    100,
    Math.max(0, Math.round(input.accuracyScore))
  );

  const totalStrokes = Math.max(
    0,
    Math.floor(input.totalStrokes)
  );

  const correctStrokes = Math.min(
    totalStrokes,
    Math.max(0, Math.floor(input.correctStrokes))
  );

  if (!hanzi) {
    throw new Error("Hanzi မရှိသေးပါ။");
  }

  const { data, error } = await supabase
    .from("hsk_writing_attempts")
    .insert({
      user_id: user.id,
      level,
      hanzi,
      accuracy_score: accuracyScore,
      total_strokes: totalStrokes,
      correct_strokes: correctStrokes,
    })
    .select(
      `
        id,
        user_id,
        level,
        hanzi,
        accuracy_score,
        total_strokes,
        correct_strokes,
        created_at
      `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SavedWritingAttempt;
}