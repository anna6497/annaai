import Link from "next/link";
import ChatWindow from "@/components/ai/ChatWindow";
import { getAiSpeakingAccess } from "@/lib/ai-speaking-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Talk with Anna | Anna AI",
  description: "Practice natural Chinese conversation with Anna.",
};

export default async function TalkWithAnnaPage() {
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
            Talk with Anna ကိုအသုံးပြုရန် active AI Speaking plan လိုအပ်ပါတယ်။
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
    <main className="relative min-h-screen overflow-hidden bg-[#090014] px-3 py-3 text-white sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 sm:mb-5">
          <Link
            href="/dashboard/ai"
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 backdrop-blur-xl transition hover:border-purple-300/30 hover:bg-white/10 hover:text-white"
          >
            ← Choose AI Partner
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/ai/pronunciation"
              className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/15"
            >
              🎓 Your Laoshi
            </Link>

            <Link href="/" className="text-sm font-black text-white/80 transition hover:text-purple-300">
              🤖 Anna-AI
            </Link>
          </div>
        </div>

        <ChatWindow />
      </div>
    </main>
  );
}