"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import DictionaryAudioButton from "@/components/hsk/DictionaryAudioButton";

import {
  getVocabularyRecommendations,
  searchAllVocabulary,
} from "@/lib/hsk/vocabulary";

const INITIAL_RESULT_LIMIT = 12;

export default function DictionaryClient() {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const trimmedQuery = query.trim();

  const recommendations = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    return getVocabularyRecommendations(
      trimmedQuery,
      8,
    );
  }, [trimmedQuery]);

  const results = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    return searchAllVocabulary(
      trimmedQuery,
      50,
    );
  }, [trimmedQuery]);

  const visibleResults = useMemo(() => {
    if (showAll) {
      return results;
    }

    return results.slice(
      0,
      INITIAL_RESULT_LIMIT,
    );
  }, [results, showAll]);

  function handleQueryChange(
    value: string,
  ) {
    setQuery(value);
    setShowAll(false);
  }

  function clearSearch() {
    setQuery("");
    setShowAll(false);
  }

  return (
    <main className="min-h-screen bg-[#080011] px-4 pb-32 pt-6 text-white">
      <div className="mx-auto w-full max-w-3xl">

        <header>
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/hsk"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/65 transition hover:bg-white/10"
            >
              ← HSK
            </Link>

            <span className="rounded-full border border-fuchsia-300/10 bg-fuchsia-500/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-fuchsia-200">
              Dictionary
            </span>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-300/10 bg-fuchsia-500/10 text-2xl">
                🔎
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300">
                  Anna AI
                </p>

                <h1 className="mt-1 text-3xl font-black">
                  Chinese Dictionary
                </h1>
              </div>
            </div>

            <p
              lang="my"
              className="mt-4 text-sm font-medium leading-7 text-white/45"
            >
              Hanzi, Pinyin, Myanmar သို့မဟုတ် English
              နဲ့ HSK vocabulary ကို ရှာနိုင်ပါတယ်။
            </p>
          </div>
        </header>

        <section className="mt-7">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-lg text-white/30">
              🔎
            </div>

            <input
              value={query}
              onChange={(event) =>
                handleQueryChange(
                  event.target.value,
                )
              }
              placeholder="Search 你好, ni hao, hello, မင်္ဂလာပါ..."
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-[22px] border border-white/10 bg-[#15071f] py-5 pl-14 pr-14 text-base font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:ring-4 focus:ring-fuchsia-500/5"
            />

            {query ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 flex items-center px-5 text-white/35 transition hover:text-white"
              >
                ✕
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "汉字 Hanzi",
              "Pinyin",
              "Myanmar",
              "English",
            ].map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold text-white/35"
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        {!trimmedQuery ? (
          <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.025] p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-3xl">
              字
            </div>

            <h2 className="mt-5 text-xl font-black">
              Search Chinese Words
            </h2>

            <p
              lang="my"
              className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/40"
            >
              Vocabulary အားလုံးတန်းမပြဘဲ
              ရှာလိုက်တဲ့စကားလုံးနဲ့ သက်ဆိုင်တဲ့
              suggestions နဲ့ results ကိုပဲပြပေးပါမယ်။
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "你好",
                "学习",
                "工作",
                "friend",
                "love",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    handleQueryChange(item)
                  }
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {trimmedQuery &&
        recommendations.length > 0 ? (
          <section className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
                Suggestions
              </p>

              <p className="text-[10px] font-bold text-white/20">
                {recommendations.length} suggestions
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {recommendations.map((word) => (
                <Link
                  key={`${word.level}-${word.id}`}
                  href={`/hsk/dictionary/${encodeURIComponent(
                    word.hanzi,
                  )}`}
                  className="rounded-full border border-fuchsia-300/10 bg-fuchsia-500/[0.06] px-4 py-2 text-left transition hover:bg-fuchsia-500/15"
                >
                  <span
                    lang="zh-CN"
                    className="font-black text-white"
                  >
                    {word.hanzi}
                  </span>

                  <span className="ml-2 text-xs font-semibold text-fuchsia-200/55">
                    {word.primaryPinyin ??
                      word.pinyin}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {trimmedQuery ? (
          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-300">
                  Search Results
                </p>

                <h2 className="mt-1 break-all text-xl font-black">
                  “{trimmedQuery}”
                </h2>
              </div>

              <p className="shrink-0 text-xs font-bold text-white/30">
                {results.length} results
              </p>
            </div>

            {results.length > 0 ? (
              <>
                <div className="mt-4 space-y-3">
                  {visibleResults.map(
                    (word) => (
                      <div
                        key={`${word.level}-${word.id}`}
                        className="group flex w-full items-start gap-3 rounded-[22px] border border-white/10 bg-[#15071f] p-5 transition hover:border-fuchsia-300/20 hover:bg-[#1a0925]"
                      >
                        <Link
                          href={`/hsk/dictionary/${encodeURIComponent(
                            word.hanzi,
                          )}`}
                          className="min-w-0 flex-1"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <p
                              lang="zh-CN"
                              className="text-2xl font-black"
                            >
                              {word.hanzi}
                            </p>

                            <span className="rounded-full bg-fuchsia-500/10 px-2.5 py-1 text-[9px] font-black text-fuchsia-300">
                              HSK {word.level}
                            </span>
                          </div>

                          <p className="mt-1 text-sm font-bold text-fuchsia-200/65">
                            {word.primaryPinyin ??
                              word.pinyin}
                          </p>

                          <p
                            lang="my"
                            className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-white/60"
                          >
                            {word.meaningMyanmar ??
                              word.myanmar ??
                              "မြန်မာအဓိပ္ပာယ် မထည့်ရသေးပါ"}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-white/30">
                            {word.meaning ??
                              word.english ??
                              ""}
                          </p>
                        </Link>

                        <div className="flex shrink-0 flex-col items-center gap-3">
                          <DictionaryAudioButton
                            text={word.hanzi}
                            speed="normal"
                            compact
                          />

                          <Link
                            href={`/hsk/dictionary/${encodeURIComponent(
                              word.hanzi,
                            )}`}
                            aria-label={`Open ${word.hanzi}`}
                            className="text-fuchsia-300/60 transition-transform group-hover:translate-x-1"
                          >
                            →
                          </Link>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {results.length >
                  INITIAL_RESULT_LIMIT ? (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() =>
                        setShowAll(
                          (value) =>
                            !value,
                        )
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-sm font-black text-white/55 transition hover:bg-white/[0.07] hover:text-white"
                    >
                      {showAll
                        ? "Show less"
                        : `Show more (${results.length - INITIAL_RESULT_LIMIT})`}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.025] p-8 text-center">
                <p className="text-3xl">
                  🔍
                </p>

                <p className="mt-3 font-black">
                  No results found
                </p>

                <p
                  lang="my"
                  className="mt-2 text-xs leading-6 text-white/35"
                >
                  Hanzi, Pinyin, Myanmar
                  ဒါမှမဟုတ် English နဲ့
                  ပြန်ရှာကြည့်ပါ။
                </p>
              </div>
            )}
          </section>
        ) : null}

        <div className="h-12" />
      </div>
    </main>
  );
}