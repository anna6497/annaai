import Link from "next/link";

import { getAiSpeakingAccess } from "@/lib/ai-speaking-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Choose AI Mode | Anna AI",
  description:
    "Choose between natural conversation with Anna and guided Chinese learning with Your Laoshi.",
};

export default async function AiModePage() {
  const access = await getAiSpeakingAccess();

  if (!access.active) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090010] px-4 text-white">
        <section className="w-full max-w-xl rounded-[32px] border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-fuchsia-300/25 bg-fuchsia-500/15 text-4xl">
            🎙️
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-fuchsia-300">
            AI Speaking Access
          </p>
          <h1 className="mt-3 text-3xl font-black">
            Active Plan Required
          </h1>
          <p lang="my" className="mt-4 text-sm leading-8 text-white/55">
            AI Speaking မှာ Free Trial မရှိပါ။ Talk with Anna နဲ့
            Your Laoshi ကိုအသုံးပြုရန် active plan တစ်ခုလိုအပ်ပါတယ်။
          </p>
          <Link
            href="/dashboard/ai/pricing"
            className="mt-7 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-4 font-black"
          >
            View AI Speaking Plans
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090014] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      </div>

      <section className="relative mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75"
          >
            ← Back to Dashboard
          </Link>
          <Link href="/" className="text-sm font-black text-white/80">
            🤖 Anna-AI
          </Link>
        </div>

        <header className="mx-auto mt-12 max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-fuchsia-300">
            Anna AI Speaking
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Choose Your AI Partner
          </h1>
          <p lang="my" className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/55">
            Natural conversation လေ့ကျင့်ချင်ရင် Anna ကိုရွေးပါ။
            Pronunciation၊ lessons၊ Smart Review နဲ့ progress tracking
            လေ့ကျင့်ချင်ရင် Your Laoshi ကိုရွေးပါ။
          </p>
        </header>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <ModeCard
            eyebrow="AI FRIEND"
            title="Talk with Anna"
            description="Practice natural Chinese conversation with Anna using voice, Hanzi, Pinyin and conversation memory."
            icon="💜"
            href="/dashboard/ai/talk"
            buttonLabel="Start Talking →"
            accent="anna"
          />
          <ModeCard
            eyebrow="AI TEACHER"
            title="Your Laoshi"
            description="Learn Chinese step by step with pronunciation, structured lessons, Smart Review and progress tracking."
            icon="🎓"
            href="/dashboard/ai/laoshi"
            buttonLabel="Start Learning →"
            accent="laoshi"
          />
        </div>
      </section>
    </main>
  );
}

function ModeCard({
  eyebrow,
  title,
  description,
  icon,
  href,
  buttonLabel,
  accent,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  buttonLabel: string;
  accent: "anna" | "laoshi";
}) {
  const isAnna = accent === "anna";

  return (
    <article className={`relative overflow-hidden rounded-[34px] border p-7 shadow-2xl ${
      isAnna
        ? "border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-950/85 via-violet-950/85 to-slate-950/90"
        : "border-cyan-300/20 bg-gradient-to-br from-cyan-950/85 via-emerald-950/75 to-slate-950/90"
    }`}>
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.28em] ${
            isAnna ? "text-fuchsia-300" : "text-cyan-300"
          }`}>
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            {title}
          </h2>
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/10 bg-white/5 text-4xl">
          {icon}
        </div>
      </div>

      <p className="mt-6 text-base leading-8 text-white/58">
        {description}
      </p>

      <Link
        href={href}
        className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-6 py-4 text-base font-black text-white ${
          isAnna
            ? "bg-gradient-to-r from-fuchsia-600 to-violet-600"
            : "bg-gradient-to-r from-emerald-500 to-cyan-500"
        }`}
      >
        {buttonLabel}
      </Link>
    </article>
  );
}
