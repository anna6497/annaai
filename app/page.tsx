import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <h1 className="text-3xl font-bold">🤖 Anna-AI</h1>

        <button className="rounded-xl bg-white/10 px-5 py-2 hover:bg-white/20">
          Login
        </button>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <div>
          <div className="inline-block rounded-full bg-purple-500/20 px-4 py-2 text-sm">
            ✨ 3 Days Free Trial
          </div>

          <h2 className="mt-6 text-5xl font-extrabold leading-tight sm:text-6xl">
            Speak Chinese
            <br />
            with your
            <span className="block text-purple-300">AI Best Friend</span>
          </h2>

          <p className="mt-6 max-w-lg text-lg text-purple-100">
            ဖုန်းပြောနေသလို တရုတ်စကားလေ့ကျင့်ပါ။ Anna က ဆရာမလို
            မဟုတ်ဘဲ သူငယ်ချင်းတစ်ယောက်လို သဘာဝကျကျ ပြန်ပြောပေးမယ်။
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/call"
              className="rounded-2xl bg-purple-500 px-8 py-4 text-center text-lg font-bold hover:bg-purple-400"
            >
              🎙️ Start Talking
            </Link>

            <a
              href="#pricing"
              className="rounded-2xl border border-white/20 px-8 py-4 text-center hover:bg-white/10"
            >
              View Pricing
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-purple-200">
            <span>✅ AI Voice Call</span>
            <span>✅ Live Caption</span>
            <span>✅ Friendly Replies</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-[360px] rounded-[40px] border border-white/20 bg-black/30 p-5 backdrop-blur">
            <div className="rounded-[32px] bg-gradient-to-b from-purple-700 to-slate-950 p-6">
              <div className="text-center">
                <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-purple-300/20 text-8xl">
                  👧🏻
                </div>

                <h2 className="mt-6 text-3xl font-bold">Anna</h2>

                <p className="text-purple-200">
                  Your Chinese AI Friend
                </p>

                <p className="mt-2 text-green-300">● Online</p>
              </div>

              <div className="mt-8 rounded-3xl bg-white/10 p-5 text-center">
                <p className="text-xl font-bold">你好呀！</p>

                <p className="mt-2">Nǐ hǎo ya!</p>

                <p className="mt-2 text-purple-200">ဟိုင်း 😊</p>
              </div>

              <div className="mt-10 flex items-center justify-center gap-8">
                <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl">
                  🔇
                </button>

                <button className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-3xl shadow-lg">
                  📞
                </button>

                <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl">
                  🔊
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-4xl font-bold sm:text-5xl">
          Choose Your Plan
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-white/10 p-8">
            <h3 className="text-2xl font-bold">Monthly</h3>

            <p className="mt-5 text-4xl font-bold">20,000 MMK</p>

            <p className="mt-2 text-white/60">per month</p>
          </div>

          <div className="rounded-3xl border-2 border-purple-400 bg-purple-500/20 p-8">
            <div className="mb-4 inline-block rounded-full bg-purple-400 px-3 py-1 text-sm font-bold text-purple-950">
              SAVE 40,000
            </div>

            <h3 className="text-2xl font-bold">Yearly</h3>

            <p className="mt-2 text-white/50 line-through">
              240,000 MMK
            </p>

            <p className="text-4xl font-bold">200,000 MMK</p>

            <p className="mt-2 text-white/60">per year</p>
          </div>
        </div>
      </section>
    </main>
  );
}