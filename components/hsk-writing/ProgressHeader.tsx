import type { WritingLevelProgressSummary } from "@/types/hsk-writing";

interface ProgressHeaderProps {
  level: number;
  summary: WritingLevelProgressSummary;
  loading?: boolean;
}

export default function ProgressHeader({
  level,
  summary,
  loading = false,
}: ProgressHeaderProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-orange-300/15 bg-gradient-to-br from-orange-950/75 via-purple-950/50 to-slate-950 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-300">
            Anna AI Writing
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            HSK {level} Lessons
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-white/55">
            Stroke order ကိုကြည့်ပြီး Hanzi ကို လက်တွေ့ရေးပါ။
            Lesson တစ်ခုစီကို 60% နှင့်အထက်ရရှိလျှင် နောက် lesson unlock ဖြစ်ပါမယ်။
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 px-6 py-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            Overall Progress
          </p>

          <p className="mt-2 text-4xl font-black text-orange-200">
            {loading ? "—" : `${summary.progressPercent}%`}
          </p>
        </div>
      </div>

      <div className="mt-8 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300 transition-all duration-500"
          style={{
            width: `${Math.max(
              0,
              Math.min(100, summary.progressPercent),
            )}%`,
          }}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBox
          label="Completed"
          value={
            loading
              ? "—"
              : `${summary.completedLessons}/${summary.totalLessons}`
          }
        />

        <StatBox
          label="Stars"
          value={
            loading
              ? "—"
              : `${summary.totalStars}/${summary.maximumStars}`
          }
        />

        <StatBox
          label="Next Lesson"
          value={
            loading
              ? "—"
              : summary.nextLessonNumber
                ? `Lesson ${summary.nextLessonNumber}`
                : "All Done"
          }
        />

        <StatBox
          label="Status"
          value={
            loading
              ? "Loading"
              : summary.completedLessons ===
                  summary.totalLessons &&
                summary.totalLessons > 0
                ? "Completed ✓"
                : "In Progress"
          }
        />
      </div>
    </section>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-white/40">
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-white">
        {value}
      </p>
    </div>
  );
}
