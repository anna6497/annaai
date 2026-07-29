import Link from "next/link";
import {
  AI_SPEAKING_PLAN_IDS,
  AI_SPEAKING_PLANS,
  formatMmk,
  getDiscountPercent,
} from "@/lib/ai-speaking-plans";

export default function AiSpeakingPricingPage() {
  return (
    <main className="min-h-screen bg-[#090010] px-4 py-10 text-white sm:px-6">
      <section className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-fuchsia-300">Anna AI Speaking</p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">Choose Your Plan</h1>
          <p lang="my" className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Free Trial မရှိပါ။ AI Speaking ကို အသုံးပြုရန် plan တစ်ခု ဝယ်ယူပေးပါ။
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {AI_SPEAKING_PLAN_IDS.map((planId) => {
            const plan = AI_SPEAKING_PLANS[planId];
            const highlighted = planId === "ai-six-months";

            return (
              <article
                key={plan.id}
                className={[
                  "relative overflow-hidden rounded-[30px] border p-6",
                  highlighted
                    ? "border-fuchsia-300/60 bg-gradient-to-b from-fuchsia-500/20 to-violet-950/70 shadow-[0_25px_80px_rgba(192,38,211,0.24)]"
                    : "border-white/10 bg-white/[0.045]",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-black text-fuchsia-200">{plan.badge}</span>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-200">
                    {getDiscountPercent(plan)}% OFF
                  </span>
                </div>

                <h2 className="mt-6 text-2xl font-black">{plan.shortTitle}</h2>
                <p className="mt-2 text-sm text-white/50">{plan.durationLabel}</p>

                <div className="mt-6">
                  <p className="text-sm text-white/35 line-through">{formatMmk(plan.originalPriceMmk)}</p>
                  <p className="mt-1 text-4xl font-black">{formatMmk(plan.priceMmk)}</p>
                </div>

                <ul className="mt-7 space-y-3 text-sm text-white/75">
                  <li>✓ Chinese Practice</li>
                  <li>✓ Sentence Builder</li>
                  <li>✓ Hanzi + Pinyin</li>
                  <li>✓ Conversation Memory</li>
                  <li>✓ Speaker Playback</li>
                </ul>

                <Link
                  href={`/dashboard/ai/payment?plan=${plan.id}`}
                  className={[
                    "mt-8 flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-black transition",
                    highlighted
                      ? "bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:brightness-110"
                      : "border border-white/10 bg-white/[0.07] hover:bg-white/[0.12]",
                  ].join(" ")}
                >
                  Choose {plan.shortTitle}
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
