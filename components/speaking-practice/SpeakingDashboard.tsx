"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getSpeakingDashboardData,
  type SpeakingDashboardData,
} from "@/lib/speaking-practice/dashboard";

import {
  saveSpeakingDailyGoal,
  type SpeakingDailyGoal,
} from "@/lib/speaking-practice/preferences";

const EMPTY_DASHBOARD: SpeakingDashboardData = {
  isAuthenticated: false,
  todayGoal: 10,
  todayCompleted: 0,
  todayProgressPercentage: 0,
  currentStreak: 0,
  averageScore: 0,
  totalAttempts: 0,
  practicedSentenceCount: 0,
  weakCharacters: [],
  recentAttempts: [],
  latestReviewSession: null,
  latestReviewImprovement: null,
};

const DAILY_GOALS: SpeakingDailyGoal[] = [
  5,
  10,
  20,
];

export default function SpeakingDashboard() {
  const [dashboard, setDashboard] =
    useState<SpeakingDashboardData>(
      EMPTY_DASHBOARD
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    isSavingGoal,
    setIsSavingGoal,
  ] = useState(false);

  const [
    goalMessage,
    setGoalMessage,
  ] = useState<string | null>(null);

  const loadDashboard =
    useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        setDashboard(
          await getSpeakingDashboardData()
        );
      } catch (loadError) {
        console.error(
          "Unable to load speaking dashboard:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load speaking dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleGoalChange(
    dailyGoal: SpeakingDailyGoal
  ) {
    if (
      dailyGoal ===
      dashboard.todayGoal
    ) {
      return;
    }

    setIsSavingGoal(true);
    setGoalMessage(null);

    try {
      await saveSpeakingDailyGoal(
        dailyGoal
      );

      setDashboard(
        (previous) => ({
          ...previous,
          todayGoal: dailyGoal,
          todayProgressPercentage:
            Math.min(
              100,
              Math.round(
                (previous.todayCompleted /
                  dailyGoal) *
                  100
              )
            ),
        })
      );

      setGoalMessage(
        `Daily goal changed to ${dailyGoal} sentences.`
      );
    } catch (saveError) {
      setGoalMessage(
        saveError instanceof Error
          ? saveError.message
          : "Daily goal could not be saved."
      );
    } finally {
      setIsSavingGoal(false);
    }
  }

  const reviewAgainHref =
    useMemo(() => {
      const sentenceIds =
        dashboard
          .latestReviewSession
          ?.sentenceIds ?? [];

      if (sentenceIds.length === 0) {
        return "/dashboard/ai/pronunciation/review";
      }

      return `/dashboard/ai/pronunciation?review=${encodeURIComponent(
        sentenceIds.join(",")
      )}`;
    }, [
      dashboard.latestReviewSession,
    ]);

  if (isLoading) {
    return (
      <MessageCard>
        Loading your speaking progress…
      </MessageCard>
    );
  }

  if (error) {
    return (
      <MessageCard>
        <p>{error}</p>

        <button
          type="button"
          onClick={() =>
            void loadDashboard()
          }
          className="mt-5 rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white"
        >
          Try Again
        </button>
      </MessageCard>
    );
  }

  if (!dashboard.isAuthenticated) {
    return (
      <MessageCard>
        <h1 className="text-2xl font-bold text-white">
          Sign in to view your progress
        </h1>

        <Link
          href="/login"
          className="mt-6 inline-flex rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white"
        >
          Sign In
        </Link>
      </MessageCard>
    );
  }

  const improvement =
    dashboard.latestReviewImprovement;

  return (
    <section className="mx-auto w-full max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-violet-200">
            Anna AI V6
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
            Speaking Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/ai/pronunciation/review"
            className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-6 py-3 font-semibold text-amber-100"
          >
            Smart Review
          </Link>

          <Link
            href="/dashboard/ai/pronunciation"
            className="rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white"
          >
            Continue Practice →
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
          <p className="text-sm font-semibold text-violet-200">
            Today&apos;s Goal
          </p>

          <p className="mt-2 text-4xl font-bold text-white">
            {dashboard.todayCompleted} /{" "}
            {dashboard.todayGoal}
          </p>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
              style={{
                width: `${dashboard.todayProgressPercentage}%`,
              }}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {DAILY_GOALS.map(
              (dailyGoal) => (
                <button
                  key={dailyGoal}
                  type="button"
                  disabled={isSavingGoal}
                  onClick={() =>
                    void handleGoalChange(
                      dailyGoal
                    )
                  }
                  className={`rounded-2xl px-5 py-3 text-sm font-semibold ${
                    dashboard.todayGoal ===
                    dailyGoal
                      ? "bg-violet-500 text-white"
                      : "border border-white/10 bg-white/5 text-white/70"
                  }`}
                >
                  {dailyGoal} sentences
                </button>
              )
            )}
          </div>

          {goalMessage ? (
            <p className="mt-3 text-sm text-white/60">
              {goalMessage}
            </p>
          ) : null}
        </section>

        <div className="grid grid-cols-2 gap-4">
          <Metric
            label="Streak"
            value={`${dashboard.currentStreak} days`}
          />
          <Metric
            label="Average"
            value={`${dashboard.averageScore}%`}
          />
          <Metric
            label="Attempts"
            value={String(
              dashboard.totalAttempts
            )}
          />
          <Metric
            label="Sentences"
            value={String(
              dashboard.practicedSentenceCount
            )}
          />
        </div>
      </div>

      <section className="mt-6 rounded-[2rem] border border-violet-300/15 bg-violet-400/10 p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-violet-200">
              Last Smart Review
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              {dashboard.latestReviewSession
                ? `${dashboard.latestReviewSession.completedSentences} sentences reviewed`
                : "No completed review yet"}
            </h2>
          </div>

          {dashboard.latestReviewSession ? (
            <div className="rounded-3xl bg-black/15 px-6 py-4 text-center">
              <p className="text-xs text-white/40">
                Average Score
              </p>
              <p className="mt-1 text-4xl font-bold text-white">
                {
                  dashboard
                    .latestReviewSession
                    .averageScore
                }
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={reviewAgainHref}
            className="rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white"
          >
            Review Again →
          </Link>

          <Link
            href="/dashboard/ai/pronunciation/review"
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/75"
          >
            Build New Review
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-emerald-300/15 bg-emerald-400/10 p-6">
        <p className="text-sm font-semibold text-emerald-200">
          Improvement Summary
        </p>

        {!improvement ? (
          <p className="mt-3 text-white/60">
            Complete a Smart Review to see
            improvement analytics.
          </p>
        ) : (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Metric
                label="Previous Average"
                value={
                  improvement.previousAverage ===
                  null
                    ? "—"
                    : String(
                        improvement.previousAverage
                      )
                }
              />

              <Metric
                label="Latest Average"
                value={String(
                  improvement.latestAverage
                )}
              />

              <Metric
                label="Improvement"
                value={
                  improvement.averageImprovement ===
                  null
                    ? "—"
                    : `${improvement.averageImprovement >= 0 ? "+" : ""}${improvement.averageImprovement}`
                }
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <SummaryPill
                label="Improved"
                value={
                  improvement.improvedCount
                }
              />
              <SummaryPill
                label="Mastered"
                value={
                  improvement.masteredCount
                }
              />
              <SummaryPill
                label="Needs Practice"
                value={
                  improvement.needsPracticeCount
                }
              />
              <SummaryPill
                label="Declined"
                value={
                  improvement.declinedCount
                }
              />
            </div>

            <div className="mt-6 space-y-3">
              {improvement.items.map(
                (item) => (
                  <div
                    key={item.sentenceId}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-black/15 px-4 py-3"
                  >
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {item.targetText}
                      </p>

                      <p className="mt-1 text-xs text-white/45">
                        {formatStatus(
                          item.status
                        )}
                      </p>
                    </div>

                    <p className="font-semibold text-white">
                      {item.previousScore ??
                        "—"}{" "}
                      → {item.reviewScore}
                      {item.previousScore !==
                      null ? (
                        <span className="ml-2 text-emerald-200">
                          (
                          {item.scoreChange >= 0
                            ? "+"
                            : ""}
                          {item.scoreChange})
                        </span>
                      ) : null}
                    </p>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
          <h2 className="text-xl font-bold text-white">
            Weak Characters
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {dashboard.weakCharacters.map(
              (item) => (
                <Link
                  key={item.character}
                  href={`/dashboard/ai/pronunciation?q=${encodeURIComponent(
                    item.character
                  )}`}
                  className="rounded-2xl bg-amber-400/10 p-4 text-center"
                >
                  <p className="text-4xl font-semibold text-amber-50">
                    {item.character}
                  </p>
                  <p className="mt-2 text-xs text-amber-100/60">
                    {item.mistakeCount} mistakes
                  </p>
                </Link>
              )
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
          <h2 className="text-xl font-bold text-white">
            Recent Practice
          </h2>

          <div className="mt-5 space-y-3">
            {dashboard.recentAttempts.map(
              (attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3"
                >
                  <p className="text-white">
                    {attempt.targetText}
                  </p>

                  <span className="font-bold text-violet-200">
                    {attempt.overallScore}
                  </span>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function MessageCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/10 p-10 text-center text-white/70">
      {children}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-black/15 p-5">
      <p className="text-xs uppercase tracking-wide text-white/40">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function SummaryPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-black/15 px-4 py-3 text-center">
      <p className="text-xs text-white/45">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function formatStatus(
  status: string
): string {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}
