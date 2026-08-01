import { createClient } from "@/lib/supabase/client";

export type SaveCompletedReviewSessionInput = {
  sentenceIds: string[];
  completedSentenceIds: string[];
  averageScore: number;
  startedAt: string;
};

export async function saveCompletedReviewSession({
  sentenceIds,
  completedSentenceIds,
  averageScore,
  startedAt,
}: SaveCompletedReviewSessionInput): Promise<string> {
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
      "Please sign in before saving your Smart Review session."
    );
  }

  const normalizedSentenceIds = Array.from(
    new Set(
      sentenceIds
        .map((sentenceId) => sentenceId.trim())
        .filter(Boolean)
    )
  );

  const normalizedCompletedSentenceIds = Array.from(
    new Set(
      completedSentenceIds
        .map((sentenceId) => sentenceId.trim())
        .filter((sentenceId) =>
          normalizedSentenceIds.includes(sentenceId)
        )
    )
  );

  if (normalizedSentenceIds.length === 0) {
    throw new Error(
      "The Smart Review session does not contain any sentences."
    );
  }

  if (
    normalizedCompletedSentenceIds.length !==
    normalizedSentenceIds.length
  ) {
    throw new Error(
      "The Smart Review session is not complete yet."
    );
  }

  const safeAverageScore = Math.max(
    0,
    Math.min(100, Math.round(averageScore))
  );

  const completedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("ai_speaking_review_sessions")
    .insert({
      user_id: user.id,
      sentence_ids: normalizedSentenceIds,
      completed_sentence_ids:
        normalizedCompletedSentenceIds,
      total_sentences:
        normalizedSentenceIds.length,
      completed_sentences:
        normalizedCompletedSentenceIds.length,
      average_score: safeAverageScore,
      status: "completed",
      started_at: startedAt,
      completed_at: completedAt,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.id) {
    throw new Error(
      "Smart Review session was saved, but no session ID was returned."
    );
  }

  return String(data.id);
}
