"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  speakChinese,
  stopSpeaking,
} from "@/lib/ai/speech";

type DictionaryAudioButtonProps = {
  text: string;

  speed?:
    | "normal"
    | "slow";

  label?: string;

  compact?: boolean;
};

export default function DictionaryAudioButton({
  text,
  speed = "normal",
  label,
  compact = false,
}: DictionaryAudioButtonProps) {
  const [isPlaying, setIsPlaying] =
    useState(false);

  const [hasError, setHasError] =
    useState(false);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  async function handlePlay() {
    const cleaned =
      text.trim();

    if (!cleaned) {
      return;
    }

    if (isPlaying) {
      stopSpeaking();

      setIsPlaying(false);

      return;
    }

    setHasError(false);

    try {
      await speakChinese(
        cleaned,
        {
          speed,

          onStart: () => {
            setIsPlaying(true);
          },

          onEnd: () => {
            setIsPlaying(false);
          },

          onError: (
            error,
          ) => {
            console.error(
              "Dictionary TTS error:",
              error,
            );

            setHasError(true);
            setIsPlaying(false);
          },
        },
      );

      setIsPlaying(false);
    } catch (error) {
      console.error(
        "Dictionary speech failed:",
        error,
      );

      setHasError(true);
      setIsPlaying(false);
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handlePlay}
        aria-label={
          isPlaying
            ? "Stop pronunciation"
            : "Play pronunciation"
        }
        title={
          isPlaying
            ? "Stop"
            : "Play pronunciation"
        }
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition",
          isPlaying
            ? "border-fuchsia-300/30 bg-fuchsia-500/20 text-fuchsia-200"
            : "border-white/10 bg-white/5 text-white/60 hover:border-fuchsia-300/20 hover:bg-fuchsia-500/10 hover:text-fuchsia-200",
        ].join(" ")}
      >
        {isPlaying
          ? "■"
          : "🔊"}
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePlay}
        className={[
          "flex w-full items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-sm font-black transition",
          isPlaying
            ? "border-fuchsia-300/30 bg-fuchsia-500/20 text-fuchsia-100"
            : "border-fuchsia-300/10 bg-fuchsia-500/[0.07] text-fuchsia-200 hover:border-fuchsia-300/25 hover:bg-fuchsia-500/15",
        ].join(" ")}
      >
        <span
          className={
            isPlaying
              ? "animate-pulse"
              : ""
          }
        >
          {isPlaying
            ? "🔊"
            : "🔊"}
        </span>

        <span>
          {isPlaying
            ? "Playing..."
            : label ??
              (
                speed ===
                  "slow"
                  ? "Play Slowly"
                  : "Play Pronunciation"
              )}
        </span>

        {isPlaying ? (
          <span className="ml-1 text-xs text-white/45">
            Tap to stop
          </span>
        ) : null}
      </button>

      {hasError ? (
        <p
          lang="my"
          className="mt-2 text-center text-xs font-medium text-red-300/70"
        >
          အသံဖွင့်၍မရပါ။
          ခဏနေပြီး ပြန်စမ်းပါ။
        </p>
      ) : null}
    </div>
  );
}