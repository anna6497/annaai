"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getSpeakingDashboardData,
  type SpeakingDashboardData,
} from "@/lib/speaking-practice/dashboard";

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
};

export default function SpeakingDashboard() {
  const [
    dashboard,
    setDashboard,
  ] =
    useState<SpeakingDashboardData>(
      EMPTY_DASHBOARD
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadDashboard =
    useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result =
          await getSpeakingDashboardData();

        setDashboard(result);
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

  if (isLoading) {
    return (
      <DashboardMessage>
        Loading your speaking
        progress…
      </DashboardMessage>
    );
  }

  if (error) {
    return (
      <DashboardMessage>
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
      </DashboardMessage>
    );
  }

  if (!dashboard.isAuthenticated) {
    return (
      <DashboardMessage>
        <h1 className="text-2xl font-bold text-white">
          Sign in to view your
          progress
        </h1>

        <p className="mt-3 text-white/60">
          Your scores, streak and
          difficult characters will
          appear here.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white"
        >
          Sign In
        </Link>
      </DashboardMessage>
    );
  }

  const goalCompleted =
    dashboard.todayCompleted >=
    dashboard.todayGoal;

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-violet-200">
            Anna AI V6
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
            Speaking Dashboard
          </h1>

          <p className="mt-2 text-white/55">
            Practice every day and
            improve your Chinese
            pronunciation.
          </p>
        </div>

        <Link
          href="/dashboard/ai/pronunciation"
          className="rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-violet-400"
        >
          Continue Practice →
        </Link>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-violet-200">
                Today&apos;s Goal
              </p>

              <p className="mt-2 text-4xl font-bold text-white">
                {
                  dashboard.todayCompleted
                }{" "}
                / {dashboard.todayGoal}
              </p>

              <p className="mt-2 text-sm text-white/55">
                Different sentences
                practiced today
              </p>
            </div>

            <div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-violet-400/25 bg-black/10">
              <span className="text-xl font-bold text-white">
                {
                  dashboard.todayProgressPercentage
                }
                %
              </span>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-500"
              style={{
                width: `${dashboard.todayProgressPercentage}%`,
              }}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-black/15 px-4 py-3 text-sm text-white/65">
            {goalCompleted
              ? "🎉 Daily goal completed! Great work."
              : `${Math.max(
                  dashboard.todayGoal -
                    dashboard.todayCompleted,
                  0
                )} more sentence${
                  dashboard.todayGoal -
                    dashboard.todayCompleted ===
                  1
                    ? ""
                    : "s"
                } to complete today’s goal.`}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            icon="🔥"
            label="Current Streak"
            value={`${dashboard.currentStreak} days`}
          />

          <MetricCard
            icon="⭐"
            label="Average Score"
            value={`${dashboard.averageScore}%`}
          />

          <MetricCard
            icon="🎤"
            label="Total Attempts"
            value={String(
              dashboard.totalAttempts
            )}
          />

          <MetricCard
            icon="📚"
            label="Sentences Practiced"
            value={String(
              dashboard.practicedSentenceCount
            )}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-violet-200">
                Smart Review
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Weak Characters
              </h2>
            </div>

            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/55">
              Last 90 days
            </span>
          </div>

          {dashboard.weakCharacters
            .length === 0 ? (
            <div className="mt-6 rounded-2xl bg-black/15 p-6 text-center">
              <p className="font-semibold text-white">
                No difficult characters
                yet
              </p>

              <p className="mt-2 text-sm text-white/50">
                Complete pronunciation
                checks to build your
                review list.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {dashboard.weakCharacters.map(
                (item) => (
                  <div
                    key={item.character}
                    className="rounded-2xl border border-amber-300/15 bg-amber-400/10 p-4 text-center"
                  >
                    <p className="text-4xl font-semibold text-amber-50">
                      {item.character}
                    </p>

                    <p className="mt-2 text-xs text-amber-100/60">
                      {
                        item.mistakeCount
                      }{" "}
                      mistake
                      {item.mistakeCount ===
                      1
                        ? ""
                        : "s"}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
          <div>
            <p className="text-sm font-semibold text-violet-200">
              History
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Recent Practice
            </h2>
          </div>

          {dashboard.recentAttempts
            .length === 0 ? (
            <div className="mt-6 rounded-2xl bg-black/15 p-6 text-center">
              <p className="font-semibold text-white">
                No practice history yet
              </p>

              <Link
                href="/dashboard/ai/pronunciation"
                className="mt-4 inline-flex text-sm font-semibold text-violet-200"
              >
                Start practicing →
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {dashboard.recentAttempts.map(
                (attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-black/15 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-white">
                        {
                          attempt.targetText
                        }
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        Lesson{" "}
                        {attempt.lesson} ·{" "}
                        {formatCategory(
                          attempt.category
                        )}{" "}
                        ·{" "}
                        {formatDate(
                          attempt.createdAt
                        )}
                      </p>
                    </div>

                    <div
                      className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${getScoreClass(
                        attempt.overallScore
                      )}`}
                    >
                      {
                        attempt.overallScore
                      }
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DashboardMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/10 p-10 text-center shadow-xl backdrop-blur-xl">
      <div className="text-white/70">
        {children}
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-lg backdrop-blur-xl">
      <p className="text-2xl">
        {icon}
      </p>

      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-white/40">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function formatCategory(
  category: string
): string {
  return category
    .replaceAll("-", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function formatDate(
  value: string
): string {
  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

function getScoreClass(
  score: number
): string {
  if (score >= 90) {
    return "bg-emerald-400/15 text-emerald-100";
  }

  if (score >= 75) {
    return "bg-blue-400/15 text-blue-100";
  }

  if (score >= 60) {
    return "bg-amber-400/15 text-amber-100";
  }

  return "bg-red-400/15 text-red-100";
}