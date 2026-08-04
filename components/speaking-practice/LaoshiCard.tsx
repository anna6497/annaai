import Link from "next/link";

type LaoshiCardProps = {
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  buttonLabel: string;
  badge?: string;
  disabled?: boolean;
};

export default function LaoshiCard({
  icon,
  eyebrow,
  title,
  description,
  href,
  buttonLabel,
  badge,
  disabled = false,
}: LaoshiCardProps) {
  return (
    <article className={`relative flex h-full flex-col overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.055] p-6 shadow-xl backdrop-blur-xl ${
      disabled ? "opacity-70" : "transition hover:-translate-y-1 hover:bg-white/[0.075]"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 text-3xl">
          {icon}
        </div>
        {badge ? (
          <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/55">
            {badge}
          </span>
        ) : null}
      </div>

      <p className="mt-6 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black text-white">
        {title}
      </h2>
      <p className="mt-3 flex-1 text-sm leading-7 text-white/52">
        {description}
      </p>

      {disabled || !href ? (
        <div className="mt-6 flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/45">
          {buttonLabel}
        </div>
      ) : (
        <Link
          href={href}
          className="mt-6 flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-black text-white"
        >
          {buttonLabel}
        </Link>
      )}
    </article>
  );
}
