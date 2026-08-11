"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";
import {
  getUserHskAccess,
  hasHskLevelAccess,
} from "@/lib/hsk-access";

import type {
  UserHskAccess,
} from "@/types/access";

type AiAccess = {
  active: boolean;
  planCode: string | null;
  planTitle: string | null;
  durationLabel: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  lifetime: boolean;
};

const HSK_LEVELS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9,
] as const;

const EMPTY_AI_ACCESS: AiAccess = {
  active: false,
  planCode: null,
  planTitle: null,
  durationLabel: null,
  startsAt: null,
  expiresAt: null,
  lifetime: false,
};

export default function AppAccountPage() {
  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const [email, setEmail] = useState("");
  const [aiAccess, setAiAccess] =
    useState<AiAccess>(EMPTY_AI_ACCESS);

  const [hskAccess, setHskAccess] =
    useState<UserHskAccess[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadAccount = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          window.location.replace(
            "/login?next=/app-account",
          );
          return;
        }

        setEmail(user.email ?? "");

        const [aiResult, hskResult] =
          await Promise.allSettled([
            fetch(
              "/api/account/ai-access",
              {
                method: "GET",
                cache: "no-store",
              },
            ).then(
              async (response) => {
                if (!response.ok) {
                  throw new Error(
                    "AI Speaking access request failed.",
                  );
                }

                return (
                  await response.json()
                ) as AiAccess;
              },
            ),

            getUserHskAccess(),
          ]);

        if (
          aiResult.status ===
          "fulfilled"
        ) {
          setAiAccess(aiResult.value);
        }

        if (
          hskResult.status ===
          "fulfilled"
        ) {
          setHskAccess(
            hskResult.value,
          );
        }

        if (
          aiResult.status === "rejected" &&
          hskResult.status === "rejected"
        ) {
          setError(
            "Unable to refresh account access. Please try again.",
          );
        }
      } catch (loadError) {
        console.error(
          "Account load failed:",
          loadError,
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load account.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [supabase],
  );

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const activeHskLevels =
    HSK_LEVELS.filter((level) =>
      hasHskLevelAccess(
        level,
        hskAccess,
      ),
    );

  const fullPackage =
    hskAccess.some(
      (row) =>
        row.product_code ===
        "hsk_full",
    );

  function refresh() {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    void loadAccount(true);
  }

  async function logout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const { error: logoutError } =
        await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      window.location.replace(
        "/login",
      );
    } catch (logoutError) {
      console.error(
        "Logout failed:",
        logoutError,
      );

      setError(
        "Logout failed. Please try again.",
      );

      setLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09030f] px-5 pb-28 pt-[max(30px,env(safe-area-inset-top))] text-white">
      <div className="mx-auto w-full max-w-md">
        <section className="text-center">
          <div className="mx-auto flex h-[82px] w-[82px] items-center justify-center rounded-full bg-purple-500 text-[38px] font-black">
            安
          </div>

          <h1 className="mt-4 text-2xl font-extrabold">
            Anna AI Account
          </h1>

          <p className="mt-1 text-[13px] text-[#8f8099]">
            {email || "Anna AI User"}
          </p>
        </section>

        {loading ? (
          <div className="mt-6 flex min-h-[70px] items-center justify-center gap-3 rounded-[17px] bg-[#130a1b] text-xs text-[#9b8aa4]">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-fuchsia-400/20 border-t-fuchsia-400" />
            Checking your access...
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/[0.08] p-3 text-xs text-red-200">
            ⚠ {error}
          </div>
        ) : null}

        <section className="mt-5 rounded-[22px] border border-[#382044] bg-[#160b20] p-[19px]">
          <p className="text-[9px] font-black tracking-[0.14em] text-purple-200">
            AI SPEAKING
          </p>

          <p
            className={[
              "mt-1 text-[8px] font-black",
              aiAccess.active
                ? "text-green-300"
                : "text-[#817189]",
            ].join(" ")}
          >
            {aiAccess.active
              ? "ACTIVE"
              : "NOT ACTIVE"}
          </p>

          <h2 className="mt-4 text-[21px] font-black">
            {aiAccess.active
              ? aiAccess.planTitle ??
                "Active AI Speaking Plan"
              : "Free Account"}
          </h2>

          <p className="mt-2 text-xs leading-5 text-[#9b8aa5]">
            {aiAccess.active
              ? aiAccess.lifetime
                ? "Lifetime AI Speaking access"
                : aiAccess.durationLabel ??
                  "AI Speaking access"
              : "Unlock Talk with Anna, Sentence Builder, pronunciation and premium speaking features."}
          </p>

          <Link
            href="/dashboard/ai/pricing"
            className="mt-4 flex h-[49px] items-center justify-center rounded-[14px] bg-purple-600 text-[13px] font-extrabold"
          >
            {aiAccess.active
              ? "View / Extend Plans"
              : "Buy AI Speaking Plan"}
          </Link>
        </section>

        <section className="mt-[14px] rounded-[22px] border border-[#173941] bg-[#0c171e] p-[18px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] font-black tracking-[0.12em] text-cyan-300">
                HSK LEARNING
              </p>

              <h2 className="mt-1 text-base font-black">
                Flashcards + Writing
              </h2>
            </div>

            {fullPackage ? (
              <span className="rounded-lg bg-green-500/10 px-2 py-1 text-[8px] font-black text-green-300">
                FULL
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {HSK_LEVELS.map(
              (level) => {
                const active =
                  hasHskLevelAccess(
                    level,
                    hskAccess,
                  );

                return (
                  <Link
                    key={level}
                    href={
                      active
                        ? `/hsk/flashcards/${level}`
                        : "/hsk/store"
                    }
                    className={[
                      "flex min-h-[67px] flex-col items-center justify-center rounded-[14px] border",
                      active
                        ? "border-[#277b87] bg-[#10272d]"
                        : "border-[#20333a] bg-[#111920]",
                    ].join(" ")}
                  >
                    <span className="text-[21px] font-black">
                      {level}
                    </span>

                    {level === 1 ? (
                      <span className="text-[7px] font-black text-green-300">
                        FREE
                      </span>
                    ) : active ? (
                      <span className="text-green-300">
                        ●
                      </span>
                    ) : (
                      <span>🔒</span>
                    )}
                  </Link>
                );
              },
            )}
          </div>

          <p className="mt-4 text-xs font-bold text-[#d8f7fb]">
            {fullPackage
              ? "HSK 1–9"
              : activeHskLevels
                  .map(
                    (level) =>
                      `HSK ${level}`,
                  )
                  .join(", ")}
          </p>

          <Link
            href="/hsk/store"
            className="mt-4 flex h-[45px] items-center justify-center rounded-[13px] bg-[#10303a] text-xs font-extrabold text-cyan-300"
          >
            View HSK Plans →
          </Link>
        </section>

        <Link
          href="/dashboard/payments"
          className="mt-4 flex h-[50px] items-center justify-center rounded-[15px] border border-[#302435] bg-[#130d18] text-sm font-bold text-violet-200"
        >
          View Payment Status →
        </Link>

        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="mt-4 flex h-[50px] w-full items-center justify-center rounded-[15px] border border-[#3b2447] bg-[#21132a] font-bold text-purple-200"
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh Access"}
        </button>

        <button
          type="button"
          disabled={loggingOut}
          onClick={() =>
            void logout()
          }
          className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[15px] border border-red-400/25 bg-red-500/[0.08] text-sm font-bold text-red-200"
        >
          {loggingOut
            ? "Logging out..."
            : "Logout"}
        </button>
      </div>
    </main>
  );
}