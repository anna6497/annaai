"use client";

import Link from "next/link";

type LearningCategory = {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  href: string;
  badge?: string;
};

const categories: LearningCategory[] = [
  {
    title: "Flashcards",
    subtitle: "Vocabulary Flashcards",
    description:
      "HSK 1–9 vocabulary ကို Hanzi, Pinyin, Myanmar & English meanings နဲ့ လေ့လာပါ။",
    icon: "🗂️",
    href: "/hsk/flashcards",
    badge: "HSK 1–9",
  },
  {
    title: "Writing",
    subtitle: "Chinese Characters",
    description:
      "HSK level အလိုက် Chinese characters ရေးနည်း၊ stroke practice နဲ့ writing lessons လေ့လာပါ။",
    icon: "✍️",
    href: "/hsk/writing",
    badge: "HSK 1–9",
  },
  {
    title: "Reading & Listening",
    subtitle: "Stories + Audio",
    description:
      "HSK level အလိုက် Chinese stories ဖတ်ပြီး Pinyin, Myanmar translation နဲ့ native-style audio နားထောင်ပါ။",
    icon: "📖",
    href: "/hsk/reading",
    badge: "180 Stories",
  },
  {
    title: "Dictionary",
    subtitle: "Chinese Dictionary",
    description:
      "Hanzi, Pinyin, Myanmar သို့မဟုတ် English နဲ့ Chinese vocabulary ကိုရှာပါ။",
    icon: "🔎",
    href: "/hsk/dictionary",
    badge: "Search",
  },
];

export default function HskPage() {
  return (
    <main className="min-h-screen bg-[#080011] px-4 pb-32 pt-6 text-white">
      <div className="mx-auto w-full max-w-3xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <header>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-300/10 bg-fuchsia-500/15 text-2xl shadow-lg shadow-fuchsia-950/20">
                学
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300">
                  HSK 3.0
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                  HSK Learning
                </h1>
              </div>
            </div>

            <Link
              href="/hsk/store"
              className="shrink-0 rounded-xl border border-fuchsia-300/20 bg-fuchsia-500/10 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-fuchsia-200 transition hover:bg-fuchsia-500/20"
            >
              Store
            </Link>
          </div>

          <p
            lang="my"
            className="mt-5 max-w-2xl text-sm font-medium leading-7 text-white/50"
          >
            Chinese vocabulary, writing, reading,
            listening နဲ့ dictionary ကို
            category အလိုက် လွယ်လွယ်ကူကူ
            လေ့လာနိုင်ပါတယ်။
          </p>
        </header>

        {/* =================================================
            FREE INFORMATION
        ================================================= */}

        <section className="mt-6 rounded-[22px] border border-emerald-400/20 bg-emerald-500/[0.07] p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
              🎁
            </div>

            <div>
              <p className="text-sm font-black text-emerald-300">
                HSK 1 is Free
              </p>

              <p
                lang="my"
                className="mt-1 text-xs font-medium leading-5 text-emerald-100/55"
              >
                HSK 1 Flashcards, Writing နဲ့ Reading
                & Listening ကို free အသုံးပြုနိုင်ပါတယ်။
                HSK 2–9 အတွက် ဝယ်ထားတဲ့ account နဲ့
                access ရရှိပါမယ်။
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            CATEGORY TITLE
        ================================================= */}

        <section className="mt-9">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            Learning Categories
          </p>

          <h2 className="mt-2 text-xl font-black">
            What do you want to study?
          </h2>
        </section>

        {/* =================================================
            CATEGORY CARDS
        ================================================= */}

        <section className="mt-5 grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#160820] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-fuchsia-300/20 hover:bg-[#1b0a27]"
            >
              {/* glow */}

              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-500/[0.06] blur-3xl transition group-hover:bg-fuchsia-500/[0.12]" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.05] text-2xl">
                    {category.icon}
                  </div>

                  {category.badge ? (
                    <span className="rounded-full border border-fuchsia-300/10 bg-fuchsia-400/[0.08] px-3 py-1 text-[9px] font-black uppercase tracking-wider text-fuchsia-200/80">
                      {category.badge}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-5 text-xl font-black transition group-hover:text-fuchsia-200">
                  {category.title}
                </h3>

                <p className="mt-1 text-xs font-bold text-fuchsia-300/55">
                  {category.subtitle}
                </p>

                <p
                  lang="my"
                  className="mt-4 min-h-[60px] text-xs font-medium leading-6 text-white/40"
                >
                  {category.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-xs font-black text-fuchsia-300">
                    Open
                  </span>

                  <span className="text-lg text-fuchsia-300 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* =================================================
            QUICK INFO
        ================================================= */}

        <section className="mt-8 rounded-[26px] border border-white/10 bg-white/[0.025] p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
            Anna AI HSK
          </p>

          <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 text-center">
            <div className="px-2">
              <p className="text-xl font-black text-fuchsia-300">
                9
              </p>

              <p className="mt-1 text-[10px] font-bold text-white/30">
                HSK Levels
              </p>
            </div>

            <div className="px-2">
              <p className="text-xl font-black text-fuchsia-300">
                180
              </p>

              <p className="mt-1 text-[10px] font-bold text-white/30">
                Reading Stories
              </p>
            </div>

            <div className="px-2">
              <p className="text-xl font-black text-fuchsia-300">
                4
              </p>

              <p className="mt-1 text-[10px] font-bold text-white/30">
                Study Tools
              </p>
            </div>
          </div>
        </section>

        <div className="h-10" />
      </div>
    </main>
  );
}