"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ChatBox, {
  type ConversationStatus,
} from "@/components/ChatBox";

import { createSupabaseBrowserClient } from "@/lib/supabase";

type SubscriptionStatus =
  | "trial"
  | "pending"
  | "premium"
  | "expired"
  | "blocked";

interface ProfileData {
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
}

const statusDetails: Record<
  ConversationStatus,
  {
    text: string;
    dotClass: string;
  }
> = {
  ready: {
    text: "Anna is ready",
    dotClass: "bg-purple-400",
  },
  listening: {
    text: "Anna is listening",
    dotClass: "bg-green-400",
  },
  thinking: {
    text: "Anna is thinking",
    dotClass: "bg-yellow-400",
  },
  speaking: {
    text: "Anna is speaking",
    dotClass: "bg-purple-300",
  },
};

export default function CallPage() {
  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    []
  );

  const [status, setStatus] =
    useState<ConversationStatus>("ready");

  const [checkingAccess, setCheckingAccess] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [userEmail, setUserEmail] =
    useState("");

  const [planName, setPlanName] =
    useState("");

  const [trialDaysLeft, setTrialDaysLeft] =
    useState<number | null>(null);

  const [pageError, setPageError] =
    useState("");

  const currentStatus = statusDetails[status];

  useEffect(() => {
    let isMounted = true;

    async function checkAccountAccess() {
      try {
        setPageError("");

        /*
         * STEP 1:
         * Browser session ရှိ/မရှိ စစ်မယ်။
         */
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (
          sessionError ||
          !session ||
          !session.user
        ) {
          window.location.replace("/login");
          return;
        }

        const user = session.user;

        /*
         * STEP 2:
         * Logged-in user အမှန်ဟုတ်/မဟုတ်
         * Supabase Auth နဲ့စစ်မယ်။
         */
        const {
          data: { user: verifiedUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (!isMounted) {
          return;
        }

        if (userError || !verifiedUser) {
          await supabase.auth.signOut();
          window.location.replace("/login");
          return;
        }

        /*
         * STEP 3:
         * profiles table က trial / premium
         * information ကိုဖတ်မယ်။
         */
        const {
          data: profileResult,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "subscription_status, trial_ends_at, subscription_ends_at"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (!isMounted) {
          return;
        }

        if (profileError) {
          console.error(
            "Profile query error:",
            profileError
          );

          setPageError(
            `Profile data စစ်မရပါ: ${profileError.message}`
          );

          setCheckingAccess(false);
          return;
        }

        if (!profileResult) {
          setPageError(
            "profiles table ထဲမှာ ဒီ account ရဲ့ row မရှိပါ။"
          );

          setCheckingAccess(false);
          return;
        }

        const profile =
          profileResult as ProfileData;

        /*
         * STEP 4:
         * Blocked account ဖြစ်ရင် logout လုပ်မယ်။
         */
        if (
          profile.subscription_status ===
          "blocked"
        ) {
          await supabase.auth.signOut();

          window.alert(
            "ဒီ account ကို block လုပ်ထားပါတယ်။"
          );

          window.location.replace("/login");
          return;
        }

        const now = new Date();

        const trialEndsAt =
          profile.trial_ends_at
            ? new Date(profile.trial_ends_at)
            : null;

        const subscriptionEndsAt =
          profile.subscription_ends_at
            ? new Date(
                profile.subscription_ends_at
              )
            : null;

        const trialDateIsValid =
          trialEndsAt !== null &&
          !Number.isNaN(
            trialEndsAt.getTime()
          );

        const subscriptionDateIsValid =
          subscriptionEndsAt !== null &&
          !Number.isNaN(
            subscriptionEndsAt.getTime()
          );

        /*
         * Trial status ဖြစ်ပြီး trial end date
         * မကျော်သေးရင် access ပေးမယ်။
         */
        const hasActiveTrial =
          profile.subscription_status ===
            "trial" &&
          trialDateIsValid &&
          trialEndsAt!.getTime() >
            now.getTime();

        /*
         * Premium status ဖြစ်ပြီး subscription
         * end date မကျော်သေးရင် access ပေးမယ်။
         */
        const hasActivePremium =
          profile.subscription_status ===
            "premium" &&
          subscriptionDateIsValid &&
          subscriptionEndsAt!.getTime() >
            now.getTime();

        /*
         * Trial နဲ့ Premium နှစ်ခုလုံး inactive
         * ဖြစ်ရင် Homepage Pricing ကိုပို့မယ်။
         */
        if (
          !hasActiveTrial &&
          !hasActivePremium
        ) {
          window.location.replace(
            "/#pricing"
          );

          return;
        }

        /*
         * Header မှာ user information ပြမယ်။
         */
        setUserEmail(
          verifiedUser.email ?? ""
        );

        if (hasActivePremium) {
          setPlanName("Premium");
          setTrialDaysLeft(null);
        }

        if (
          hasActiveTrial &&
          trialEndsAt
        ) {
          const millisecondsLeft =
            trialEndsAt.getTime() -
            now.getTime();

          const calculatedDaysLeft =
            Math.max(
              1,
              Math.ceil(
                millisecondsLeft /
                  (1000 *
                    60 *
                    60 *
                    24)
              )
            );

          setPlanName("Free Trial");
          setTrialDaysLeft(
            calculatedDaysLeft
          );
        }

        setCheckingAccess(false);
      } catch (error) {
        console.error(
          "Account access error:",
          error
        );

        if (!isMounted) {
          return;
        }

        setPageError(
          error instanceof Error
            ? error.message
            : "Account access စစ်မရပါ။"
        );

        setCheckingAccess(false);
      }
    }

    void checkAccountAccess();

    /*
     * User logout ဖြစ်သွားရင်
     * login page ကိုပြန်ပို့မယ်။
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) {
          return;
        }

        if (
          event === "SIGNED_OUT" ||
          !session
        ) {
          window.location.replace(
            "/login"
          );
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    setPageError("");

    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.replace("/login");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setPageError(
        error instanceof Error
          ? error.message
          : "Logout လုပ်မရပါ။"
      );

      setLoggingOut(false);
    }
  }

  /*
   * Account နဲ့ Trial စစ်နေချိန် Loading screen
   */
  if (checkingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-5 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-300/30 border-t-purple-400" />

          <p className="mt-4 text-purple-100">
            Checking your account...
          </p>

          <p className="mt-2 text-sm text-white/40">
            Login and trial status
            စစ်နေပါတယ်။
          </p>
        </div>
      </main>
    );
  }

  /*
   * profiles table / database error ဖြစ်ရင်
   * ဒီ screen ပြမယ်။
   */
  if (pageError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-red-500/10 p-7 text-center">
          <p className="text-5xl">⚠️</p>

          <h1 className="mt-4 text-2xl font-bold">
            Account Error
          </h1>

          <p className="mt-3 text-sm leading-6 text-red-100">
            {pageError}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="rounded-2xl bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-500"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                void handleLogout()
              }
              disabled={loggingOut}
              className="rounded-2xl bg-white/10 px-5 py-3 font-semibold transition hover:bg-white/20 disabled:opacity-50"
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-3 text-white sm:flex sm:items-center sm:justify-center">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-sm flex-col overflow-hidden rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-purple-800 via-slate-900 to-black shadow-2xl sm:h-[820px] sm:min-h-0">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between px-6 pb-3 pt-6">
          <Link
            href="/"
            aria-label="Go back"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-xl backdrop-blur-md transition hover:bg-white/15"
          >
            ←
          </Link>

          <div className="min-w-0 px-2 text-center">
            <h1 className="font-semibold">
              Anna-AI
            </h1>

            <p className="mt-1 max-w-44 truncate text-xs text-green-300">
              ● {userEmail || "Online"}
            </p>

            {planName && (
              <p className="mt-1 text-[11px] text-purple-200">
                {planName}
              </p>
            )}

            {trialDaysLeft !== null && (
              <p className="mt-1 text-[11px] font-semibold text-yellow-200">
                {trialDaysLeft} day
                {trialDaysLeft > 1
                  ? "s"
                  : ""}{" "}
                left
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              void handleLogout()
            }
            disabled={loggingOut}
            aria-label="Logout"
            className="flex h-11 min-w-11 items-center justify-center rounded-full bg-black/30 px-3 text-xs font-semibold backdrop-blur-md transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut
              ? "..."
              : "Logout"}
          </button>
        </header>

        {/* Main scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <section className="pt-3 text-center">
            <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-full border-4 border-purple-300/30 bg-purple-300/10 shadow-2xl shadow-purple-900/70 sm:h-60 sm:w-60">
              <Image
                src="/anna-character.png"
                alt="Anna AI cartoon character"
                fill
                priority
                sizes="240px"
                className="object-cover"
              />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-purple-100">
              <span
                className={`inline-block h-2.5 w-2.5 animate-pulse rounded-full ${currentStatus.dotClass}`}
              />

              <span>
                {currentStatus.text}
              </span>
            </div>
          </section>

          <section className="mt-5">
            <ChatBox
              onStatusChange={setStatus}
            />
          </section>
        </div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-white/10 bg-black/30 px-6 pb-6 pt-4 backdrop-blur-xl">
          <div className="flex items-start justify-center gap-9">
            <div className="text-center">
              <button
                type="button"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xl transition hover:bg-white/25"
              >
                🔇
              </button>

              <p className="mt-2 text-xs text-white/60">
                Mute
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/"
                aria-label="End call"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-2xl shadow-xl shadow-red-950/50 transition hover:bg-red-400"
              >
                📞
              </Link>

              <p className="mt-2 text-xs text-white/60">
                End
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xl transition hover:bg-white/25"
              >
                🔊
              </button>

              <p className="mt-2 text-xs text-white/60">
                Speaker
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}