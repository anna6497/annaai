import Link from "next/link";

export const metadata = {
  title: "Grammar Coach | Anna AI",
  description:
    "Practice Chinese grammar patterns with Your Laoshi.",
};

export default function GrammarCoachPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071018] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-violet-500/15 blur-[120px]" />
      </div>

      <section className="relative mx-auto flex min-h-[75vh] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[34px] border border-blue-300/15 bg-white/[0.055] p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-blue-300/20 bg-blue-400/10 text-5xl">
            📚
          </div>

          <p className="mt-7 text-xs font-black uppercase tracking-[0.28em] text-blue-300">
            Your Laoshi
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Grammar Coach
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/55">
            Grammar patterns, guided examples and
            speaking exercises are coming in a future
            Anna AI update.
          </p>

          <div className="mt-7 inline-flex rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm font-black text-amber-100">
            Coming Soon
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/ai/laoshi"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-black text-white/75 transition hover:bg-white/10"
            >
              ← Your Laoshi
            </Link>

            <Link
              href="/dashboard/ai/lessons"
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 font-black text-white"
            >
              Open Speaking Lessons
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}