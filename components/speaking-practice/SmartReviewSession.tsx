"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getSmartReviewItems,
  type SmartReviewItem,
} from "@/lib/speaking-practice/review";

export default function SmartReviewSession() {
  const [items, setItems] = useState<
    SmartReviewItem[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadReviewItems =
    useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result =
          await getSmartReviewItems(10);

        setItems(result);
      } catch (loadError) {
        console.error(
          "Unable to load smart review:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load smart review."
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadReviewItems();
  }, [loadReviewItems]);

  if (isLoading) {
    return (
      <ReviewMessage>
        Preparing your Smart Review…
      </ReviewMessage>
    );
  }

  if (error) {
    return (
      <ReviewMessage>
        <p>{error}</p>

        <button
          type="button"
          onClick={() =>
            void loadReviewItems()
          }
          className="mt-5 rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white"
        >
          Try Again
        </button>
      </ReviewMessage>
    );
  }

  if (items.length === 0) {
    return (
      <ReviewMessage>
        <h1 className="text-2xl font-bold text-white">
          No Smart Review needed
        </h1>

        <p className="mt-3 text-white/55">
          Complete more pronunciation
          checks to build your review
          session.
        </p>

        <Link
          href="/dashboard/ai/pronunciation"
          className="mt-6 inline-flex rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white"
        >
          Start Practice
        </Link>
      </ReviewMessage>
    );
  }

  const sentenceIds = items
    .map((item) => item.sentenceId)
    .join(",");

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-amber-200">
            Anna AI Smart Review
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Your Review Session
          </h1>

          <p className="mt-2 text-sm text-white/55">
            These sentences were selected
            from your pronunciation
            history.
          </p>
        </div>

        <Link
          href={`/dashboard/ai/pronunciation?review=${encodeURIComponent(
            sentenceIds
          )}`}
          className="rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-violet-400"
        >
          Start Review →
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {items.map((item, index) => (
          <div
            key={item.sentenceId}
            className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-400/15 font-bold text-violet-100">
                {index + 1}
              </div>

              <div className="min-w-0">
                <p className="text-2xl font-semibold text-white">
                  {item.targetText}
                </p>

                <p className="mt-1 text-xs text-white/45">
                  Attempted{" "}
                  {item.attemptCount} time
                  {item.attemptCount === 1
                    ? ""
                    : "s"}{" "}
                  · {item.mistakeCount} mistake
                  {item.mistakeCount === 1
                    ? ""
                    : "s"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ScoreBadge
                label="Average"
                score={item.averageScore}
              />

              <ScoreBadge
                label="Latest"
                score={item.latestScore}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap justify-between gap-4">
        <Link
          href="/dashboard/ai/pronunciation/progress"
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/75 transition hover:bg-white/10"
        >
          ← Progress Dashboard
        </Link>

        <Link
          href={`/dashboard/ai/pronunciation?review=${encodeURIComponent(
            sentenceIds
          )}`}
          className="rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white"
        >
          Practice {items.length} Sentences
        </Link>
      </div>
    </section>
  );
}

function ScoreBadge({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl bg-black/15 px-4 py-3 text-center">
      <p className="text-xs text-white/40">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {score}
      </p>
    </div>
  );
}

function ReviewMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/10 p-10 text-center text-white/70 backdrop-blur-xl">
      {children}
    </section>
  );
}