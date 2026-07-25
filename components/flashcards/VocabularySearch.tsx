"use client";

interface VocabularySearchProps {
  value: string;
  onChange: (value: string) => void;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
  onShuffle: () => void;
}

export default function VocabularySearch({
  value,
  onChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  onShuffle,
}: VocabularySearchProps) {
  return (
    <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 lg:grid-cols-[1fr_auto_auto]">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search Hanzi, Pinyin, English or Myanmar..."
        className="min-w-0 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-emerald-300/40"
      />

      <button
        type="button"
        onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
        className={`rounded-2xl px-5 py-3 font-bold ${
          favoritesOnly
            ? "bg-red-500 text-white"
            : "border border-white/10 bg-white/5 text-white/70"
        }`}
      >
        ❤️ Favorites
      </button>

      <button
        type="button"
        onClick={onShuffle}
        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white/70 hover:bg-white/10"
      >
        🔀 Shuffle
      </button>
    </div>
  );
}
