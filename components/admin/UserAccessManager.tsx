"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  changeUserPassword,
  grantAiSpeakingAccess,
  grantLifetimeAccess,
  initialChangePasswordState,
  revokeAiSpeakingAccess,
  revokeLifetimeAccess,
} from "@/app/admin/users/actions";
import type { AdminUserAccessRow } from "@/lib/admin-portal";
import {
  AI_SPEAKING_PLAN_IDS,
  AI_SPEAKING_PLANS,
} from "@/lib/ai-speaking-plans";

const HSK_PRODUCTS = [
  ...Array.from({ length: 8 }, (_, index) => ({
    code: `hsk_${index + 2}`,
    label: `HSK ${index + 2}`,
  })),
  { code: "hsk_full", label: "HSK 2–9 Full" },
];

type UserFilter = "all" | "paid" | "free";

function PasswordSettings({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    changeUserPassword,
    initialChangePasswordState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [state.success]);

  return (
    <section className="rounded-[1.6rem] border border-sky-300/15 bg-gradient-to-br from-sky-500/[0.07] to-cyan-500/[0.04] p-4 xl:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
            Account Security
          </p>
          <p className="mt-1 text-sm text-white/45">
            Change this user&apos;s login password
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="rounded-xl border border-sky-300/20 bg-sky-400/10 px-4 py-2.5 text-sm font-black text-sky-100 transition hover:bg-sky-400/20"
        >
          {isOpen ? "Close Password Settings" : "Change Password"}
        </button>
      </div>

      {isOpen ? (
        <form ref={formRef} action={formAction} className="mt-5 grid gap-4">
          <input type="hidden" name="userId" value={userId} />

          <div className="rounded-xl border border-white/[0.07] bg-black/15 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">
              Selected user
            </p>
            <p className="mt-1 break-all text-sm font-bold text-white/80">
              {userEmail}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor={`new-password-${userId}`}
                className="mb-2 block text-sm font-bold text-white/70"
              >
                New Password
              </label>
              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#12051f] focus-within:border-sky-300/50">
                <input
                  id={`new-password-${userId}`}
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="border-l border-white/10 px-4 text-xs font-black text-sky-200 transition hover:bg-white/5"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor={`confirm-password-${userId}`}
                className="mb-2 block text-sm font-bold text-white/70"
              >
                Confirm Password
              </label>
              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#12051f] focus-within:border-sky-300/50">
                <input
                  id={`confirm-password-${userId}`}
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="Enter password again"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((current) => !current)}
                  className="border-l border-white/10 px-4 text-xs font-black text-sky-200 transition hover:bg-white/5"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          {state.message ? (
            <div
              role="status"
              className={[
                "rounded-xl border px-4 py-3 text-sm font-bold",
                state.success
                  ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
                  : "border-rose-300/20 bg-rose-400/10 text-rose-200",
              ].join(" ")}
            >
              {state.message}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-3 text-sm font-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Changing Password..." : "Save New Password"}
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={() => {
                formRef.current?.reset();
                setIsOpen(false);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/65 transition hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export default function UserAccessManager({
  users,
}: {
  users: AdminUserAccessRow[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const hasHskAccess = user.entitlements.length > 0;
      const searchMatch =
        !query ||
        user.email.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);
      const filterMatch =
        filter === "all" ||
        (filter === "paid" && hasHskAccess) ||
        (filter === "free" && !hasHskAccess);

      return searchMatch && filterMatch;
    });
  }, [users, search, filter]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 lg:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email or user ID"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-fuchsia-400"
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as UserFilter)}
          className="rounded-2xl border border-white/10 bg-[#12051f] px-4 py-3 font-bold"
        >
          <option value="all">All users</option>
          <option value="paid">HSK paid users</option>
          <option value="free">HSK free users</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-white/40">
        Showing <span className="font-black text-white/70">{filtered.length}</span>{" "}
        of <span className="font-black text-white/70">{users.length}</span> users
      </p>

      <div className="mt-5 grid gap-4">
        {filtered.map((user) => {
          const hasHskAccess = user.entitlements.length > 0;

          return (
            <article
              key={user.id}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black">
                      {user.name || "Unnamed User"}
                    </h2>
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-black",
                        hasHskAccess
                          ? "bg-emerald-400/15 text-emerald-200"
                          : "bg-white/10 text-white/45",
                      ].join(" ")}
                    >
                      {hasHskAccess ? "HSK PAID" : "HSK FREE"}
                    </span>
                  </div>

                  <p className="mt-1 break-all text-sm text-white/55">
                    {user.email}
                  </p>
                  <p className="mt-2 break-all text-xs text-white/25">
                    User ID: {user.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void navigator.clipboard?.writeText(user.id)}
                  className="w-fit rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/55 transition hover:bg-white/10"
                >
                  Copy User ID
                </button>
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-2">
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
                    <input type="hidden" name="userId" value={user.id} />
                    <select
                      name="productCode"
                      defaultValue="hsk_full"
                      className="w-full rounded-xl border border-white/10 bg-[#12051f] px-4 py-3 text-sm font-bold"
                    >
                      {HSK_PRODUCTS.map((product) => (
                        <option key={product.code} value={product.code}>
                          {product.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      formAction={grantLifetimeAccess}
                      className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black transition hover:bg-emerald-500 active:scale-[0.99]"
                    >
                      Grant HSK Lifetime
                    </button>
                    <button
                      type="submit"
                      formAction={revokeLifetimeAccess}
                      className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-black transition hover:bg-rose-500 active:scale-[0.99]"
                    >
                      Revoke HSK
                    </button>
                  </form>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.entitlements.length === 0 ? (
                      <span className="text-sm text-white/35">
                        No HSK paid access
                      </span>
                    ) : (
                      user.entitlements.map((code) => (
                        <span
                          key={code}
                          className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-200"
                        >
                          {code === "hsk_full"
                            ? "HSK 2–9 Full Lifetime"
                            : `${code.replace("_", " ").toUpperCase()} Lifetime`}
                        </span>
                      ))
                    )}
                  </div>
                </section>

                <section className="rounded-[1.6rem] border border-fuchsia-300/15 bg-gradient-to-br from-fuchsia-500/[0.07] to-violet-500/[0.05] p-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">
                      AI Speaking Access
                    </p>
                    <p className="mt-1 text-sm text-white/45">
                      Manual access without payment approval
                    </p>
                  </div>

                  <form className="mt-4 grid gap-3">
                    <input type="hidden" name="userId" value={user.id} />
                    <select
                      name="aiPlanCode"
                      defaultValue="ai-monthly"
                      className="w-full rounded-xl border border-fuchsia-300/15 bg-[#12051f] px-4 py-3 text-sm font-bold"
                    >
                      {AI_SPEAKING_PLAN_IDS.map((planId) => {
                        const plan = AI_SPEAKING_PLANS[planId];
                        return (
                          <option key={plan.id} value={plan.id}>
                            {plan.title} — {plan.durationLabel}
                          </option>
                        );
                      })}
                    </select>

                    <button
                      type="submit"
                      formAction={grantAiSpeakingAccess}
                      className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-3 text-sm font-black transition hover:brightness-110 active:scale-[0.99]"
                    >
                      Grant AI Speaking
                    </button>
                    <button
                      type="submit"
                      formAction={revokeAiSpeakingAccess}
                      className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-black transition hover:bg-rose-500 active:scale-[0.99]"
                    >
                      Revoke AI Speaking
                    </button>
                  </form>
                </section>

                <PasswordSettings userId={user.id} userEmail={user.email} />
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