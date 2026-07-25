interface HskAccessBadgeProps {
  unlocked: boolean;
  free?: boolean;
}

export default function HskAccessBadge({
  unlocked,
  free = false,
}: HskAccessBadgeProps) {
  if (free) {
    return (
      <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-black uppercase text-cyan-200">
        Free
      </span>
    );
  }

  if (unlocked) {
    return (
      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black uppercase text-emerald-200">
        ✅ Purchased
      </span>
    );
  }

  return (
    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase text-white/45">
      🔒 Locked
    </span>
  );
}
