"use client";

import type { HskLevel } from "@/types/hsk-vocabulary";
import { useEffect, useMemo, useState } from "react";
import Flashcard from "@/components/flashcards/Flashcard";
import VocabularySearch from "@/components/flashcards/VocabularySearch";
import {
  getVocabularyByLevel,
  searchVocabulary,
} from "@/lib/hsk-vocabulary";
import {
  getFlashcardState,
  saveFlashcardProgress,
  toggleVocabularyFavorite,
} from "@/lib/flashcard-data";
import type {
  FlashcardStatus,
  HskVocabularyItem,
} from "@/types/vocabulary";

interface Props {
  level: HskLevel;
}

export default function FlashcardsClient({ level }: Props) {
  const words = useMemo(() => getVocabularyByLevel(level), [level]);
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [order, setOrder] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Record<string, FlashcardStatus>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    setOrder(words.map((word) => word.id));
    setCurrentIndex(0);

    getFlashcardState(level)
      .then((state) => {
        setFavorites(new Set(state.favorites.map((row) => row.vocab_id)));
        setStatuses(
          Object.fromEntries(
            state.progress.map((row) => [row.vocab_id, row.status]),
          ),
        );
      })
      .catch(() => {
        // The vocabulary UI remains usable when progress tables are not installed.
      });
  }, [level, words]);

  const visibleWords = useMemo(() => {
    const searched = searchVocabulary(words, query);
    const filtered = favoritesOnly
      ? searched.filter((word) => favorites.has(word.id))
      : searched;

    if (order.length === 0) return filtered;

    const rank = new Map(order.map((id, index) => [id, index]));
    return [...filtered].sort(
      (a, b) =>
        (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [favorites, favoritesOnly, order, query, words]);

  useEffect(() => {
    if (currentIndex >= visibleWords.length) setCurrentIndex(0);
  }, [currentIndex, visibleWords.length]);

  const current: HskVocabularyItem | undefined =
    visibleWords[currentIndex];

  function shuffle() {
    setOrder((existing) => {
      const next = existing.length
        ? [...existing]
        : words.map((word) => word.id);

      for (let index = next.length - 1; index > 0; index -= 1) {
        const random = Math.floor(Math.random() * (index + 1));
        [next[index], next[random]] = [next[random], next[index]];
      }

      return next;
    });
    setCurrentIndex(0);
  }

  async function toggleFavorite() {
    if (!current) return;
    const active = favorites.has(current.id);

    setFavorites((previous) => {
      const next = new Set(previous);
      active ? next.delete(current.id) : next.add(current.id);
      return next;
    });

    try {
      await toggleVocabularyFavorite(current.id, level, active);
    } catch {
      setMessage("Login ဝင်ထားမှ favorite ကို account ထဲသိမ်းနိုင်ပါတယ်။");
    }
  }

  async function changeStatus(status: FlashcardStatus) {
    if (!current) return;
    setStatuses((previous) => ({ ...previous, [current.id]: status }));

    try {
      await saveFlashcardProgress(current.id, level, status);
    } catch {
      setMessage("Progress ကို database ထဲမသိမ်းနိုင်သေးပါ။");
    }
  }

  return (
    <main className="min-h-screen bg-[#080011] px-4 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
              HSK 3.0 Flashcards
            </p>
            <h1 className="mt-2 text-4xl font-black">HSK {level}</h1>
            <p className="mt-2 text-white/45">
              {words.length.toLocaleString()} vocabulary entries
              {level >= 7 ? " · Official HSK 7–9 combined list" : ""}
            </p>
          </div>

          {visibleWords.length > 0 ? (
            <p className="rounded-full bg-white/5 px-4 py-2 text-sm font-bold text-white/60">
              {currentIndex + 1} / {visibleWords.length}
            </p>
          ) : null}
        </div>

        <VocabularySearch
          value={query}
          onChange={(value) => {
            setQuery(value);
            setCurrentIndex(0);
          }}
          favoritesOnly={favoritesOnly}
          onFavoritesOnlyChange={(value) => {
            setFavoritesOnly(value);
            setCurrentIndex(0);
          }}
          onShuffle={shuffle}
        />

        {message ? (
          <p className="mt-4 rounded-2xl bg-amber-500/10 p-3 text-sm text-amber-200">
            {message}
          </p>
        ) : null}

        <div className="mt-7">
          {current ? (
            <>
              <Flashcard
                item={current}
                favorite={favorites.has(current.id)}
                status={statuses[current.id] ?? "new"}
                onToggleFavorite={toggleFavorite}
                onStatusChange={changeStatus}
              />

              <div className="mx-auto mt-6 flex max-w-3xl justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((index) =>
                      index <= 0 ? visibleWords.length - 1 : index - 1,
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-black hover:bg-white/10"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((index) =>
                      index >= visibleWords.length - 1 ? 0 : index + 1,
                    )
                  }
                  className="rounded-2xl bg-emerald-600 px-6 py-3 font-black hover:bg-emerald-500"
                >
                  Next →
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/50">
              No vocabulary matches your search.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
