"use client";

import { useRouter } from "next/navigation";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  checkPronunciation,
  type PronunciationCheckResponse,
} from "@/lib/speaking-practice/api";

import {
  savePronunciationAttempt,
} from "@/lib/speaking-practice/history";

import PronunciationFeedback from "@/components/speaking-practice/PronunciationFeedback";

import type {
  SpeakingPracticeSentence,
} from "@/lib/speaking-practice/types";

type PronunciationPracticeProps = {
  sentences: SpeakingPracticeSentence[];
  initialSearchQuery?: string;
  initialLesson?: number | "all";
  initialCategory?: string;
};

type AudioMode = "normal" | "slow";

export default function PronunciationPractice({
  sentences,
  initialSearchQuery = "",
  initialLesson = "all",
  initialCategory = "all",
}: PronunciationPracticeProps) {
  const router = useRouter();

  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);
  const recordedAudioUrlRef = useRef<string | null>(null);

  const [searchQuery, setSearchQuery] =
  useState(initialSearchQuery);

const [
  selectedLesson,
  setSelectedLesson,
] = useState<number | "all">(
  initialLesson
);

const [
  selectedCategory,
  setSelectedCategory,
] = useState<string>(
  initialCategory
);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [playingMode, setPlayingMode] = useState<AudioMode | null>(null);

  const [showPinyin, setShowPinyin] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);

  const [audioError, setAudioError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const [isCheckingScore, setIsCheckingScore] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const [pronunciationResult, setPronunciationResult] =
    useState<PronunciationCheckResponse | null>(null);

  const [isSavingResult, setIsSavingResult] =
    useState(false);

  const [saveResultMessage, setSaveResultMessage] =
    useState<string | null>(null);

  const lessons = useMemo(() => {
    return Array.from(
      new Set(sentences.map((sentence) => sentence.lesson))
    ).sort((first, second) => first - second);
  }, [sentences]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(sentences.map((sentence) => sentence.category))
    ).sort((first, second) => first.localeCompare(second));
  }, [sentences]);

  const filteredSentences = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return sentences.filter((sentence) => {
      const lessonMatches =
        selectedLesson === "all" ||
        sentence.lesson === selectedLesson;

      const categoryMatches =
        selectedCategory === "all" ||
        sentence.category === selectedCategory;

      const searchableText = [
        sentence.hanzi,
        sentence.pinyin,
        sentence.pinyinNumbered,
        sentence.myanmar,
        sentence.english,
        sentence.category,
        ...sentence.keywords,
        ...sentence.grammar,
      ]
        .join(" ")
        .toLowerCase();

      const searchMatches =
        normalizedQuery.length === 0 ||
        searchableText.includes(normalizedQuery);

      return lessonMatches && categoryMatches && searchMatches;
    });
  }, [
    sentences,
    searchQuery,
    selectedLesson,
    selectedCategory,
  ]);

  const currentSentence = filteredSentences[currentIndex];

  const stopSampleAudio = useCallback(() => {
    if (sampleAudioRef.current) {
      sampleAudioRef.current.pause();
      sampleAudioRef.current.currentTime = 0;
      sampleAudioRef.current = null;
    }

    setIsPlayingSample(false);
    setPlayingMode(null);
  }, []);

  const stopMicrophoneStream = useCallback(() => {
    microphoneStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    microphoneStreamRef.current = null;
  }, []);

  const clearRecordedAudioUrl = useCallback(() => {
    if (recordedAudioUrlRef.current) {
      URL.revokeObjectURL(recordedAudioUrlRef.current);
      recordedAudioUrlRef.current = null;
    }

    setRecordedAudioUrl(null);
  }, []);

  const resetRecording = useCallback(() => {
    const recorder = recorderRef.current;

    if (recorder?.state === "recording") {
      recorder.onstop = null;
      recorder.stop();
    }

    recorderRef.current = null;
    recordedChunksRef.current = [];
    recordingStartedAtRef.current = null;

    stopMicrophoneStream();
    clearRecordedAudioUrl();

    setRecordedAudioBlob(null);
    setRecordingDuration(0);
    setIsRecording(false);
    setRecordingError(null);

    setPronunciationResult(null);
    setScoreError(null);
    setIsCheckingScore(false);
    setIsSavingResult(false);
    setSaveResultMessage(null);
  }, [
    clearRecordedAudioUrl,
    stopMicrophoneStream,
  ]);

  useEffect(() => {
  setSearchQuery(
    initialSearchQuery
  );

  setSelectedLesson(
    initialLesson
  );

  setSelectedCategory(
    initialCategory
  );

  setCurrentIndex(0);
}, [
  initialSearchQuery,
  initialLesson,
  initialCategory,
]);

  useEffect(() => {
    return () => {
      stopSampleAudio();
      stopMicrophoneStream();
      clearRecordedAudioUrl();
    };
  }, [
    clearRecordedAudioUrl,
    stopMicrophoneStream,
    stopSampleAudio,
  ]);

  useEffect(() => {
    setCurrentIndex(0);
    stopSampleAudio();
    resetRecording();
    setAudioError(null);
  }, [
    searchQuery,
    selectedLesson,
    selectedCategory,
    resetRecording,
    stopSampleAudio,
  ]);

  useEffect(() => {
    stopSampleAudio();
    resetRecording();
    setAudioError(null);
  }, [
    currentIndex,
    resetRecording,
    stopSampleAudio,
  ]);

  function playSampleAudio(mode: AudioMode) {
    if (!currentSentence) {
      return;
    }

    if (isRecording) {
      setRecordingError(
        "Please stop recording before playing the sample."
      );
      return;
    }

    const audioUrl =
      mode === "slow"
        ? currentSentence.audio.slow
        : currentSentence.audio.normal;

    if (!audioUrl) {
      setAudioError(
        `${mode} audio is not configured for this sentence.`
      );
      return;
    }

    if (
      isPlayingSample &&
      playingMode === mode
    ) {
      stopSampleAudio();
      return;
    }

    stopSampleAudio();
    setAudioError(null);

    const audio = new Audio(audioUrl);
    audio.preload = "auto";

    audio.onplay = () => {
      setIsPlayingSample(true);
      setPlayingMode(mode);
    };

    audio.onended = () => {
      sampleAudioRef.current = null;
      setIsPlayingSample(false);
      setPlayingMode(null);
    };

    audio.onerror = () => {
      sampleAudioRef.current = null;
      setIsPlayingSample(false);
      setPlayingMode(null);

      setAudioError(
        `Audio could not be loaded: ${audioUrl}`
      );
    };

    sampleAudioRef.current = audio;

    void audio.play().catch((error: unknown) => {
      console.error("Unable to play sample audio:", error);

      sampleAudioRef.current = null;
      setIsPlayingSample(false);
      setPlayingMode(null);

      setAudioError(
        "The browser could not play this audio."
      );
    });
  }

  async function startRecording() {
    setRecordingError(null);
    setScoreError(null);
    setPronunciationResult(null);
    setIsSavingResult(false);
    setSaveResultMessage(null);

    stopSampleAudio();
    clearRecordedAudioUrl();

    setRecordedAudioBlob(null);
    setRecordingDuration(0);

    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordingError(
        "Microphone recording is not supported by this browser."
      );
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setRecordingError(
        "MediaRecorder is not supported by this browser."
      );
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

      microphoneStreamRef.current = stream;

      const preferredMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
        "audio/ogg",
      ];

      const supportedMimeType =
        preferredMimeTypes.find((mimeType) =>
          MediaRecorder.isTypeSupported(mimeType)
        );

      const recorder = supportedMimeType
        ? new MediaRecorder(stream, {
            mimeType: supportedMimeType,
          })
        : new MediaRecorder(stream);

      recorderRef.current = recorder;
      recordedChunksRef.current = [];
      recordingStartedAtRef.current = Date.now();

      recorder.ondataavailable = (
        event: BlobEvent
      ) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onerror = () => {
        setRecordingError(
          "Recording failed. Please try again."
        );

        setIsRecording(false);
        stopMicrophoneStream();
      };

      recorder.onstop = () => {
        const mimeType =
          recorder.mimeType ||
          supportedMimeType ||
          "audio/webm";

        const audioBlob = new Blob(
          recordedChunksRef.current,
          {
            type: mimeType,
          }
        );

        const startedAt =
          recordingStartedAtRef.current;

        const duration =
          startedAt === null
            ? 0
            : (Date.now() - startedAt) / 1000;

        if (audioBlob.size === 0) {
          setRecordingError(
            "No audio was recorded. Please try again."
          );
        } else {
          const audioUrl =
            URL.createObjectURL(audioBlob);

          recordedAudioUrlRef.current =
            audioUrl;

          setRecordedAudioBlob(audioBlob);
          setRecordedAudioUrl(audioUrl);
          setRecordingDuration(
            Number(duration.toFixed(1))
          );
        }

        setIsRecording(false);
        stopMicrophoneStream();
      };

      recorder.start(250);
      setIsRecording(true);
    } catch (error) {
      console.error(
        "Unable to access microphone:",
        error
      );

      if (
        error instanceof DOMException &&
        error.name === "NotAllowedError"
      ) {
        setRecordingError(
          "Microphone permission was denied."
        );
      } else if (
        error instanceof DOMException &&
        error.name === "NotFoundError"
      ) {
        setRecordingError(
          "No microphone was found."
        );
      } else {
        setRecordingError(
          "Unable to access the microphone."
        );
      }

      setIsRecording(false);
      stopMicrophoneStream();
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;

    if (recorder?.state === "recording") {
      recorder.stop();
    }
  }

  async function handleCheckScore() {
    if (!recordedAudioBlob) {
      setScoreError(
        "Please record your voice first."
      );
      return;
    }

    if (!currentSentence) {
      setScoreError(
        "The current sentence was not found."
      );
      return;
    }

    setIsCheckingScore(true);
    setScoreError(null);
    setSaveResultMessage(null);
    setPronunciationResult(null);

    try {
      const result =
        await checkPronunciation({
          audioBlob: recordedAudioBlob,
          sentenceId: currentSentence.id,
          targetText: currentSentence.hanzi,
          durationSeconds: recordingDuration,
        });

      setPronunciationResult(result);
      setIsSavingResult(true);

      try {
        await savePronunciationAttempt({
          sentence: currentSentence,
          result,
          recordingDuration,
        });

        setSaveResultMessage(
          "Score saved to your speaking history."
        );
      } catch (saveError) {
        console.error(
          "Unable to save pronunciation result:",
          saveError
        );

        setSaveResultMessage(
          saveError instanceof Error
            ? saveError.message
            : "Score could not be saved."
        );
      } finally {
        setIsSavingResult(false);
      }
    } catch (error) {
      console.error(
        "Pronunciation checking failed:",
        error
      );

      setScoreError(
        error instanceof Error
          ? error.message
          : "Pronunciation checking failed."
      );
    } finally {
      setIsCheckingScore(false);
    }
  }

  function goToPreviousSentence() {
    setCurrentIndex((previousIndex) =>
      Math.max(0, previousIndex - 1)
    );
  }

  function goToNextSentence() {
    setCurrentIndex((previousIndex) =>
      Math.min(
        filteredSentences.length - 1,
        previousIndex + 1
      )
    );
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedLesson("all");
    setSelectedCategory("all");
    setCurrentIndex(0);

    router.replace(
      "/dashboard/ai/pronunciation",
      {
        scroll: false,
      }
    );
  }

  const progressPercentage =
    filteredSentences.length > 0
      ? ((currentIndex + 1) /
          filteredSentences.length) *
        100
      : 0;

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-violet-200">
          Anna AI V6
        </p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Listen and Repeat
        </h1>

        <p className="mt-2 text-sm text-white/55">
          Search and practice Chinese sentences by lesson
          and category.
        </p>
      </div>

      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
              Search
            </span>

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Hanzi, pinyin, Myanmar, English..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
              Lesson
            </span>

            <select
              value={selectedLesson}
              onChange={(event) => {
                const value = event.target.value;

                setSelectedLesson(
                  value === "all"
                    ? "all"
                    : Number(value)
                );
              }}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
            >
              <option value="all">
                All lessons
              </option>

              {lessons.map((lesson) => (
                <option
                  key={lesson}
                  value={lesson}
                >
                  Lesson {lesson}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
              Category
            </span>

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(
                  event.target.value
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
            >
              <option value="all">
                All categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {formatCategory(category)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-white/50">
            {filteredSentences.length} sentence
            {filteredSentences.length === 1
              ? ""
              : "s"}{" "}
            found
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10"
          >
            Clear filters
          </button>
        </div>
      </div>

      {initialSearchQuery ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-amber-300/20 bg-amber-400/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-amber-100">
              Smart Review
            </p>

            <p className="mt-1 text-sm text-amber-50/70">
              Practicing sentences that contain{" "}
              <span className="text-xl font-bold text-amber-50">
                {initialSearchQuery}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-2xl border border-amber-200/20 bg-black/10 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-black/20"
          >
            Exit Smart Review
          </button>
        </div>
      ) : null}

      {!currentSentence ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-xl font-semibold text-white">
            No sentences found
          </p>

          <p className="mt-2 text-sm text-white/50">
            Try changing the lesson, category, or search
            word.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white"
          >
            Show all sentences
          </button>
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm text-white/60">
              HSK {currentSentence.level} · Lesson{" "}
              {currentSentence.lesson}
            </p>

            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80">
              {currentIndex + 1} /{" "}
              {filteredSentences.length}
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
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-200">
                  {formatCategory(
                    currentSentence.category
                  )}
                </span>

                <span className="text-xs text-white/50">
                  Difficulty{" "}
                  {currentSentence.difficulty}
                </span>
              </div>
            </div>

            <div className="px-6 py-10 text-center sm:px-10">
              <p className="text-4xl font-semibold leading-relaxed text-white sm:text-5xl">
                {currentSentence.hanzi}
              </p>

              {showPinyin ? (
                <p className="mt-5 text-xl text-violet-200 sm:text-2xl">
                  {currentSentence.pinyin}
                </p>
              ) : null}

              {showMeaning ? (
                <p className="mt-4 text-base text-white/70 sm:text-lg">
                  {currentSentence.myanmar}
                </p>
              ) : null}

              {showEnglish ? (
                <p className="mt-2 text-sm text-white/45">
                  {currentSentence.english}
                </p>
              ) : null}

              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    playSampleAudio("normal")
                  }
                  disabled={isRecording}
                  className="min-w-36 rounded-2xl bg-white px-5 py-3 font-semibold text-violet-700 shadow-lg transition hover:bg-violet-50 disabled:opacity-50"
                >
                  {isPlayingSample &&
                  playingMode === "normal"
                    ? "■ Stop"
                    : "▶ Normal"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    playSampleAudio("slow")
                  }
                  disabled={isRecording}
                  className="min-w-36 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
                >
                  {isPlayingSample &&
                  playingMode === "slow"
                    ? "■ Stop"
                    : "🐢 Slow"}
                </button>
              </div>

              {audioError ? (
                <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {audioError}
                </div>
              ) : null}

              <div className="mt-8 rounded-3xl border border-white/10 bg-black/10 p-5">
                <p className="text-sm font-semibold text-white">
                  Your pronunciation
                </p>

                <p className="mt-1 text-sm text-white/60">
                  Listen and repeat the sentence.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={() =>
                        void startRecording()
                      }
                      disabled={
                        isCheckingScore ||
                        isSavingResult
                      }
                      className="rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white disabled:opacity-50"
                    >
                      🎤 Start Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="animate-pulse rounded-2xl bg-red-500 px-6 py-3 font-semibold text-white"
                    >
                      ■ Stop Recording
                    </button>
                  )}

                  {recordedAudioUrl &&
                  !isRecording ? (
                    <button
                      type="button"
                      onClick={resetRecording}
                      disabled={
                        isCheckingScore ||
                        isSavingResult
                      }
                      className="rounded-2xl border border-white/15 bg-white/10 px-6 py-3 font-semibold text-white disabled:opacity-50"
                    >
                      ↻ Record Again
                    </button>
                  ) : null}
                </div>

                {isRecording ? (
                  <p className="mt-4 text-sm font-medium text-red-200">
                    Recording…
                  </p>
                ) : null}

                {recordingError ? (
                  <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                    {recordingError}
                  </div>
                ) : null}

                {recordedAudioUrl ? (
                  <div className="mx-auto mt-6 max-w-md rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-3 text-sm text-white/70">
                      Duration: {recordingDuration}s
                    </p>

                    <audio
                      controls
                      src={recordedAudioUrl}
                      className="w-full"
                    />
                  </div>
                ) : null}

                {scoreError ? (
                  <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                    {scoreError}
                  </div>
                ) : null}

                {pronunciationResult ? (
                  <PronunciationFeedback
                    result={pronunciationResult}
                    onTryAgain={resetRecording}
                    onListenNormal={() =>
                      playSampleAudio("normal")
                    }
                    onListenSlow={() =>
                      playSampleAudio("slow")
                    }
                  />
                ) : null}

                {isSavingResult ? (
                  <p className="mt-4 text-sm text-violet-200">
                    Saving score…
                  </p>
                ) : null}

                {saveResultMessage ? (
                  <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                    {saveResultMessage}
                  </div>
                ) : null}
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ToggleButton
                  active={showPinyin}
                  onClick={() =>
                    setShowPinyin(
                      (value) => !value
                    )
                  }
                  showLabel="Show Pinyin"
                  hideLabel="Hide Pinyin"
                />

                <ToggleButton
                  active={showMeaning}
                  onClick={() =>
                    setShowMeaning(
                      (value) => !value
                    )
                  }
                  showLabel="Show Myanmar"
                  hideLabel="Hide Myanmar"
                />

                <ToggleButton
                  active={showEnglish}
                  onClick={() =>
                    setShowEnglish(
                      (value) => !value
                    )
                  }
                  showLabel="Show English"
                  hideLabel="Hide English"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/10 px-5 py-5">
              <button
                type="button"
                onClick={goToPreviousSentence}
                disabled={
                  currentIndex === 0 ||
                  isRecording ||
                  isCheckingScore ||
                  isSavingResult
                }
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white disabled:opacity-30"
              >
                ← Previous
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleCheckScore()
                }
                disabled={
                  !recordedAudioBlob ||
                  isRecording ||
                  isCheckingScore ||
                  isSavingResult
                }
                className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {isCheckingScore
                  ? "Checking…"
                  : isSavingResult
                    ? "Saving…"
                    : "Check Score"}
              </button>

              <button
                type="button"
                onClick={goToNextSentence}
                disabled={
                  currentIndex ===
                    filteredSentences.length - 1 ||
                  isRecording ||
                  isCheckingScore ||
                  isSavingResult
                }
                className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}


function ToggleButton({
  active,
  onClick,
  showLabel,
  hideLabel,
}: {
  active: boolean;
  onClick: () => void;
  showLabel: string;
  hideLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-black/10 px-4 py-2 text-sm font-medium text-white/80"
    >
      {active ? hideLabel : showLabel}
    </button>
  );
}

function formatCategory(category: string): string {
  return category
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}