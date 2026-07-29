import Link from "next/link";
import ChatWindow from "@/components/ai/ChatWindow";
import { getAiSpeakingAccess } from "@/lib/ai-speaking-access";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  const access = await getAiSpeakingAccess();

  if (!access.active) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090010] px-4 text-white">
        <section className="w-full max-w-xl rounded-[32px] border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-fuchsia-300/25 bg-fuchsia-500/15 text-4xl">🎙️</div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-fuchsia-300">AI Speaking Access</p>
          <h1 className="mt-3 text-3xl font-black">Active Plan Required</h1>
          <p lang="my" className="mt-4 text-sm leading-8 text-white/55">
            AI Speaking မှာ Free Trial မရှိပါ။ Chinese Practice နဲ့ Sentence Builder ကို အသုံးပြုရန် plan တစ်ခု ဝယ်ယူပေးပါ။
          </p>
          <Link href="/dashboard/ai/pricing" className="mt-7 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-4 font-black">
            View AI Speaking Plans
          </Link>
        </section>
      </main>
    );
  }

  return <ChatWindow />;
}
