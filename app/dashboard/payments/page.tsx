import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  paymentStatusClass,
  paymentStatusLabel,
  type PaymentStatus,
} from "@/lib/payment-status";

export const dynamic = "force-dynamic";

export default async function PaymentHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("payment_requests")
    .select(
      "id,product_code,product_title,amount_mmk,payment_method,status,admin_note,created_at,reviewed_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const payments = data ?? [];

  return (
    <main className="min-h-screen bg-[#080011] px-4 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
          Dashboard
        </p>
        <h1 className="mt-2 text-4xl font-black">
          Payment History
        </h1>

        <div className="mt-8 grid gap-4">
          {payments.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/50">
              You have not submitted any payments yet.
            </div>
          ) : (
            payments.map((payment) => {
              const status = payment.status as PaymentStatus;

              return (
                <article
                  key={payment.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black">
                        {payment.product_title}
                      </h2>
                      <p className="mt-1 text-sm text-white/40">
                        {new Date(payment.created_at).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${paymentStatusClass(status)}`}
                    >
                      {paymentStatusLabel(status)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <Info
                      label="Amount"
                      value={`${Number(payment.amount_mmk).toLocaleString()} MMK`}
                    />
                    <Info
                      label="Payment method"
                      value={
                        payment.payment_method === "kpay"
                          ? "KPay"
                          : "QR Pay"
                      }
                    />
                    <Info
                      label="Product code"
                      value={payment.product_code}
                    />
                  </div>

                  {payment.admin_note ? (
                    <div className="mt-5 rounded-2xl bg-white/[0.05] p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-white/30">
                        Admin note
                      </p>
                      <p className="mt-2 text-white/70">
                        {payment.admin_note}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
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
      <p className="text-xs font-black uppercase tracking-wider text-white/30">
        {label}
      </p>
      <p className="mt-1 font-bold text-white/80">
        {value}
      </p>
    </div>
  );
}
