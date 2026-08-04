import Link from "next/link";
import { notFound } from "next/navigation";
import LessonCard from "@/components/speaking-practice/LessonCard";
import {
  getSpeakingPracticeByLesson,
  getSpeakingPracticeLessons,
  getSpeakingPracticeSentences,
} from "@/lib/speaking-practice/loader";

type Props = { params: Promise<{ level: string }> };

export default async function SpeakingLevelPage({ params }: Props) {
  const { level: levelValue } = await params;
  const level = Number(levelValue);

  if (!Number.isInteger(level) || level < 1 || level > 6) notFound();

  const sentences = getSpeakingPracticeSentences(level);
  if (sentences.length === 0) notFound();

  const lessons = getSpeakingPracticeLessons(level);

  return (
    <main className="min-h-screen bg-[#071018] px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/dashboard/ai/lessons" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75">
            ← Speaking Lessons
          </Link>
          <Link href={`/dashboard/ai/pronunciation?level=${level}`} className="rounded-xl border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-sm font-bold text-violet-100">
            Practice All HSK {level}
          </Link>
        </div>

        <header className="mt-12 rounded-[34px] border border-white/10 bg-white/[0.055] p-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-300">
            Speaking Course
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            HSK {level} Lessons
          </h1>
          <p className="mt-4 text-white/55">
            {sentences.length.toLocaleString()} sentences · {lessons.length} lessons
          </p>
        </header>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson) => {
            const items = getSpeakingPracticeByLesson(level, lesson);
            const categories = Array.from(new Set(items.map((item) => item.category)));
            const averageDifficulty = items.length
              ? Math.max(1, Math.round(items.reduce((sum, item) => sum + item.difficulty, 0) / items.length))
              : 1;

            return (
              <LessonCard
                key={lesson}
                level={level}
                lesson={lesson}
                sentenceCount={items.length}
                categories={categories}
                averageDifficulty={averageDifficulty}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}
