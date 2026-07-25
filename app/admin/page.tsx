import Link from "next/link";
import { getAdminPortalSummary } from "@/lib/admin-portal";

export const dynamic = "force-dynamic";

function formatMmk(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} MMK`;
}

export default async function AdminOverviewPage() {
  const summary = await getAdminPortalSummary();

  const cards = [
    ["👥", "Total Users", summary.totalUsers.toLocaleString("en-US")],
    ["💎", "Paid Users", summary.paidUsers.toLocaleString("en-US")],
    ["🆓", "Free Users", summary.freeUsers.toLocaleString("en-US")],
    [
      "⏳",
      "Pending Payments",
      summary.pendingPayments.toLocaleString("en-US"),
    ],
    [
      "✅",
      "Approved Payments",
      summary.approvedPayments.toLocaleString("en-US"),
    ],
    ["💰", "Total Sales", formatMmk(summary.totalSalesMmk)],
  ];

  return (
    <main className="px-4 py-8 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-950 via-fuchsia-950/80 to-slate-950 p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
            Business Overview
          </p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Anna AI Admin Dashboard
          </h1>
          <p className="mt-3 text-white/55">
            Users, payments and lifetime HSK permissions ကို တစ်နေရာတည်းက
            စီမံနိုင်ပါတယ်။
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(([icon, label, value]) => (
            <article
              key={label}
              className="rounded-3xl border border-white/10 bg-white/[0.05] p-6"
            >
              <div className="text-3xl">{icon}</div>
              <p className="mt-5 text-sm font-bold text-white/45">{label}</p>
              <p className="mt-2 text-3xl font-black">{value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <Link
            href="/admin/payments?status=pending"
            className="rounded-[2rem] border border-amber-300/20 bg-amber-400/10 p-7"
          >
            <p className="text-sm font-black uppercase text-amber-200">
              Payment Queue
            </p>
            <p className="mt-3 text-4xl font-black">
              {summary.pendingPayments}
            </p>
            <p className="mt-2 text-white/55">
              Pending slips ကိုစစ်ပြီး Approve & Unlock လုပ်ရန်
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="rounded-[2rem] border border-emerald-300/20 bg-emerald-400/10 p-7"
          >
            <p className="text-sm font-black uppercase text-emerald-200">
              User Access
            </p>
            <p className="mt-3 text-4xl font-black">{summary.paidUsers}</p>
            <p className="mt-2 text-white/55">
              Lifetime permission ကို manual grant သို့ revoke လုပ်ရန်
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
