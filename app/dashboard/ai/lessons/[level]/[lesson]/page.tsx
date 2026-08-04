import Link from "next/link";
import { notFound } from "next/navigation";
import { getSpeakingPracticeByLesson } from "@/lib/speaking-practice/loader";

type Props = {
  params: Promise<{ level: string; lesson: string }>;
};

export default async function LessonDetailPage({ params }: Props) {
  const resolved = await params;
  const level = Number(resolved.level);
  const lesson = Number(resolved.lesson);

  if (
    !Number.isInteger(level) ||
    !Number.isInteger(lesson) ||
    level < 1 ||
    level > 6 ||
    lesson < 1
  ) {
    notFound();
  }

  const sentences = getSpeakingPracticeByLesson(level, lesson);
  if (sentences.length === 0) notFound();

  const categories = Array.from(new Set(sentences.map((item) => item.category)));
  const averageDifficulty = Math.max(
    1,
    Math.round(
      sentences.reduce((sum, item) => sum + item.difficulty, 0) /
        sentences.length
    )
  );
  const estimatedMinutes = Math.max(3, Math.ceil(sentences.length * 0.5));

  return (
    <main className="min-h-screen bg-[#071018] px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/dashboard/ai/lessons/${level}`}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75"
          >
            ← HSK {level} Lessons
          </Link>
          <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-sm font-black text-violet-100">
            Lesson {lesson}
          </span>
        </div>

        <header className="mt-12 rounded-[34px] border border-white/10 bg-white/[0.055] p-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-fuchsia-300">
            HSK {level} Speaking
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            Lesson {lesson}
          </h1>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Info label="Sentences" value={String(sentences.length)} />
            <Info label="Estimated Time" value={`${estimatedMinutes} min`} />
            <Info label="Difficulty" value={`${averageDifficulty}/5`} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100"
              >
                {formatCategory(category)}
              </span>
            ))}
          </div>

          <Link
            href={`/dashboard/ai/pronunciation?level=${level}&lesson=${lesson}`}
            className="mt-8 flex min-h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-4 text-base font-black text-white"
          >
            Start Practice →
          </Link>
        </header>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
          <h2 className="text-2xl font-black">Lesson Preview</h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {sentences.slice(0, 6).map((sentence, index) => (
              <article
                key={sentence.id}
                className="rounded-2xl border border-white/10 bg-black/15 p-4"
              >
                <p className="text-xs font-black uppercase tracking-wide text-white/35">
                  Sentence {index + 1}
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {sentence.hanzi}
                </p>
                <p className="mt-2 text-sm text-violet-200">
                  {sentence.pinyin}
                </p>
                <p className="mt-2 text-sm text-white/50">
                  {sentence.myanmar}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <p className="text-xs uppercase tracking-wide text-white/35">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function formatCategory(category: string): string {
  return category
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
