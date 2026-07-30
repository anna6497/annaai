"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  grantAiSpeakingAccess,
  grantLifetimeAccess,
  revokeAiSpeakingAccess,
  revokeLifetimeAccess,
} from "@/app/admin/users/actions";
import type { AdminUserAccessRow } from "@/lib/admin-portal";
import {
  AI_SPEAKING_PLAN_IDS,
  AI_SPEAKING_PLANS,
} from "@/lib/ai-speaking-plans";

const HSK_PRODUCTS = [
  ...Array.from(
    { length: 8 },
    (_, index) => ({
      code: `hsk_${index + 2}`,
      label: `HSK ${index + 2}`,
    }),
  ),

  {
    code: "hsk_full",
    label: "HSK 2–9 Full",
  },
];

type UserFilter =
  | "all"
  | "paid"
  | "free";

export default function UserAccessManager({
  users,
}: {
  users: AdminUserAccessRow[];
}) {
  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<UserFilter>("all");

  const filtered = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const hasHskAccess =
        user.entitlements.length > 0;

      const searchMatch =
        !query ||
        user.email
          .toLowerCase()
          .includes(query) ||
        user.name
          .toLowerCase()
          .includes(query);

      const filterMatch =
        filter === "all" ||
        (filter === "paid" &&
          hasHskAccess) ||
        (filter === "free" &&
          !hasHskAccess);

      return (
        searchMatch &&
        filterMatch
      );
    });
  }, [users, search, filter]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 lg:flex-row">
        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Search name or email"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-fuchsia-400"
        />

        <select
          value={filter}
          onChange={(event) =>
            setFilter(
              event.target
                .value as UserFilter,
            )
          }
          className="rounded-2xl border border-white/10 bg-[#12051f] px-4 py-3 font-bold"
        >
          <option value="all">
            All users
          </option>

          <option value="paid">
            HSK paid users
          </option>

          <option value="free">
            HSK free users
          </option>
        </select>
      </div>

      <div className="mt-5 grid gap-4">
        {filtered.map((user) => {
          const hasHskAccess =
            user.entitlements.length >
            0;

          return (
            <article
              key={user.id}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black">
                    {user.name}
                  </h2>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-black",
                      hasHskAccess
                        ? "bg-emerald-400/15 text-emerald-200"
                        : "bg-white/10 text-white/45",
                    ].join(" ")}
                  >
                    {hasHskAccess
                      ? "HSK PAID"
                      : "HSK FREE"}
                  </span>
                </div>

                <p className="mt-1 break-all text-sm text-white/45">
                  {user.email}
                </p>
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-2">
                {/* HSK ACCESS */}
                <section className="rounded-[1.6rem] border border-emerald-300/10 bg-black/15 p-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                      HSK Access
                    </p>

                    <p className="mt-1 text-sm text-white/45">
                      Flashcards and Writing
                    </p>
                  </div>

                  <form className="mt-4 grid gap-3">
                    <input
                      type="hidden"
                      name="userId"
                      value={user.id}
                    />

                    <select
                      name="productCode"
                      defaultValue="hsk_full"
                      className="w-full rounded-xl border border-white/10 bg-[#12051f] px-4 py-3 text-sm font-bold"
                    >
                      {HSK_PRODUCTS.map(
                        (product) => (
                          <option
                            key={
                              product.code
                            }
                            value={
                              product.code
                            }
                          >
                            {
                              product.label
                            }
                          </option>
                        ),
                      )}
                    </select>

                    <button
                      type="submit"
                      formAction={
                        grantLifetimeAccess
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black transition hover:bg-emerald-500 active:scale-[0.99]"
                    >
                      Grant HSK Lifetime
                    </button>

                    <button
                      type="submit"
                      formAction={
                        revokeLifetimeAccess
                      }
                      className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-black transition hover:bg-rose-500 active:scale-[0.99]"
                    >
                      Revoke HSK
                    </button>
                  </form>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.entitlements
                      .length === 0 ? (
                      <span className="text-sm text-white/35">
                        No HSK paid access
                      </span>
                    ) : (
                      user.entitlements.map(
                        (code) => (
                          <span
                            key={code}
                            className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-200"
                          >
                            {code ===
                            "hsk_full"
                              ? "HSK 2–9 Full Lifetime"
                              : `${code
                                  .replace(
                                    "_",
                                    " ",
                                  )
                                  .toUpperCase()} Lifetime`}
                          </span>
                        ),
                      )
                    )}
                  </div>
                </section>

                {/* AI SPEAKING ACCESS */}
                <section className="rounded-[1.6rem] border border-fuchsia-300/15 bg-gradient-to-br from-fuchsia-500/[0.07] to-violet-500/[0.05] p-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">
                      AI Speaking Access
                    </p>

                    <p className="mt-1 text-sm text-white/45">
                      Manual access without
                      payment approval
                    </p>
                  </div>

                  <form className="mt-4 grid gap-3">
                    <input
                      type="hidden"
                      name="userId"
                      value={user.id}
                    />

                    <select
                      name="aiPlanCode"
                      defaultValue="ai-monthly"
                      className="w-full rounded-xl border border-fuchsia-300/15 bg-[#12051f] px-4 py-3 text-sm font-bold"
                    >
                      {AI_SPEAKING_PLAN_IDS.map(
                        (planId) => {
                          const plan =
                            AI_SPEAKING_PLANS[
                              planId
                            ];

                          return (
                            <option
                              key={
                                plan.id
                              }
                              value={
                                plan.id
                              }
                            >
                              {
                                plan.title
                              }{" "}
                              —{" "}
                              {
                                plan.durationLabel
                              }
                            </option>
                          );
                        },
                      )}
                    </select>

                    <button
                      type="submit"
                      formAction={
                        grantAiSpeakingAccess
                      }
                      className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-3 text-sm font-black transition hover:brightness-110 active:scale-[0.99]"
                    >
                      Grant AI Speaking
                    </button>

                    <button
                      type="submit"
                      formAction={
                        revokeAiSpeakingAccess
                      }
                      className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-black transition hover:bg-rose-500 active:scale-[0.99]"
                    >
                      Revoke AI Speaking
                    </button>
                  </form>

                  <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/15 px-3 py-3">
                    <p className="text-xs leading-5 text-white/40">
                      Granting a new AI plan
                      revokes the user's
                      previous active AI plan
                      and starts the selected
                      plan immediately.
                    </p>
                  </div>
                </section>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-12 text-center text-white/40">
            No matching users.
          </div>
        ) : null}
      </div>
    </div>
  );
}