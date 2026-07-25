interface StageBadgeProps {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}

export default function StageBadge({
  number,
  label,
  active,
  completed,
}: StageBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition ${
          active
            ? "bg-orange-500 text-white"
            : completed
              ? "bg-emerald-500 text-white"
              : "bg-white/10 text-white/40"
        }`}
      >
        {completed ? "✓" : number}
      </span>

      <span
        className={
          active
            ? "font-bold text-white"
            : "text-sm text-white/40"
        }
      >
        {label}
      </span>
    </div>
  );
}