import Link from "next/link";
import { createClient } from "../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <h1 className="text-3xl font-bold">🤖 Anna-AI</h1>
        <Link href={isLoggedIn ? "/call" : "/login?next=/call"} className="rounded-xl bg-white/10 px-5 py-2 hover:bg-white/20">{isLoggedIn ? "Continue" : "Login"}</Link>
      </nav>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
        <div>
          <div className="inline-block rounded-full bg-purple-500/20 px-4 py-2 text-sm">✨ 3 Days Free Trial</div>
          <h2 className="mt-6 text-5xl font-extrabold leading-tight sm:text-6xl">Speak Chinese<br />with your<span className="block text-purple-300">AI Best Friend</span></h2>
          <p className="mt-6 max-w-lg text-lg text-purple-100">ဖုန်းပြောနေသလို တရုတ်စကားလေ့ကျင့်ပါ။ Anna က ဆရာမလိုမဟုတ်ဘဲ သူငယ်ချင်းတစ်ယောက်လို သဘာဝကျကျ ပြန်ပြောပေးမယ်။</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href={isLoggedIn ? "/call" : "/login?next=/call"} className="rounded-2xl bg-purple-500 px-8 py-4 text-center text-lg font-bold hover:bg-purple-400">🎙️ Start Talking</Link>
            <Link href="/pricing" className="rounded-2xl border border-white/20 px-8 py-4 text-center hover:bg-white/10">View Pricing</Link>
          </div>
        </div>
        <div className="flex justify-center text-center"><div className="w-full max-w-sm rounded-[42px] border border-white/15 bg-black/25 p-8 backdrop-blur"><div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-purple-400/20 text-8xl">👧🏻</div><h2 className="mt-6 text-4xl font-bold">Anna</h2><p className="mt-2 text-purple-200">Your Chinese AI Friend</p><p className="mt-3 text-green-300">● Online</p></div></div>
      </section>
    </main>
  );
}
