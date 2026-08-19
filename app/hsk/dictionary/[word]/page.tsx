import Link from "next/link";
import { notFound } from "next/navigation";

import DictionaryAudioButton from "@/components/hsk/DictionaryAudioButton";

import {
  getVocabularyByHanzi,
} from "@/lib/hsk/vocabulary";

import type {
  HskLevel,
} from "@/types/hsk-vocabulary";


type DictionaryWordPageProps = {
  params: Promise<{
    word: string;
  }>;
};


function isHskLevel(
  value: number,
): value is HskLevel {
  return (
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 9
  );
}


export default async function DictionaryWordPage({
  params,
}: DictionaryWordPageProps) {
  const {
    word: encodedWord,
  } = await params;

  /*
   * Decode URL word.
   *
   * Example:
   *
   * /hsk/dictionary/%E4%BD%A0%E5%A5%BD
   *
   * becomes:
   *
   * 你好
   */
  let requestedWord = "";

  try {
    requestedWord =
      decodeURIComponent(
        encodedWord,
      );
  } catch {
    notFound();
  }


  /*
   * Find vocabulary item.
   */
  const word =
    getVocabularyByHanzi(
      requestedWord,
    );

  if (!word) {
    notFound();
  }


  /*
   * Validate HSK level.
   */
  const parsedLevel =
    Number(word.level);

  if (
    !isHskLevel(
      parsedLevel,
    )
  ) {
    notFound();
  }

  const level: HskLevel =
    parsedLevel;


  /*
   * Display values.
   */
  const pinyin =
    word.primaryPinyin ??
    word.pinyin ??
    "";

  const myanmar =
    word.meaningMyanmar ??
    word.myanmar ??
    "မြန်မာအဓိပ္ပာယ် မထည့်ရသေးပါ";

  const english =
    word.meaning ??
    word.english ??
    "Meaning pending";

  const tags =
    word.partOfSpeech ??
    word.tags ??
    [];

  const example =
    word.example ??
    "";

  const examplePinyin =
    word.examplePinyin ??
    "";

  const exampleMyanmar =
    word.exampleMyanmar ??
    "";


  /*
   * Extract individual Chinese
   * characters for Writing Practice.
   *
   * Example:
   *
   * 你好
   *
   * becomes:
   *
   * ["你", "好"]
   */
  const chineseCharacters =
    Array.from(
      word.hanzi,
    ).filter(
      (
        character,
      ) =>
        /[\u3400-\u4DBF\u4E00-\u9FFF]/u.test(
          character,
        ),
    );


  /*
   * Remove duplicate characters.
   *
   * Example:
   *
   * 人人
   *
   * becomes:
   *
   * ["人"]
   */
  const uniqueChineseCharacters =
    Array.from(
      new Set(
        chineseCharacters,
      ),
    );


  return (
    <main className="min-h-screen bg-[#080011] px-4 pb-32 pt-6 text-white">
      <div className="mx-auto w-full max-w-3xl">

        {/* ========================================
            HEADER
        ======================================== */}

        <header className="flex items-center justify-between gap-4">
          <Link
            href="/hsk/dictionary"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            ← Dictionary
          </Link>

          <span className="rounded-full border border-fuchsia-300/10 bg-fuchsia-500/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-fuchsia-200">
            HSK {level}
          </span>
        </header>


        {/* ========================================
            MAIN WORD CARD
        ======================================== */}

        <section className="mt-8 overflow-hidden rounded-[30px] border border-fuchsia-300/15 bg-[#15071f]">

          {/* WORD HEADER */}

          <div className="bg-gradient-to-br from-fuchsia-500/[0.14] via-transparent to-purple-500/[0.08] p-7 sm:p-9">

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300">
                  Chinese Word
                </p>

                <h1
                  lang="zh-CN"
                  className="mt-5 break-words text-6xl font-black leading-tight sm:text-7xl"
                >
                  {word.hanzi}
                </h1>

                <p className="mt-4 text-xl font-black text-fuchsia-300">
                  {pinyin}
                </p>

              </div>


              {/* SMALL AUDIO BUTTON */}

              <div className="shrink-0 pt-8">
                <DictionaryAudioButton
                  text={word.hanzi}
                  speed="normal"
                  compact
                />
              </div>
            </div>


            {/* TRADITIONAL */}

            {word.traditional &&
            word.traditional !==
              word.hanzi ? (
              <div className="mt-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/25">
                  Traditional
                </span>

                <p
                  lang="zh-CN"
                  className="mt-1 text-lg font-bold text-white/55"
                >
                  {word.traditional}
                </p>
              </div>
            ) : null}

          </div>


          {/* ========================================
              CONTENT
          ======================================== */}

          <div className="space-y-4 p-6 sm:p-8">


            {/* ========================================
                PRONUNCIATION
            ======================================== */}

            <section className="rounded-2xl border border-cyan-300/10 bg-cyan-500/[0.04] p-5">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300/60">
                    Pronunciation
                  </p>

                  <p
                    lang="zh-CN"
                    className="mt-2 text-xl font-black text-white"
                  >
                    {word.hanzi}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-cyan-200/60">
                    {pinyin}
                  </p>
                </div>

                <span className="text-2xl">
                  🔊
                </span>

              </div>


              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                <DictionaryAudioButton
                  text={word.hanzi}
                  speed="normal"
                  label="🔊 Normal"
                />

                <DictionaryAudioButton
                  text={word.hanzi}
                  speed="slow"
                  label="🐢 Slow"
                />

              </div>

            </section>


            {/* ========================================
                MYANMAR MEANING
            ======================================== */}

            <section className="rounded-2xl border border-fuchsia-300/10 bg-fuchsia-500/[0.05] p-5">

              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-fuchsia-300/55">
                Myanmar Meaning
              </p>

              <p
                lang="my"
                className="mt-2 text-base font-semibold leading-7 text-white/80"
              >
                {myanmar}
              </p>

            </section>


            {/* ========================================
                ENGLISH MEANING
            ======================================== */}

            <section className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">

              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">
                English Meaning
              </p>

              <p className="mt-2 text-sm font-medium leading-6 text-white/65">
                {english}
              </p>

            </section>


            {/* ========================================
                WORD TYPE / TAGS
            ======================================== */}

            {tags.length > 0 ? (
              <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">

                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/25">
                  Word Type
                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  {tags.map(
                    (
                      tag,
                      index,
                    ) => (
                      <span
                        key={`${tag}-${index}`}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/45"
                      >
                        {tag}
                      </span>
                    ),
                  )}

                </div>

              </section>
            ) : null}


            {/* ========================================
                EXAMPLE SENTENCE
            ======================================== */}

            {example ? (
              <section className="rounded-2xl border border-white/5 bg-white/[0.025] p-5">

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">
                      Example Sentence
                    </p>

                    <p
                      lang="zh-CN"
                      className="mt-3 text-xl font-bold leading-8 text-white"
                    >
                      {example}
                    </p>

                    {examplePinyin ? (
                      <p className="mt-2 text-sm font-semibold leading-6 text-fuchsia-200/60">
                        {examplePinyin}
                      </p>
                    ) : null}

                    {exampleMyanmar ? (
                      <p
                        lang="my"
                        className="mt-2 text-sm font-medium leading-7 text-white/45"
                      >
                        {exampleMyanmar}
                      </p>
                    ) : null}

                  </div>


                  {/* EXAMPLE AUDIO */}

                  <div className="shrink-0">
                    <DictionaryAudioButton
                      text={example}
                      speed="normal"
                      compact
                    />
                  </div>

                </div>


                {/* SLOW EXAMPLE */}

                <div className="mt-4">

                  <DictionaryAudioButton
                    text={example}
                    speed="slow"
                    label="🐢 Listen to example slowly"
                  />

                </div>

              </section>
            ) : null}


            {/* ========================================
                WRITING PRACTICE
            ======================================== */}

            {uniqueChineseCharacters.length >
            0 ? (
              <section className="rounded-2xl border border-white/5 bg-white/[0.025] p-5">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">
                      Writing Practice
                    </p>

                    <p
                      lang="my"
                      className="mt-1 text-xs leading-5 text-white/35"
                    >
                      လေ့ကျင့်ချင်တဲ့
                      Chinese character ကို
                      ရွေးပါ။
                    </p>

                  </div>

                  <span className="text-xl">
                    ✍️
                  </span>

                </div>


                <div className="mt-4 flex flex-wrap gap-3">

                  {uniqueChineseCharacters.map(
                    (
                      character,
                    ) => (
                      <Link
                        key={character}
                        href={`/hsk/writing/${level}/${encodeURIComponent(
                          character,
                        )}`}
                        className="group flex min-h-16 min-w-16 items-center justify-center rounded-2xl border border-fuchsia-300/10 bg-fuchsia-500/[0.06] px-4 text-3xl font-black transition hover:border-fuchsia-300/30 hover:bg-fuchsia-500/15"
                      >
                        <span className="transition-transform group-hover:scale-110">
                          {character}
                        </span>
                      </Link>
                    ),
                  )}

                </div>

              </section>
            ) : null}


            {/* ========================================
                QUICK ACTIONS
            ======================================== */}

            <section>

              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/25">
                Continue Learning
              </p>


              <div className="grid gap-3 sm:grid-cols-2">

                <Link
                  href={`/hsk/writing/${level}`}
                  className="group rounded-2xl bg-fuchsia-600 px-5 py-4 text-center transition hover:bg-fuchsia-500"
                >
                  <div className="text-xl">
                    ✍️
                  </div>

                  <p className="mt-1 text-sm font-black">
                    Writing
                  </p>

                  <p
                    lang="my"
                    className="mt-1 text-[10px] font-medium text-white/60"
                  >
                    HSK {level} စာလုံးရေး
                    လေ့ကျင့်ရန်
                  </p>
                </Link>


                <Link
                  href={`/hsk/flashcards/${level}`}
                  className="group rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center transition hover:border-white/20 hover:bg-white/10"
                >
                  <div className="text-xl">
                    🃏
                  </div>

                  <p className="mt-1 text-sm font-black">
                    Flashcards
                  </p>

                  <p
                    lang="my"
                    className="mt-1 text-[10px] font-medium text-white/40"
                  >
                    HSK {level} vocabulary
                    ပြန်လေ့လာရန်
                  </p>
                </Link>

              </div>

            </section>


            {/* ========================================
                WORD INFORMATION
            ======================================== */}

            <section className="rounded-2xl border border-white/5 bg-black/10 p-5">

              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/20">
                Word Information
              </p>


              <div className="mt-4 grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-white/[0.025] p-3">

                  <p className="text-[9px] font-bold uppercase text-white/20">
                    Level
                  </p>

                  <p className="mt-1 text-sm font-black text-fuchsia-300">
                    HSK {level}
                  </p>

                </div>


                <div className="rounded-xl bg-white/[0.025] p-3">

                  <p className="text-[9px] font-bold uppercase text-white/20">
                    Characters
                  </p>

                  <p className="mt-1 text-sm font-black text-white/65">
                    {
                      chineseCharacters.length
                    }
                  </p>

                </div>

              </div>

            </section>


            {/* ========================================
                BACK TO SEARCH
            ======================================== */}

            <Link
              href="/hsk/dictionary"
              className="block rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-center text-xs font-bold text-white/40 transition hover:bg-white/5 hover:text-white/70"
            >
              ← Search another word
            </Link>

          </div>

        </section>


        <div className="h-10" />

      </div>
    </main>
  );
}