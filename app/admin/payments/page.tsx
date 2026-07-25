import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { approvePayment, rejectPayment } from "./actions";

export const dynamic = "force-dynamic";

type Status = "pending" | "approved" | "rejected";

const statusStyle: Record<Status, string> = {
  pending: "bg-amber-400/15 text-amber-200",
  approved: "bg-emerald-400/15 text-emerald-200",
  rejected: "bg-rose-400/15 text-rose-200",
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const filter = ["pending", "approved", "rejected"].includes(
    params.status ?? "",
  )
    ? params.status!
    : "all";

  await requireAdmin();

const admin = createSupabaseAdminClient();

let query = admin
  .from("payment_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter !== "all") query = query.eq("status", filter);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = data ?? [];

  return (
    <main className="px-4 py-8 sm:px-7 lg:px-10">
      <section className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
              Payment Management
            </p>
            <h1 className="mt-2 text-4xl font-black">Payment Requests</h1>
            <p className="mt-2 text-white/50">
              Slip စစ်ပြီး approve လုပ်တာနဲ့ lifetime access အလိုအလျောက်ရပါမယ်။
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <Link
                key={status}
                href={
                  status === "all"
                    ? "/admin/payments"
                    : `/admin/payments?status=${status}`
                }
                className={`rounded-xl px-4 py-2 text-sm font-black capitalize ${
                  filter === status
                    ? "bg-fuchsia-500"
                    : "border border-white/10 bg-white/[0.05] text-white/55"
                }`}
              >
                {status}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          {rows.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-12 text-center text-white/45">
              No payment requests found.
            </div>
          ) : (
            rows.map((payment) => {
              const status = payment.status as Status;

              return (
                <article
                  key={payment.id}
                  className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 lg:grid-cols-[240px_1fr]"
                >
                  <SlipPreview
                    supabase={admin}
                    path={String(payment.slip_path)}
                  />

                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black">
                          {payment.product_title}
                        </h2>
                        <p className="mt-1 text-sm text-white/45">
                          {payment.user_email ?? payment.user_id}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase ${statusStyle[status]}`}
                      >
                        {status}
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <Info label="Product" value={payment.product_code} />
                      <Info
                        label="Amount"
                        value={`${Number(payment.amount_mmk).toLocaleString("en-US")} MMK`}
                      />
                      <Info
                        label="Method"
                        value={
                          payment.payment_method === "kpay"
                            ? "KBZPay"
                            : "QR Pay"
                        }
                      />
                      <Info
                        label="Submitted"
                        value={new Date(payment.created_at).toLocaleString(
                          "en-GB",
                        )}
                      />
                    </dl>

                    {payment.admin_note ? (
                      <div className="mt-5 rounded-2xl bg-white/[0.05] p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-white/35">
                          Admin note
                        </p>
                        <p className="mt-2 text-sm text-white/70">
                          {payment.admin_note}
                        </p>
                      </div>
                    ) : null}

                    {status === "pending" ? (
                      <form className="mt-5 grid gap-3">
                        <textarea
                          name="adminNote"
                          rows={3}
                          placeholder="Optional admin note"
                          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-white/25 focus:border-fuchsia-400"
                        />
                        <input
                          type="hidden"
                          name="paymentId"
                          value={payment.id}
                        />

                        <div className="flex flex-wrap gap-3">
                          <button
                            formAction={approvePayment}
                            className="rounded-2xl bg-emerald-600 px-5 py-3 font-black transition hover:bg-emerald-500"
                          >
                            Approve & Unlock
                          </button>
                          <button
                            formAction={rejectPayment}
                            className="rounded-2xl bg-rose-600 px-5 py-3 font-black transition hover:bg-rose-500"
                          >
                            Reject
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase tracking-wider text-white/30">
        {label}
      </dt>
      <dd className="mt-1 font-bold text-white/80">{value}</dd>
    </div>
  );
}

async function SlipPreview({
  supabase,
  path,
}: {
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  path: string;
}) {
  const { data, error } = await supabase.storage
    .from("payment-slips")
    .createSignedUrl(path, 60 * 10);

  if (error || !data?.signedUrl) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-sm text-white/40">
        Slip unavailable
      </div>
    );
  }

  if (path.toLowerCase().endsWith(".pdf")) {
    return (
      <a
        href={data.signedUrl}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-56 items-center justify-center rounded-2xl border border-white/10 bg-black/20 font-black text-fuchsia-300 hover:bg-black/30"
      >
        Open PDF slip
      </a>
    );
  }

  return (
    <a
      href={data.signedUrl}
      target="_blank"
      rel="noreferrer"
      className="relative block min-h-56 overflow-hidden rounded-2xl border border-white/10 bg-black/20"
    >
      <Image
        src={data.signedUrl}
        alt="Payment slip"
        fill
        unoptimized
        className="object-contain"
      />
    </a>
  );
}
