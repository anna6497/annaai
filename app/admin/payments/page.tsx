import Image from "next/image";
import { requireAdmin } from "@/lib/admin-auth";
import {
  paymentStatusClass,
  paymentStatusLabel,
  type PaymentStatus,
} from "@/lib/payment-status";
import {
  approvePayment,
  rejectPayment,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const { supabase } = await requireAdmin();

  const { data: payments, error } = await supabase
    .from("payment_requests_admin")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = payments ?? [];

  return (
    <main className="min-h-screen bg-[#080011] px-4 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
            Anna AI Admin
          </p>
          <h1 className="mt-2 text-4xl font-black">
            Payment Requests
          </h1>
          <p className="mt-2 text-white/50">
            Review payment slips and unlock purchased HSK access.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/50">
            No payment requests yet.
          </div>
        ) : (
          <div className="grid gap-5">
            {rows.map((payment) => {
              const status = payment.status as PaymentStatus;

              return (
                <article
                  key={payment.id}
                  className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 lg:grid-cols-[220px_1fr]"
                >
                  <SlipPreview
                    supabase={supabase}
                    path={payment.slip_path}
                  />

                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black">
                          {payment.product_title}
                        </h2>
                        <p className="mt-1 text-sm text-white/45">
                          {payment.user_email ?? payment.user_id}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase ${paymentStatusClass(status)}`}
                      >
                        {paymentStatusLabel(status)}
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <Info
                        label="Product"
                        value={payment.product_code}
                      />
                      <Info
                        label="Amount"
                        value={`${Number(payment.amount_mmk).toLocaleString()} MMK`}
                      />
                      <Info
                        label="Method"
                        value={
                          payment.payment_method === "kpay"
                            ? "KPay"
                            : "QR Pay"
                        }
                      />
                      <Info
                        label="Submitted"
                        value={new Date(payment.created_at).toLocaleString()}
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
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-black uppercase tracking-wider text-white/30">
        {label}
      </dt>
      <dd className="mt-1 font-bold text-white/80">
        {value}
      </dd>
    </div>
  );
}

async function SlipPreview({
  supabase,
  path,
}: {
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"];
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

  const isPdf = path.toLowerCase().endsWith(".pdf");

  if (isPdf) {
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
