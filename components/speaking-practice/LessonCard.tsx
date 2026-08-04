import Link from "next/link";

type Props = {
  level: number;
  lesson: number;
  sentenceCount: number;
  categories: string[];
  averageDifficulty: number;
};

export default function LessonCard({
  level,
  lesson,
  sentenceCount,
  categories,
  averageDifficulty,
}: Props) {
  const estimatedMinutes = Math.max(3, Math.ceil(sentenceCount * 0.5));

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.075]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-300">
            HSK {level}
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Lesson {lesson}
          </h2>
        </div>

        <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-xs font-black text-white/50">
          {sentenceCount} sentences
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {categories.slice(0, 3).map((category) => (
          <span
            key={category}
            className="rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100"
          >
            {formatCategory(category)}
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Info label="Estimated" value={`${estimatedMinutes} min`} />
        <Info label="Difficulty" value={`${averageDifficulty}/5`} />
      </div>

      <Link
        href={`/dashboard/ai/lessons/${level}/${lesson}`}
        className="mt-6 flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-black text-white"
      >
        View Lesson →
      </Link>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <p className="text-xs uppercase tracking-wide text-white/35">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function formatCategory(category: string): string {
  return category
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
