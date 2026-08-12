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

  const [email, setEmail] =
    useState("");

  const [aiAccess, setAiAccess] =
    useState<AiAccess>(
      EMPTY_AI_ACCESS,
    );

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
        } =
          await supabase.auth.getUser();

        if (userError || !user) {
          window.location.replace(
            "/login?next=/app-account",
          );
          return;
        }

        setEmail(user.email ?? "");

        const [
          aiResult,
          hskResult,
        ] = await Promise.allSettled([
          fetch("/api/account/ai-access", {
            method: "GET",
            cache: "no-store",
          }).then(async (response) => {
            if (!response.ok) {
              throw new Error(
                "AI Speaking access request failed.",
              );
            }

            return (
              await response.json()
            ) as AiAccess;
          }),

          getUserHskAccess(),
        ]);

        if (
          aiResult.status ===
          "fulfilled"
        ) {
          setAiAccess(
            aiResult.value,
          );
        } else {
          console.error(
            "AI access load failed:",
            aiResult.reason,
          );
        }

        if (
          hskResult.status ===
          "fulfilled"
        ) {
          setHskAccess(
            hskResult.value,
          );
        } else {
          console.error(
            "HSK access load failed:",
            hskResult.reason,
          );
        }

        if (
          aiResult.status ===
            "rejected" &&
          hskResult.status ===
            "rejected"
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
    setError("");

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
    <main
      className="
        min-h-screen
        bg-[#09030f]
        px-5
        pb-8
        pt-[max(30px,env(safe-area-inset-top))]
        text-white
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-md
        "
      >
        {/* ACCOUNT HEADER */}

        <section className="text-center">
          <div
            className="
              mx-auto
              flex
              h-[82px]
              w-[82px]
              items-center
              justify-center
              rounded-full
              bg-purple-500
              text-[38px]
              font-black
              shadow-[0_0_40px_rgba(168,85,247,0.25)]
            "
          >
            安
          </div>

          <h1
            className="
              mt-4
              text-2xl
              font-extrabold
            "
          >
            Anna AI Account
          </h1>

          <p
            className="
              mt-1
              text-[13px]
              text-[#8f8099]
            "
          >
            {email ||
              "Anna AI User"}
          </p>
        </section>

        {loading ? (
          <div
            className="
              mt-6
              flex
              min-h-[70px]
              items-center
              justify-center
              gap-3
              rounded-[17px]
              bg-[#130a1b]
              text-xs
              text-[#9b8aa4]
            "
          >
            <span
              className="
                h-5
                w-5
                animate-spin
                rounded-full
                border-2
                border-fuchsia-400/20
                border-t-fuchsia-400
              "
            />

            Checking your access...
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="
              mt-4
              rounded-2xl
              border
              border-red-400/20
              bg-red-500/[0.08]
              p-3
              text-xs
              leading-5
              text-red-200
            "
          >
            ⚠ {error}
          </div>
        ) : null}

        {/* AI SPEAKING */}

        <section
          className="
            mt-5
            rounded-[22px]
            border
            border-[#382044]
            bg-[#160b20]
            p-[19px]
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-[42px]
                w-[42px]
                items-center
                justify-center
                rounded-[13px]
                bg-[#2b1436]
                text-xl
                text-fuchsia-300
              "
            >
              ◆
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="
                  text-[9px]
                  font-black
                  tracking-[0.14em]
                  text-purple-200
                "
              >
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
            </div>

            <span
              className={
                aiAccess.active
                  ? "text-2xl text-green-300"
                  : "text-xl text-[#75677f]"
              }
            >
              {aiAccess.active
                ? "●"
                : "🔒"}
            </span>
          </div>

          <h2
            className="
              mt-4
              text-[21px]
              font-black
            "
          >
            {aiAccess.active
              ? aiAccess.planTitle ??
                "Active AI Speaking Plan"
              : "Free Account"}
          </h2>

          <p
            className="
              mt-2
              text-xs
              leading-5
              text-[#9b8aa5]
            "
          >
            {aiAccess.active
              ? aiAccess.lifetime
                ? "Lifetime AI Speaking access"
                : aiAccess.durationLabel ??
                  "AI Speaking access"
              : "Unlock Talk with Anna, Sentence Builder, pronunciation and premium speaking features."}
          </p>

          {aiAccess.expiresAt &&
          !aiAccess.lifetime ? (
            <p
              className="
                mt-3
                text-[11px]
                text-violet-300
              "
            >
              ◷ Expires{" "}
              {new Date(
                aiAccess.expiresAt,
              ).toLocaleDateString()}
            </p>
          ) : null}

          <Link
            href="/dashboard/ai/pricing"
            className="
              mt-4
              flex
              h-[49px]
              items-center
              justify-center
              gap-2
              rounded-[14px]
              bg-purple-600
              text-[13px]
              font-extrabold
              transition
              active:scale-[0.98]
            "
          >
            ◆
            {aiAccess.active
              ? "View / Extend Plans"
              : "Buy AI Speaking Plan"}
          </Link>
        </section>

        {/* HSK */}

        <section
          className="
            mt-[14px]
            rounded-[22px]
            border
            border-[#173941]
            bg-[#0c171e]
            p-[18px]
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-[42px]
                w-[42px]
                items-center
                justify-center
                rounded-[13px]
                bg-[#10303a]
                text-xl
                text-cyan-300
              "
            >
              ▣
            </div>

            <div className="flex-1">
              <p
                className="
                  text-[8px]
                  font-black
                  tracking-[0.12em]
                  text-cyan-300
                "
              >
                HSK LEARNING
              </p>

              <h2
                className="
                  mt-1
                  text-base
                  font-black
                "
              >
                Flashcards + Writing
              </h2>
            </div>

            {fullPackage ? (
              <span
                className="
                  rounded-lg
                  bg-green-500/10
                  px-2
                  py-1
                  text-[8px]
                  font-black
                  text-green-300
                "
              >
                FULL
              </span>
            ) : null}
          </div>

          <p
            className="
              mt-3
              text-[11px]
              leading-[18px]
              text-[#789097]
            "
          >
            HSK 1 is free. Purchased
            levels unlock both
            Flashcards and Writing.
          </p>

          <div
            className="
              mt-4
              grid
              grid-cols-3
              gap-2
            "
          >
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
                    <span
                      className={[
                        "text-[21px] font-black",
                        active
                          ? "text-white"
                          : "text-[#766f7b]",
                      ].join(" ")}
                    >
                      {level}
                    </span>

                    {level === 1 ? (
                      <span
                        className="
                          mt-0.5
                          text-[7px]
                          font-black
                          text-green-300
                        "
                      >
                        FREE
                      </span>
                    ) : active ? (
                      <span
                        className="
                          text-xs
                          text-green-300
                        "
                      >
                        ●
                      </span>
                    ) : (
                      <span
                        className="
                          text-[10px]
                          text-[#675a6e]
                        "
                      >
                        🔒
                      </span>
                    )}
                  </Link>
                );
              },
            )}
          </div>

          <div
            className="
              mt-4
              border-t
              border-[#173039]
              pt-3
            "
          >
            <p
              className="
                text-[8px]
                font-black
                tracking-[0.12em]
                text-[#5f7a80]
              "
            >
              ACTIVE LEVELS
            </p>

            <p
              className="
                mt-1
                text-xs
                font-bold
                leading-[18px]
                text-[#d8f7fb]
              "
            >
              {fullPackage
                ? "HSK 1–9"
                : activeHskLevels
                    .map(
                      (level) =>
                        `HSK ${level}`,
                    )
                    .join(", ")}
            </p>
          </div>

          <Link
            href="/hsk/store"
            className="
              mt-4
              flex
              h-[45px]
              items-center
              justify-center
              gap-2
              rounded-[13px]
              bg-[#10303a]
              text-xs
              font-extrabold
              text-cyan-300
            "
          >
            View HSK Plans →
          </Link>
        </section>

        {/* PAYMENT */}

        <section
          className="
            mt-[14px]
            rounded-[22px]
            border
            border-[#302435]
            bg-[#130d18]
            p-[18px]
          "
        >
          <p
            className="
              text-[8px]
              font-black
              tracking-[0.12em]
              text-violet-300
            "
          >
            PAYMENTS
          </p>

          <h2
            className="
              mt-1
              text-[17px]
              font-black
            "
          >
            Payment Status
          </h2>

          <p
            className="
              mt-3
              text-[11px]
              leading-5
              text-[#817589]
            "
          >
            View your submitted payment
            requests and approval status.
          </p>

          <Link
            href="/dashboard/payments"
            className="
              mt-4
              flex
              h-[45px]
              items-center
              justify-center
              rounded-[13px]
              bg-white/[0.05]
              text-xs
              font-bold
              text-violet-200
            "
          >
            View Payment Status →
          </Link>
        </section>

        {/* REFRESH */}

        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="
            mt-[14px]
            flex
            h-[50px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-[15px]
            border
            border-[#3b2447]
            bg-[#21132a]
            font-bold
            text-purple-200
            disabled:opacity-50
          "
        >
          <span
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          >
            ↻
          </span>

          {refreshing
            ? "Refreshing..."
            : "Refresh Access"}
        </button>

        <p
          lang="my"
          className="
            mt-2
            px-4
            text-center
            text-[9px]
            leading-[15px]
            text-[#6f6376]
          "
        >
          Admin approve လုပ်ပြီးရင်
          Refresh Access နှိပ်ပါ။
          AI Speaking နဲ့ HSK access ကို
          ချက်ချင်းပြန်စစ်ပေးပါမယ်။
        </p>

        {/* LOGOUT */}

        <button
          type="button"
          disabled={loggingOut}
          onClick={() =>
            void logout()
          }
          className="
            mt-[14px]
            flex
            h-[52px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-[15px]
            border
            border-red-400/25
            bg-red-500/[0.08]
            text-sm
            font-bold
            text-red-200
            disabled:opacity-50
          "
        >
          {loggingOut
            ? "Logging out..."
            : "⇥  Logout"}
        </button>
      </div>
    </main>
  );
}