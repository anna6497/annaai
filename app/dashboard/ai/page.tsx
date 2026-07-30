import Link from "next/link";

import ChatWindow from "@/components/ai/ChatWindow";
import { getAiSpeakingAccess } from "@/lib/ai-speaking-access";
import {
  AI_SPEAKING_PLAN_IDS,
  AI_SPEAKING_PLANS,
  formatMmk,
  getDiscountPercent,
} from "@/lib/ai-speaking-plans";

export const dynamic =
  "force-dynamic";

export default async function AiPage() {
  const access =
    await getAiSpeakingAccess();

  if (access.active) {
    return <ChatWindow />;
  }

  return (
    <main className="min-h-screen bg-[#090010] px-4 py-10 text-white sm:px-6">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-black transition hover:bg-white/[0.1]"
          >
            ← Dashboard
          </Link>

          <Link
            href="/dashboard/ai/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-4 py-2 text-sm font-black text-fuchsia-200 transition hover:bg-fuchsia-500/20"
          >
            View All Plans
          </Link>
        </header>

        <div className="mt-10 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-fuchsia-300/25 bg-fuchsia-500/15 text-4xl shadow-[0_0_55px_rgba(217,70,239,0.2)]">
            🎙️
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.28em] text-fuchsia-300">
            Anna AI Speaking
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            Choose Your Plan
          </h1>

          <p
            lang="my"
            className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-white/55 sm:text-base"
          >
            AI Speaking ကို
            အသုံးပြုရန် plan
            တစ်ခုရွေးချယ်ပါ။
            Plan ဝယ်ယူပြီး
            Admin အတည်ပြုပေးသည့်အခါ
            Chinese Practice နဲ့
            Sentence Builder ကို
            အသုံးပြုနိုင်ပါမယ်။
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {AI_SPEAKING_PLAN_IDS.map(
            (planId) => {
              const plan =
                AI_SPEAKING_PLANS[
                  planId
                ];

              const highlighted =
                planId ===
                "ai-six-months";

              return (
                <article
                  key={plan.id}
                  className={[
                    "relative flex h-full flex-col overflow-hidden rounded-[30px] border p-6",
                    highlighted
                      ? "border-fuchsia-300/60 bg-gradient-to-b from-fuchsia-500/20 to-violet-950/70 shadow-[0_25px_80px_rgba(192,38,211,0.24)]"
                      : "border-white/10 bg-white/[0.045]",
                  ].join(" ")}
                >
                  {highlighted && (
                    <div className="absolute right-0 top-0 rounded-bl-2xl bg-fuchsia-500 px-4 py-2 text-[11px] font-black uppercase tracking-wider">
                      Popular
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-black text-fuchsia-200">
                      {plan.badge}
                    </span>

                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-200">
                      {getDiscountPercent(
                        plan,
                      )}
                      % OFF
                    </span>
                  </div>

                  <h2 className="mt-6 text-2xl font-black">
                    {
                      plan.shortTitle
                    }
                  </h2>

                  <p className="mt-2 text-sm text-white/50">
                    {
                      plan.durationLabel
                    }
                  </p>

                  <div className="mt-6">
                    <p className="text-sm text-white/35 line-through">
                      {formatMmk(
                        plan.originalPriceMmk,
                      )}
                    </p>

                    <p className="mt-1 text-3xl font-black">
                      {formatMmk(
                        plan.priceMmk,
                      )}
                    </p>
                  </div>

                  <ul className="mt-7 flex-1 space-y-3 text-sm text-white/75">
                    <li>
                      ✓ Chinese
                      Practice
                    </li>

                    <li>
                      ✓ Sentence
                      Builder
                    </li>

                    <li>
                      ✓ Hanzi +
                      Pinyin
                    </li>

                    <li>
                      ✓ Conversation
                      Memory
                    </li>

                    <li>
                      ✓ Speaker
                      Playback
                    </li>
                  </ul>

                  <Link
                    href={`/dashboard/ai/payment?plan=${plan.id}`}
                    className={[
                      "mt-8 flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-black transition",
                      highlighted
                        ? "bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:brightness-110"
                        : "border border-white/10 bg-white/[0.07] hover:bg-white/[0.12]",
                    ].join(
                      " ",
                    )}
                  >
                    Choose{" "}
                    {
                      plan.shortTitle
                    }
                  </Link>
                </article>
              );
            },
          )}
        </div>

        <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-center">
          <p className="text-sm font-black text-white/80">
            Payment ပြီးရင်
            Admin အတည်ပြုချက်ကို
            စောင့်ပေးပါ။
          </p>

          <p
            lang="my"
            className="mt-2 text-sm leading-7 text-white/45"
          >
            Admin က plan ကို
            approve လုပ်ပေးပြီးပါက
            ဒီ page ကို refresh
            လုပ်ပြီး AI Speaking
            ကို စတင်အသုံးပြုနိုင်ပါမယ်။
          </p>

          <Link
            href="/dashboard"
            className="mt-5 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black transition hover:bg-white/[0.1]"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}