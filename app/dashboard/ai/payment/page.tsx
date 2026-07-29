"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  AI_SPEAKING_PLAN_IDS,
  AI_SPEAKING_PLANS,
  formatMmk,
  isAiSpeakingPlanId,
  type AiSpeakingPlanId,
} from "@/lib/ai-speaking-plans";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type PaymentMethod = "kpay" | "qrpay";
type PaymentStatus = "pending" | "approved" | "rejected";

type ExistingPayment = {
  id: string;
  product_code: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  created_at: string;
};

const PAYMENT_DETAILS = {
  kpay: {
    title: "KBZPay",
    accountName: "Daw Inngyin Hmwe",
    accountNumber: "09259977824",
    qrImage: "/payments/kbzpay-qr.png",
  },
  qrpay: {
    title: "QR Pay",
    accountName: "Mya Thinzar Khin",
    accountNumber: "0628328076",
    qrImage: "/payments/qr-pay.png",
  },
} satisfies Record<PaymentMethod, {
  title: string;
  accountName: string;
  accountNumber: string;
  qrImage: string;
}>;

export default function AiSpeakingPaymentPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [planId, setPlanId] = useState<AiSpeakingPlanId>("ai-monthly");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("kpay");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [transferReference, setTransferReference] = useState("");
  const [note, setNote] = useState("");
  const [payments, setPayments] = useState<ExistingPayment[]>([]);
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const plan = AI_SPEAKING_PLANS[planId];
  const payment = PAYMENT_DETAILS[paymentMethod];
  const hasPendingAiPayment = payments.some((item) => item.status === "pending");

  useEffect(() => {
    const selectedPlan = new URLSearchParams(window.location.search).get("plan");
    if (isAiSpeakingPlanId(selectedPlan)) setPlanId(selectedPlan);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!active) return;
        if (authError || !user) {
          window.location.replace("/login");
          return;
        }

        setUserId(user.id);
        setUserEmail(user.email ?? "");

        const { data, error: historyError } = await supabase
          .from("payment_requests")
          .select("id, product_code, payment_method, status, created_at")
          .eq("user_id", user.id)
          .like("product_code", "ai-%")
          .order("created_at", { ascending: false });

        if (historyError) throw historyError;
        if (active) setPayments((data ?? []) as ExistingPayment[]);
      } catch (accountError) {
        if (active) {
          setError(accountError instanceof Error ? accountError.message : "Account စစ်ဆေးမရပါ။");
        }
      } finally {
        if (active) setCheckingAccount(false);
      }
    }

    void loadAccount();
    return () => { active = false; };
  }, [supabase]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setSuccess("");
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
      setError("JPG, PNG သို့မဟုတ် WEBP ပုံပဲ တင်နိုင်ပါတယ်။");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Screenshot size က 5 MB အောက် ဖြစ်ရပါမယ်။");
      event.target.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }

  function getExtension(selectedFile: File) {
    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "webp"].includes(extension ?? "") ? extension! : "jpg";
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setSuccess("");

    if (!userId) return setError("Login ပြန်ဝင်ပေးပါ။");
    if (hasPendingAiPayment) return setError("AI Speaking payment တစ်ခု စစ်ဆေးနေဆဲဖြစ်ပါတယ်။");
    if (!file) return setError("Payment screenshot ထည့်ပေးပါ။");

    setSubmitting(true);
    let uploadedPath = "";

    try {
      uploadedPath = `${userId}/ai-speaking/${crypto.randomUUID()}.${getExtension(file)}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-slips")
        .upload(uploadedPath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw new Error(`Screenshot upload မရပါ: ${uploadError.message}`);

      const { data: insertedPayment, error: insertError } = await supabase
        .from("payment_requests")
        .insert({
          user_id: userId,
          user_email: userEmail || null,
          product_code: plan.id,
          product_title: plan.title,
          amount_mmk: plan.priceMmk,
          payment_method: paymentMethod,
          slip_path: uploadedPath,
          transfer_reference: transferReference.trim() || null,
          customer_note: note.trim() || null,
          status: "pending",
        })
        .select("id, product_code, payment_method, status, created_at")
        .single();

      if (insertError) {
        await supabase.storage.from("payment-slips").remove([uploadedPath]);
        throw new Error(`Payment record သိမ်းမရပါ: ${insertError.message}`);
      }

      setPayments((current) => [insertedPayment as ExistingPayment, ...current]);
      setFile(null);
      setPreviewUrl("");
      setTransferReference("");
      setNote("");
      setSuccess("Payment တင်ပြီးပါပြီ။ Admin approve လုပ်ပြီးရင် AI Speaking access ရပါမယ်။");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Payment တင်မရပါ။");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAccount) {
    return <main className="flex min-h-screen items-center justify-center bg-[#090010] text-white">Checking your account...</main>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#090010] via-purple-950 to-[#090010] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-3 py-4">
          <Link href="/dashboard/ai/pricing" className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">← Pricing</Link>
          <h1 className="text-lg font-black">AI Speaking Payment</h1>
          <Link href="/dashboard" className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">Dashboard</Link>
        </header>

        <div className="mt-8 grid gap-7 lg:grid-cols-2">
          <section className="rounded-[30px] border border-white/10 bg-white/[0.07] p-6">
            <h2 className="text-xl font-black">1. Choose Your Plan</h2>
            <div className="mt-5 grid gap-3">
              {AI_SPEAKING_PLAN_IDS.map((item) => {
                const itemPlan = AI_SPEAKING_PLANS[item];
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPlanId(item)}
                    className={`rounded-2xl border p-4 text-left ${planId === item ? "border-fuchsia-300 bg-fuchsia-500/20" : "border-white/10 bg-black/20"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black">{itemPlan.shortTitle}</p>
                        <p className="mt-1 text-xs text-white/45">{itemPlan.durationLabel}</p>
                      </div>
                      <p className="font-black text-fuchsia-200">{formatMmk(itemPlan.priceMmk)}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <h2 className="mt-8 text-xl font-black">2. Payment Method</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {(["kpay", "qrpay"] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-2xl border p-4 ${paymentMethod === method ? "border-violet-300 bg-violet-500/20" : "border-white/10 bg-black/20"}`}
                >
                  <p className="font-black">{PAYMENT_DETAILS[method].title}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-black/25 p-5 text-center">
              <p className="text-3xl font-black text-fuchsia-200">{formatMmk(plan.priceMmk)}</p>
              <p className="mt-2 text-sm text-white/45">{plan.durationLabel}</p>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-4">
              <Image src={payment.qrImage} alt={`${payment.title} QR`} width={320} height={320} className="mx-auto h-auto w-full max-w-64 rounded-xl object-contain" />
            </div>

            <div className="mt-5 rounded-2xl bg-black/25 p-5">
              <p className="font-black">{payment.title}</p>
              <p className="mt-3 text-sm text-white/50">Account Name</p>
              <p>{payment.accountName}</p>
              <p className="mt-3 text-sm text-white/50">Phone / Account</p>
              <p>{payment.accountNumber}</p>
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-white/[0.07] p-6">
            <h2 className="text-xl font-black">3. Upload Payment Slip</h2>
            <form onSubmit={submitPayment} className="mt-6 space-y-5">
              <input value={transferReference} onChange={(e) => setTransferReference(e.target.value)} placeholder="Transfer Reference (optional)" className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3" />
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Note (optional)" className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3" />
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="block w-full rounded-2xl border border-dashed border-white/20 bg-black/20 p-4 text-sm" />

              {previewUrl && <img src={previewUrl} alt="Payment preview" className="mx-auto max-h-80 rounded-xl object-contain" />}
              {error && <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</p>}
              {success && <p className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">{success}</p>}

              <button type="submit" disabled={submitting || hasPendingAiPayment} className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-4 font-black disabled:opacity-45">
                {submitting ? "Submitting..." : hasPendingAiPayment ? "Payment Under Review" : "Submit Payment"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
