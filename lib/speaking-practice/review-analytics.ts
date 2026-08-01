import { createClient } from "@/lib/supabase/client";

import type {
  LatestCompletedReviewSession,
  ReviewResultStatus,
} from "@/lib/speaking-practice/review-session";

export type ReviewImprovementItem = {
  sentenceId: string;
  targetText: string;
  previousScore: number | null;
  reviewScore: number;
  scoreChange: number;
  status: ReviewResultStatus;
};

export type ReviewImprovementSummary = {
  reviewSessionId: string;
  previousAverage: number | null;
  latestAverage: number;
  averageImprovement: number | null;
  improvedCount: number;
  masteredCount: number;
  needsPracticeCount: number;
  declinedCount: number;
  unchangedCount: number;
  items: ReviewImprovementItem[];
};

type ReviewItemRow = {
  sentence_id: string;
  target_text: string;
  previous_score: number | null;
  review_score: number;
  score_change: number;
  result_status: ReviewResultStatus;
};

export async function getReviewImprovementSummary(
  session: LatestCompletedReviewSession | null
): Promise<ReviewImprovementSummary | null> {
  if (!session) {
    return null;
  }

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
    .from(
      "ai_speaking_review_session_items"
    )
    .select(
      `
        sentence_id,
        target_text,
        previous_score,
        review_score,
        score_change,
        result_status
      `
    )
    .eq(
      "review_session_id",
      session.id
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const items =
    (data as ReviewItemRow[] | null) ??
    [];

  if (items.length === 0) {
    return {
      reviewSessionId: session.id,
      previousAverage: null,
      latestAverage:
        session.averageScore,
      averageImprovement: null,
      improvedCount: 0,
      masteredCount: 0,
      needsPracticeCount: 0,
      declinedCount: 0,
      unchangedCount: 0,
      items: [],
    };
  }

  const previousScores = items
    .map((item) => item.previous_score)
    .filter(
      (score): score is number =>
        typeof score === "number"
    );

  const previousAverage =
    previousScores.length > 0
      ? Math.round(
          previousScores.reduce(
            (sum, score) =>
              sum + score,
            0
          ) / previousScores.length
        )
      : null;

  const latestAverage = Math.round(
    items.reduce(
      (sum, item) =>
        sum + item.review_score,
      0
    ) / items.length
  );

  return {
    reviewSessionId: session.id,
    previousAverage,
    latestAverage,
    averageImprovement:
      previousAverage === null
        ? null
        : latestAverage -
          previousAverage,
    improvedCount: items.filter(
      (item) =>
        item.result_status ===
        "improved"
    ).length,
    masteredCount: items.filter(
      (item) =>
        item.result_status ===
        "mastered"
    ).length,
    needsPracticeCount: items.filter(
      (item) =>
        item.result_status ===
        "needs_practice"
    ).length,
    declinedCount: items.filter(
      (item) =>
        item.result_status ===
        "declined"
    ).length,
    unchangedCount: items.filter(
      (item) =>
        item.result_status ===
        "unchanged"
    ).length,
    items: items.map((item) => ({
      sentenceId:
        item.sentence_id,
      targetText:
        item.target_text,
      previousScore:
        item.previous_score,
      reviewScore:
        item.review_score,
      scoreChange:
        item.score_change,
      status:
        item.result_status,
    })),
  };
}
