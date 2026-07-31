import { createClient } from "@/lib/supabase/client";

import type {
  PronunciationCheckResponse,
} from "@/lib/speaking-practice/api";

import type {
  SpeakingPracticeSentence,
} from "@/lib/speaking-practice/types";

export type PronunciationHistoryRecord = {
  id: string;
  sentence_id: string;
  level: number;
  lesson: number;
  category: string;
  target_text: string;
  recognized_text: string;
  overall_score: number;
  accuracy_score: number;
  completeness_score: number;
  fluency_score: number;
  missing_characters: string[];
  extra_characters: string[];
  incorrect_characters: Array<{
    expected: string;
    recognized: string;
  }>;
  recording_duration_seconds: number;
  processing_seconds: number;
  created_at: string;
};

type SavePronunciationAttemptInput = {
  sentence: SpeakingPracticeSentence;
  result: PronunciationCheckResponse;
  recordingDuration: number;
};

export async function savePronunciationAttempt({
  sentence,
  result,
  recordingDuration,
}: SavePronunciationAttemptInput): Promise<void> {
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
      "Please sign in before saving your speaking score."
    );
  }

  const { error } = await supabase
    .from("ai_speaking_pronunciation_attempts")
    .insert({
      user_id: user.id,
      sentence_id: sentence.id,
      level: sentence.level,
      lesson: sentence.lesson,
      category: sentence.category,
      target_text: result.target_text,
      recognized_text: result.recognized_text,
      overall_score: result.scores.overall,
      accuracy_score: result.scores.accuracy,
      completeness_score:
        result.scores.completeness,
      fluency_score: result.scores.fluency,
      missing_characters:
        result.feedback.missing_characters,
      extra_characters:
        result.feedback.extra_characters,
      incorrect_characters:
        result.feedback.incorrect_characters,
      recording_duration_seconds:
        recordingDuration,
      processing_seconds:
        result.processing_seconds,
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getRecentPronunciationAttempts(
  limit = 20
): Promise<PronunciationHistoryRecord[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ai_speaking_pronunciation_attempts")
    .select(
      `
        id,
        sentence_id,
        level,
        lesson,
        category,
        target_text,
        recognized_text,
        overall_score,
        accuracy_score,
        completeness_score,
        fluency_score,
        missing_characters,
        extra_characters,
        incorrect_characters,
        recording_duration_seconds,
        processing_seconds,
        created_at
      `
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (
    data as PronunciationHistoryRecord[] | null
  ) ?? [];
}
