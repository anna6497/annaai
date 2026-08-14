import Link from "next/link";

import LaoshiCard from "@/components/speaking-practice/LaoshiCard";
import { getLaoshiAccess } from "@/lib/laoshi-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your Laoshi | Anna AI",
  description:
    "Guided Chinese speaking lessons, pronunciation practice, Smart Review and progress tracking.",
};

export default async function YourLaoshiPage() {
  const access =
    await getLaoshiAccess();

  if (!access.active) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071018] px-4 text-white">
        <section className="w-full max-w-xl rounded-[32px] border border-cyan-300/15 bg-white/[0.05] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-4xl">
            🎓
          </div>

          <h1 className="mt-6 text-3xl font-black">
            Active Plan Required
          </h1>

          <p
            lang="my"
            className="mt-4 text-sm leading-8 text-white/55"
          >
            Your Laoshi features တွေကို အသုံးပြုရန်
            AI Speaking Plan သို့မဟုတ် Paid HSK Plan
            လိုအပ်ပါတယ်။
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              href="/dashboard/ai/pricing"
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-4 font-black"
            >
              View AI Speaking Plans
            </Link>

            <Link
              href="/hsk/store"
              className="flex w-full items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-4 font-black text-cyan-100"
            >
              View HSK Plans
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071018] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />

        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px]" />
      </div>

      <section className="relative mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard/ai"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75"
          >
            ← Choose AI Partner
          </Link>

          <Link
            href="/dashboard/ai/talk"
            className="rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-2 text-sm font-bold text-fuchsia-100"
          >
            💜 Talk with Anna
          </Link>
        </div>

        <header className="mt-12 rounded-[36px] border border-cyan-300/15 bg-gradient-to-br from-cyan-950/80 via-emerald-950/60 to-slate-950/85 p-7 shadow-2xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            Anna AI Teacher
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            🎓 Your Laoshi
          </h1>

          <p
            lang="my"
            className="mt-5 max-w-2xl text-base leading-8 text-white/58"
          >
            Pronunciation၊ HSK speaking lessons၊ Smart Review နဲ့
            progress tracking တွေကို တစ်နေရာတည်းမှာ လေ့ကျင့်ပါ။
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {access.aiSpeaking ? (
              <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-fuchsia-100">
                AI Speaking Access
              </span>
            ) : null}

            {access.hskPaid ? (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-100">
                HSK Paid Access
              </span>
            ) : null}
          </div>
        </header>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <LaoshiCard
            icon="🎯"
            eyebrow="Core Practice"
            title="Pronunciation"
            description="Listen, repeat and receive AI-powered character feedback, scoring and Anna Coach suggestions."
            href="/dashboard/ai/pronunciation"
            buttonLabel="Start Pronunciation →"
            badge="Ready"
          />

          <LaoshiCard
            icon="🎤"
            eyebrow="Structured Learning"
            title="Speaking Lessons"
            description="Practice Chinese speaking by HSK level, lesson and real-life category."
            href="/dashboard/ai/lessons"
            buttonLabel="Browse Lessons →"
            badge="HSK 1–6"
          />

          <LaoshiCard
            icon="🧠"
            eyebrow="Personal Review"
            title="Smart Review"
            description="Review difficult sentences and weak characters automatically selected from your history."
            href="/dashboard/ai/pronunciation/review"
            buttonLabel="Start Smart Review →"
            badge="Adaptive"
          />

          <LaoshiCard
            icon="📈"
            eyebrow="Your Results"
            title="Speaking Progress"
            description="View daily goals, streaks, average scores, recent attempts and weak characters."
            href="/dashboard/ai/pronunciation/progress"
            buttonLabel="View Progress →"
            badge="Dashboard"
          />

          <LaoshiCard
            icon="📚"
            eyebrow="Language Patterns"
            title="Grammar Coach"
            description="Learn useful grammar patterns and practice them through guided speaking exercises."
            buttonLabel="Coming Soon"
            badge="V7"
            disabled
          />
        </div>
      </section>
    </main>
  );
}