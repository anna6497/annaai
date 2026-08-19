"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getHskReadingStories,
  getHskReadingStory,
  type HskReadingStory,
} from "@/lib/hsk-reading";

import {
  getBestReadingDictionaryWord,
  tokenizeReadingText,
  type ReadingDictionaryWord,
  type ReadingToken,
} from "@/lib/hsk-reading-dictionary";

/* =========================================================
   TYPES
========================================================= */

type SelectedWord = {
  text: string;
  entry: ReadingDictionaryWord;
};

type PlaybackSpeed =
  | 0.75
  | 1
  | 1.25;

/* =========================================================
   HELPERS
========================================================= */

function formatTime(
  seconds: number,
): string {
  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {
    return "0:00";
  }

  const wholeSeconds =
    Math.floor(seconds);

  const minutes =
    Math.floor(
      wholeSeconds / 60,
    );

  const remainingSeconds =
    wholeSeconds % 60;

  return `${minutes}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

/* =========================================================
   PAGE
========================================================= */

export default function ReadingStoryPage() {
  const params =
    useParams<{
      level: string;
      storyId: string;
    }>();

  const level =
    Number(params.level);

  const storyId =
    params.storyId;

  /* =======================================================
     DISPLAY STATE
  ======================================================= */

  const [
    showPinyin,
    setShowPinyin,
  ] = useState(true);

  const [
    showMyanmar,
    setShowMyanmar,
  ] = useState(false);

  const [
    selectedWord,
    setSelectedWord,
  ] =
    useState<SelectedWord | null>(
      null,
    );

  /* =======================================================
     AUDIO STATE
  ======================================================= */

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    duration,
    setDuration,
  ] = useState(0);

  const [
    playbackSpeed,
    setPlaybackSpeed,
  ] =
    useState<PlaybackSpeed>(
      1,
    );

  const [
    audioError,
    setAudioError,
  ] = useState("");

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null,
    );

  const speechRef =
    useRef<SpeechSynthesisUtterance | null>(
      null,
    );

  /* =======================================================
     STORY
  ======================================================= */

  const story:
    HskReadingStory | null =
    useMemo(() => {
      return getHskReadingStory(
        level,
        storyId,
      );
    }, [
      level,
      storyId,
    ]);

  const allStories =
    useMemo(() => {
      return getHskReadingStories(
        level,
      );
    }, [level]);

  /* =======================================================
     TOKENIZED STORY
  ======================================================= */

  const tokenizedParagraphs =
    useMemo(() => {
      if (!story) {
        return [];
      }

      return story.paragraphs.map(
        (paragraph) =>
          tokenizeReadingText(
            paragraph,
            level,
          ),
      );
    }, [
      story,
      level,
    ]);

  /* =======================================================
     PREVIOUS / NEXT STORY
  ======================================================= */

  const currentIndex =
    useMemo(() => {
      return allStories.findIndex(
        (item) =>
          item.id === storyId,
      );
    }, [
      allStories,
      storyId,
    ]);

  const previousStory =
    currentIndex > 0
      ? allStories[
          currentIndex - 1
        ]
      : null;

  const nextStory =
    currentIndex >= 0 &&
    currentIndex <
      allStories.length - 1
      ? allStories[
          currentIndex + 1
        ]
      : null;

  /* =======================================================
     CHINESE VOICE
  ======================================================= */

  function getChineseVoice():
    SpeechSynthesisVoice | undefined {
    if (
      typeof window ===
      "undefined"
    ) {
      return undefined;
    }

    if (
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return undefined;
    }

    const voices =
      window.speechSynthesis.getVoices();

    return (
      voices.find((voice) =>
        voice.lang
          .toLowerCase()
          .startsWith("zh-cn"),
      ) ??
      voices.find((voice) =>
        voice.lang
          .toLowerCase()
          .startsWith("zh"),
      )
    );
  }

  /* =======================================================
     AUDIO CLEANUP
  ======================================================= */

  function clearCurrentAudio() {
    if (audioRef.current) {
      audioRef.current.pause();

      audioRef.current.src =
        "";

      audioRef.current =
        null;
    }

    if (
      typeof window !==
        "undefined" &&
      "speechSynthesis" in
        window
    ) {
      window.speechSynthesis.cancel();
    }

    speechRef.current =
      null;

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }

  /* =======================================================
     CREATE STATIC AUDIO INSTANCE
  ======================================================= */

  function ensureAudio():
    HTMLAudioElement | null {
    if (
      !story?.audioUrl
    ) {
      return null;
    }

    if (
      audioRef.current
    ) {
      return audioRef.current;
    }

    const audio =
      new Audio(
        story.audioUrl,
      );

    audio.preload =
      "metadata";

    audio.playbackRate =
      playbackSpeed;

    audio.onloadedmetadata =
      () => {
        setDuration(
          Number.isFinite(
            audio.duration,
          )
            ? audio.duration
            : 0,
        );
      };

    audio.ontimeupdate =
      () => {
        setCurrentTime(
          audio.currentTime,
        );

        if (
          Number.isFinite(
            audio.duration,
          )
        ) {
          setDuration(
            audio.duration,
          );
        }
      };

    audio.onplay =
      () => {
        setIsPlaying(true);
        setAudioError("");
      };

    audio.onpause =
      () => {
        setIsPlaying(false);
      };

    audio.onended =
      () => {
        setIsPlaying(false);
        setCurrentTime(
          audio.duration || 0,
        );
      };

    audio.onerror =
      () => {
        setIsPlaying(false);

        setAudioError(
          "Audio file could not be played.",
        );
      };

    audioRef.current =
      audio;

    return audio;
  }

  /* =======================================================
     PLAY / PAUSE
  ======================================================= */

  async function togglePlayPause() {
    if (!story) {
      return;
    }

    setAudioError("");

    /*
     * Static MP3
     */

    if (story.audioUrl) {
      const audio =
        ensureAudio();

      if (!audio) {
        return;
      }

      if (
        !audio.paused
      ) {
        audio.pause();
        return;
      }

      try {
        audio.playbackRate =
          playbackSpeed;

        await audio.play();
      } catch {
        setIsPlaying(false);

        setAudioError(
          "Audio could not be played.",
        );
      }

      return;
    }

    /*
     * Browser TTS fallback
     */

    if (
      typeof window ===
        "undefined" ||
      !(
        "speechSynthesis" in
        window
      )
    ) {
      setAudioError(
        "Audio is not supported on this device.",
      );

      return;
    }

    if (
      window.speechSynthesis.speaking &&
      !window.speechSynthesis.paused
    ) {
      window.speechSynthesis.pause();

      setIsPlaying(false);

      return;
    }

    if (
      window.speechSynthesis.paused
    ) {
      window.speechSynthesis.resume();

      setIsPlaying(true);

      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        story.audioText ||
          story.paragraphs.join(
            "",
          ),
      );

    utterance.lang =
      "zh-CN";

    utterance.rate =
      playbackSpeed;

    utterance.pitch = 1;

    const chineseVoice =
      getChineseVoice();

    if (chineseVoice) {
      utterance.voice =
        chineseVoice;
    }

    utterance.onstart =
      () => {
        setIsPlaying(true);
      };

    utterance.onend =
      () => {
        setIsPlaying(false);
      };

    utterance.onerror =
      () => {
        setIsPlaying(false);

        setAudioError(
          "Unable to play Chinese audio.",
        );
      };

    speechRef.current =
      utterance;

    window.speechSynthesis.speak(
      utterance,
    );
  }

  /* =======================================================
     RESTART
  ======================================================= */

  async function restartAudio() {
    if (!story) {
      return;
    }

    if (story.audioUrl) {
      const audio =
        ensureAudio();

      if (!audio) {
        return;
      }

      audio.currentTime = 0;

      setCurrentTime(0);

      try {
        audio.playbackRate =
          playbackSpeed;

        await audio.play();
      } catch {
        setAudioError(
          "Audio could not be played.",
        );
      }

      return;
    }

    if (
      typeof window !==
        "undefined" &&
      "speechSynthesis" in
        window
    ) {
      window.speechSynthesis.cancel();

      speechRef.current =
        null;

      setIsPlaying(false);

      await togglePlayPause();
    }
  }

  /* =======================================================
     SEEK
  ======================================================= */

  function handleSeek(
    value: number,
  ) {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    const newTime =
      Math.max(
        0,
        Math.min(
          value,
          duration,
        ),
      );

    audio.currentTime =
      newTime;

    setCurrentTime(
      newTime,
    );
  }

  /* =======================================================
     SPEED
  ======================================================= */

  function changeSpeed(
    speed: PlaybackSpeed,
  ) {
    setPlaybackSpeed(
      speed,
    );

    if (
      audioRef.current
    ) {
      audioRef.current.playbackRate =
        speed;
    }

    /*
     * Browser SpeechSynthesis
     * cannot change rate reliably
     * while current utterance
     * is already speaking.
     */

    if (
      !story?.audioUrl &&
      typeof window !==
        "undefined" &&
      "speechSynthesis" in
        window &&
      window.speechSynthesis.speaking
    ) {
      window.speechSynthesis.cancel();

      speechRef.current =
        null;

      setIsPlaying(false);
    }
  }

  /* =======================================================
     WORD AUDIO
  ======================================================= */

  function playWord(
    word: string,
  ) {
    if (
      typeof window ===
        "undefined" ||
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();

      setIsPlaying(false);
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        word,
      );

    utterance.lang =
      "zh-CN";

    utterance.rate =
      0.7;

    utterance.pitch = 1;

    const chineseVoice =
      getChineseVoice();

    if (chineseVoice) {
      utterance.voice =
        chineseVoice;
    }

    window.speechSynthesis.speak(
      utterance,
    );
  }

  /* =======================================================
     OPEN WORD
  ======================================================= */

  function openToken(
    token: ReadingToken,
  ) {
    if (
      token.type !==
        "word" ||
      !token.bestEntry
    ) {
      return;
    }

    setSelectedWord({
      text: token.text,
      entry:
        token.bestEntry,
    });
  }

  function openKeyword(
    keyword: string,
  ) {
    const entry =
      getBestReadingDictionaryWord(
        keyword,
        level,
      );

    if (!entry) {
      return;
    }

    setSelectedWord({
      text: keyword,
      entry,
    });
  }

  /* =======================================================
     STORY CHANGE RESET
  ======================================================= */

  useEffect(() => {
    clearCurrentAudio();

    setAudioError("");
    setSelectedWord(null);

    return () => {
      clearCurrentAudio();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    storyId,
    level,
  ]);

  /* =======================================================
     SPEED SYNC
  ======================================================= */

  useEffect(() => {
    if (
      audioRef.current
    ) {
      audioRef.current.playbackRate =
        playbackSpeed;
    }
  }, [
    playbackSpeed,
  ]);

  /* =======================================================
     INVALID STORY
  ======================================================= */

  if (!story) {
    return (
      <main className="min-h-screen bg-[#090014] px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/hsk/reading/${level}`}
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            ← Reading Stories
          </Link>

          <section className="mt-12 rounded-[30px] border border-white/10 bg-[#12081d] p-10 text-center">
            <p className="text-5xl">
              📖
            </p>

            <h1 className="mt-5 text-2xl font-black">
              Story Not Found
            </h1>

            <p className="mt-3 text-sm text-white/45">
              This reading story is
              not available.
            </p>
          </section>
        </div>
      </main>
    );
  }

  /* =======================================================
     PROGRESS
  ======================================================= */

  const progressPercent =
    duration > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (currentTime /
              duration) *
              100,
          ),
        )
      : 0;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#090014] px-4 py-6 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">

        {/* TOP NAV */}

        <header className="flex items-center justify-between gap-4">
          <Link
            href={`/hsk/reading/${level}`}
            onClick={
              clearCurrentAudio
            }
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            ← Stories
          </Link>

          <div className="rounded-full border border-pink-300/10 bg-pink-400/[0.06] px-4 py-2">
            <p className="text-sm font-black text-pink-100">
              HSK {level}
            </p>
          </div>
        </header>

        {/* STORY HEADER */}

        <section className="mt-8 overflow-hidden rounded-[32px] border border-pink-300/15 bg-gradient-to-br from-pink-950/75 via-rose-950/45 to-slate-950 shadow-2xl">
          <div className="p-6 sm:p-9">

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-pink-300/15 bg-pink-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-pink-300">
                Story{" "}
                {String(
                  story.order,
                ).padStart(
                  2,
                  "0",
                )}
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase text-white/45">
                {
                  story.difficulty
                }
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/45">
                ⏱{" "}
                {
                  story.estimatedMinutes
                }{" "}
                min
              </span>
            </div>

            <h1
              lang="zh-CN"
              className="mt-5 text-3xl font-black tracking-wide sm:text-4xl"
            >
              {story.title}
            </h1>

            <p className="mt-2 text-base font-medium text-pink-200/75">
              {
                story.pinyinTitle
              }
            </p>

            <p
              lang="my"
              className="mt-3 text-sm font-semibold leading-6 text-white/50"
            >
              {
                story.myanmarTitle
              }
            </p>

            {/* AUDIO PLAYER */}

            <div className="mt-7 rounded-[24px] border border-white/10 bg-black/20 p-4 sm:p-5">
              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={
                    togglePlayPause
                  }
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-600 text-lg font-black shadow-lg shadow-pink-950/40 transition hover:bg-pink-500"
                  aria-label={
                    isPlaying
                      ? "Pause audio"
                      : "Play audio"
                  }
                >
                  {isPlaying
                    ? "Ⅱ"
                    : "▶"}
                </button>

                <button
                  type="button"
                  onClick={
                    restartAudio
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm transition hover:bg-white/10"
                  aria-label="Restart audio"
                >
                  ↺
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-white/60">
                      Reading Audio
                    </p>

                    {story.audioUrl ? (
                      <span className="rounded-full border border-green-300/10 bg-green-400/[0.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-green-300/70">
                        MP3
                      </span>
                    ) : (
                      <span className="rounded-full border border-amber-300/10 bg-amber-400/[0.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-amber-200/70">
                        TTS
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    {story.audioUrl ? (
                      <>
                        <input
                          type="range"
                          min={0}
                          max={
                            duration || 0
                          }
                          step={0.1}
                          value={
                            Math.min(
                              currentTime,
                              duration ||
                                currentTime,
                            )
                          }
                          onChange={(
                            event,
                          ) =>
                            handleSeek(
                              Number(
                                event
                                  .target
                                  .value,
                              ),
                            )
                          }
                          className="h-1.5 w-full cursor-pointer accent-pink-500"
                          aria-label="Audio progress"
                        />

                        <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-white/35">
                          <span>
                            {formatTime(
                              currentTime,
                            )}
                          </span>

                          <span>
                            {formatTime(
                              duration,
                            )}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-pink-500 transition-all"
                          style={{
                            width:
                              isPlaying
                                ? "100%"
                                : "0%",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SPEED */}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-white/30">
                  Speed
                </span>

                {(
                  [
                    0.75,
                    1,
                    1.25,
                  ] as PlaybackSpeed[]
                ).map(
                  (speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() =>
                        changeSpeed(
                          speed,
                        )
                      }
                      className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                        playbackSpeed ===
                        speed
                          ? "bg-pink-600 text-white"
                          : "border border-white/10 bg-white/5 text-white/45 hover:bg-white/10"
                      }`}
                    >
                      {speed}×
                    </button>
                  ),
                )}
              </div>

              {/* SMALL PROGRESS TEXT */}

              {story.audioUrl &&
              duration > 0 ? (
                <p className="mt-3 text-right text-[9px] font-medium text-white/20">
                  {Math.round(
                    progressPercent,
                  )}
                  %
                </p>
              ) : null}

              {audioError ? (
                <div className="mt-4 rounded-xl border border-red-300/10 bg-red-400/[0.06] px-4 py-3">
                  <p className="text-xs font-semibold text-red-200/80">
                    {
                      audioError
                    }
                  </p>
                </div>
              ) : null}
            </div>

            {/* DISPLAY CONTROLS */}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowPinyin(
                    (current) =>
                      !current,
                  )
                }
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
              >
                {showPinyin
                  ? "Hide Pinyin"
                  : "Show Pinyin"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowMyanmar(
                    (current) =>
                      !current,
                  )
                }
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
              >
                {showMyanmar
                  ? "Hide Myanmar"
                  : "Show Myanmar"}
              </button>
            </div>
          </div>
        </section>

        {/* READING TIP */}

        <div className="mt-5 rounded-[20px] border border-cyan-300/10 bg-cyan-400/[0.05] px-5 py-4">
          <p
            lang="my"
            className="text-xs font-bold leading-6 text-cyan-100/65"
          >
            💡 နားမလည်တဲ့ Chinese
            word ကိုနှိပ်ပါ။ Pinyin,
            Myanmar meaning နဲ့ HSK
            Level ကိုကြည့်နိုင်ပါတယ်။
          </p>
        </div>

        {/* STORY */}

        <article className="mt-5 rounded-[30px] border border-white/10 bg-[#12081d] p-6 shadow-xl sm:p-9">
          <div className="space-y-10">
            {story.paragraphs.map(
              (
                paragraph,
                paragraphIndex,
              ) => {
                const tokens =
                  tokenizedParagraphs[
                    paragraphIndex
                  ] ?? [];

                return (
                  <section
                    key={`${story.id}-${paragraphIndex}`}
                  >
                    <p
                      lang="zh-CN"
                      className="text-[22px] font-semibold leading-[2.05] tracking-[0.04em] text-white sm:text-[25px]"
                    >
                      {tokens.map(
                        (
                          token,
                          tokenIndex,
                        ) => {
                          const key =
                            `${paragraphIndex}-${tokenIndex}-${token.text}`;

                          if (
                            token.type ===
                              "word" &&
                            token.bestEntry
                          ) {
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() =>
                                  openToken(
                                    token,
                                  )
                                }
                                className="rounded-md px-[1px] text-left transition hover:bg-pink-400/15 hover:text-pink-200 focus:bg-pink-400/20 focus:text-pink-200 focus:outline-none"
                                title="Tap for meaning"
                              >
                                {
                                  token.text
                                }
                              </button>
                            );
                          }

                          return (
                            <span
                              key={key}
                            >
                              {
                                token.text
                              }
                            </span>
                          );
                        },
                      )}
                    </p>

                    {showPinyin ? (
                      <p className="mt-4 text-[15px] font-medium leading-7 text-pink-200/75">
                        {
                          story
                            .pinyinParagraphs[
                            paragraphIndex
                          ] ?? ""
                        }
                      </p>
                    ) : null}

                    {showMyanmar ? (
                      <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.035] p-4">
                        <p
                          lang="my"
                          className="text-sm font-medium leading-7 text-white/60"
                        >
                          {
                            story
                              .myanmarParagraphs[
                              paragraphIndex
                            ] ?? ""
                          }
                        </p>
                      </div>
                    ) : null}
                  </section>
                );
              },
            )}
          </div>
        </article>

        {/* KEY VOCABULARY */}

        <section className="mt-5 rounded-[26px] border border-white/10 bg-[#12081d] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-300">
                Key Vocabulary
              </p>

              <p className="mt-1 text-xs text-white/30">
                Tap a word to see
                meaning
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/40">
              {
                story.keywords.length
              }{" "}
              words
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {story.keywords.map(
              (keyword) => {
                const entry =
                  getBestReadingDictionaryWord(
                    keyword,
                    level,
                  );

                if (entry) {
                  return (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() =>
                        openKeyword(
                          keyword,
                        )
                      }
                      className="rounded-full border border-pink-300/10 bg-pink-400/[0.06] px-4 py-2 text-sm font-bold text-pink-100 transition hover:bg-pink-400/15"
                    >
                      {keyword}
                    </button>
                  );
                }

                return (
                  <span
                    key={keyword}
                    className="rounded-full border border-white/5 bg-white/[0.03] px-4 py-2 text-sm font-bold text-white/35"
                  >
                    {keyword}
                  </span>
                );
              },
            )}
          </div>
        </section>

        {/* PREVIOUS / NEXT */}

        <nav className="mt-6 grid gap-3 sm:grid-cols-2">
          {previousStory ? (
            <Link
              href={`/hsk/reading/${level}/${previousStory.id}`}
              onClick={
                clearCurrentAudio
              }
              className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.07]"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-white/35">
                ← Previous
              </p>

              <p
                lang="zh-CN"
                className="mt-2 text-lg font-black"
              >
                {
                  previousStory.title
                }
              </p>

              <p className="mt-1 text-xs text-white/30">
                Story{" "}
                {
                  previousStory.order
                }
              </p>
            </Link>
          ) : (
            <div />
          )}

          {nextStory ? (
            <Link
              href={`/hsk/reading/${level}/${nextStory.id}`}
              onClick={
                clearCurrentAudio
              }
              className="rounded-[22px] border border-pink-300/10 bg-pink-400/[0.05] p-5 text-right transition hover:bg-pink-400/[0.1]"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-pink-300/60">
                Next →
              </p>

              <p
                lang="zh-CN"
                className="mt-2 text-lg font-black"
              >
                {
                  nextStory.title
                }
              </p>

              <p className="mt-1 text-xs text-pink-200/30">
                Story{" "}
                {
                  nextStory.order
                }
              </p>
            </Link>
          ) : null}
        </nav>

        <div className="h-24" />
      </div>

      {/* WORD POPUP */}

      {selectedWord ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 px-4 pb-4 backdrop-blur-sm sm:items-center sm:py-8"
          onClick={() =>
            setSelectedWord(
              null,
            )
          }
        >
          <section
            className="w-full max-w-md overflow-hidden rounded-[30px] border border-pink-300/20 bg-[#16091f] shadow-2xl shadow-black/50"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="border-b border-white/10 bg-gradient-to-br from-pink-500/[0.12] via-transparent to-purple-500/[0.08] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {selectedWord.entry
                    .level > 0 ? (
                    <span className="inline-flex rounded-full border border-pink-300/15 bg-pink-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-pink-300">
                      HSK{" "}
                      {
                        selectedWord
                          .entry
                          .level
                      }
                    </span>
                  ) : null}

                  <p
                    lang="zh-CN"
                    className="mt-3 text-4xl font-black tracking-wide text-white sm:text-5xl"
                  >
                    {
                      selectedWord.text
                    }
                  </p>

                  {selectedWord.entry
                    .pinyin ? (
                    <p className="mt-3 text-lg font-bold text-pink-300">
                      {
                        selectedWord
                          .entry
                          .pinyin
                      }
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  aria-label="Close word popup"
                  onClick={() =>
                    setSelectedWord(
                      null,
                    )
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/5 text-white/55 transition hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedWord.entry
                .myanmar ? (
                <div className="rounded-2xl border border-pink-300/10 bg-pink-400/[0.05] p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-pink-300/55">
                    Myanmar Meaning
                  </p>

                  <p
                    lang="my"
                    className="mt-2 text-base font-semibold leading-7 text-white/80"
                  >
                    {
                      selectedWord
                        .entry
                        .myanmar
                    }
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-300/10 bg-amber-400/[0.05] p-4">
                  <p
                    lang="my"
                    className="text-sm leading-6 text-amber-100/60"
                  >
                    ဒီစကားလုံးအတွက်
                    Myanmar meaning
                    မရှိသေးပါ။
                  </p>
                </div>
              )}

              {selectedWord.entry
                .english ? (
                <div className="mt-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                    English
                  </p>

                  <p className="mt-2 text-sm font-medium leading-6 text-white/55">
                    {
                      selectedWord
                        .entry
                        .english
                    }
                  </p>
                </div>
              ) : null}

              {selectedWord.entry
                .partOfSpeech
                .length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedWord.entry
                    .partOfSpeech
                    .map(
                      (
                        part,
                      ) => (
                        <span
                          key={part}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-white/40"
                        >
                          {part}
                        </span>
                      ),
                    )}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() =>
                  playWord(
                    selectedWord.text,
                  )
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 px-5 py-3.5 text-sm font-black transition hover:bg-pink-500"
              >
                <span>
                  🔊
                </span>

                <span>
                  Listen to Word
                </span>
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}