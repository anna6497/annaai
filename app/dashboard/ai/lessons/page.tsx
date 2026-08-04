import Link from "next/link";
import LevelCard from "@/components/speaking-practice/LevelCard";
import {
  getSpeakingPracticeLessons,
  getSpeakingPracticeLevels,
  getSpeakingPracticeSentences,
} from "@/lib/speaking-practice/loader";

export const metadata = {
  title: "Speaking Lessons | Anna AI",
  description: "Choose an HSK level and practice structured Chinese speaking lessons.",
};

const ALL_LEVELS = [1, 2, 3, 4, 5, 6];

export default function SpeakingLessonsPage() {
  const availableLevels = new Set(getSpeakingPracticeLevels());

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071018] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-violet-500/15 blur-[120px]" />
      </div>

      <section className="relative mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/dashboard/ai/laoshi" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75">
            ← Your Laoshi
          </Link>
          <Link href="/dashboard/ai/pronunciation/progress" className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-100">
            📈 My Progress
          </Link>
        </div>

        <header className="mx-auto mt-12 max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            Structured Practice
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            🎤 Speaking Lessons
          </h1>
          <p lang="my" className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/55">
            HSK Level ကိုရွေးပြီး lesson နဲ့ category အလိုက်
            Chinese speaking ကို တစ်ဆင့်ချင်း လေ့ကျင့်ပါ။
          </p>
        </header>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {ALL_LEVELS.map((level) => {
            const sentences = getSpeakingPracticeSentences(level);
            const lessons = getSpeakingPracticeLessons(level);
            const available = availableLevels.has(level) && sentences.length > 0;

            return (
              <LevelCard
                key={level}
                level={level}
                sentenceCount={sentences.length}
                lessonCount={lessons.length}
                available={available}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}
