interface ResultSectionProps {
  score: number;
  mistakes: number;
  strokeCount: number;
  saving: boolean;
  saved: boolean;
  hasPreviousCharacter: boolean;
  hasNextCharacter: boolean;
  onSave: () => void;
  onRetry: () => void;
  onReview: () => void;
  onPreviousCharacter: () => void;
  onNextCharacter: () => void;
}

export default function ResultSection({
  score,
  mistakes,
  strokeCount,
  saving,
  saved,
  hasPreviousCharacter,
  hasNextCharacter,
  onSave,
  onRetry,
  onReview,
  onPreviousCharacter,
  onNextCharacter,
}: ResultSectionProps) {
  const emoji =
    score >= 90
      ? "🎉"
      : score >= 70
        ? "👏"
        : "💪";

  const scoreColor =
    score >= 90
      ? "text-emerald-300"
      : score >= 70
        ? "text-orange-300"
        : "text-red-300";

  return (
    <div className="py-6 text-center">
      <p className="text-6xl">{emoji}</p>

      <p className="mt-6 text-sm font-bold uppercase tracking-widest text-white/40">
        Stroke Accuracy
      </p>

      <h2
        className={`mt-4 text-7xl font-black ${scoreColor}`}
      >
        {score}%
      </h2>

      <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/40">
            Total Strokes
          </p>

          <p className="mt-2 text-2xl font-black">
            {strokeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/40">
            Mistakes
          </p>

          <p className="mt-2 text-2xl font-black text-red-300">
            {mistakes}
          </p>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-white/55">
        {score >= 90
          ? "Excellent! Stroke order အားလုံးနီးပါး မှန်ကန်ပါတယ်။"
          : score >= 70
            ? "Good job! နောက်တစ်ကြိမ် ထပ်လေ့ကျင့်ရင် ပိုကောင်းလာပါမယ်။"
            : "ဆက်လေ့ကျင့်ပါ။ Stroke order ကို ပြန်ကြည့်ပြီး ထပ်ရေးကြည့်ပါ။"}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onReview}
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold transition hover:bg-white/10"
        >
          Review Stroke Order
        </button>

        <button
          type="button"
          onClick={onRetry}
          className="rounded-2xl bg-orange-600 px-5 py-4 font-bold transition hover:bg-orange-500"
        >
          Practice Again
        </button>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={saving || saved}
        className="mt-3 w-full rounded-2xl bg-emerald-600 px-5 py-4 font-bold transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving
          ? "Saving Result..."
          : saved
            ? "✓ Result Saved"
            : "Save Result"}
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onPreviousCharacter}
          disabled={!hasPreviousCharacter}
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={onNextCharacter}
          disabled={!hasNextCharacter}
          className="rounded-2xl bg-purple-600 px-5 py-4 font-bold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next Character →
        </button>
      </div>
    </div>
  );
}