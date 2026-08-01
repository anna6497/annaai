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
  revokeAiSpeakingAccess,
  revokeLifetimeAccess,
} from "@/app/admin/users/actions";
import {
  initialChangePasswordState,
} from "@/app/admin/users/action-state";
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
  {
    code: "hsk_full",
    label: "HSK 2–9 Full",
  },
] as const;

type UserFilter = "all" | "paid" | "free";

function formatEntitlement(code: string): string {
  if (code === "hsk_full") {
    return "HSK 2–9 Full";
  }

  return code.replace("_", " ").toUpperCase();
}

function UserInitial({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const value = (name || email || "U").trim();
  const initial = value.charAt(0).toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 text-sm font-black text-fuchsia-200">
      {initial}
    </div>
  );
}

function PasswordPanel({
  user,
}: {
  user: AdminUserAccessRow;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    <section className="rounded-2xl border border-sky-300/15 bg-sky-400/[0.04] p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
        Change Password
      </p>

      <p className="mt-1 text-sm text-white/40">
        Change this user&apos;s login password.
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="mt-4 grid gap-4"
      >
        <input type="hidden" name="userId" value={user.id} />

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label
              htmlFor={`new-password-${user.id}`}
              className="mb-2 block text-sm font-bold text-white/65"
            >
              New password
            </label>

            <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/20 focus-within:border-sky-300/50">
              <input
                id={`new-password-${user.id}`}
                name="newPassword"
                type={showPassword ? "text" : "password"}
                minLength={8}
                maxLength={72}
                required
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="border-l border-white/10 px-4 text-xs font-black text-sky-200 hover:bg-white/5"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor={`confirm-password-${user.id}`}
              className="mb-2 block text-sm font-bold text-white/65"
            >
              Confirm password
            </label>

            <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/20 focus-within:border-sky-300/50">
              <input
                id={`confirm-password-${user.id}`}
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                minLength={8}
                maxLength={72}
                required
                autoComplete="new-password"
                placeholder="Enter password again"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
              />

              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="border-l border-white/10 px-4 text-xs font-black text-sky-200 hover:bg-white/5"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        {state.message ? (
          <div
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

        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-3 text-sm font-black text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Changing..." : "Update Password"}
        </button>
      </form>
    </section>
  );
}

function UserSettingsPanel({
  user,
}: {
  user: AdminUserAccessRow;
}) {
  const hasHskAccess = user.entitlements.length > 0;

  return (
    <div className="rounded-[2rem] border border-fuchsia-300/15 bg-white/[0.04] p-5 shadow-2xl shadow-fuchsia-950/10">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <UserInitial name={user.name} email={user.email} />

          <div className="min-w-0">
            <h2 className="truncate text-xl font-black">
              {user.name || "Unnamed User"}
            </h2>

            <p className="truncate text-sm text-white/45">
              {user.email}
            </p>

            <p className="mt-1 break-all text-xs text-white/25">
              {user.id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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

          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(user.id)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-white/55 hover:bg-white/10"
          >
            Copy ID
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
            HSK Access
          </p>

          <p className="mt-1 text-sm text-white/40">
            Flashcards and writing lifetime access.
          </p>

          <form className="mt-4 grid gap-3">
            <input type="hidden" name="userId" value={user.id} />

            <select
              name="productCode"
              defaultValue="hsk_full"
              className="w-full rounded-xl border border-white/10 bg-[#12051f] px-4 py-3 text-sm font-bold outline-none"
            >
              {HSK_PRODUCTS.map((product) => (
                <option key={product.code} value={product.code}>
                  {product.label}
                </option>
              ))}
            </select>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                formAction={grantLifetimeAccess}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black transition hover:bg-emerald-500"
              >
                Grant HSK
              </button>

              <button
                type="submit"
                formAction={revokeLifetimeAccess}
                className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-black transition hover:bg-rose-500"
              >
                Revoke HSK
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {user.entitlements.length === 0 ? (
              <span className="text-sm text-white/35">
                No paid HSK access
              </span>
            ) : (
              user.entitlements.map((code) => (
                <span
                  key={code}
                  className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-200"
                >
                  {formatEntitlement(code)}
                </span>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-400/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">
            AI Speaking Access
          </p>

          <p className="mt-1 text-sm text-white/40">
            Grant or revoke an AI Speaking plan.
          </p>

          <form className="mt-4 grid gap-3">
            <input type="hidden" name="userId" value={user.id} />

            <select
              name="aiPlanCode"
              defaultValue="ai-monthly"
              className="w-full rounded-xl border border-white/10 bg-[#12051f] px-4 py-3 text-sm font-bold outline-none"
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

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                formAction={grantAiSpeakingAccess}
                className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-3 text-sm font-black transition hover:brightness-110"
              >
                Grant AI
              </button>

              <button
                type="submit"
                formAction={revokeAiSpeakingAccess}
                className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-black transition hover:bg-rose-500"
              >
                Revoke AI
              </button>
            </div>
          </form>
        </section>

        <div className="xl:col-span-2">
          <PasswordPanel user={user} />
        </div>
      </div>
    </div>
  );
}

export default function UserAccessManager({
  users,
}: {
  users: AdminUserAccessRow[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [selectedUserId, setSelectedUserId] = useState(
    users[0]?.id ?? "",
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const hasHskAccess = user.entitlements.length > 0;

      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "paid" && hasHskAccess) ||
        (filter === "free" && !hasHskAccess);

      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);

  const selectedUser =
    users.find((user) => user.id === selectedUserId) ??
    filteredUsers[0] ??
    users[0];

  useEffect(() => {
    if (
      selectedUserId &&
      filteredUsers.some((user) => user.id === selectedUserId)
    ) {
      return;
    }

    const nextUserId = filteredUsers[0]?.id ?? "";

    if (nextUserId !== selectedUserId) {
      setSelectedUserId(nextUserId);
    }
  }, [filteredUsers, selectedUserId]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.6fr)]">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
        <div className="border-b border-white/10 p-4">
          <div className="grid gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or user ID"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as UserFilter)
                }
                className="rounded-2xl border border-white/10 bg-[#12051f] px-4 py-3 text-sm font-bold outline-none"
              >
                <option value="all">All users</option>
                <option value="paid">HSK paid</option>
                <option value="free">HSK free</option>
              </select>

              <select
                value={selectedUserId}
                onChange={(event) =>
                  setSelectedUserId(event.target.value)
                }
                className="rounded-2xl border border-white/10 bg-[#12051f] px-4 py-3 text-sm font-bold outline-none xl:hidden"
              >
                {filteredUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-3 text-xs text-white/35">
            {filteredUsers.length} of {users.length} users
          </p>
        </div>

        <div className="hidden max-h-[760px] overflow-y-auto xl:block">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#10051a] text-xs uppercase tracking-[0.14em] text-white/35">
              <tr>
                <th className="px-4 py-3 font-black">User</th>
                <th className="px-4 py-3 font-black">Access</th>
                <th className="px-4 py-3 font-black"></th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const active = selectedUser?.id === user.id;
                const paid = user.entitlements.length > 0;

                return (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={[
                      "cursor-pointer border-t border-white/[0.06] transition",
                      active
                        ? "bg-fuchsia-400/10"
                        : "hover:bg-white/[0.04]",
                    ].join(" ")}
                  >
                    <td className="px-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <UserInitial
                          name={user.name}
                          email={user.email}
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-white/85">
                            {user.name || "Unnamed User"}
                          </p>

                          <p className="truncate text-xs text-white/35">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-[10px] font-black",
                          paid
                            ? "bg-emerald-400/15 text-emerald-200"
                            : "bg-white/10 text-white/40",
                        ].join(" ")}
                      >
                        {paid ? "PAID" : "FREE"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedUserId(user.id);
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/55 hover:bg-white/10"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid max-h-[520px] gap-2 overflow-y-auto p-3 xl:hidden">
          {filteredUsers.map((user) => {
            const active = selectedUser?.id === user.id;
            const paid = user.entitlements.length > 0;

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUserId(user.id)}
                className={[
                  "flex items-center justify-between gap-3 rounded-2xl border p-3 text-left transition",
                  active
                    ? "border-fuchsia-300/30 bg-fuchsia-400/10"
                    : "border-white/[0.07] bg-black/10",
                ].join(" ")}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <UserInitial
                    name={user.name}
                    email={user.email}
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                      {user.name || "Unnamed User"}
                    </p>

                    <p className="truncate text-xs text-white/35">
                      {user.email}
                    </p>
                  </div>
                </div>

                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-[10px] font-black",
                    paid
                      ? "bg-emerald-400/15 text-emerald-200"
                      : "bg-white/10 text-white/40",
                  ].join(" ")}
                >
                  {paid ? "PAID" : "FREE"}
                </span>
              </button>
            );
          })}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-sm text-white/35">
            No matching users.
          </div>
        ) : null}
      </section>

      <section>
        {selectedUser ? (
          <UserSettingsPanel
            key={selectedUser.id}
            user={selectedUser}
          />
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-12 text-center text-white/35">
            Select a user to manage access.
          </div>
        )}
      </section>
    </div>
  );
}