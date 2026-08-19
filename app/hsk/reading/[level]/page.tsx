"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  getHskReadingStories,
  type HskReadingStory,
} from "@/lib/hsk-reading";

function getCategoryIcon(
  category: HskReadingStory["category"],
) {
  switch (category) {
    case "daily-life":
      return "🌤️";

    case "school":
      return "🎓";

    case "friends":
      return "👭";

    case "shopping":
      return "🛍️";

    case "travel":
      return "🧳";

    default:
      return "📖";
  }
}

function getDifficultyLabel(
  difficulty: HskReadingStory["difficulty"],
) {
  switch (difficulty) {
    case "easy":
      return "Easy";

    case "medium":
      return "Medium";

    case "hard":
      return "Hard";

    default:
      return difficulty;
  }
}

export default function ReadingLevelPage() {
  const params =
    useParams<{
      level: string;
    }>();

  const level =
    Number(params.level);

  const validLevel =
    Number.isInteger(level) &&
    level >= 1 &&
    level <= 9;

  if (!validLevel) {
    return (
      <main className="min-h-screen bg-[#090014] px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/hsk/reading"
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold"
          >
            ← Reading Levels
          </Link>

          <div className="mt-12 rounded-[28px] border border-red-400/20 bg-red-950/20 p-8 text-center">
            <p className="text-4xl">
              📖
            </p>

            <h1 className="mt-4 text-2xl font-black">
              Invalid HSK Level
            </h1>
          </div>
        </div>
      </main>
    );
  }

  const stories =
    getHskReadingStories(
      level,
    );

  return (
    <main className="min-h-screen bg-[#090014] px-4 py-6 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <header className="flex items-center justify-between gap-4">
          <Link
            href="/hsk/reading"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            ← Levels
          </Link>

          <p className="text-sm font-black sm:text-base">
            HSK {level} Reading
          </p>
        </header>

        {/* HERO */}

        <section className="mt-8 overflow-hidden rounded-[30px] border border-pink-300/15 bg-gradient-to-br from-pink-950/70 via-rose-950/50 to-slate-950 p-6 shadow-2xl sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-pink-300/20 bg-pink-500/10 text-3xl">
              📖
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-300">
                HSK {level}
              </p>

              <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                Reading Stories
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                Read Chinese stories,
                learn vocabulary in
                context and listen to
                natural Chinese audio.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60">
              📚 {stories.length} Stories
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60">
              🔊 Audio
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60">
              🇲🇲 Myanmar Meaning
            </span>
          </div>
        </section>

        {/* STORY LIST */}

        {stories.length > 0 ? (
          <section className="mt-6 space-y-3">
            {stories.map(
              (story) => (
                <Link
                  key={story.id}
                  href={
                    `/hsk/reading/${level}/${story.id}`
                  }
                  className="group block rounded-[24px] border border-white/10 bg-[#12081d] p-5 transition hover:border-pink-400/30 hover:bg-[#190b27] sm:p-6"
                >
                  <div className="flex items-start gap-4">

                    {/* ICON */}

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                      {getCategoryIcon(
                        story.category,
                      )}
                    </div>

                    {/* STORY */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-pink-300">
                          Story{" "}
                          {String(
                            story.order,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <span className="text-white/20">
                          •
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                          {getDifficultyLabel(
                            story.difficulty,
                          )}
                        </span>
                      </div>

                      <h2 className="mt-2 text-xl font-black tracking-wide text-white sm:text-2xl">
                        {story.title}
                      </h2>

                      <p className="mt-1 text-sm text-pink-200/70">
                        {story.pinyinTitle}
                      </p>

                      <p className="mt-2 text-sm font-medium text-white/45">
                        {story.myanmarTitle}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/45">
                          ⏱{" "}
                          {
                            story.estimatedMinutes
                          }{" "}
                          min
                        </span>

                        <span className="rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/45">
                          🔊 Audio
                        </span>

                        <span className="rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/45">
                          🀄 Vocabulary
                        </span>
                      </div>
                    </div>

                    {/* ARROW */}

                    <div className="pt-4 text-xl text-white/25 transition group-hover:translate-x-1 group-hover:text-pink-300">
                      →
                    </div>
                  </div>
                </Link>
              ),
            )}
          </section>
        ) : (
          <section className="mt-6 rounded-[28px] border border-white/10 bg-[#12081d] p-8 text-center sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
              📚
            </div>

            <h2 className="mt-5 text-xl font-black">
              HSK {level} Stories
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/45">
              Reading stories for this
              level are being prepared.
            </p>

            <Link
              href="/hsk/reading"
              className="mt-6 inline-flex rounded-full bg-pink-600 px-5 py-3 text-sm font-bold transition hover:bg-pink-500"
            >
              Choose Another Level
            </Link>
          </section>
        )}

        {/* INFO */}

        {stories.length > 0 && (
          <section className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-bold text-white/70">
              💡 Reading Tip
            </p>

            <p className="mt-2 text-xs leading-5 text-white/40">
              Story ထဲမှာ
              နားမလည်တဲ့ Chinese
              word ကိုနှိပ်ပြီး Pinyin
              နဲ့ Myanmar meaning
              ကြည့်နိုင်ပါတယ်။
            </p>
          </section>
        )}

        <div className="h-12" />
      </div>
    </main>
  );
}