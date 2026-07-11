"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase";

type PaymentStatus = "pending" | "approved" | "rejected";
type FilterStatus = PaymentStatus | "all";

interface PaymentRecord {
  id: string;
  user_id: string;
  user_email: string | null;
  plan: "monthly" | "yearly";
  payment_method: "kbzpay" | "promptpay";
  amount: number | null;
  currency: string | null;
  transfer_reference: string | null;
  note: string | null;
  screenshot_path: string;
  status: PaymentStatus;
  created_at: string;
}

interface PaymentWithUrl extends PaymentRecord {
  screenshotUrl: string;
}

export default function AdminPaymentsPage() {
  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    []
  );

  const [payments, setPayments] = useState<PaymentWithUrl[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("pending");

  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        window.location.replace("/");
        return;
      }

      let query = supabase
        .from("payments")
        .select(
          `
            id,
            user_id,
            user_email,
            plan,
            payment_method,
            amount,
            currency,
            transfer_reference,
            note,
            screenshot_path,
            status,
            created_at
          `
        )
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error: paymentsError } = await query;

      if (paymentsError) {
        throw paymentsError;
      }

      const records = (data ?? []) as PaymentRecord[];

      const withUrls = await Promise.all(
        records.map(async (payment) => {
          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("payment-slips")
              .createSignedUrl(payment.screenshot_path, 60 * 10);

          if (signedError) {
            console.error("Signed URL error:", signedError);
          }

          return {
            ...payment,
            screenshotUrl: signedData?.signedUrl ?? "",
          };
        })
      );

      setPayments(withUrls);
    } catch (loadError) {
      console.error("Admin payments error:", loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Payments မဖတ်နိုင်ပါ။"
      );
    } finally {
      setLoading(false);
    }
  }, [filter, supabase]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  async function approvePayment(paymentId: string) {
    if (!window.confirm("ဒီ Payment ကို Approve လုပ်မှာ သေချာပါသလား?")) {
      return;
    }

    setWorkingId(paymentId);
    setError("");

    try {
      const { error: rpcError } = await supabase.rpc("approve_payment", {
        payment_id_input: paymentId,
      });

      if (rpcError) throw rpcError;

      await loadPayments();
    } catch (approveError) {
      setError(
        approveError instanceof Error
          ? approveError.message
          : "Approve လုပ်မရပါ။"
      );
    } finally {
      setWorkingId("");
    }
  }

  async function rejectPayment(paymentId: string) {
    if (!window.confirm("ဒီ Payment ကို Reject လုပ်မှာ သေချာပါသလား?")) {
      return;
    }

    setWorkingId(paymentId);
    setError("");

    try {
      const { error: rpcError } = await supabase.rpc("reject_payment", {
        payment_id_input: paymentId,
      });

      if (rpcError) throw rpcError;

      await loadPayments();
    } catch (rejectError) {
      setError(
        rejectError instanceof Error
          ? rejectError.message
          : "Reject လုပ်မရပါ။"
      );
    } finally {
      setWorkingId("");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm text-purple-300">Anna-AI Admin</p>
            <h1 className="text-3xl font-black">Payment Approvals</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
            >
              Home
            </Link>

            <button
              type="button"
              onClick={() => void loadPayments()}
              className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold transition hover:bg-purple-500"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/30"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["pending", "approved", "rejected", "all"] as FilterStatus[]).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-sm capitalize transition ${
                  filter === item
                    ? "bg-purple-600"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/20 p-4 text-red-100">
            {error}
          </p>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-300/20 border-t-purple-400" />
            <p className="mt-4">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-5xl">📭</p>
            <p className="mt-4 text-xl font-bold">Payment မရှိသေးပါ။</p>
          </div>
        ) : (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            {payments.map((payment) => (
              <article
                key={payment.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                <div className="bg-black/25 p-5">
                  {payment.screenshotUrl ? (
                    <a
                      href={payment.screenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={payment.screenshotUrl}
                        alt="Payment slip"
                        className="mx-auto max-h-96 w-full rounded-2xl object-contain"
                      />
                    </a>
                  ) : (
                    <div className="flex h-60 items-center justify-center rounded-2xl bg-white/5 text-white/50">
                      Screenshot unavailable
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold capitalize">
                        {payment.plan} Plan
                      </h2>

                      <p className="mt-1 text-sm uppercase text-purple-300">
                        {payment.payment_method}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        payment.status === "approved"
                          ? "bg-green-500/20 text-green-200"
                          : payment.status === "rejected"
                            ? "bg-red-500/20 text-red-200"
                            : "bg-yellow-500/20 text-yellow-200"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-4 text-sm">
                    <div>
                      <p className="text-white/45">User</p>
                      <p className="break-all">
                        {payment.user_email ?? payment.user_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-white/45">Amount</p>
                      <p>
                        {payment.amount ?? "Not specified"}{" "}
                        {payment.currency ?? ""}
                      </p>
                    </div>

                    <div>
                      <p className="text-white/45">Reference</p>
                      <p>{payment.transfer_reference ?? "-"}</p>
                    </div>

                    <div>
                      <p className="text-white/45">Note</p>
                      <p>{payment.note ?? "-"}</p>
                    </div>

                    <div>
                      <p className="text-white/45">Submitted</p>
                      <p>{new Date(payment.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {payment.status === "pending" && (
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => void approvePayment(payment.id)}
                        disabled={workingId === payment.id}
                        className="rounded-2xl bg-green-600 px-4 py-3 font-bold transition hover:bg-green-500 disabled:opacity-50"
                      >
                        {workingId === payment.id ? "Working..." : "Approve"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void rejectPayment(payment.id)}
                        disabled={workingId === payment.id}
                        className="rounded-2xl bg-red-600 px-4 py-3 font-bold transition hover:bg-red-500 disabled:opacity-50"
                      >
                        {workingId === payment.id ? "Working..." : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}