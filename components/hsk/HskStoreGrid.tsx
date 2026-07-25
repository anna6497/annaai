import Link from "next/link";
import HskAccessBadge from "@/components/access/HskAccessBadge";

interface HskStoreGridProps {
  unlockedLevels: number[];
  fullPackage: boolean;
}

const LEVEL_PRICE = 10_000;
const FULL_PROMO_PRICE = 25_000;
const FULL_ORIGINAL_PRICE = 80_000;

export default function HskStoreGrid({
  unlockedLevels,
  fullPackage,
}: HskStoreGridProps) {
  const unlocked = new Set(unlockedLevels);

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }, (_, index) => {
        const level = index + 1;
        const free = level === 1;
        const purchased =
          free || fullPackage || unlocked.has(level);

        return (
          <article
            key={level}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-white/35">
                  HSK 3.0
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  HSK {level}
                </h2>
              </div>

              <HskAccessBadge
                unlocked={purchased}
                free={free}
              />
            </div>

            <p className="mt-4 leading-7 text-white/50">
              Flashcards, Writing practice and vocabulary access.
            </p>

            <div className="mt-6">
              {free ? (
                <p className="text-2xl font-black text-cyan-300">
                  Free
                </p>
              ) : (
                <p className="text-2xl font-black">
                  {LEVEL_PRICE.toLocaleString()} MMK
                </p>
              )}
            </div>

            {purchased ? (
              <Link
                href={`/hsk/flashcards/${level}`}
                className="mt-6 block rounded-2xl bg-emerald-600 px-5 py-3 text-center font-black transition hover:bg-emerald-500"
              >
                Open HSK {level}
              </Link>
            ) : (
              <Link
                href={`/payment?hsk=hsk_${level}`}
                className="mt-6 block rounded-2xl bg-fuchsia-600 px-5 py-3 text-center font-black transition hover:bg-fuchsia-500"
              >
                Buy HSK {level}
              </Link>
            )}
          </article>
        );
      })}

      <article className="rounded-3xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-6 md:col-span-2 xl:col-span-3">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-200">
              Best Value
            </p>
            <h2 className="mt-2 text-3xl font-black">
              HSK 2–9 Full Package
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/55">
              Lifetime access to all paid Flashcards, Writing and Vocabulary levels.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-lg text-white/35 line-through">
                {FULL_ORIGINAL_PRICE.toLocaleString()} MMK
              </span>
              <span className="text-3xl font-black text-fuchsia-200">
                {FULL_PROMO_PRICE.toLocaleString()} MMK
              </span>
              <span className="rounded-full bg-fuchsia-500 px-3 py-1 text-xs font-black">
                SAVE 69%
              </span>
            </div>
          </div>

          {fullPackage ? (
            <Link
              href="/hsk/flashcards/2"
              className="rounded-2xl bg-emerald-600 px-6 py-4 text-center font-black transition hover:bg-emerald-500"
            >
              ✅ Purchased — Open
            </Link>
          ) : (
            <Link
              href="/payment?hsk=hsk_full"
              className="rounded-2xl bg-fuchsia-600 px-6 py-4 text-center font-black transition hover:bg-fuchsia-500"
            >
              Buy Full Package
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}
