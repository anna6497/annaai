"use client";

import { useMemo, useState } from "react";
import type { AdminUserAccessRow } from "@/lib/admin-portal";
import {
  grantLifetimeAccess,
  revokeLifetimeAccess,
} from "@/app/admin/users/actions";

const PRODUCTS = [
  ...Array.from({ length: 8 }, (_, index) => ({
    code: `hsk_${index + 2}`,
    label: `HSK ${index + 2}`,
  })),
  { code: "hsk_full", label: "HSK 2–9 Full" },
];

export default function UserAccessManager({
  users,
}: {
  users: AdminUserAccessRow[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "free">("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const paid = user.entitlements.length > 0;
      const searchMatch =
        !query ||
        user.email.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query);
      const filterMatch =
        filter === "all" ||
        (filter === "paid" && paid) ||
        (filter === "free" && !paid);

      return searchMatch && filterMatch;
    });
  }, [users, search, filter]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 lg:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or email"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-fuchsia-400"
        />
        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value as "all" | "paid" | "free")
          }
          className="rounded-2xl border border-white/10 bg-[#12051f] px-4 py-3 font-bold"
        >
          <option value="all">All users</option>
          <option value="paid">Paid users</option>
          <option value="free">Free users</option>
        </select>
      </div>

      <div className="mt-5 grid gap-4">
        {filtered.map((user) => (
          <article
            key={user.id}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black">{user.name}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      user.entitlements.length > 0
                        ? "bg-emerald-400/15 text-emerald-200"
                        : "bg-white/10 text-white/45"
                    }`}
                  >
                    {user.entitlements.length > 0 ? "PAID" : "FREE"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/45">{user.email}</p>
              </div>

              <form className="flex flex-col gap-3 sm:flex-row">
                <input type="hidden" name="userId" value={user.id} />
                <select
                  name="productCode"
                  defaultValue="hsk_full"
                  className="rounded-xl border border-white/10 bg-[#12051f] px-4 py-3 text-sm font-bold"
                >
                  {PRODUCTS.map((product) => (
                    <option key={product.code} value={product.code}>
                      {product.label}
                    </option>
                  ))}
                </select>
                <button
                  formAction={grantLifetimeAccess}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black"
                >
                  Grant Lifetime
                </button>
                <button
                  formAction={revokeLifetimeAccess}
                  className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-black"
                >
                  Revoke
                </button>
              </form>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {user.entitlements.length === 0 ? (
                <span className="text-sm text-white/35">No paid access</span>
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
          </article>
        ))}

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-12 text-center text-white/40">
            No matching users.
          </div>
        ) : null}
      </div>
    </div>
  );
}
