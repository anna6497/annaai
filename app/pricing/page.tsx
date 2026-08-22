import Link from "next/link";

import {
  AI_SPEAKING_PLAN_IDS,
  AI_SPEAKING_PLANS,
  formatMmk as formatAiMmk,
} from "@/lib/ai-speaking-plans";

import {
  formatMmk as formatHskMmk,
} from "@/lib/hsk-products";

export default function PricingPage() {
  const startingPlan =
    AI_SPEAKING_PLANS[AI_SPEAKING_PLAN_IDS[0]];

  return (
    <main className="min-h-screen bg-[#090014] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Top navigation */}
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
          >
            ← Home
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
          >
            Dashboard
          </Link>
        </header>

        {/* Heading */}
        <section className="py-12 text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-300">
            Anna AI Pricing
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            Choose what you need
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/55">
            Choose an AI Speaking plan or get lifetime
            access to Anna AI HSK learning materials.
          </p>
        </section>

        {/* Main cards */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* AI Speaking */}
          <article className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/20 bg-gradient-to-br from-[#471071] via-[#260743] to-[#10001d] p-8 shadow-2xl">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-300">
                  AI Speaking
                </p>

                <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-3 py-1 text-xs font-bold text-fuchsia-200">
                  Paid Plans
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black">
                Practice Chinese with Anna AI
              </h2>

              <p
                lang="my"
                className="mt-4 max-w-xl leading-7 text-white/60"
              >
                AI နဲ့ တရုတ်စကားပြောလေ့ကျင့်ပြီး
                Sentence Builder, Hanzi + Pinyin,
                Conversation Memory နဲ့ Speaker Playback
                features တွေကို အသုံးပြုနိုင်ပါတယ်။
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                  Plans available
                </p>

                <p className="mt-2 text-xl font-black">
                  Monthly · 6 Months · Yearly
                </p>

                <p className="mt-3 text-sm text-white/50">
                  Starting from
                </p>

                <p className="mt-1 text-3xl font-black text-fuchsia-200">
                  {formatAiMmk(startingPlan.priceMmk)}
                </p>
              </div>

              <Link
                href="/dashboard/ai/pricing"
                className="mt-8 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-6 py-4 font-black transition hover:brightness-110"
              >
                View AI Speaking Plans →
              </Link>
            </div>
          </article>

          {/* HSK */}
          <article className="relative overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-gradient-to-br from-[#003a35] via-[#002b31] to-[#071827] p-8 shadow-2xl">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
                  HSK Lifetime Package
                </p>

                <span className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200">
                  Lifetime
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black">
                HSK 2–9 Full Package
              </h2>

              <p className="mt-4 leading-7 text-white/60">
                Flashcards + Writing for HSK 2 to HSK 9.
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/35 line-through">
                  {formatHskMmk(80000)}
                </p>

                <p className="mt-1 text-4xl font-black text-emerald-200">
                  {formatHskMmk(25000)}
                </p>

                <p className="mt-2 text-sm font-bold text-emerald-300">
                  Promotion · Lifetime Access
                </p>
              </div>

              <Link
                href="/hsk/store"
                className="mt-8 flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-6 py-4 font-black transition hover:bg-emerald-500"
              >
                View HSK Store →
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}