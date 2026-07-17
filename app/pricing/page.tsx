"use client";

import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090014] text-white">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-purple-700/30 blur-3xl" />

        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-fuchsia-600/25 blur-3xl" />

        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8 sm:py-10">
        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold sm:text-xl"
          >
            <span className="text-3xl">🤖</span>
            <span>Anna-AI</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold transition hover:bg-white/10 sm:px-4 sm:text-sm"
            >
              Dashboard
            </Link>

            <Link
              href="/call"
              className="rounded-full border border-purple-300/20 bg-purple-500/15 px-3 py-2 text-xs font-semibold text-purple-100 transition hover:bg-purple-500/25 sm:px-4 sm:text-sm"
            >
              Start Talking
            </Link>
          </div>
        </header>

        {/* Coming soon content */}
        <section className="flex flex-1 items-center justify-center py-16">
          <div className="w-full max-w-2xl">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.06] p-7 text-center shadow-2xl backdrop-blur-xl sm:p-12">
              {/* Inner glow */}
              <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-purple-600/20 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-24 -right-20 h-60 w-60 rounded-full bg-fuchsia-600/20 blur-3xl" />

              <div className="relative">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-purple-300/20 bg-gradient-to-br from-purple-600/30 to-fuchsia-600/20 text-5xl shadow-xl">
                  🚀
                </div>

                <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
                  Coming Soon
                </div>

                <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">
                  Anna-AI Premium Plans
                  <span className="mt-2 block bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                    Coming Soon
                  </span>
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/60 sm:text-lg">
                  Anna-AI ရဲ့ Premium Plan နဲ့ Pricing များကို
                  လက်ရှိပြင်ဆင်နေပါတယ်။
                  ပိုကောင်းတဲ့ Chinese speaking experience နဲ့အတူ
                  မကြာမီ ဖွင့်လှစ်ပေးသွားပါမယ်။
                </p>

                <div className="mx-auto mt-8 grid max-w-lg gap-3 text-left sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-2xl">🎤</div>

                    <p className="mt-3 font-bold">
                      AI Voice Practice
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/45">
                      Anna နဲ့ သဘာဝကျကျ တရုတ်စကားပြော လေ့ကျင့်နိုင်မယ်။
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-2xl">✨</div>

                    <p className="mt-3 font-bold">
                      Premium Features
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/45">
                      အသစ်ထည့်သွင်းမယ့် features များ မကြာမီလာမယ်။
                    </p>
                  </div>
                </div>

                <Link
                  href="/call"
                  className="mt-9 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-4 font-bold shadow-lg shadow-purple-950/40 transition hover:scale-[1.01] hover:opacity-95 active:scale-[0.99] sm:w-auto sm:min-w-60"
                >
                  🎙️ Continue Free Trial
                </Link>

                <p className="mt-5 text-xs leading-5 text-white/35">
                  Premium pricing ဖွင့်လှစ်သည့်အခါ
                  Anna-AI မှ အသိပေးသွားပါမယ်။
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-6 text-center text-sm text-white/30">
          © 2026 Anna-AI. Your Chinese AI Friend.
        </footer>
      </div>
    </main>
  );
}