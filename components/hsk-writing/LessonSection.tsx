import type { RefObject } from "react";

interface LessonSectionProps {
  animationContainerRef: RefObject<HTMLDivElement | null>;
  loadingCharacter: boolean;
  animating: boolean;
  currentStroke: number;
  strokeCount: number;
  hasViewedStrokeOrder: boolean;
  onAnimateAll: () => void;
  onShowStepByStep: () => void;
  onStartPractice: () => void;
}

export default function LessonSection({
  animationContainerRef,
  loadingCharacter,
  animating,
  currentStroke,
  strokeCount,
  hasViewedStrokeOrder,
  onAnimateAll,
  onShowStepByStep,
  onStartPractice,
}: LessonSectionProps) {
  return (
    <>
      <div>
        <p className="text-xl font-black">
          Step-by-Step Stroke Order
        </p>

        <p className="mt-2 text-sm leading-6 text-white/45">
          Stroke order ကို အရင်ကြည့်ပြီးမှ Practice
          စလုပ်ပါ။
        </p>
      </div>

      <div className="relative mt-6 flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/20 bg-black/30">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
          <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />
        </div>

        {loadingCharacter && (
          <div className="absolute z-20 rounded-full bg-black/60 px-4 py-2 text-sm text-white/60">
            Stroke data loading...
          </div>
        )}

        <div
          ref={animationContainerRef}
          className="relative z-10"
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-white/50">
          Current Stroke:{" "}
          <strong className="text-orange-300">
            {currentStroke}
          </strong>{" "}
          / {strokeCount}
        </p>

        {hasViewedStrokeOrder && (
          <p className="text-xs font-bold text-emerald-300">
            ✓ Stroke order viewed
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onShowStepByStep}
          disabled={animating || loadingCharacter}
          className="rounded-2xl border border-orange-300/20 bg-orange-500/10 px-5 py-4 font-bold text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {animating
            ? "Showing Strokes..."
            : "Show One by One"}
        </button>

        <button
          type="button"
          onClick={onAnimateAll}
          disabled={animating || loadingCharacter}
          className="rounded-2xl bg-orange-600 px-5 py-4 font-bold transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {animating
            ? "Playing..."
            : "Play Full Animation"}
        </button>
      </div>

      <button
        type="button"
        onClick={onStartPractice}
        disabled={
          loadingCharacter ||
          animating ||
          !hasViewedStrokeOrder
        }
        className="mt-3 w-full rounded-2xl bg-emerald-600 px-5 py-4 font-bold transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {hasViewedStrokeOrder
          ? "Start Practice"
          : "Stroke Order ကို အရင်ကြည့်ပါ"}
      </button>
    </>
  );
}