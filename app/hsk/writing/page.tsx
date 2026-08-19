import Link from "next/link";

import {
  getServerHskAccessMap,
} from "@/lib/server-hsk-access";

const HSK_LEVELS = [
  {
    level: 1,
    label: "Beginner",
    description:
      "Practice basic Chinese characters and stroke order.",
  },
  {
    level: 2,
    label: "Beginner",
    description:
      "Build confidence writing common Chinese characters.",
  },
  {
    level: 3,
    label: "Elementary",
    description:
      "Practice more useful HSK Chinese characters.",
  },
  {
    level: 4,
    label: "Intermediate",
    description:
      "Improve character recognition and writing accuracy.",
  },
  {
    level: 5,
    label: "Intermediate",
    description:
      "Practice more complex Chinese characters.",
  },
  {
    level: 6,
    label: "Upper Intermediate",
    description:
      "Strengthen advanced character writing skills.",
  },
  {
    level: 7,
    label: "Advanced",
    description:
      "Practice advanced Chinese characters.",
  },
  {
    level: 8,
    label: "Advanced",
    description:
      "Develop high-level Chinese writing ability.",
  },
  {
    level: 9,
    label: "Advanced",
    description:
      "Master advanced HSK Chinese characters.",
  },
] as const;

export default async function WritingPage() {
  const accessMap =
    await getServerHskAccessMap();

  return (
    <main className="min-h-screen bg-[#080011] px-4 pb-32 pt-6 text-white">
      <div className="mx-auto w-full max-w-4xl">

        <header>
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/hsk"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              ← HSK
            </Link>

            <span className="rounded-full border border-fuchsia-300/10 bg-fuchsia-500/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-fuchsia-200">
              Writing
            </span>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-300/10 bg-fuchsia-500/10 text-2xl">
                ✍️
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300">
                  HSK 3.0
                </p>

                <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                  Chinese Writing
                </h1>
              </div>
            </div>

            <p
              lang="my"
              className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/45"
            >
              HSK 1 မှ 9 အထိ Chinese
              characters တွေကို stroke order,
              animation နဲ့ writing practice
              လေ့ကျင့်နိုင်ပါတယ်။
            </p>
          </div>
        </header>

        <section className="mt-7 rounded-[22px] border border-fuchsia-300/10 bg-gradient-to-r from-fuchsia-500/[0.08] to-purple-500/[0.03] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10">
              ✍️
            </div>

            <div>
              <p className="text-xs font-black text-fuchsia-200">
                Stroke Order + Practice
              </p>

              <p
                lang="my"
                className="mt-1 text-[11px] font-medium leading-5 text-white/40"
              >
                Character ကိုရွေးပြီး stroke
                animation ကြည့်နိုင်သလို
                ကိုယ်တိုင်လည်း ရေးလေ့ကျင့်နိုင်ပါတယ်။
              </p>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-300">
                Levels
              </p>

              <h2 className="mt-1 text-lg font-black">
                HSK 1–9
              </h2>
            </div>

            <span className="text-[10px] font-bold text-white/25">
              9 Levels
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {HSK_LEVELS.map((item) => {
              const unlocked =
                accessMap[item.level];

              const isFree =
                item.level === 1;

              return (
                <Link
                  key={item.level}
                  href={`/hsk/writing/${item.level}`}
                  className="group relative min-h-[185px] overflow-hidden rounded-[24px] border border-white/10 bg-[#16091f] p-5 transition duration-200 hover:-translate-y-1 hover:border-fuchsia-300/25 hover:bg-[#1c0b27]"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-fuchsia-500/10 blur-2xl transition group-hover:bg-fuchsia-500/20" />

                  <div className="relative flex items-start justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/35">
                      HSK
                    </span>

                    {isFree ? (
                      <span className="rounded-full border border-emerald-300/10 bg-emerald-500/10 px-2 py-1 text-[8px] font-black uppercase text-emerald-300">
                        FREE
                      </span>
                    ) : unlocked ? (
                      <span className="rounded-full border border-emerald-300/10 bg-emerald-500/10 px-2 py-1 text-[8px] font-black uppercase text-emerald-300">
                        ✓ UNLOCKED
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[8px] font-black uppercase text-white/35">
                        🔒 LOCKED
                      </span>
                    )}
                  </div>

                  <div className="relative mt-3">
                    <p className="bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-4xl font-black text-transparent">
                      {item.level}
                    </p>

                    <p className="mt-1 text-xs font-black text-white/85">
                      {item.label}
                    </p>
                  </div>

                  <p className="relative mt-3 line-clamp-2 text-[10px] font-medium leading-5 text-white/30">
                    {item.description}
                  </p>

                  <div className="relative mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-black text-fuchsia-300">
                      {unlocked
                        ? "Open Writing"
                        : "View Access"}
                    </span>

                    <span className="text-fuchsia-300 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="h-10" />
      </div>
    </main>
  );
}