"use client";

import Link from "next/link";

interface Plan {
  id: "monthly" | "yearly";
  name: string;
  price: string;
  oldPrice?: string;
  period: string;
  badge?: string;
  paymentUrl: string;
  features: string[];
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: "20,000 MMK",
    period: "per month",
    paymentUrl: "/payment?plan=monthly",
    features: [
      "Unlimited Chinese conversation",
      "Anna AI voice replies",
      "Speaking and grammar correction",
      "Conversation history",
      "Priority AI access",
    ],
  },
  {
    id: "yearly",
    name: "Yearly",
    oldPrice: "240,000 MMK",
    price: "200,000 MMK",
    period: "per year",
    badge: "SAVE 40,000",
    paymentUrl: "/payment?plan=yearly",
    highlighted: true,
    features: [
      "Everything included in Monthly",
      "12 months premium access",
      "Unlimited Chinese conversation",
      "Conversation history",
      "Priority new features",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background lights */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-purple-700/30 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-fuchsia-600/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold sm:text-xl"
          >
            <span className="text-3xl">🤖</span>
            <span>Anna-AI</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            >
              Dashboard
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
            >
              Login
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="pb-10 pt-14 text-center sm:pb-14 sm:pt-20">
          <p className="inline-flex rounded-full border border-purple-300/20 bg-purple-500/15 px-4 py-2 text-sm font-semibold text-purple-200">
            ✨ Simple and affordable pricing
          </p>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
              Plan
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
            တရုတ်စကားပြောကို Anna-AI နဲ့ အချိန်မရွေး လေ့ကျင့်ပါ။
            KBZPay သို့မဟုတ် PromptPay ဖြင့် ငွေပေးချေနိုင်ပါတယ်။
          </p>
        </section>

        {/* Pricing cards */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Free Trial */}
          <article className="flex flex-col rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-7">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-white/50">
                Free Trial
              </p>

              <h2 className="mt-4 text-4xl font-black">
                3 Days
              </h2>

              <p className="mt-2 text-white/50">
                New accounts only
              </p>
            </div>

            <div className="my-7 h-px bg-white/10" />

            <ul className="flex-1 space-y-4 text-sm text-white/75">
              <li>✓ AI Chinese conversation</li>
              <li>✓ Chinese speech recognition</li>
              <li>✓ Anna AI voice replies</li>
              <li>✓ Grammar correction</li>
              <li>✓ Pronunciation practice</li>
            </ul>

            <Link
              href="/register"
              className="mt-8 block w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-center text-base font-bold transition hover:bg-white/20 active:scale-[0.98]"
            >
              Start Free Trial
            </Link>
          </article>

          {/* Paid plans */}
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-[2rem] border p-6 backdrop-blur-xl sm:p-7 ${
                plan.highlighted
                  ? "border-purple-300/60 bg-gradient-to-b from-purple-500/25 to-white/5 shadow-2xl shadow-purple-950/40"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {plan.badge && (
                <span className="mb-5 inline-flex w-fit rounded-full bg-gradient-to-r from-purple-300 to-fuchsia-300 px-4 py-2 text-xs font-black text-purple-950 lg:absolute lg:right-5 lg:top-5 lg:mb-0">
                  {plan.badge}
                </span>
              )}

              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-purple-200">
                  {plan.name}
                </p>

                {plan.oldPrice && (
                  <p className="mt-5 text-lg text-white/40 line-through">
                    {plan.oldPrice}
                  </p>
                )}

                <h2
                  className={`text-4xl font-black sm:text-5xl ${
                    plan.oldPrice ? "mt-1" : "mt-5"
                  }`}
                >
                  {plan.price}
                </h2>

                <p className="mt-3 text-lg text-white/50">
                  {plan.period}
                </p>
              </div>

              <div className="my-7 h-px bg-white/10" />

              <ul className="flex-1 space-y-4 text-sm text-white/75">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.paymentUrl}
                className={`mt-8 block w-full rounded-2xl px-5 py-4 text-center text-lg font-bold text-white transition active:scale-[0.98] ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:opacity-90"
                    : "bg-purple-600 hover:bg-purple-500"
                }`}
              >
                Choose {plan.name}
              </Link>
            </article>
          ))}
        </section>

        {/* Payment guide */}
        <section className="mt-14 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl sm:p-10">
          <h2 className="text-2xl font-bold sm:text-3xl">
            How payment works
          </h2>

          <div className="mx-auto mt-8 grid max-w-4xl gap-5 text-left md:grid-cols-3">
            <div className="rounded-2xl bg-black/20 p-5">
              <p className="text-3xl">1️⃣</p>

              <h3 className="mt-3 font-bold">
                Choose Plan
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Monthly သို့မဟုတ် Yearly Plan ရွေးပါ။
              </p>
            </div>

            <div className="rounded-2xl bg-black/20 p-5">
              <p className="text-3xl">2️⃣</p>

              <h3 className="mt-3 font-bold">
                Transfer Payment
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                KBZPay သို့မဟုတ် PromptPay ဖြင့် ငွေလွှဲပါ။
              </p>
            </div>

            <div className="rounded-2xl bg-black/20 p-5">
              <p className="text-3xl">3️⃣</p>

              <h3 className="mt-3 font-bold">
                Admin Approval
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Payment slip တင်ပြီး Admin စစ်ဆေးအတည်ပြုပါမယ်။
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-10">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Frequently Asked Questions
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-black/20 p-5">
              <h3 className="font-bold">
                Trial က ဘယ်အချိန်ကစမလဲ?
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Account register လုပ်တဲ့အချိန်ကစပြီး 3 ရက်
                အလိုအလျောက်စတင်ပါတယ်။
              </p>
            </div>

            <div className="rounded-2xl bg-black/20 p-5">
              <h3 className="font-bold">
                Trial ကုန်ရင်ဘာဖြစ်မလဲ?
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Anna-AI Call Page ကို အသုံးပြုနိုင်တော့မှာမဟုတ်ဘဲ
                Plan ဝယ်ယူရန် ဒီစာမျက်နှာကို ပြန်ပို့ပါမယ်။
              </p>
            </div>

            <div className="rounded-2xl bg-black/20 p-5">
              <h3 className="font-bold">
                Payment ဘယ်လိုပေးရမလဲ?
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                KBZPay သို့မဟုတ် PromptPay ဖြင့် ငွေလွှဲပြီး
                payment screenshot တင်ပေးရပါမယ်။
              </p>
            </div>

            <div className="rounded-2xl bg-black/20 p-5">
              <h3 className="font-bold">
                ဘယ်အချိန် Premium ဖြစ်မလဲ?
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Admin က payment ကိုစစ်ပြီး Approve လုပ်ပြီးတာနဲ့
                Premium အလိုအလျောက်ဖြစ်ပါမယ်။
              </p>
            </div>
          </div>
        </section>

        <footer className="py-10 text-center text-sm text-white/35">
          © 2026 Anna-AI. Your Chinese AI Friend.
        </footer>
      </div>
    </main>
  );
}