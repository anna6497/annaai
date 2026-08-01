import Link from "next/link";
import { getAdminPortalSummary } from "@/lib/admin-portal";

export const dynamic = "force-dynamic";

function formatMmk(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} MMK`;
}

export default async function AdminOverviewPage() {
  const summary = await getAdminPortalSummary();

  const cards = [
    [
      "👥",
      "Total Users",
      summary.totalUsers.toLocaleString("en-US"),
    ],
    [
      "📚",
      "HSK Paid Users",
      summary.hskPaidUsers.toLocaleString("en-US"),
    ],
    [
      "🎙️",
      "AI Speaking Users",
      summary.aiSpeakingUsers.toLocaleString("en-US"),
    ],
    [
      "💎",
      "Total Paid Users",
      summary.totalPaidUsers.toLocaleString("en-US"),
    ],
    [
      "🆓",
      "Free Users",
      summary.freeUsers.toLocaleString("en-US"),
    ],
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
    [
      "❌",
      "Rejected Payments",
      summary.rejectedPayments.toLocaleString("en-US"),
    ],
    [
      "💰",
      "Total Sales",
      formatMmk(summary.totalSalesMmk),
    ],
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
            Users, HSK, AI Speaking and payment management overview.
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(([icon, label, value]) => (
            <article
              key={label}
              className="rounded-3xl border border-white/10 bg-white/[0.05] p-6"
            >
              <div className="text-3xl">{icon}</div>

              <p className="mt-5 text-sm font-bold text-white/45">
                {label}
              </p>

              <p className="mt-2 text-3xl font-black">
                {value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <Link
            href="/admin/payments?status=pending"
            className="rounded-[2rem] border border-amber-300/20 bg-amber-400/10 p-7 transition hover:bg-amber-400/15"
          >
            <p className="text-sm font-black uppercase text-amber-200">
              Payment Queue
            </p>

            <p className="mt-3 text-4xl font-black">
              {summary.pendingPayments}
            </p>

            <p className="mt-2 text-white/55">
              Pending payment requests
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="rounded-[2rem] border border-emerald-300/20 bg-emerald-400/10 p-7 transition hover:bg-emerald-400/15"
          >
            <p className="text-sm font-black uppercase text-emerald-200">
              HSK Users
            </p>

            <p className="mt-3 text-4xl font-black">
              {summary.hskPaidUsers}
            </p>

            <p className="mt-2 text-white/55">
              Manage HSK lifetime access
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-500/10 p-7 transition hover:bg-fuchsia-500/15"
          >
            <p className="text-sm font-black uppercase text-fuchsia-200">
              AI Speaking Users
            </p>

            <p className="mt-3 text-4xl font-black">
              {summary.aiSpeakingUsers}
            </p>

            <p className="mt-2 text-white/55">
              Manage AI Speaking subscriptions
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}