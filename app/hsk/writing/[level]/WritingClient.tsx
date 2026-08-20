"use client";

import type { HskLevel } from "@/types/hsk-vocabulary";
import HanziWriter from "hanzi-writer";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getVocabularyByLevel } from "@/lib/hsk-vocabulary";

export default function WritingClient({ level }: { level: HskLevel }) {
  const params = useSearchParams();
  const requestedWord = params.get("word") ?? "";
  const words = useMemo(() => getVocabularyByLevel(level), [level]);

  const characters = useMemo(() => {
    const unique = new Set<string>();
    for (const word of words) {
      for (const character of Array.from(word.hanzi)) {
        if (/[\u3400-\u9fff]/u.test(character)) unique.add(character);
      }
    }
    return [...unique];
  }, [words]);

  const initialIndex = Math.max(
    0,
    characters.findIndex((character) => requestedWord.includes(character)),
  );
  const [index, setIndex] = useState(initialIndex);
  const [quizMessage, setQuizMessage] = useState("");
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  const character = characters[index] ?? "";

  useEffect(() => {
    if (!targetRef.current || !character) return;

    targetRef.current.innerHTML = "";
    const writer = HanziWriter.create(targetRef.current, character, {
      width: 300,
      height: 300,
      padding: 12,
      showOutline: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 120,
      charDataLoader(char, onComplete, onError) {
        fetch(`/hanzi-data/${encodeURIComponent(char)}.json`)
          .then((response) => {
            if (!response.ok) throw new Error("Character data unavailable");
            return response.json();
          })
          .then(onComplete)
          .catch(onError);
      },
    });

    writerRef.current = writer;
    setQuizMessage("");

    return () => {
      targetRef.current?.replaceChildren();
      writerRef.current = null;
    };
  }, [character]);

  function animate() {
    writerRef.current?.animateCharacter();
  }

  function quiz() {
    setQuizMessage("အစဉ်လိုက် ရေးကြည့်ပါ။");
    writerRef.current?.quiz({
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      onComplete(summary) {
        setQuizMessage(
          `Completed · mistakes ${summary.totalMistakes}`,
        );
      },
    });
  }

  if (!character) {
    return (
      <main className="min-h-screen bg-[#080011] p-8 text-white">
        No writing characters found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080011] px-4 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-300">
              HSK {level} Writing
            </p>
            <h1 className="mt-2 text-4xl font-black">
              Character Practice
            </h1>
            <p className="mt-2 text-white/45">
              {characters.length.toLocaleString()} unique characters
            </p>
          </div>
          <Link
            href={`/hsk/vocabulary/${level}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold"
          >
            Browse vocabulary
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div
              ref={targetRef}
              className="mx-auto h-[300px] w-[300px] overflow-hidden rounded-2xl bg-white"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={animate}
                className="rounded-2xl bg-cyan-600 px-4 py-3 font-black"
              >
                ▶ Stroke order
              </button>
              <button
                type="button"
                onClick={quiz}
                className="rounded-2xl bg-fuchsia-600 px-4 py-3 font-black"
              >
                ✍ Practice
              </button>
            </div>

            {quizMessage ? (
              <p className="mt-4 text-center text-sm text-emerald-200">
                {quizMessage}
              </p>
            ) : null}

            <div className="mt-5 flex justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setIndex((value) =>
                    value <= 0 ? characters.length - 1 : value - 1,
                  )
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-bold"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setIndex((value) =>
                    value >= characters.length - 1 ? 0 : value + 1,
                  )
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-bold"
              >
                Next →
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
              Current character
            </p>
            <p className="mt-4 text-8xl font-black">{character}</p>
            <p className="mt-4 text-white/45">
              Character {index + 1} of {characters.length}
            </p>

            <div className="mt-7 grid max-h-[420px] grid-cols-5 gap-2 overflow-y-auto pr-2 sm:grid-cols-8">
              {characters.map((item, itemIndex) => (
                <button
                  type="button"
                  key={`${item}-${itemIndex}`}
                  onClick={() => setIndex(itemIndex)}
                  className={`aspect-square rounded-xl text-2xl font-black ${
                    itemIndex === index
                      ? "bg-fuchsia-600"
                      : "border border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
