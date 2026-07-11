"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase";

type Plan = "monthly" | "yearly";
type PaymentMethod = "kbzpay" | "promptpay";
type PaymentStatus = "pending" | "approved" | "rejected";

interface ExistingPayment {
  id: string;
  plan: Plan;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  created_at: string;
}

const PAYMENT_DETAILS = {
  kbzpay: {
    title: "KBZPay",
    accountName: "Daw Inngyin Hmwe",
    accountNumber: "09XXXXXXXXX",
    qrImage: "/payments/kbzpay-qr.png",
  },
  promptpay: {
    title: "PromptPay",
    accountName: "Mya Thinzar Khin",
    accountNumber: "0XX-XXX-XXXX",
    qrImage: "/payments/promptpay-qr.png",
  },
} satisfies Record<
  PaymentMethod,
  {
    title: string;
    accountName: string;
    accountNumber: string;
    qrImage: string;
  }
>;

const PLAN_DETAILS = {
  monthly: {
    title: "Monthly Plan",
    duration: "1 Month",
    mmkAmount: 20000,
    mmkDisplay: "20,000 MMK",
    thbAmount: 150,
    thbDisplay: "150 THB",
  },
  yearly: {
    title: "Yearly Plan",
    duration: "1 Year",
    mmkAmount: 200000,
    mmkDisplay: "200,000 MMK",
    thbAmount: 1500,
    thbDisplay: "1,500 THB",
  },
} satisfies Record<
  Plan,
  {
    title: string;
    duration: string;
    mmkAmount: number;
    mmkDisplay: string;
    thbAmount: number;
    thbDisplay: string;
  }
>;

export default function PaymentPage() {
  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    []
  );

  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [plan, setPlan] = useState<Plan>("monthly");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("kbzpay");

  const [transferReference, setTransferReference] = useState("");
  const [note, setNote] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [payments, setPayments] = useState<ExistingPayment[]>([]);

  const [checkingAccount, setCheckingAccount] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentPlan = PLAN_DETAILS[plan];
  const currentPayment = PAYMENT_DETAILS[paymentMethod];

  const amount =
    paymentMethod === "kbzpay"
      ? currentPlan.mmkAmount
      : currentPlan.thbAmount;

  const currency = paymentMethod === "kbzpay" ? "MMK" : "THB";

  const amountDisplay =
    paymentMethod === "kbzpay"
      ? currentPlan.mmkDisplay
      : currentPlan.thbDisplay;

  const hasPendingPayment = payments.some(
    (payment) => payment.status === "pending"
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedPlan = params.get("plan");

    if (selectedPlan === "monthly" || selectedPlan === "yearly") {
      setPlan(selectedPlan);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (userError || !user) {
          window.location.replace("/login");
          return;
        }

        setUserId(user.id);
        setUserEmail(user.email ?? "");

        const { data, error: historyError } = await supabase
          .from("payments")
          .select("id, plan, payment_method, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (historyError) {
          throw historyError;
        }

        if (!active) return;

        setPayments((data ?? []) as ExistingPayment[]);
      } catch (accountError) {
        console.error("Payment account error:", accountError);

        if (!active) return;

        setError(
          accountError instanceof Error
            ? accountError.message
            : "Account စစ်ဆေးမရပါ။"
        );
      } finally {
        if (active) setCheckingAccount(false);
      }
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setSuccess("");

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("JPG, PNG သို့မဟုတ် WEBP ပုံပဲ တင်နိုင်ပါတယ်။");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Screenshot size က 5 MB အောက် ဖြစ်ရပါမယ်။");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }

  function getExtension(selectedFile: File) {
    const extension = selectedFile.name.split(".").pop()?.toLowerCase();

    if (
      extension === "jpg" ||
      extension === "jpeg" ||
      extension === "png" ||
      extension === "webp"
    ) {
      return extension;
    }

    if (selectedFile.type === "image/png") return "png";
    if (selectedFile.type === "image/webp") return "webp";

    return "jpg";
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    if (!userId) {
      setError("Login ပြန်ဝင်ပေးပါ။");
      return;
    }

    if (hasPendingPayment) {
      setError(
        "စစ်ဆေးနေဆဲ Payment ရှိပြီးသားပါ။ Admin စစ်ဆေးပြီးမှ ထပ်တင်ပါ။"
      );
      return;
    }

    if (!file) {
      setError("Payment screenshot ထည့်ပေးပါ။");
      return;
    }

    setSubmitting(true);

    let uploadedPath = "";

    try {
      const extension = getExtension(file);

      uploadedPath = `${userId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-slips")
        .upload(uploadedPath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Screenshot upload မရပါ: ${uploadError.message}`);
      }

      const { data: insertedPayment, error: insertError } = await supabase
        .from("payments")
        .insert({
          user_id: userId,
          user_email: userEmail || null,
          plan,
          payment_method: paymentMethod,
          amount,
          currency,
          transfer_reference: transferReference.trim() || null,
          note: note.trim() || null,
          screenshot_path: uploadedPath,
          status: "pending",
        })
        .select("id, plan, payment_method, status, created_at")
        .single();

      if (insertError) {
        await supabase.storage.from("payment-slips").remove([uploadedPath]);

        throw new Error(`Payment record သိမ်းမရပါ: ${insertError.message}`);
      }

      setPayments((current) => [
        insertedPayment as ExistingPayment,
        ...current,
      ]);

      setFile(null);
      setTransferReference("");
      setNote("");

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl("");

      setSuccess(
        "Payment တင်ပြီးပါပြီ။ Admin စစ်ဆေးအတည်ပြုသည်အထိ စောင့်ပေးပါ။"
      );
    } catch (submitError) {
      console.error("Payment submission error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Payment တင်မရပါ။"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAccount) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-300/20 border-t-purple-400" />
          <p className="mt-4">Checking your account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-5 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between py-4">
          <Link
            href="/pricing"
            className="rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
          >
            ← Pricing
          </Link>

          <h1 className="text-xl font-bold">Anna-AI Payment</h1>

          <Link
            href="/"
            className="rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
          >
            Home
          </Link>
        </header>

        <section className="mt-8 text-center">
          <p className="text-5xl">💳</p>
          <h2 className="mt-4 text-4xl font-black">Complete Your Payment</h2>
          <p className="mt-3 text-white/60">
            KBZPay သို့မဟုတ် PromptPay ဖြင့် ငွေလွှဲပြီး screenshot တင်ပေးပါ။
          </p>
        </section>

        <div className="mt-10 grid gap-7 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <h3 className="text-xl font-bold">1. Choose Your Plan</h3>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {(["monthly", "yearly"] as Plan[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPlan(item)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    plan === item
                      ? "border-purple-300 bg-purple-500/25"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <p className="font-bold capitalize">{item}</p>
                  <p className="mt-2 text-sm text-white/60">
                    {PLAN_DETAILS[item].mmkDisplay}
                  </p>
                </button>
              ))}
            </div>

            <h3 className="mt-8 text-xl font-bold">
              2. Choose Payment Method
            </h3>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("kbzpay")}
                className={`rounded-2xl border p-4 transition ${
                  paymentMethod === "kbzpay"
                    ? "border-blue-300 bg-blue-500/20"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <p className="text-2xl">🇲🇲</p>
                <p className="mt-2 font-bold">KBZPay</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("promptpay")}
                className={`rounded-2xl border p-4 transition ${
                  paymentMethod === "promptpay"
                    ? "border-green-300 bg-green-500/20"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <p className="text-2xl">🇹🇭</p>
                <p className="mt-2 font-bold">PromptPay</p>
              </button>
            </div>

            <div className="mt-6 rounded-3xl bg-black/25 p-5 text-center">
              <p className="text-sm text-white/50">Amount to pay</p>
              <p className="mt-2 text-3xl font-black text-purple-200">
                {amountDisplay}
              </p>
              <p className="mt-2 text-sm text-white/50">
                {currentPlan.duration}
              </p>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-4">
              <Image
                src={currentPayment.qrImage}
                alt={`${currentPayment.title} QR code`}
                width={300}
                height={300}
                className="mx-auto h-auto w-full max-w-64 rounded-xl object-contain"
              />
            </div>

            <div className="mt-5 rounded-2xl bg-black/25 p-5">
              <p className="text-sm text-white/50">Payment Method</p>
              <p className="mt-1 font-bold">{currentPayment.title}</p>

              <p className="mt-4 text-sm text-white/50">Account Name</p>
              <p className="mt-1 font-semibold">
                {currentPayment.accountName}
              </p>

              <p className="mt-4 text-sm text-white/50">Phone / Account</p>
              <p className="mt-1 font-semibold">
                {currentPayment.accountNumber}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <h3 className="text-xl font-bold">3. Upload Payment Slip</h3>

            <form onSubmit={submitPayment} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Transfer Reference (optional)
                </label>

                <input
                  value={transferReference}
                  onChange={(event) =>
                    setTransferReference(event.target.value)
                  }
                  placeholder="Transaction ID / Reference"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Note (optional)
                </label>

                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  placeholder="Admin ကိုပြောချင်တဲ့ message"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Payment Screenshot
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="block w-full rounded-2xl border border-dashed border-white/20 bg-black/20 p-4 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:font-semibold file:text-white"
                />
              </div>

              {previewUrl && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <img
                    src={previewUrl}
                    alt="Payment preview"
                    className="mx-auto max-h-80 rounded-xl object-contain"
                  />
                </div>
              )}

              {error && (
                <p className="rounded-2xl border border-red-400/20 bg-red-500/20 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-2xl border border-green-400/20 bg-green-500/20 px-4 py-3 text-sm text-green-100">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || hasPendingPayment}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-4 font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : hasPendingPayment
                    ? "Payment Under Review"
                    : "Submit Payment"}
              </button>
            </form>

            {payments.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold">Payment History</h3>

                <div className="mt-4 space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl bg-black/25 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold capitalize">
                            {payment.plan} · {payment.payment_method}
                          </p>

                          <p className="mt-1 text-xs text-white/45">
                            {new Date(payment.created_at).toLocaleString()}
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
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}