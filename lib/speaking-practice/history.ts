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
  review_session_id: string | null;
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
  reviewSessionId?: string | null;
};

export async function savePronunciationAttempt({
  sentence,
  result,
  recordingDuration,
  reviewSessionId = null,
}: SavePronunciationAttemptInput): Promise<string> {
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

  const { data, error } = await supabase
    .from("ai_speaking_pronunciation_attempts")
    .insert({
      user_id: user.id,
      review_session_id: reviewSessionId,
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
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.id) {
    throw new Error(
      "The pronunciation attempt was saved, but no attempt ID was returned."
    );
  }

  return String(data.id);
}

export async function getLatestAttemptBefore(
  sentenceId: string,
  beforeIso: string
): Promise<PronunciationHistoryRecord | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("ai_speaking_pronunciation_attempts")
    .select(
      `
        id,
        sentence_id,
        review_session_id,
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
    .eq("user_id", user.id)
    .eq("sentence_id", sentenceId)
    .lt("created_at", beforeIso)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (
    data as PronunciationHistoryRecord | null
  ) ?? null;
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
        review_session_id,
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
