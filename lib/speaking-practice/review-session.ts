import { createClient } from "@/lib/supabase/client";

export type ReviewResultStatus =
  | "improved"
  | "mastered"
  | "needs_practice"
  | "unchanged"
  | "declined";

export type CreateReviewSessionInput = {
  sentenceIds: string[];
};

export type SaveReviewSessionItemInput = {
  reviewSessionId: string;
  sentenceId: string;
  targetText: string;
  previousScore: number | null;
  reviewScore: number;
  previousAttemptId: string | null;
  reviewAttemptId: string;
};

export type CompleteReviewSessionInput = {
  reviewSessionId: string;
  completedSentenceIds: string[];
  averageScore: number;
};

export type LatestCompletedReviewSession = {
  id: string;
  sentenceIds: string[];
  completedSentenceIds: string[];
  totalSentences: number;
  completedSentences: number;
  averageScore: number;
  status: "completed";
  startedAt: string;
  completedAt: string;
  createdAt: string;
};

type ReviewSessionRow = {
  id: string;
  sentence_ids: string[] | null;
  completed_sentence_ids: string[] | null;
  total_sentences: number | null;
  completed_sentences: number | null;
  average_score: number | null;
  status: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

export function getReviewResultStatus(
  previousScore: number | null,
  reviewScore: number
): ReviewResultStatus {
  if (reviewScore >= 85) {
    return "mastered";
  }

  if (previousScore === null) {
    return reviewScore < 75
      ? "needs_practice"
      : "unchanged";
  }

  const change = reviewScore - previousScore;

  if (change >= 5) {
    return "improved";
  }

  if (change <= -5) {
    return "declined";
  }

  if (reviewScore < 75) {
    return "needs_practice";
  }

  return "unchanged";
}

export async function createReviewSession({
  sentenceIds,
}: CreateReviewSessionInput): Promise<string> {
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
      "Please sign in before starting Smart Review."
    );
  }

  const normalizedSentenceIds = Array.from(
    new Set(
      sentenceIds
        .map((sentenceId) => sentenceId.trim())
        .filter(Boolean)
    )
  );

  if (normalizedSentenceIds.length === 0) {
    throw new Error(
      "Smart Review does not contain any sentences."
    );
  }

  const { data, error } = await supabase
    .from("ai_speaking_review_sessions")
    .insert({
      user_id: user.id,
      sentence_ids: normalizedSentenceIds,
      completed_sentence_ids: [],
      total_sentences:
        normalizedSentenceIds.length,
      completed_sentences: 0,
      average_score: 0,
      status: "started",
      started_at: new Date().toISOString(),
      completed_at: null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.id) {
    throw new Error(
      "Smart Review started, but no session ID was returned."
    );
  }

  return String(data.id);
}

export async function saveReviewSessionItem({
  reviewSessionId,
  sentenceId,
  targetText,
  previousScore,
  reviewScore,
  previousAttemptId,
  reviewAttemptId,
}: SaveReviewSessionItemInput): Promise<void> {
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
      "Please sign in before saving Smart Review progress."
    );
  }

  const safeReviewScore = Math.max(
    0,
    Math.min(100, Math.round(reviewScore))
  );

  const safePreviousScore =
    previousScore === null
      ? null
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(previousScore)
          )
        );

  const scoreChange =
    safePreviousScore === null
      ? 0
      : safeReviewScore -
        safePreviousScore;

  const resultStatus =
    getReviewResultStatus(
      safePreviousScore,
      safeReviewScore
    );

  const { error } = await supabase
    .from("ai_speaking_review_session_items")
    .upsert(
      {
        review_session_id:
          reviewSessionId,
        user_id: user.id,
        sentence_id: sentenceId,
        target_text: targetText,
        previous_score:
          safePreviousScore,
        review_score:
          safeReviewScore,
        score_change: scoreChange,
        result_status: resultStatus,
        previous_attempt_id:
          previousAttemptId,
        review_attempt_id:
          reviewAttemptId,
      },
      {
        onConflict:
          "review_session_id,sentence_id",
      }
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function completeReviewSession({
  reviewSessionId,
  completedSentenceIds,
  averageScore,
}: CompleteReviewSessionInput): Promise<void> {
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
      "Please sign in before completing Smart Review."
    );
  }

  const normalizedCompletedSentenceIds =
    Array.from(
      new Set(
        completedSentenceIds
          .map((sentenceId) =>
            sentenceId.trim()
          )
          .filter(Boolean)
      )
    );

  const safeAverageScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(averageScore)
    )
  );

  const { error } = await supabase
    .from("ai_speaking_review_sessions")
    .update({
      completed_sentence_ids:
        normalizedCompletedSentenceIds,
      completed_sentences:
        normalizedCompletedSentenceIds.length,
      average_score:
        safeAverageScore,
      status: "completed",
      completed_at:
        new Date().toISOString(),
    })
    .eq("id", reviewSessionId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getLatestCompletedReviewSession(): Promise<LatestCompletedReviewSession | null> {
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
    .from("ai_speaking_review_sessions")
    .select(
      `
        id,
        sentence_ids,
        completed_sentence_ids,
        total_sentences,
        completed_sentences,
        average_score,
        status,
        started_at,
        completed_at,
        created_at
      `
    )
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("completed_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as ReviewSessionRow;

  if (!row.completed_at) {
    return null;
  }

  return {
    id: row.id,
    sentenceIds:
      row.sentence_ids ?? [],
    completedSentenceIds:
      row.completed_sentence_ids ?? [],
    totalSentences:
      Number(row.total_sentences ?? 0),
    completedSentences:
      Number(
        row.completed_sentences ?? 0
      ),
    averageScore:
      Number(row.average_score ?? 0),
    status: "completed",
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}
