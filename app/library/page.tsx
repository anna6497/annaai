"use client";

import Link from "next/link";

export default function LibraryPage() {
  return (
    <main className="min-h-screen bg-[#09030f] px-4 pb-28 pt-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <header>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">
                Anna AI
              </p>

              <h1 className="mt-2 text-4xl font-black">
                Anna&apos;s Library
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                Choose your library and explore Chinese learning resources.
              </p>
            </div>

            <Link
              href="/app-home"
              className="flex h-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-bold text-white/70"
            >
              ← Home
            </Link>
          </div>
        </header>

        {/* LIBRARY OPTIONS */}
        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {/* FREE */}
          <Link
            href="/library/free"
            className="group relative overflow-hidden rounded-[30px] border border-emerald-400/20 bg-gradient-to-br from-[#0c271f] via-[#10151b] to-[#09030f] p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/40"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 text-3xl">
                📚
              </div>

              <p className="mt-7 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">
                Free Library
              </p>

              <h2 className="mt-2 text-2xl font-black">
                For Free User
              </h2>

              <p className="mt-3 min-h-[48px] text-sm leading-6 text-white/45">
                Explore free Grammar, Vocabulary, HSK notes and Chinese learning resources.
              </p>

              <div className="mt-8 flex h-12 items-center justify-between rounded-2xl bg-emerald-400/10 px-5 text-sm font-black text-emerald-200">
                <span>
                  Browse Free Resources
                </span>

                <span className="text-lg transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </Link>

          {/* PREMIUM */}
          <Link
            href="/library/premium"
            className="group relative overflow-hidden rounded-[30px] border border-fuchsia-400/20 bg-gradient-to-br from-[#35103c] via-[#17101c] to-[#09030f] p-7 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-300/40"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-fuchsia-500/15 blur-3xl" />

            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-fuchsia-400/20 bg-fuchsia-500/10 text-3xl">
                👑
              </div>

              <p className="mt-7 text-[11px] font-black uppercase tracking-[0.2em] text-fuchsia-300">
                Premium Library
              </p>

              <h2 className="mt-2 text-2xl font-black">
                For Paid User
              </h2>

              <p className="mt-3 min-h-[48px] text-sm leading-6 text-white/45">
                Access premium Anna AI worksheets, notes and exclusive learning materials.
              </p>

              <div className="mt-8 flex h-12 items-center justify-between rounded-2xl bg-fuchsia-500/10 px-5 text-sm font-black text-fuchsia-200">
                <span>
                  Browse Premium Resources
                </span>

                <span className="text-lg transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* INFO */}
        <section className="mt-6 rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5">
          <p className="text-xs font-bold text-white/55">
            Anna AI Library
          </p>

          <p className="mt-2 text-xs leading-5 text-white/35">
            Resources are organized by category so you can quickly find the materials you want to study.
          </p>
        </section>
      </div>
    </main>
  );
}