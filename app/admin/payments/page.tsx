import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { approvePayment, rejectPayment } from "./actions";

export const dynamic = "force-dynamic";

type PaymentStatus = "pending" | "approved" | "rejected";

type PaymentRow = {
  id: string;
  user_id: string;
  product_code: string;
  product_title: string;
  amount_mmk: number | string;
  payment_method: string;
  status: PaymentStatus;
  slip_path: string | null;
  admin_note: string | null;
  created_at: string;
};

const statusStyles: Record<PaymentStatus, string> = {
  pending: "bg-amber-400/15 text-amber-200",
  approved: "bg-emerald-400/15 text-emerald-200",
  rejected: "bg-rose-400/15 text-rose-200",
};

const allowedStatuses: PaymentStatus[] = [
  "pending",
  "approved",
  "rejected",
];

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;

  const filter: PaymentStatus | "all" = allowedStatuses.includes(
    params.status as PaymentStatus,
  )
    ? (params.status as PaymentStatus)
    : "all";

  const admin = createSupabaseAdminClient();

  let query = admin
    .from("payment_requests")
    .select(
      `
        id,
        user_id,
        product_code,
        product_title,
        amount_mmk,
        payment_method,
        status,
        slip_path,
        admin_note,
        created_at
      `,
    )
    .order("created_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("status", filter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Admin payment query failed:", error);
    throw new Error(`Unable to load payment requests: ${error.message}`);
  }

  const payments = (data ?? []) as PaymentRow[];

  return (
    <main className="px-4 py-8 sm:px-7 lg:px-10">
      <section className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
              Payment Management
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Payment Requests
            </h1>

            <p className="mt-2 text-white/50">
              Payment slip ကိုစစ်ပြီး approve လုပ်တာနဲ့ lifetime HSK access
              ရပါမယ်။
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {["all", ...allowedStatuses].map((status) => {
              const active = filter === status;

              return (
                <Link
                  key={status}
                  href={
                    status === "all"
                      ? "/admin/payments"
                      : `/admin/payments?status=${status}`
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-black capitalize transition ${
                    active
                      ? "bg-fuchsia-500 text-white"
                      : "border border-white/10 bg-white/[0.05] text-white/55 hover:bg-white/[0.1]"
                  }`}
                >
                  {status}
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="mt-6 grid gap-5">
          {payments.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-12 text-center text-white/45">
              No payment requests found.
            </div>
          ) : (
            payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                admin={admin}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

async function PaymentCard({
  payment,
  admin,
}: {
  payment: PaymentRow;
  admin: ReturnType<typeof createSupabaseAdminClient>;
}) {
  return (
    <article className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 lg:grid-cols-[240px_1fr]">
      <SlipPreview
        admin={admin}
        path={payment.slip_path}
      />

      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {payment.product_title}
            </h2>

            <p className="mt-1 break-all text-sm text-white/45">
              User ID: {payment.user_id}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
              statusStyles[payment.status]
            }`}
          >
            {payment.status}
          </span>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Info
            label="Product"
            value={payment.product_code}
          />

          <Info
            label="Amount"
            value={`${Number(payment.amount_mmk).toLocaleString(
              "en-US",
            )} MMK`}
          />

          <Info
            label="Method"
            value={formatPaymentMethod(payment.payment_method)}
          />

          <Info
            label="Submitted"
            value={formatDate(payment.created_at)}
          />
        </dl>

        {payment.admin_note ? (
          <div className="mt-5 rounded-2xl bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-wider text-white/35">
              Admin note
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">
              {payment.admin_note}
            </p>
          </div>
        ) : null}

        {payment.status === "pending" ? (
          <form className="mt-5 grid gap-3">
            <input
              type="hidden"
              name="paymentId"
              value={payment.id}
            />

            <textarea
              name="adminNote"
              rows={3}
              placeholder="Optional admin note"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-fuchsia-400"
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                formAction={approvePayment}
                className="rounded-2xl bg-emerald-600 px-5 py-3 font-black transition hover:bg-emerald-500"
              >
                Approve & Unlock
              </button>

              <button
                type="submit"
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

      <dd className="mt-1 break-words font-bold text-white/80">
        {value}
      </dd>
    </div>
  );
}

async function SlipPreview({
  admin,
  path,
}: {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  path: string | null;
}) {
  if (!path) {
    return <SlipUnavailable message="No slip uploaded" />;
  }

  const { data, error } = await admin.storage
    .from("payment-slips")
    .createSignedUrl(path, 60 * 10);

  if (error) {
    console.error("Unable to create payment slip URL:", {
      path,
      message: error.message,
    });

    return <SlipUnavailable message="Slip unavailable" />;
  }

  const signedUrl = data?.signedUrl;

  if (!signedUrl) {
    return <SlipUnavailable message="Slip unavailable" />;
  }

  if (path.toLowerCase().endsWith(".pdf")) {
    return (
      <a
        href={signedUrl}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-56 items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-4 text-center font-black text-fuchsia-300 transition hover:bg-black/30"
      >
        Open PDF slip
      </a>
    );
  }

  return (
    <a
      href={signedUrl}
      target="_blank"
      rel="noreferrer"
      className="relative block min-h-56 overflow-hidden rounded-2xl border border-white/10 bg-black/20"
    >
      <Image
        src={signedUrl}
        alt="Payment slip"
        fill
        unoptimized
        sizes="240px"
        className="object-contain"
      />
    </a>
  );
}

function SlipUnavailable({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-4 text-center text-sm text-white/40">
      {message}
    </div>
  );
}

function formatPaymentMethod(method: string) {
  const normalized = method.toLowerCase();

  if (normalized === "kpay" || normalized === "kbzpay") {
    return "KBZPay";
  }

  if (
    normalized === "qr" ||
    normalized === "qrpay" ||
    normalized === "qr_pay"
  ) {
    return "QR Pay";
  }

  return method;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-GB");
}