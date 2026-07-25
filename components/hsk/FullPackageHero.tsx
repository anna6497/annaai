"use client";

import Link from "next/link";

import { formatMmk } from "@/lib/hsk-products";
import type { HskProduct } from "@/types/access";

interface FullPackageHeroProps {
  product: HskProduct;
  unlocked: boolean;
}

function calculateDiscount(
  originalPrice: number | null,
  salePrice: number,
): number {
  if (!originalPrice || originalPrice <= 0) {
    return 0;
  }

  return Math.round(
    ((originalPrice - salePrice) / originalPrice) * 100,
  );
}

export default function FullPackageHero({
  product,
  unlocked,
}: FullPackageHeroProps) {
  const discount = calculateDiscount(
    product.originalPriceMmk,
    product.priceMmk,
  );

  return (
    <section className="group relative mb-12 overflow-hidden rounded-[2.5rem] border border-emerald-300/25 bg-gradient-to-br from-emerald-950 via-teal-950 to-[#12051f] p-[1px] shadow-[0_0_60px_rgba(16,185,129,0.15)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_90px_rgba(16,185,129,0.3)]">
      {/* Animated background glow */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl transition-all duration-700 group-hover:bg-emerald-400/30" />

      <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl transition-all duration-700 group-hover:bg-fuchsia-500/30" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      {/* Discount badge */}
      {discount > 0 && !unlocked && (
        <div className="absolute right-4 top-4 z-20 sm:right-7 sm:top-7">
          <div className="animate-[float_3s_ease-in-out_infinite] rounded-full border border-red-300/40 bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-center shadow-[0_0_30px_rgba(239,68,68,0.45)]">
            <p className="text-xs font-black uppercase tracking-wider text-white">
              🔥 Save
            </p>

            <p className="text-2xl font-black text-white">
              {discount}%
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 rounded-[calc(2.5rem-1px)] bg-black/20 p-6 backdrop-blur-xl sm:p-10 lg:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Left content */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                ✨ Limited Time Offer
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/70">
                Lifetime Access
              </span>
            </div>

            <p className="mt-8 text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Most Popular Package
            </p>

            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              HSK 2–9
              <span className="block bg-gradient-to-r from-emerald-300 via-cyan-200 to-fuchsia-300 bg-clip-text text-transparent">
                Full Package
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
              Unlock Flashcards and Writing practice for all
              levels from HSK 2 to HSK 9 with one lifetime
              purchase.
            </p>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
              <FeatureItem icon="📇" text="HSK 2–9 Flashcards" />
              <FeatureItem icon="✍️" text="HSK 2–9 Writing" />
              <FeatureItem icon="♾️" text="Lifetime Access" />
              <FeatureItem icon="✨" text="Future Content Updates" />
            </div>
          </div>

          {/* Right pricing section */}
          <div className="relative rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            {unlocked ? (
              <div className="mb-5 inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-300">
                ✅ Package Unlocked
              </div>
            ) : (
              <div className="mb-5 inline-flex rounded-full border border-yellow-300/25 bg-yellow-400/10 px-4 py-2 text-sm font-black text-yellow-200">
                🎁 Promotional Price
              </div>
            )}

            {product.originalPriceMmk && !unlocked && (
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-white/35">
                  Normal Price
                </p>

                <p className="mt-2 text-2xl font-black text-white/35 line-through decoration-red-400 decoration-2">
                  {formatMmk(product.originalPriceMmk)}
                </p>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                {unlocked ? "Your Access" : "Now Only"}
              </p>

              <p className="mt-2 text-4xl font-black text-white sm:text-5xl">
                {unlocked
                  ? "Lifetime"
                  : formatMmk(product.priceMmk)}
              </p>

              {!unlocked && (
                <p className="mt-3 text-sm font-bold text-emerald-300">
                  One-time payment · No monthly fee
                </p>
              )}
            </div>

            {!unlocked && discount > 0 && (
              <div className="mt-6 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-4">
                <p className="text-sm text-white/55">
                  You save
                </p>

                <p className="mt-1 text-2xl font-black text-emerald-200">
                  {formatMmk(
                    (product.originalPriceMmk ?? 0) -
                      product.priceMmk,
                  )}
                </p>
              </div>
            )}

            <Link
              href={
                unlocked
                  ? "/hsk"
                  : `/payment?hsk=${encodeURIComponent(
                      product.code,
                    )}`
              }
              className={`mt-7 flex w-full items-center justify-center rounded-2xl px-6 py-4 text-center text-lg font-black transition-all duration-300 ${
                unlocked
                  ? "bg-emerald-600 text-white hover:scale-[1.02] hover:bg-emerald-500"
                  : "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-emerald-500 text-white shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:scale-[1.03] hover:shadow-[0_0_45px_rgba(16,185,129,0.4)]"
              }`}
            >
              {unlocked
                ? "Open Full Package →"
                : "🚀 Buy Full Package"}
            </Link>

            {!unlocked && (
              <p className="mt-4 text-center text-xs text-white/35">
                HSK 2 to HSK 9 · Flashcards + Writing
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface FeatureItemProps {
  icon: string;
  text: string;
}

function FeatureItem({
  icon,
  text,
}: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
      <span className="text-xl">{icon}</span>

      <span className="text-sm font-bold text-white/75">
        {text}
      </span>
    </div>
  );
}