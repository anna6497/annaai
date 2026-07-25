import type { RefObject } from "react";

interface PracticeSectionProps {
  practiceContainerRef: RefObject<HTMLDivElement | null>;
  completedStrokes: number;
  strokeCount: number;
  mistakes: number;
  onRestart: () => void;
  onBackToLesson: () => void;
}

export default function PracticeSection({
  practiceContainerRef,
  completedStrokes,
  strokeCount,
  mistakes,
  onRestart,
  onBackToLesson,
}: PracticeSectionProps) {
  const progress =
    strokeCount > 0
      ? Math.round(
          (completedStrokes / strokeCount) * 100
        )
      : 0;

  return (
    <>
      <div>
        <p className="text-xl font-black">
          Stroke Order Practice
        </p>

        <p className="mt-2 text-sm leading-6 text-white/45">
          မှန်ကန်တဲ့ stroke order အတိုင်း Character
          ကို ရေးပါ။
        </p>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-white/45">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="relative mt-6 flex min-h-[460px] items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/20 bg-black/30">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
          <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />
        </div>

        <div
          ref={practiceContainerRef}
          className="relative z-10"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-500/10 p-4 text-center">
          <p className="text-xs text-white/45">
            Completed
          </p>

          <p className="mt-2 text-2xl font-black text-emerald-300">
            {completedStrokes} / {strokeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-red-300/15 bg-red-500/10 p-4 text-center">
          <p className="text-xs text-white/45">
            Mistakes
          </p>

          <p className="mt-2 text-2xl font-black text-red-300">
            {mistakes}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onBackToLesson}
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold transition hover:bg-white/10"
        >
          Review Stroke Order
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="rounded-2xl bg-orange-600 px-5 py-4 font-bold transition hover:bg-orange-500"
        >
          Restart Practice
        </button>
      </div>
    </>
  );
}