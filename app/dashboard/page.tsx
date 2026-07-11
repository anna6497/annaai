"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase";

type SubscriptionStatus =
  | "trial"
  | "pending"
  | "premium"
  | "expired"
  | "blocked";

type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected";

interface ProfileData {
  name: string | null;
  email: string | null;
  role: string | null;
  subscription_status: SubscriptionStatus;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
}

interface PaymentData {
  id: string;
  plan: "monthly" | "yearly";
  payment_method: "kbzpay" | "promptpay";
  amount: number | null;
  currency: string | null;
  status: PaymentStatus;
  created_at: string;
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function calculateDaysLeft(value: string | null) {
  if (!value) {
    return 0;
  }

  const endDate = new Date(value);

  if (Number.isNaN(endDate.getTime())) {
    return 0;
  }

  const millisecondsLeft =
    endDate.getTime() - Date.now();

  return Math.max(
    0,
    Math.ceil(
      millisecondsLeft /
        (1000 * 60 * 60 * 24)
    )
  );
}

export default function DashboardPage() {
  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    []
  );

  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [payments, setPayments] =
    useState<PaymentData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!active) {
          return;
        }

        if (userError || !user) {
          window.location.replace(
            "/login"
          );
          return;
        }

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            `
              name,
              email,
              role,
              subscription_status,
              trial_started_at,
              trial_ends_at,
              subscription_started_at,
              subscription_ends_at
            `
          )
          .eq("id", user.id)
          .single();

        if (profileError) {
          throw new Error(
            `Profile data မဖတ်နိုင်ပါ: ${profileError.message}`
          );
        }

        const {
          data: paymentData,
          error: paymentError,
        } = await supabase
          .from("payments")
          .select(
            `
              id,
              plan,
              payment_method,
              amount,
              currency,
              status,
              created_at
            `
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(10);

        if (paymentError) {
          throw new Error(
            `Payment history မဖတ်နိုင်ပါ: ${paymentError.message}`
          );
        }

        if (!active) {
          return;
        }

        setProfile(
          profileData as ProfileData
        );

        setPayments(
          (paymentData ??
            []) as PaymentData[]
        );
      } catch (dashboardError) {
        console.error(
          "Dashboard error:",
          dashboardError
        );

        if (!active) {
          return;
        }

        setError(
          dashboardError instanceof Error
            ? dashboardError.message
            : "Dashboard ဖွင့်မရပါ။"
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [supabase]);

  async function handleLogout() {
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

      window.location.replace("/login");
    } catch (logoutError) {
      setError(
        logoutError instanceof Error
          ? logoutError.message
          : "Logout လုပ်မရပါ။"
      );

      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-300/20 border-t-purple-400" />

          <p className="mt-4">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-red-500/10 p-7 text-center">
          <p className="text-5xl">⚠️</p>

          <h1 className="mt-4 text-2xl font-bold">
            Dashboard Error
          </h1>

          <p className="mt-3 text-sm leading-6 text-red-100">
            {error ||
              "Profile data မတွေ့ပါ။"}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-2xl bg-purple-600 px-6 py-3 font-bold"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const isTrial =
    profile.subscription_status ===
    "trial";

  const isPremium =
    profile.subscription_status ===
    "premium";

  const activeEndDate = isPremium
    ? profile.subscription_ends_at
    : profile.trial_ends_at;

  const daysLeft =
    calculateDaysLeft(activeEndDate);

  const latestPayment =
    payments.length > 0
      ? payments[0]
      : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-5 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 py-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold"
          >
            <span className="text-3xl">
              🤖
            </span>

            <span>Anna-AI</span>
          </Link>

          <div className="flex gap-3">
            {profile.role === "admin" && (
              <Link
                href="/admin/payments"
                className="rounded-full bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-100"
              >
                Admin
              </Link>
            )}

            <button
              type="button"
              onClick={() =>
                void handleLogout()
              }
              disabled={loggingOut}
              className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100 disabled:opacity-50"
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>
          </div>
        </header>

        <section className="mt-8">
          <p className="text-sm text-purple-300">
            Welcome back
          </p>

          <h1 className="mt-2 text-4xl font-black sm:text-5xl">
            {profile.name ||
              profile.email ||
              "Anna-AI User"}
          </h1>

          <p className="mt-3 text-white/55">
            Your account, subscription and
            payment information.
          </p>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-sm text-white/50">
              Current Plan
            </p>

            <p className="mt-3 text-2xl font-black capitalize">
              {profile.subscription_status}
            </p>

            <span
              className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                isPremium
                  ? "bg-green-500/20 text-green-200"
                  : isTrial
                    ? "bg-purple-500/20 text-purple-200"
                    : "bg-red-500/20 text-red-200"
              }`}
            >
              {isPremium
                ? "Premium Active"
                : isTrial
                  ? "Free Trial"
                  : "Access Inactive"}
            </span>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-sm text-white/50">
              Days Remaining
            </p>

            <p className="mt-3 text-4xl font-black">
              {daysLeft}
            </p>

            <p className="mt-3 text-sm text-white/45">
              Ends:{" "}
              {formatDate(activeEndDate)}
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-sm text-white/50">
              Latest Payment
            </p>

            <p className="mt-3 text-2xl font-black capitalize">
              {latestPayment
                ? latestPayment.status
                : "None"}
            </p>

            <p className="mt-3 text-sm text-white/45">
              {latestPayment
                ? `${latestPayment.plan} · ${latestPayment.payment_method}`
                : "No payment submitted"}
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-sm text-white/50">
              Account Email
            </p>

            <p className="mt-3 break-all text-lg font-bold">
              {profile.email || "-"}
            </p>

            <p className="mt-3 text-sm capitalize text-white/45">
              Role: {profile.role || "user"}
            </p>
          </article>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/10 p-7 backdrop-blur-xl lg:col-span-2">
            <h2 className="text-2xl font-bold">
              Quick Actions
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {(isTrial || isPremium) &&
              daysLeft > 0 ? (
                <Link
                  href="/call"
                  className="rounded-2xl bg-purple-600 p-5 transition hover:bg-purple-500"
                >
                  <p className="text-3xl">
                    🎙️
                  </p>

                  <p className="mt-3 text-lg font-bold">
                    Talk to Anna
                  </p>

                  <p className="mt-2 text-sm text-white/65">
                    Continue Chinese speaking
                    practice.
                  </p>
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="rounded-2xl bg-red-500/20 p-5 transition hover:bg-red-500/30"
                >
                  <p className="text-3xl">
                    🔒
                  </p>

                  <p className="mt-3 text-lg font-bold">
                    Renew Access
                  </p>

                  <p className="mt-2 text-sm text-white/65">
                    Choose a plan to continue.
                  </p>
                </Link>
              )}

              <Link
                href="/pricing"
                className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:bg-white/10"
              >
                <p className="text-3xl">
                  💎
                </p>

                <p className="mt-3 text-lg font-bold">
                  Upgrade Plan
                </p>

                <p className="mt-2 text-sm text-white/55">
                  Monthly or Yearly premium
                  access.
                </p>
              </Link>

              <Link
                href="/payment"
                className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:bg-white/10"
              >
                <p className="text-3xl">
                  💳
                </p>

                <p className="mt-3 text-lg font-bold">
                  Submit Payment
                </p>

                <p className="mt-2 text-sm text-white/55">
                  KBZPay or PromptPay slip.
                </p>
              </Link>

              {profile.role === "admin" && (
                <Link
                  href="/admin/payments"
                  className="rounded-2xl border border-yellow-300/20 bg-yellow-500/10 p-5 transition hover:bg-yellow-500/20"
                >
                  <p className="text-3xl">
                    🛠️
                  </p>

                  <p className="mt-3 text-lg font-bold">
                    Admin Payments
                  </p>

                  <p className="mt-2 text-sm text-white/55">
                    Approve or reject payment
                    slips.
                  </p>
                </Link>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/10 p-7 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">
              Subscription
            </h2>

            <div className="mt-6 space-y-5 text-sm">
              <div>
                <p className="text-white/45">
                  Trial Started
                </p>

                <p className="mt-1">
                  {formatDate(
                    profile.trial_started_at
                  )}
                </p>
              </div>

              <div>
                <p className="text-white/45">
                  Trial Ends
                </p>

                <p className="mt-1">
                  {formatDate(
                    profile.trial_ends_at
                  )}
                </p>
              </div>

              <div>
                <p className="text-white/45">
                  Premium Started
                </p>

                <p className="mt-1">
                  {formatDate(
                    profile.subscription_started_at
                  )}
                </p>
              </div>

              <div>
                <p className="text-white/45">
                  Premium Ends
                </p>

                <p className="mt-1">
                  {formatDate(
                    profile.subscription_ends_at
                  )}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-7 backdrop-blur-xl">
          <h2 className="text-2xl font-bold">
            Payment History
          </h2>

          {payments.length === 0 ? (
            <div className="py-10 text-center text-white/45">
              No payment history yet.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/45">
                    <th className="px-3 py-4">
                      Plan
                    </th>

                    <th className="px-3 py-4">
                      Method
                    </th>

                    <th className="px-3 py-4">
                      Amount
                    </th>

                    <th className="px-3 py-4">
                      Status
                    </th>

                    <th className="px-3 py-4">
                      Submitted
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map(
                    (payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-white/5"
                      >
                        <td className="px-3 py-4 capitalize">
                          {payment.plan}
                        </td>

                        <td className="px-3 py-4 uppercase">
                          {
                            payment.payment_method
                          }
                        </td>

                        <td className="px-3 py-4">
                          {payment.amount ?? "-"}{" "}
                          {payment.currency ?? ""}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              payment.status ===
                              "approved"
                                ? "bg-green-500/20 text-green-200"
                                : payment.status ===
                                    "rejected"
                                  ? "bg-red-500/20 text-red-200"
                                  : "bg-yellow-500/20 text-yellow-200"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-white/55">
                          {formatDate(
                            payment.created_at
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}