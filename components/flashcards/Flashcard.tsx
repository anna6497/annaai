"use client";

import Link from "next/link";
import { useState } from "react";

import { getWritingUrl } from "@/lib/hsk-vocabulary";
import type {
  FlashcardStatus,
  HskVocabularyItem,
} from "@/types/vocabulary";

interface FlashcardProps {
  item: HskVocabularyItem;
  favorite: boolean;
  status: FlashcardStatus;
  onToggleFavorite: () => void;
  onStatusChange: (status: FlashcardStatus) => void;
}

export default function Flashcard({
  item,
  favorite,
  status,
  onToggleFavorite,
  onStatusChange,
}: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.85;

    window.speechSynthesis.speak(utterance);
  }

  return (
    <article className="mx-auto w-full max-w-3xl">
      <div
        className="group relative min-h-[430px] cursor-pointer [perspective:1200px]"
        onClick={() => setFlipped((value) => !value)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setFlipped((value) => !value);
          }
        }}
      >
        <div
          className={`relative min-h-[430px] w-full rounded-[2.5rem] transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="absolute inset-0 rounded-[2.5rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-950/90 via-slate-950 to-purple-950 p-8 shadow-[0_0_70px_rgba(16,185,129,0.15)] [backface-visibility:hidden] sm:p-12">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                  HSK {item.level}
                </p>

                <p className="mt-6 text-7xl font-black sm:text-9xl">
                  {item.hanzi}
                </p>

                <p className="mt-5 text-2xl font-bold text-emerald-200">
                  {item.pinyin}
                </p>
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleFavorite();
                }}
                className="rounded-full border border-white/10 bg-white/5 p-3 text-2xl transition hover:scale-110"
                aria-label="Toggle favorite"
              >
                {favorite ? "❤️" : "🤍"}
              </button>
            </div>

            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-sm text-white/40 sm:left-12 sm:right-12">
              <span>Tap to flip</span>
              <span>Front</span>
            </div>
          </div>

          <div className="absolute inset-0 rounded-[2.5rem] border border-fuchsia-300/20 bg-gradient-to-br from-purple-950 via-slate-950 to-emerald-950 p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-12">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-300">
              Meaning
            </p>

            <h2 className="mt-5 text-4xl font-black">{item.english}</h2>
            <p className="mt-3 text-xl text-white/70">{item.myanmar}</p>

            {item.example ? (
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                <p className="text-2xl font-bold">{item.example}</p>
                <p className="mt-2 text-emerald-200">
                  {item.examplePinyin}
                </p>
                <p className="mt-3 text-white/55">
                  {item.exampleMyanmar}
                </p>
              </div>
            ) : null}

            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-sm text-white/40 sm:left-12 sm:right-12">
              <span>Tap to flip</span>
              <span>Back</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => speak(item.hanzi)}
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold hover:bg-white/10"
        >
          🔊 Audio
        </button>

        <Link
          href={getWritingUrl(item)}
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center font-bold hover:bg-white/10"
        >
          ✍️ Writing
        </Link>

        <button
          type="button"
          onClick={() => onStatusChange("learning")}
          className={`rounded-2xl px-5 py-3 font-bold ${
            status === "learning"
              ? "bg-amber-500 text-black"
              : "bg-amber-500/15 text-amber-200"
          }`}
        >
          Learning
        </button>

        <button
          type="button"
          onClick={() => onStatusChange("known")}
          className={`rounded-2xl px-5 py-3 font-bold ${
            status === "known"
              ? "bg-emerald-500 text-black"
              : "bg-emerald-500/15 text-emerald-200"
          }`}
        >
          Known
        </button>
      </div>
    </article>
  );
}
