"use client";

import { useEffect, useRef, useState } from "react";
import type { SpeakingPracticeSentence } from "@/lib/speaking-practice/types";

type PronunciationPracticeProps = {
  sentences: SpeakingPracticeSentence[];
};

type PlaybackSpeed = 1 | 0.75;

export default function PronunciationPractice({
  sentences,
}: PronunciationPracticeProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] =
    useState<PlaybackSpeed>(1);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);

  const currentSentence = sentences[currentIndex];

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    stopAudio();
    setAudioError(null);
  }, [currentIndex]);

  function stopAudio() {
    if (!audioRef.current) {
      setIsPlaying(false);
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
    setIsPlaying(false);
  }

  function playAudio(speed: PlaybackSpeed = playbackSpeed) {
    if (!currentSentence?.audioUrl) {
      setAudioError("This sentence does not have a sample audio file.");
      return;
    }

    stopAudio();
    setAudioError(null);
    setPlaybackSpeed(speed);

    const audio = new Audio(currentSentence.audioUrl);
    audio.playbackRate = speed;
    audio.preload = "auto";

    audio.onplay = () => {
      setIsPlaying(true);
    };

    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setIsPlaying(false);
      audioRef.current = null;
      setAudioError(
        `Audio file could not be loaded: ${currentSentence.audioUrl}`
      );
    };

    audioRef.current = audio;

    void audio.play().catch((error: unknown) => {
      console.error("Unable to play pronunciation audio:", error);

      setIsPlaying(false);
      audioRef.current = null;
      setAudioError(
        "The browser could not play this audio. Please check the audio file."
      );
    });
  }

  function goToPreviousSentence() {
    setCurrentIndex((previousIndex) =>
      Math.max(0, previousIndex - 1)
    );
  }

  function goToNextSentence() {
    setCurrentIndex((previousIndex) =>
      Math.min(sentences.length - 1, previousIndex + 1)
    );
  }

  if (!currentSentence) {
    return (
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur">
        <h1 className="text-2xl font-semibold text-white">
          Pronunciation Practice
        </h1>

        <p className="mt-3 text-sm text-white/70">
          No speaking-practice sentences were found.
        </p>
      </section>
    );
  }

  const progressPercentage =
    ((currentIndex + 1) / sentences.length) * 100;

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet-200">
            HSK {currentSentence.level}
          </p>

          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Listen and Repeat
          </h1>
        </div>

        <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80">
          {currentIndex + 1} / {sentences.length}
        </div>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-300"
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-white/10 px-6 py-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-200">
              {currentSentence.category.replaceAll("-", " ")}
            </span>

            <span className="text-xs capitalize text-white/50">
              {currentSentence.difficulty}
            </span>
          </div>
        </div>

        <div className="px-6 py-10 text-center sm:px-10">
          <p className="text-4xl font-semibold leading-relaxed text-white sm:text-5xl">
            {currentSentence.hanzi}
          </p>

          {showPinyin ? (
            <p className="mt-5 text-xl leading-relaxed text-violet-200 sm:text-2xl">
              {currentSentence.pinyin}
            </p>
          ) : null}

          {showMeaning ? (
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              {currentSentence.myanmar}
            </p>
          ) : null}

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (isPlaying) {
                  stopAudio();
                } else {
                  playAudio(playbackSpeed);
                }
              }}
              className="min-w-36 rounded-2xl bg-white px-5 py-3 font-semibold text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPlaying ? "■ Stop" : "▶ Listen"}
            </button>

            <button
              type="button"
              onClick={() => playAudio(0.75)}
              className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
            >
              🐢 Slow Audio
            </button>
          </div>

          {audioError ? (
            <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {audioError}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowPinyin((visible) => !visible)}
              className="rounded-xl border border-white/10 bg-black/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              {showPinyin ? "Hide Pinyin" : "Show Pinyin"}
            </button>

            <button
              type="button"
              onClick={() => setShowMeaning((visible) => !visible)}
              className="rounded-xl border border-white/10 bg-black/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              {showMeaning ? "Hide Meaning" : "Show Meaning"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-black/10 px-6 py-5 sm:px-8">
          <button
            type="button"
            onClick={goToPreviousSentence}
            disabled={currentIndex === 0}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Previous
          </button>

          <button
            type="button"
            disabled
            className="rounded-xl bg-violet-500/30 px-5 py-3 text-sm font-semibold text-white/60"
            title="Recording will be added in the next step."
          >
            🎤 Repeat
          </button>

          <button
            type="button"
            onClick={goToNextSentence}
            disabled={currentIndex === sentences.length - 1}
            className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}