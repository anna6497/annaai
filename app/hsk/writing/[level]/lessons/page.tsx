import Link from "next/link";

import PurchaseRequired from "@/components/access/PurchaseRequired";
import {
  getVocabularyLessons,
} from "@/lib/hsk/vocabulary";
import { getServerHskAccess } from "@/lib/server-hsk-access";

import type {
  HskLevel,
  HskVocabularyItem,
} from "@/types/hsk-vocabulary";

interface Props {
  params: Promise<{
    level: string;
  }>;
}

interface WritingLesson {
  id: number;
  title: string;
  subtitle?: string;
  words: HskVocabularyItem[];
}

function isHskLevel(value: number): value is HskLevel {
  return (
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 9
  );
}

function createLessons(
  level: HskLevel,
): WritingLesson[] {
  const groups = getVocabularyLessons(level, 20);

  return groups.map((words, index) => ({
    id: index + 1,
    title: `Lesson ${index + 1}`,
    subtitle: `${words.length} vocabulary words`,
    words,
  }));
}

export default async function WritingLessonsPage({
  params,
}: Props) {
  const { level: levelText } = await params;
  const parsedLevel = Number(levelText);

  if (!isHskLevel(parsedLevel)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080011] px-4 text-white">
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center">
          Invalid HSK level.
        </div>
      </main>
    );
  }

  const level: HskLevel = parsedLevel;
  const access = await getServerHskAccess(level);

  if (!access.allowed) {
    return (
      <PurchaseRequired
        level={level}
        reason={access.reason}
      />
    );
  }

  const lessons = createLessons(level);

  return (
    <main className="min-h-screen bg-[#080011] px-4 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-300">
              Writing Lessons
            </p>

            <h1 className="mt-2 text-4xl font-black">
              HSK {level}
            </h1>

            <p className="mt-2 text-white/50">
              {lessons.length.toLocaleString()} lessons
            </p>
          </div>

          <Link
            href={`/hsk/writing/${level}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold hover:bg-white/10"
          >
            Writing Practice
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            const firstWord = lesson.words[0];

            return (
              <article
                key={lesson.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">
                  HSK {level}
                </p>

                <h2 className="mt-3 text-2xl font-black">
                  {lesson.title}
                </h2>

                <p className="mt-2 text-sm text-white/50">
                  {lesson.subtitle ??
                    "Chinese writing practice"}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {lesson.words
                    .slice(0, 10)
                    .map((word) => (
                      <span
                        key={String(word.id)}
                        className="rounded-xl bg-white/5 px-3 py-2 text-xl font-bold"
                      >
                        {word.hanzi}
                      </span>
                    ))}
                </div>

                {lesson.words.length > 10 ? (
                  <p className="mt-3 text-xs text-white/40">
                    +{lesson.words.length - 10} more
                  </p>
                ) : null}

                <Link
                  href={
                    firstWord
                      ? `/hsk/writing/${level}?word=${encodeURIComponent(
                          firstWord.hanzi,
                        )}&vocabId=${encodeURIComponent(
                          String(firstWord.id),
                        )}&lesson=${lesson.id}`
                      : `/hsk/writing/${level}`
                  }
                  className="mt-6 block rounded-2xl bg-fuchsia-600 px-5 py-3 text-center font-black hover:bg-fuchsia-500"
                >
                  Start Lesson
                </Link>
              </article>
            );
          })}
        </div>

        {lessons.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/50">
            No writing lessons are available.
          </div>
        ) : null}
      </section>
    </main>
  );
}