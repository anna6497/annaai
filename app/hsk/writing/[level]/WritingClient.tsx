"use client";

import type {
  HskLevel,
} from "@/types/hsk-vocabulary";

import HanziWriter from "hanzi-writer";
import Link from "next/link";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getVocabularyByLevel,
} from "@/lib/hsk-vocabulary";

interface WritingClientProps {
  level: HskLevel;
  requestedCharacter?: string;
}

export default function WritingClient({
  level,
  requestedCharacter = "",
}: WritingClientProps) {
  const words =
    useMemo(
      () =>
        getVocabularyByLevel(
          level,
        ),
      [level],
    );

  const characters =
    useMemo(() => {
      const unique =
        new Set<string>();

      for (const word of words) {
        for (
          const character of Array.from(
            word.hanzi,
          )
        ) {
          if (
            /[\u3400-\u4DBF\u4E00-\u9FFF]/u.test(
              character,
            )
          ) {
            unique.add(
              character,
            );
          }
        }
      }

      return [
        ...unique,
      ];
    }, [words]);

  const initialIndex =
    useMemo(() => {
      if (
        !requestedCharacter
      ) {
        return 0;
      }

      const foundIndex =
        characters.findIndex(
          (character) =>
            character ===
            requestedCharacter,
        );

      return foundIndex >= 0
        ? foundIndex
        : 0;
    }, [
      characters,
      requestedCharacter,
    ]);

  const [
    index,
    setIndex,
  ] =
    useState(
      initialIndex,
    );

  const [
    quizMessage,
    setQuizMessage,
  ] =
    useState("");

  const targetRef =
    useRef<HTMLDivElement>(
      null,
    );

  const writerRef =
    useRef<HanziWriter | null>(
      null,
    );

  const character =
    characters[index] ??
    "";

  /*
   * If the URL changes from
   * /1/你 -> /1/好
   * make sure the selected
   * character changes too.
   */
  useEffect(() => {
    setIndex(
      initialIndex,
    );
  }, [initialIndex]);

  /*
   * Find vocabulary information
   * containing the current
   * character.
   */
  const currentWord =
    useMemo(() => {
      return (
        words.find(
          (word) =>
            word.hanzi.includes(
              character,
            ),
        ) ?? null
      );
    }, [
      words,
      character,
    ]);

  /*
   * Hanzi Writer
   */
  useEffect(() => {
    if (
      !targetRef.current ||
      !character
    ) {
      return;
    }

    targetRef.current.innerHTML =
      "";

    const writer =
      HanziWriter.create(
        targetRef.current,
        character,
        {
          width: 300,
          height: 300,

          padding: 12,

          showOutline: true,
          showCharacter: true,

          strokeAnimationSpeed: 1,

          delayBetweenStrokes:
            120,

          charDataLoader(
            char,
            onComplete,
            onError,
          ) {
            fetch(
              `/hanzi-data/${encodeURIComponent(
                char,
              )}.json`,
            )
              .then(
                (
                  response,
                ) => {
                  if (
                    !response.ok
                  ) {
                    throw new Error(
                      "Character data unavailable",
                    );
                  }

                  return response.json();
                },
              )
              .then(
                onComplete,
              )
              .catch(
                onError,
              );
          },
        },
      );

    writerRef.current =
      writer;

    setQuizMessage(
      "",
    );

    return () => {
      targetRef.current?.replaceChildren();

      writerRef.current =
        null;
    };
  }, [character]);

  function animate() {
    setQuizMessage(
      "",
    );

    writerRef.current?.animateCharacter();
  }

  function quiz() {
    setQuizMessage(
      "အစဉ်လိုက် ရေးကြည့်ပါ။",
    );

    writerRef.current?.quiz(
      {
        showHintAfterMisses:
          2,

        highlightOnComplete:
          true,

        onComplete(
          summary,
        ) {
          setQuizMessage(
            `Completed · mistakes ${summary.totalMistakes}`,
          );
        },
      },
    );
  }

  function previous() {
    setIndex(
      (value) =>
        value <= 0
          ? characters.length -
            1
          : value - 1,
    );

    setQuizMessage(
      "",
    );
  }

  function next() {
    setIndex(
      (value) =>
        value >=
        characters.length -
          1
          ? 0
          : value + 1,
    );

    setQuizMessage(
      "",
    );
  }

  if (!character) {
    return (
      <main className="min-h-screen bg-[#080011] px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/hsk/writing/${level}`}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold"
          >
            ← HSK {level}
          </Link>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center">
            No writing
            characters found.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080011] px-4 pb-32 pt-6 text-white">
      <section className="mx-auto max-w-5xl">

        {/* NAV */}

        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/hsk/writing/${level}`}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            ← Characters
          </Link>

          <span className="rounded-full border border-fuchsia-300/10 bg-fuchsia-500/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-fuchsia-200">
            HSK {level}
          </span>
        </div>

        {/* HEADER */}

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300">
              HSK {level} Writing
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Character Practice
            </h1>

            <p className="mt-2 text-sm text-white/40">
              Character{" "}
              {index + 1} of{" "}
              {
                characters.length
              }
            </p>
          </div>

          <Link
            href={`/hsk/flashcards/${level}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white/60 transition hover:bg-white/10"
          >
            Flashcards →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">

          {/* WRITING BOARD */}

          <div className="rounded-[28px] border border-white/10 bg-[#15071f] p-5 sm:p-6">

            <div
              ref={
                targetRef
              }
              className="mx-auto h-[300px] w-[300px] max-w-full overflow-hidden rounded-[22px] bg-white"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={
                  animate
                }
                className="rounded-2xl bg-cyan-600 px-3 py-3.5 text-xs font-black transition hover:bg-cyan-500 sm:text-sm"
              >
                ▶ Stroke Order
              </button>

              <button
                type="button"
                onClick={
                  quiz
                }
                className="rounded-2xl bg-fuchsia-600 px-3 py-3.5 text-xs font-black transition hover:bg-fuchsia-500 sm:text-sm"
              >
                ✍ Practice
              </button>
            </div>

            {quizMessage ? (
              <div className="mt-4 rounded-xl border border-emerald-300/10 bg-emerald-500/[0.06] px-4 py-3">
                <p
                  lang="my"
                  className="text-center text-xs font-bold text-emerald-200"
                >
                  {
                    quizMessage
                  }
                </p>
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={
                  previous
                }
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-bold text-white/65 transition hover:bg-white/10"
              >
                ← Previous
              </button>

              <button
                type="button"
                onClick={
                  next
                }
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-bold text-white/65 transition hover:bg-white/10"
              >
                Next →
              </button>
            </div>
          </div>

          {/* INFORMATION */}

          <div className="rounded-[28px] border border-white/10 bg-[#15071f] p-6">

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              Current Character
            </p>

            <div className="mt-4 flex flex-wrap items-end gap-5">
              <p
                lang="zh-CN"
                className="text-8xl font-black leading-none"
              >
                {
                  character
                }
              </p>

              {currentWord ? (
                <div className="pb-1">
                  <p className="text-lg font-black text-fuchsia-300">
                    {
                      currentWord.pinyin
                    }
                  </p>

                  <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-white/25">
                    From{" "}
                    {
                      currentWord.hanzi
                    }
                  </p>
                </div>
              ) : null}
            </div>

            {currentWord ? (
              <div className="mt-6 space-y-3">

                <div className="rounded-2xl border border-fuchsia-300/10 bg-fuchsia-500/[0.05] p-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-fuchsia-300/50">
                    Myanmar
                  </p>

                  <p
                    lang="my"
                    className="mt-2 text-sm font-semibold leading-7 text-white/75"
                  >
                    {currentWord.meaningMyanmar ??
                      currentWord.myanmar ??
                      "မြန်မာအဓိပ္ပာယ် မထည့်ရသေးပါ"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-white/30">
                    English
                  </p>

                  <p className="mt-2 text-sm font-medium leading-6 text-white/55">
                    {currentWord.meaning ??
                      currentWord.english ??
                      "Meaning pending"}
                  </p>
                </div>

              </div>
            ) : null}

            {/* CHARACTER LIST */}

            <div className="mt-7 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black">
                  HSK {level} Characters
                </p>

                <span className="text-[10px] font-bold text-white/25">
                  {
                    characters.length
                  }
                </span>
              </div>

              <div className="mt-4 grid max-h-[320px] grid-cols-5 gap-2 overflow-y-auto pr-2 sm:grid-cols-7">
                {characters.map(
                  (
                    item,
                    itemIndex,
                  ) => (
                    <button
                      type="button"
                      key={`${item}-${itemIndex}`}
                      onClick={() =>
                        setIndex(
                          itemIndex,
                        )
                      }
                      className={`aspect-square rounded-xl text-xl font-black transition ${
                        itemIndex ===
                        index
                          ? "bg-fuchsia-600 text-white"
                          : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {
                        item
                      }
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}