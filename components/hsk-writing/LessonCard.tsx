import type { WritingLessonListItem } from "@/types/hsk-writing";

interface LessonCardProps {
  level: number;
  lesson: WritingLessonListItem;
  onOpen: (lessonNumber: number) => void;
}

function renderStars(stars: number): string {
  if (stars <= 0) {
    return "☆☆☆";
  }

  return `${"⭐".repeat(stars)}${"☆".repeat(
    Math.max(0, 3 - stars),
  )}`;
}

export default function LessonCard({
  level,
  lesson,
  onOpen,
}: LessonCardProps) {
  const locked = !lesson.unlocked;

  const statusLabel = locked
    ? `Complete Lesson ${lesson.lessonNumber - 1} first`
    : lesson.completed
      ? "Completed"
      : lesson.attemptsCount > 0
        ? "Continue"
        : "Start Lesson";

  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border p-6 transition ${
        locked
          ? "border-white/5 bg-white/[0.025] opacity-65"
          : lesson.completed
            ? "border-green-400/20 bg-gradient-to-br from-green-950/55 via-slate-950 to-slate-950 hover:-translate-y-1 hover:border-green-400/35"
            : "border-orange-300/15 bg-gradient-to-br from-orange-950/60 via-slate-950 to-slate-950 hover:-translate-y-1 hover:border-orange-300/35"
      }`}
    >
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${
          locked
            ? "bg-white/5"
            : lesson.completed
              ? "bg-green-500/15"
              : "bg-orange-500/15"
        }`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
              HSK {level}
            </p>

            <h3 className="mt-2 text-2xl font-black">
              Lesson {lesson.lessonNumber}
            </h3>

            <p className="mt-2 text-sm text-white/50">
              {lesson.subtitle}
            </p>
          </div>

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl ${
              locked
                ? "border-white/10 bg-white/5"
                : lesson.completed
                  ? "border-green-400/20 bg-green-500/10"
                  : "border-orange-400/20 bg-orange-500/10"
            }`}
          >
            {locked
              ? "🔒"
              : lesson.completed
                ? "✓"
                : "✍️"}
          </div>
        </div>

        <div className="mt-6 min-h-16 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-2xl font-black tracking-[0.25em]">
            {lesson.characters.length > 0
              ? lesson.characters.slice(0, 8).join(" ")
              : "—"}
          </p>

          <p className="mt-2 text-xs text-white/40">
            {lesson.characterCount} characters
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xl">
              {renderStars(lesson.stars)}
            </p>

            <p className="mt-1 text-xs text-white/40">
              Best Score: {lesson.bestScore}%
            </p>
          </div>

          {lesson.attemptsCount > 0 && (
            <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/45">
              {lesson.attemptsCount} attempt
              {lesson.attemptsCount === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={locked}
          onClick={() => onOpen(lesson.lessonNumber)}
          className={`mt-6 w-full rounded-2xl px-5 py-3.5 font-black transition ${
            locked
              ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/35"
              : lesson.completed
                ? "bg-green-600 text-white hover:bg-green-500"
                : "bg-orange-600 text-white hover:bg-orange-500"
          }`}
        >
          {locked
            ? statusLabel
            : lesson.completed
              ? "Review Lesson →"
              : `${statusLabel} →`}
        </button>
      </div>
    </article>
  );
}
