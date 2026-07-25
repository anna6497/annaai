"use client";

import Link from "next/link";

const PAID_LEVELS = [2, 3, 4, 5, 6, 7, 8, 9] as const;

function paymentHref(product: string) {
  return `/payment?product=${encodeURIComponent(product)}`;
}

export default function HskStoreGrid() {
  return (
    <div>
      <section className="store-reveal relative mb-10 overflow-hidden rounded-[2.25rem] border border-fuchsia-400/50 bg-gradient-to-br from-fuchsia-950 via-purple-950 to-[#17001f] p-[1px] shadow-[0_0_70px_rgba(217,70,239,0.22)]">
        <div className="store-glow absolute inset-0 opacity-70" />
        <div className="store-sparkle store-sparkle-one">✦</div>
        <div className="store-sparkle store-sparkle-two">✦</div>
        <div className="store-sparkle store-sparkle-three">✦</div>

        <div className="relative overflow-hidden rounded-[calc(2.25rem-1px)] bg-[#17001f]/95 p-6 sm:p-9 lg:p-10">
          <div className="store-shimmer pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/12 to-transparent" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="store-badge rounded-full bg-fuchsia-500 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_0_28px_rgba(217,70,239,0.65)]">
                  ⭐ Best Value
                </span>
                <span className="rounded-full border border-fuchsia-300/20 bg-white/5 px-4 py-2 text-xs font-bold text-fuchsia-100">
                  Lifetime access
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black sm:text-5xl">
                HSK 2–9 Full Package
              </h2>

              <p className="mt-4 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
                Unlock all paid Flashcards, Writing Practice and Vocabulary
                levels from HSK 2 through HSK 9.
              </p>

              <div className="mt-7 flex flex-wrap items-end gap-4">
                <span className="pb-1 text-xl font-bold text-white/35 line-through decoration-2">
                  80,000 MMK
                </span>
                <span className="text-4xl font-black text-fuchsia-100 sm:text-5xl">
                  25,000 MMK
                </span>
                <span className="store-discount rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-sm font-black">
                  SAVE 69%
                </span>
              </div>
            </div>

            <Link
              href={paymentHref("hsk_full")}
              className="store-buy-button group relative inline-flex min-h-16 min-w-64 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-fuchsia-600 px-8 py-5 text-center text-lg font-black shadow-[0_0_40px_rgba(217,70,239,0.35)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(217,70,239,0.55)]"
            >
              <span className="store-button-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/25" />
              <span className="relative">
                Buy Full Package
                <span className="ml-2 inline-block transition group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <div className="mb-5">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-white/35">
          Individual levels
        </p>
        <h2 className="mt-2 text-2xl font-black">Buy one level</h2>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {PAID_LEVELS.map((level, index) => (
          <article
            key={level}
            className="store-level-card group rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/35 hover:bg-fuchsia-500/[0.06]"
            style={{ animationDelay: `${120 + index * 70}ms` }}
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Lifetime access</p>
            <h3 className="mt-3 text-3xl font-black">HSK {level}</h3>
            <p className="mt-3 min-h-12 text-sm leading-6 text-white/50">
              Flashcards, Writing Practice and Vocabulary for HSK {level}.
            </p>
            <p className="mt-7 text-3xl font-black">10,000 MMK</p>
            <Link
              href={paymentHref(`hsk_${level}`)}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-fuchsia-600 px-5 py-4 font-black transition group-hover:bg-fuchsia-500"
            >
              Buy HSK {level}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
