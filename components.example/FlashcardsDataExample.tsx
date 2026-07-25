"use client";

import { useEffect, useMemo, useState } from "react";
import { loadVocabulary } from "@/lib/hsk/client-vocabulary";
import type {
  HskLevel,
  HskVocabularyItem,
} from "@/types/hsk-vocabulary";

export default function FlashcardsDataExample({
  level,
}: {
  level: HskLevel;
}) {
  const [words, setWords] = useState<HskVocabularyItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    loadVocabulary(level).then((data) => {
      if (active) setWords(data);
    });

    return () => {
      active = false;
    };
  }, [level]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return words;

    return words.filter(
      (word) =>
        word.hanzi.includes(query) ||
        word.pinyin.toLowerCase().includes(value) ||
        (word.meaning ?? "").toLowerCase().includes(value) ||
        (word.meaningMyanmar ?? "").includes(query),
    );
  }, [query, words]);

  return (
    <section>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search Hanzi or Pinyin"
      />

      <p>{filtered.length} words</p>

      {filtered.slice(0, 30).map((word) => (
        <article key={word.id}>
          <h2>{word.hanzi}</h2>
          <p>{word.pinyin}</p>
          <p>{word.meaningMyanmar || word.meaning || "Meaning pending"}</p>
        </article>
      ))}
    </section>
  );
}
