"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ReadingLevelPage() {
  const params = useParams<{ level: string }>();

  const level = Number(params.level);

  const [showPinyin, setShowPinyin] =
    useState(true);

  const [
    showTranslation,
    setShowTranslation,
  ] = useState(false);

  function readStory() {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const text =
      "今天是星期天。小明不用上班。他早上八点起床，然后去公园跑步。公园里有很多人。";

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "zh-CN";
    utterance.rate = 0.8;

    window.speechSynthesis.speak(utterance);
  }

  return (
    <main className="min-h-screen bg-[#090014] px-4 py-6 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <Link
            href="/hsk/reading"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            ← Levels
          </Link>

          <p className="font-black">
            HSK {level} Reading
          </p>
        </header>

        <article className="mt-12 overflow-hidden rounded-[2.5rem] border border-pink-300/15 bg-gradient-to-br from-pink-950/70 via-rose-950/50 to-slate-950 shadow-2xl">
          <div className="border-b border-white/10 p-7 sm:p-9">
            <p className="text-sm font-bold uppercase tracking-widest text-pink-300">
              Story 01
            </p>

            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              小明的星期天
            </h1>

            <p className="mt-3 text-white/45">
              Xiǎomíng de xīngqītiān
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={readStory}
                className="rounded-full bg-pink-600 px-5 py-3 text-sm font-bold hover:bg-pink-500"
              >
                🔊 Read Aloud
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowPinyin(
                    (current) => !current
                  )
                }
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold hover:bg-white/10"
              >
                {showPinyin
                  ? "Hide Pinyin"
                  : "Show Pinyin"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowTranslation(
                    (current) => !current
                  )
                }
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold hover:bg-white/10"
              >
                {showTranslation
                  ? "Hide Myanmar"
                  : "Show Myanmar"}
              </button>
            </div>
          </div>

          <div className="space-y-8 p-7 sm:p-9">
            <div>
              <p className="text-2xl font-bold leading-10">
                今天是星期天。
              </p>

              {showPinyin && (
                <p className="mt-2 text-pink-200">
                  Jīntiān shì xīngqītiān.
                </p>
              )}

              {showTranslation && (
                <p className="mt-2 text-white/55">
                  ဒီနေ့ တနင်္ဂနွေနေ့ဖြစ်ပါတယ်။
                </p>
              )}
            </div>

            <div>
              <p className="text-2xl font-bold leading-10">
                小明不用上班。
              </p>

              {showPinyin && (
                <p className="mt-2 text-pink-200">
                  Xiǎomíng bú yòng shàngbān.
                </p>
              )}

              {showTranslation && (
                <p className="mt-2 text-white/55">
                  ရှောင်မင် အလုပ်သွားစရာမလိုပါဘူး။
                </p>
              )}
            </div>

            <div>
              <p className="text-2xl font-bold leading-10">
                他早上八点起床，然后去公园跑步。
              </p>

              {showPinyin && (
                <p className="mt-2 text-pink-200">
                  Tā zǎoshang bā diǎn qǐchuáng,
                  ránhòu qù gōngyuán pǎobù.
                </p>
              )}

              {showTranslation && (
                <p className="mt-2 text-white/55">
                  သူ မနက်ရှစ်နာရီမှာ အိပ်ရာထပြီး
                  ပန်းခြံကို အပြေးလေ့ကျင့်ဖို့
                  သွားပါတယ်။
                </p>
              )}
            </div>

            <div>
              <p className="text-2xl font-bold leading-10">
                公园里有很多人。
              </p>

              {showPinyin && (
                <p className="mt-2 text-pink-200">
                  Gōngyuán lǐ yǒu hěn duō rén.
                </p>
              )}

              {showTranslation && (
                <p className="mt-2 text-white/55">
                  ပန်းခြံထဲမှာ လူတွေအများကြီး
                  ရှိပါတယ်။
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <h2 className="text-xl font-black">
                New Vocabulary
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "星期天",
                    "xīngqītiān",
                    "တနင်္ဂနွေနေ့",
                  ],
                  [
                    "上班",
                    "shàngbān",
                    "အလုပ်သွားသည်",
                  ],
                  [
                    "起床",
                    "qǐchuáng",
                    "အိပ်ရာထသည်",
                  ],
                  [
                    "跑步",
                    "pǎobù",
                    "ပြေးသည်",
                  ],
                ].map(
                  ([hanzi, pinyin, myanmar]) => (
                    <div
                      key={hanzi}
                      className="rounded-2xl bg-white/5 p-4"
                    >
                      <p className="text-xl font-bold">
                        {hanzi}
                      </p>

                      <p className="mt-1 text-sm text-pink-200">
                        {pinyin}
                      </p>

                      <p className="mt-2 text-sm text-white/45">
                        {myanmar}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-2xl bg-pink-600 px-5 py-4 font-bold hover:bg-pink-500"
            >
              Start Reading Quiz
            </button>
          </div>
        </article>
      </div>
    </main>
  );
}