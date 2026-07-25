"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  getVocabulary,
  searchVocabulary,
} from "@/lib/hsk/vocabulary";

import type { HskLevel } from "@/types/hsk-vocabulary";

interface Props {
  level: HskLevel;
}

export default function VocabularyClient({
  level,
}: Props) {
  const words = useMemo(
    () => getVocabulary(level),
    [level],
  );

  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => searchVocabulary(level, query),
    [level, query],
  );

  return (
    <main className="min-h-screen bg-[#080011] px-4 py-8 text-white">
      <section className="mx-auto max-w-7xl">

        <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
          Browse All Vocabulary
        </p>

        <h1 className="mt-2 text-4xl font-black">
          HSK {level}
        </h1>

        <p className="mt-2 text-white/50">
          {filtered.length.toLocaleString()} of{" "}
          {words.length.toLocaleString()} words
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Hanzi, Pinyin, English or Myanmar..."
          className="mt-7 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 outline-none placeholder:text-white/25 focus:border-cyan-400/50"
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {filtered.map((word) => (
            <article
              key={word.id}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
            >

              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-4xl font-black">
                    {word.hanzi}
                  </h2>

                  <p className="mt-2 text-lg font-bold text-cyan-300">
                    {word.pinyin}
                  </p>
                </div>

                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/50">
                  HSK {level}
                </span>

              </div>

              <div className="mt-5">

                <p className="font-semibold">
                  {word.meaning}
                </p>

                <p className="mt-2 text-white/60">
                  {word.meaningMyanmar}
                </p>

              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">

                <Link
                  href={`/hsk/flashcards/${level}?vocabId=${encodeURIComponent(String(word.id))}`}
                  className="rounded-xl bg-emerald-600 py-2 text-center text-sm font-bold"
                >
                  Flashcards
                </Link>

                <Link
                  href={`/hsk/writing/${level}?word=${encodeURIComponent(
                    word.hanzi,
                  )}&vocabId=${encodeURIComponent(
                    String(word.id),
                  )}`}
                  className="rounded-xl bg-fuchsia-600 py-2 text-center text-sm font-bold"
                >
                  Writing
                </Link>

              </div>

            </article>
          ))}

        </div>

      </section>
    </main>
  );
}