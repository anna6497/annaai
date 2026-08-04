import Link from "next/link";

type Props = {
  level: number;
  sentenceCount: number;
  lessonCount: number;
  available: boolean;
};

export default function LevelCard({
  level,
  sentenceCount,
  lessonCount,
  available,
}: Props) {
  return (
    <article className="rounded-[30px] border border-white/10 bg-white/[0.055] p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
            Speaking Level
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            HSK {level}
          </h2>
        </div>

        <span className={`rounded-full border px-3 py-1 text-xs font-black ${
          available
            ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
            : "border-white/10 bg-white/5 text-white/35"
        }`}>
          {available ? "Available" : "Coming Soon"}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Sentences" value={sentenceCount} />
        <Stat label="Lessons" value={lessonCount} />
      </div>

      {available ? (
        <Link
          href={`/dashboard/ai/lessons/${level}`}
          className="mt-6 flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-black text-white"
        >
          Open HSK {level} →
        </Link>
      ) : (
        <div className="mt-6 flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/35">
          Coming Soon
        </div>
      )}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <p className="text-xs uppercase tracking-wide text-white/35">{label}</p>
      <p className="mt-1 text-xl font-black text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
