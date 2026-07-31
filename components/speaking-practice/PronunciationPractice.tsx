"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  checkPronunciation,
  type PronunciationCheckResponse,
} from "@/lib/speaking-practice/api";

import type {
  SpeakingPracticeSentence,
} from "@/lib/speaking-practice/types";

type PronunciationPracticeProps = {
  sentences: SpeakingPracticeSentence[];
};

type AudioMode = "normal" | "slow";

export default function PronunciationPractice({
  sentences,
}: PronunciationPracticeProps) {
  const sampleAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const recorderRef =
    useRef<MediaRecorder | null>(null);

  const microphoneStreamRef =
    useRef<MediaStream | null>(null);

  const recordedChunksRef =
    useRef<Blob[]>([]);

  const recordingStartedAtRef =
    useRef<number | null>(null);

  const recordedAudioUrlRef =
    useRef<string | null>(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [isPlayingSample, setIsPlayingSample] =
    useState(false);

  const [playingMode, setPlayingMode] =
    useState<AudioMode | null>(null);

  const [showPinyin, setShowPinyin] =
    useState(true);

  const [showMeaning, setShowMeaning] =
    useState(true);

  const [showEnglish, setShowEnglish] =
    useState(false);

  const [audioError, setAudioError] =
    useState<string | null>(null);

  const [isRecording, setIsRecording] =
    useState(false);

  const [recordingError, setRecordingError] =
    useState<string | null>(null);

  const [
    recordedAudioUrl,
    setRecordedAudioUrl,
  ] = useState<string | null>(null);

  const [
    recordedAudioBlob,
    setRecordedAudioBlob,
  ] = useState<Blob | null>(null);

  const [
    recordingDuration,
    setRecordingDuration,
  ] = useState(0);

  const [
    isCheckingScore,
    setIsCheckingScore,
  ] = useState(false);

  const [scoreError, setScoreError] =
    useState<string | null>(null);

  const [
    pronunciationResult,
    setPronunciationResult,
  ] =
    useState<PronunciationCheckResponse | null>(
      null
    );

  const currentSentence =
    sentences[currentIndex];

  const stopSampleAudio =
    useCallback(() => {
      if (sampleAudioRef.current) {
        sampleAudioRef.current.pause();
        sampleAudioRef.current.currentTime =
          0;
        sampleAudioRef.current = null;
      }

      setIsPlayingSample(false);
      setPlayingMode(null);
    }, []);

  const stopMicrophoneStream =
    useCallback(() => {
      microphoneStreamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });

      microphoneStreamRef.current = null;
    }, []);

  const clearRecordedAudioUrl =
    useCallback(() => {
      if (recordedAudioUrlRef.current) {
        URL.revokeObjectURL(
          recordedAudioUrlRef.current
        );

        recordedAudioUrlRef.current = null;
      }

      setRecordedAudioUrl(null);
    }, []);

  const resetRecording =
    useCallback(() => {
      const recorder =
        recorderRef.current;

      if (
        recorder &&
        recorder.state === "recording"
      ) {
        recorder.onstop = null;
        recorder.stop();
      }

      recorderRef.current = null;
      recordedChunksRef.current = [];
      recordingStartedAtRef.current =
        null;

      stopMicrophoneStream();
      clearRecordedAudioUrl();

      setRecordedAudioBlob(null);
      setRecordingDuration(0);
      setIsRecording(false);
      setRecordingError(null);

      setPronunciationResult(null);
      setScoreError(null);
      setIsCheckingScore(false);
    }, [
      clearRecordedAudioUrl,
      stopMicrophoneStream,
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
    stopSampleAudio();
    resetRecording();

    setAudioError(null);
    setScoreError(null);
    setPronunciationResult(null);
  }, [
    currentIndex,
    resetRecording,
    stopSampleAudio,
  ]);

  function playSampleAudio(
    mode: AudioMode
  ) {
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

    void audio.play().catch(
      (error: unknown) => {
        console.error(
          "Unable to play sample audio:",
          error
        );

        sampleAudioRef.current = null;
        setIsPlayingSample(false);
        setPlayingMode(null);

        setAudioError(
          "The browser could not play this audio."
        );
      }
    );
  }

  async function startRecording() {
    setRecordingError(null);
    setScoreError(null);
    setPronunciationResult(null);

    stopSampleAudio();
    clearRecordedAudioUrl();

    setRecordedAudioBlob(null);
    setRecordingDuration(0);

    if (
      !navigator.mediaDevices
        ?.getUserMedia
    ) {
      setRecordingError(
        "Microphone recording is not supported by this browser."
      );
      return;
    }

    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      setRecordingError(
        "MediaRecorder is not supported by this browser."
      );
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          }
        );

      microphoneStreamRef.current =
        stream;

      const preferredMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
        "audio/ogg",
      ];

      const supportedMimeType =
        preferredMimeTypes.find(
          (mimeType) =>
            MediaRecorder.isTypeSupported(
              mimeType
            )
        );

      const recorder =
        supportedMimeType
          ? new MediaRecorder(stream, {
              mimeType:
                supportedMimeType,
            })
          : new MediaRecorder(stream);

      recorderRef.current = recorder;
      recordedChunksRef.current = [];
      recordingStartedAtRef.current =
        Date.now();

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
            : (Date.now() - startedAt) /
              1000;

        if (audioBlob.size === 0) {
          setRecordingError(
            "No audio was recorded. Please try again."
          );
        } else {
          const audioUrl =
            URL.createObjectURL(
              audioBlob
            );

          recordedAudioUrlRef.current =
            audioUrl;

          setRecordedAudioBlob(
            audioBlob
          );

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
        error.name ===
          "NotAllowedError"
      ) {
        setRecordingError(
          "Microphone permission was denied."
        );
      } else if (
        error instanceof DOMException &&
        error.name ===
          "NotFoundError"
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
    const recorder =
      recorderRef.current;

    if (
      recorder?.state === "recording"
    ) {
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
    setPronunciationResult(null);

    try {
      const result =
        await checkPronunciation({
          audioBlob:
            recordedAudioBlob,
          sentenceId:
            currentSentence.id,
          targetText:
            currentSentence.hanzi,
          durationSeconds:
            recordingDuration,
        });

      setPronunciationResult(result);
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
    setCurrentIndex(
      (previousIndex) =>
        Math.max(
          0,
          previousIndex - 1
        )
    );
  }

  function goToNextSentence() {
    setCurrentIndex(
      (previousIndex) =>
        Math.min(
          sentences.length - 1,
          previousIndex + 1
        )
    );
  }

  if (!currentSentence) {
    return (
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">
          Pronunciation Practice
        </h1>

        <p className="mt-3 text-white/60">
          No sentences were found.
        </p>
      </section>
    );
  }

  const progressPercentage =
    ((currentIndex + 1) /
      sentences.length) *
    100;

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet-200">
            HSK{" "}
            {currentSentence.level} ·
            Lesson{" "}
            {currentSentence.lesson}
          </p>

          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Listen and Repeat
          </h1>
        </div>

        <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80">
          {currentIndex + 1} /{" "}
          {sentences.length}
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
              {currentSentence.category.replaceAll(
                "-",
                " "
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
                playSampleAudio(
                  "normal"
                )
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
              Listen and repeat the
              sentence.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={() =>
                    void startRecording()
                  }
                  disabled={
                    isCheckingScore
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
                    isCheckingScore
                  }
                  className="rounded-2xl border border-white/15 bg-white/10 px-6 py-3 font-semibold text-white disabled:opacity-50"
                >
                  ↻ Record Again
                </button>
              ) : null}
            </div>

            {recordingError ? (
              <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {recordingError}
              </div>
            ) : null}

            {recordedAudioUrl ? (
              <div className="mx-auto mt-6 max-w-md rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-3 text-sm text-white/70">
                  Duration:{" "}
                  {recordingDuration}s
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
              <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/60">
                  Overall Score
                </p>

                <p className="mt-2 text-6xl font-bold text-white">
                  {
                    pronunciationResult
                      .scores.overall
                  }
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <ScoreCard
                    label="Accuracy"
                    value={
                      pronunciationResult
                        .scores.accuracy
                    }
                  />

                  <ScoreCard
                    label="Complete"
                    value={
                      pronunciationResult
                        .scores
                        .completeness
                    }
                  />

                  <ScoreCard
                    label="Fluency"
                    value={
                      pronunciationResult
                        .scores.fluency
                    }
                  />
                </div>

                <div className="mt-5 rounded-2xl bg-black/15 p-4 text-left">
                  <p className="text-xs uppercase text-white/40">
                    Target
                  </p>

                  <p className="mt-2 text-xl text-white">
                    {
                      pronunciationResult
                        .target_text
                    }
                  </p>

                  <p className="mt-5 text-xs uppercase text-white/40">
                    Anna heard
                  </p>

                  <p className="mt-2 text-xl text-violet-200">
                    {
                      pronunciationResult
                        .recognized_text
                    }
                  </p>
                </div>
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
              isCheckingScore
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
              isCheckingScore
            }
            className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {isCheckingScore
              ? "Checking…"
              : "Check Score"}
          </button>

          <button
            type="button"
            onClick={goToNextSentence}
            disabled={
              currentIndex ===
                sentences.length - 1 ||
              isRecording ||
              isCheckingScore
            }
            className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}

function ScoreCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-black/15 p-4 text-center">
      <p className="text-xs text-white/50">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
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