"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import type {
  AdminUserRow,
  DashboardSummary,
  PlanType,
} from "./types";

import {
  resetTodayUsage,
  toggleUserRole,
  updateUserPlan,
} from "../../app/admin/actions";

interface Props {
  adminEmail: string;
  users: AdminUserRow[];
  summary: DashboardSummary;
}

function formatSeconds(total: number) {
  const seconds = Math.max(0, Math.floor(total));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return hours > 0
    ? `${hours}h ${minutes}m`
    : `${minutes}m ${secs}s`;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getPlanLabel(plan: PlanType) {
  switch (plan) {
    case "plus":
      return "⭐ Plus";
    case "premium":
      return "💎 Premium";
    case "yearly":
      return "👑 Yearly";
    case "family":
      return "👨‍👩‍👧‍👦 Family";
    default:
      return "🆓 Trial";
  }
}

interface PlanUpdateFormProps {
  userId: string;
  currentPlan: PlanType;
}

function PlanUpdateForm({
  userId,
  currentPlan,
}: PlanUpdateFormProps) {
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] =
    useState<PlanType>(currentPlan);

  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedPlan(currentPlan);
  }, [currentPlan]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      try {
        const formData = new FormData();

        formData.set("userId", userId);
        formData.set("plan", selectedPlan);

        await updateUserPlan(formData);

        setMessage("Saved");
        router.refresh();
      } catch (error) {
        console.error("Plan update error:", error);

        setMessage(
          error instanceof Error
            ? error.message
            : "Plan update failed",
        );
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2"
    >
      <select
        value={selectedPlan}
        onChange={(event) => {
          setSelectedPlan(
            event.target.value as PlanType,
          );
          setMessage("");
        }}
        disabled={isPending}
        className="min-w-[150px] cursor-pointer rounded-xl border border-white/10 bg-[#1b0828] px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="trial">
          🆓 Trial
        </option>

        <option value="plus">
          ⭐ Plus
        </option>

        <option value="premium">
          💎 Premium
        </option>

        <option value="yearly">
          👑 Yearly
        </option>

        <option value="family">
          👨‍👩‍👧‍👦 Family
        </option>
      </select>

      <button
        type="submit"
        disabled={
          isPending ||
          selectedPlan === currentPlan
        }
        className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "Saving..." : "Save"}
      </button>

      {message && (
        <span
          className={`w-full text-xs font-semibold ${
            message === "Saved"
              ? "text-emerald-300"
              : "text-red-300"
          }`}
        >
          {message}
        </span>
      )}
    </form>
  );
}

interface ResetUsageButtonProps {
  userId: string;
}

function ResetUsageButton({
  userId,
}: ResetUsageButtonProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  function handleReset() {
    const confirmed = window.confirm(
      "Reset this user's voice usage?",
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        const formData = new FormData();

        formData.set("userId", userId);

        await resetTodayUsage(formData);

        router.refresh();
      } catch (error) {
        console.error(
          "Reset usage error:",
          error,
        );

        window.alert(
          error instanceof Error
            ? error.message
            : "Reset failed",
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={isPending}
      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending
        ? "Resetting..."
        : "Reset Usage"}
    </button>
  );
}

interface RoleButtonProps {
  userId: string;
  currentRole: string;
}

function RoleButton({
  userId,
  currentRole,
}: RoleButtonProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const nextRole =
    currentRole === "admin"
      ? "user"
      : "admin";

  function handleRoleChange() {
    const message =
      nextRole === "admin"
        ? "Make this user an admin?"
        : "Remove admin access from this user?";

    if (!window.confirm(message)) {
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();

        formData.set("userId", userId);
        formData.set("nextRole", nextRole);

        await toggleUserRole(formData);

        router.refresh();
      } catch (error) {
        console.error(
          "Role update error:",
          error,
        );

        window.alert(
          error instanceof Error
            ? error.message
            : "Role update failed",
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleRoleChange}
      disabled={isPending}
      className="rounded-xl border border-amber-300/20 bg-amber-500/10 px-3 py-2 text-sm font-bold text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending
        ? "Updating..."
        : currentRole === "admin"
          ? "Remove Admin"
          : "Make Admin"}
    </button>
  );
}

export default function AdminDashboard({
  adminEmail,
  users,
  summary,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [planFilter, setPlanFilter] =
    useState<"all" | PlanType>("all");

  const filteredUsers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const name =
        user.name?.toLowerCase() ?? "";

      const email =
        user.email?.toLowerCase() ?? "";

      const searchMatch =
        !query ||
        name.includes(query) ||
        email.includes(query);

      const planMatch =
        planFilter === "all" ||
        user.planType === planFilter;

      return searchMatch && planMatch;
    });
  }, [users, search, planFilter]);

  const cards = [
    [
      "👥",
      "Total Users",
      summary.totalUsers.toLocaleString(),
    ],
    [
      "⭐",
      "Plus",
      summary.plusUsers.toLocaleString(),
    ],
    [
      "💎",
      "Premium",
      summary.premiumUsers.toLocaleString(),
    ],
    [
      "👑",
      "Yearly",
      summary.yearlyUsers.toLocaleString(),
    ],
    [
      "👨‍👩‍👧‍👦",
      "Family",
      summary.familyUsers.toLocaleString(),
    ],
    [
      "🎤",
      "Active Today",
      summary.activeToday.toLocaleString(),
    ],
    [
      "⏱️",
      "Voice Today",
      formatSeconds(
        summary.todayVoiceSeconds,
      ),
    ],
  ];

  return (
    <main className="min-h-screen bg-[#090014] px-4 py-6 text-white sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-950 via-fuchsia-950/80 to-slate-950 p-6 shadow-2xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-fuchsia-300">
                Anna AI
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-sm text-white/55">
                Signed in as {adminEmail}
              </p>
            </div>

            <a
              href="/call"
              className="inline-flex w-fit rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-bold transition hover:bg-white/15"
            >
              ← Back to Anna
            </a>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {cards.map(
            ([icon, label, value]) => (
              <article
                key={label}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"
              >
                <div className="text-2xl">
                  {icon}
                </div>

                <p className="mt-5 text-sm text-white/50">
                  {label}
                </p>

                <p className="mt-1 text-3xl font-black">
                  {value}
                </p>
              </article>
            ),
          )}
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black">
                Users & Voice Usage
              </h2>

              <p className="mt-1 text-sm text-white/50">
                Search users, change plans,
                reset today&apos;s usage and
                manage roles.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search name or email"
                className="min-w-64 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-fuchsia-400"
              />

              <select
                value={planFilter}
                onChange={(event) =>
                  setPlanFilter(
                    event.target.value as
                      | "all"
                      | PlanType,
                  )
                }
                className="rounded-2xl border border-white/10 bg-[#160622] px-4 py-3 text-white outline-none"
              >
                <option value="all">
                  All plans
                </option>

                <option value="trial">
                  🆓 Trial
                </option>

                <option value="plus">
                  ⭐ Plus
                </option>

                <option value="premium">
                  💎 Premium
                </option>

                <option value="yearly">
                  👑 Yearly
                </option>

                <option value="family">
                  👨‍👩‍👧‍👦 Family
                </option>
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[1300px] border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-white/40">
                  <th className="px-4">
                    User
                  </th>

                  <th className="px-4">
                    Plan
                  </th>

                  <th className="px-4">
                    Today
                  </th>

                  <th className="px-4">
                    Remaining
                  </th>

                  <th className="px-4">
                    Ends
                  </th>

                  <th className="px-4">
                    Last sign-in
                  </th>

                  <th className="px-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const percent =
                    user.dailyLimitSeconds > 0
                      ? Math.min(
                          100,
                          (user.todayUsedSeconds /
                            user.dailyLimitSeconds) *
                            100,
                        )
                      : 0;

                  return (
                    <tr
                      key={user.id}
                      className="bg-black/25"
                    >
                      <td className="rounded-l-2xl px-4 py-4">
                        <p className="font-bold">
                          {user.name ||
                            "No name"}
                        </p>

                        <p className="mt-1 text-xs text-white/45">
                          {user.email}
                        </p>

                        <span className="mt-2 inline-flex rounded-full bg-white/10 px-2 py-1 text-[11px] uppercase text-white/60">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-fuchsia-500/15 px-3 py-1 text-sm font-bold text-fuchsia-200">
                          {getPlanLabel(
                            user.planType,
                          )}
                        </span>

                        <p className="mt-2 text-xs text-white/40">
                          {
                            user.subscriptionStatus
                          }
                        </p>

                        <p className="mt-1 text-xs text-white/35">
                          Limit:{" "}
                          {formatSeconds(
                            user.dailyLimitSeconds,
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold">
                          {formatSeconds(
                            user.todayUsedSeconds,
                          )}
                        </p>

                        <div className="mt-2 h-2 w-36 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-fuchsia-400 transition-all"
                            style={{
                              width: `${percent}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-4 font-bold text-emerald-300">
                        {formatSeconds(
                          user.todayRemainingSeconds,
                        )}
                      </td>

                      <td className="px-4 py-4 text-sm text-white/65">
                        {formatDate(
                          user.planType ===
                            "trial"
                            ? user.trialEndsAt
                            : user.subscriptionEndsAt,
                        )}
                      </td>

                      <td className="px-4 py-4 text-sm text-white/65">
                        {formatDate(
                          user.lastSignInAt,
                        )}
                      </td>

                      <td className="rounded-r-2xl px-4 py-4">
                        <div className="flex flex-wrap items-start gap-2">
                          <PlanUpdateForm
                            userId={user.id}
                            currentPlan={
                              user.planType
                            }
                          />

                          <ResetUsageButton
                            userId={user.id}
                          />

                          <RoleButton
                            userId={user.id}
                            currentRole={
                              user.role
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="py-16 text-center text-white/45">
                No matching users found.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}