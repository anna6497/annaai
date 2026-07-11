"use client";

import Link from "next/link";

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    oldPrice: null,
    price: "20,000 MMK",
    period: "per month",
    badge: null,
    href: "/payment?plan=monthly",
    features: [
      "Unlimited Chinese conversation",
      "Anna AI voice replies",
      "Speaking and grammar correction",
      "Conversation history",
      "Priority access",
    ],
  },
  {
    id: "yearly",
    name: "Yearly",
    oldPrice: "240,000 MMK",
    price: "200,000 MMK",
    period: "per year",
    badge: "SAVE 40,000",
    href: "/payment?plan=yearly",
    features: [
      "Everything in Monthly",
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
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-purple-700/30 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="text-3xl">🤖</span>
            <span>Anna-AI</span>
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/20"
          >
            Login
          </Link>
        </header>

        <section className="pb-12 pt-16 text-center">
          <p className="inline-flex rounded-full border border-purple-300/20 bg-purple-500/15 px-4 py-2 text-sm font-semibold text-purple-200">
            ✨ Simple and affordable pricing
          </p>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Speak Chinese confidently with{" "}
            <span className="bg-gradient-to-r from-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
              Anna-AI
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
            တရုတ်စကားပြောကို Anna-AI နဲ့ အချိန်မရွေး လေ့ကျင့်ပါ။
            Plan ရွေးပြီး KBZPay သို့မဟုတ် PromptPay ဖြင့် ငွေပေးချေနိုင်ပါတယ်။
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="flex flex-col rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-white/50">
                Free Trial
              </p>

              <h2 className="mt-4 text-4xl font-black">3 Days</h2>

              <p className="mt-2 text-white/50">New accounts only</p>
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
              className="mt-8 rounded-2xl border border-white/15 bg-white/10 px-5 py-3.5 text-center font-bold transition hover:bg-white/20"
            >
              Start Free Trial
            </Link>
          </article>

          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-[2rem] border p-7 backdrop-blur-xl ${
                plan.id === "yearly"
                  ? "border-purple-300/50 bg-gradient-to-b from-purple-500/20 to-white/5"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {plan.badge && (
                <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-purple-300 to-fuchsia-300 px-3 py-1 text-xs font-black text-purple-950">
                  {plan.badge}
                </span>
              )}

              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-purple-200">
                  {plan.name}
                </p>

                {plan.oldPrice && (
                  <p className="mt-4 text-sm text-white/40 line-through">
                    {plan.oldPrice}
                  </p>
                )}

                <h2 className={`${plan.oldPrice ? "mt-1" : "mt-4"} text-4xl font-black`}>
                  {plan.price}
                </h2>

                <p className="mt-2 text-white/50">{plan.period}</p>
              </div>

              <div className="my-7 h-px bg-white/10" />

              <ul className="flex-1 space-y-4 text-sm text-white/75">
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 rounded-2xl px-5 py-3.5 text-center font-bold transition ${
                  plan.id === "yearly"
                    ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:opacity-90"
                    : "bg-purple-600 hover:bg-purple-500"
                }`}
              >
                Choose {plan.name}
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-14 rounded-[2rem] border border-white/10 bg-white/5 p-7 text-center backdrop-blur-xl sm:p-10">
          <h2 className="text-2xl font-bold">How payment works</h2>

          <div className="mx-auto mt-8 grid max-w-4xl gap-5 text-left md:grid-cols-3">
            <div className="rounded-2xl bg-black/20 p-5">
              <p className="text-2xl">1️⃣</p>
              <h3 className="mt-3 font-bold">Choose Plan</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Monthly သို့မဟုတ် Yearly Plan ရွေးပါ။
              </p>
            </div>

            <div className="rounded-2xl bg-black/20 p-5">
              <p className="text-2xl">2️⃣</p>
              <h3 className="mt-3 font-bold">Transfer Payment</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                KBZPay သို့မဟုတ် PromptPay ဖြင့် ငွေလွှဲပါ။
              </p>
            </div>

            <div className="rounded-2xl bg-black/20 p-5">
              <p className="text-2xl">3️⃣</p>
              <h3 className="mt-3 font-bold">Admin Approval</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Slip တင်ပြီး Admin စစ်ဆေးအတည်ပြုပါမယ်။
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