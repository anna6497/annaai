import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getWritingLesson,
  isValidHskLevel,
} from "@/lib/hsk-writing-data";

interface PageProps {
  params: Promise<{
    level: string;
    lesson: string;
  }>;
}

export default async function WritingLessonPage({
  params,
}: PageProps) {
  const resolvedParams = await params;

  const level = Number(resolvedParams.level);
  const lessonNumber = Number(resolvedParams.lesson);

  if (
    !isValidHskLevel(level) ||
    !Number.isInteger(lessonNumber) ||
    lessonNumber < 1
  ) {
    notFound();
  }

  const lesson = getWritingLesson(
    level,
    lessonNumber,
  );

  if (!lesson) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/hsk/writing/${level}/lessons`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          ← Back to HSK {level} Lessons
        </Link>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                HSK {level} Writing
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Lesson {lessonNumber}
              </h1>
            </div>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
              {lesson.characterCount} Characters
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {lesson.characters.map(
              (character, characterIndex) => (
                <Link
                  key={`${character.hanzi}-${characterIndex}`}
                  href={`/hsk/writing/${level}?lesson=${lessonNumber}&character=${characterIndex}`}
                  className="group rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-300 hover:bg-indigo-50/40"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-5xl font-bold text-slate-900 transition group-hover:bg-white">
                      {character.hanzi}
                    </div>

                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-slate-900">
                        {character.pinyin}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {character.myanmar}
                      </p>

                      <p className="mt-3 truncate text-sm text-slate-500">
                        {character.example}
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        {character.examplePinyin}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-right text-sm font-semibold text-indigo-600">
                    Practice →
                  </div>
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </main>
  );
}