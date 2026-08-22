"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import {
  getVocabulary,
  getWritingCharacters,
} from "@/lib/hsk/vocabulary";

import type {
  HskLevel,
} from "@/types/hsk-vocabulary";

function isValidHskLevel(
  value: number,
): value is HskLevel {
  return (
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 9
  );
}

export default function WritingLevelPage() {
  const params =
    useParams<{
      level: string;
    }>();

  const parsedLevel =
    Number(params.level);

  const level: HskLevel | null =
    isValidHskLevel(
      parsedLevel,
    )
      ? parsedLevel
      : null;

  const vocabulary =
    useMemo(() => {
      if (!level) {
        return [];
      }

      return getVocabulary(
        level,
      );
    }, [level]);

  const characters =
    useMemo(() => {
      if (!level) {
        return [];
      }

      return getWritingCharacters(
        level,
      );
    }, [level]);

  const characterMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          {
            pinyin: string;
            myanmar: string;
            english: string;
            vocabId: string;
          }
        >();

      for (const word of vocabulary) {
        for (
          const character of Array.from(
            word.hanzi,
          )
        ) {
          if (
            !/[\u3400-\u4DBF\u4E00-\u9FFF]/u.test(
              character,
            )
          ) {
            continue;
          }

          if (
            map.has(
              character,
            )
          ) {
            continue;
          }

          map.set(
            character,
            {
              pinyin:
                word.primaryPinyin ??
                word.pinyin ??
                "",

              myanmar:
                word.meaningMyanmar ??
                word.myanmar ??
                "",

              english:
                word.meaning ??
                word.english ??
                "",

              vocabId:
                String(
                  word.id,
                ),
            },
          );
        }
      }

      return map;
    }, [vocabulary]);

  if (!level) {
    return (
      <main className="min-h-screen bg-[#080011] px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/hsk/writing"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold"
          >
            ← Writing
          </Link>

          <section className="mt-8 rounded-[28px] border border-white/10 bg-[#16091f] p-8 text-center">
            <p className="text-4xl">
              ✍️
            </p>

            <h1 className="mt-4 text-2xl font-black">
              Invalid HSK Level
            </h1>

            <p className="mt-2 text-sm text-white/40">
              Please choose HSK 1–9.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080011] px-4 pb-32 pt-6 text-white">
      <div className="mx-auto w-full max-w-4xl">

        {/* TOP NAV */}

        <header>
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/hsk/writing"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              ← Writing
            </Link>

            <span className="rounded-full border border-fuchsia-300/10 bg-fuchsia-500/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-fuchsia-200">
              HSK {level}
            </span>
          </div>

          {/* TITLE */}

          <div className="mt-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-300/10 bg-fuchsia-500/10 text-2xl">
                ✍️
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300">
                  Chinese Writing
                </p>

                <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                  HSK {level} Characters
                </h1>
              </div>
            </div>

            <p
              lang="my"
              className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/45"
            >
              HSK {level} ထဲက Chinese
              characters တွေကိုရွေးပြီး
              writing practice လုပ်နိုင်ပါတယ်။
            </p>
          </div>
        </header>

        {/* STATS */}

        <section className="mt-7 grid grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-white/10 bg-[#15071f] p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/30">
              Vocabulary
            </p>

            <p className="mt-2 text-2xl font-black text-fuchsia-300">
              {vocabulary.length}
            </p>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-[#15071f] p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/30">
              Characters
            </p>

            <p className="mt-2 text-2xl font-black text-fuchsia-300">
              {characters.length}
            </p>
          </div>
        </section>

        {/* TIP */}

        <section className="mt-5 rounded-[20px] border border-cyan-300/10 bg-cyan-400/[0.05] px-5 py-4">
          <p
            lang="my"
            className="text-xs font-bold leading-6 text-cyan-100/65"
          >
            💡 Character တစ်လုံးကိုနှိပ်ပြီး
            writing practice ကိုစတင်ပါ။
          </p>
        </section>

        {/* CHARACTER GRID */}

        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-300">
                Characters
              </p>

              <h2 className="mt-1 text-lg font-black">
                Choose a character
              </h2>
            </div>

            <p className="text-[10px] font-bold text-white/25">
              {characters.length} total
            </p>
          </div>

          {characters.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {characters.map(
                (character) => {
                  const info =
                    characterMap.get(
                      character,
                    );

                  return (
                    <Link
                      key={character}
                      href={`/hsk/writing/${level}/${encodeURIComponent(
                        character,
                      )}`}
                      className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-[#16091f] p-4 text-center transition hover:-translate-y-0.5 hover:border-fuchsia-300/25 hover:bg-[#1c0b27]"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500/[0.04] to-transparent opacity-0 transition group-hover:opacity-100" />

                      <p
                        lang="zh-CN"
                        className="relative text-4xl font-black text-white"
                      >
                        {character}
                      </p>

                      {info?.pinyin ? (
                        <p className="relative mt-2 truncate text-[10px] font-bold text-fuchsia-300/60">
                          {info.pinyin}
                        </p>
                      ) : (
                        <p className="relative mt-2 text-[10px] text-white/20">
                          Tap to write
                        </p>
                      )}

                      <div className="relative mt-3 text-[9px] font-black text-fuchsia-300/45">
                        WRITE →
                      </div>
                    </Link>
                  );
                },
              )}
            </div>
          ) : (
            <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-8 text-center">
              <p className="text-4xl">
                字
              </p>

              <p className="mt-4 font-black">
                No characters found
              </p>
            </div>
          )}
        </section>

        <div className="h-10" />
      </div>
    </main>
  );
}