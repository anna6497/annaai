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
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const currentSentence = sentences[currentIndex];

  useEffect(() => {
    return () => {
      stopSampleAudio();
      stopMicrophoneStream();

      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  useEffect(() => {
    stopSampleAudio();
    resetRecording();
    setAudioError(null);
    setRecordingError(null);
  }, [currentIndex]);

  function stopSampleAudio() {
    if (!sampleAudioRef.current) {
      setIsPlayingSample(false);
      return;
    }

    sampleAudioRef.current.pause();
    sampleAudioRef.current.currentTime = 0;
    sampleAudioRef.current = null;
    setIsPlayingSample(false);
  }

  function playSampleAudio(speed: PlaybackSpeed = playbackSpeed) {
    if (!currentSentence?.audioUrl) {
      setAudioError("This sentence does not have a sample audio file.");
      return;
    }

    if (isRecording) {
      setRecordingError("Please stop recording before playing the sample.");
      return;
    }

    stopSampleAudio();
    setAudioError(null);
    setPlaybackSpeed(speed);

    const audio = new Audio(currentSentence.audioUrl);
    audio.playbackRate = speed;
    audio.preload = "auto";

    audio.onplay = () => {
      setIsPlayingSample(true);
    };

    audio.onended = () => {
      setIsPlayingSample(false);
      sampleAudioRef.current = null;
    };

    audio.onerror = () => {
      setIsPlayingSample(false);
      sampleAudioRef.current = null;
      setAudioError(
        `Audio file could not be loaded: ${currentSentence.audioUrl}`
      );
    };

    sampleAudioRef.current = audio;

    void audio.play().catch((error: unknown) => {
      console.error("Unable to play pronunciation audio:", error);

      setIsPlayingSample(false);
      sampleAudioRef.current = null;
      setAudioError("The browser could not play this sample audio.");
    });
  }

  function stopMicrophoneStream() {
    microphoneStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    microphoneStreamRef.current = null;
  }

  function resetRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }

    recorderRef.current = null;
    recordedChunksRef.current = [];
    recordingStartedAtRef.current = null;

    stopMicrophoneStream();

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }

    setRecordedAudioUrl(null);
    setRecordedAudioBlob(null);
    setRecordingDuration(0);
    setIsRecording(false);
  }

  async function startRecording() {
    setRecordingError(null);
    stopSampleAudio();

    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordingError(
        "Microphone recording is not supported by this browser."
      );
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setRecordingError("MediaRecorder is not supported by this browser.");
      return;
    }

    try {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }

      setRecordedAudioUrl(null);
      setRecordedAudioBlob(null);
      setRecordingDuration(0);

      const stream = await navigator.mediaDevices.getUserMedia({
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
      ];

      const supportedMimeType = preferredMimeTypes.find((mimeType) =>
        MediaRecorder.isTypeSupported(mimeType)
      );

      const recorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);

      recorderRef.current = recorder;
      recordedChunksRef.current = [];
      recordingStartedAtRef.current = Date.now();

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setRecordingError("Recording failed. Please try again.");
        setIsRecording(false);
        stopMicrophoneStream();
      };

      recorder.onstop = () => {
        const mimeType =
          recorder.mimeType || supportedMimeType || "audio/webm";

        const audioBlob = new Blob(recordedChunksRef.current, {
          type: mimeType,
        });

        const startedAt = recordingStartedAtRef.current;
        const duration =
          startedAt === null ? 0 : (Date.now() - startedAt) / 1000;

        if (audioBlob.size === 0) {
          setRecordingError(
            "No audio was recorded. Please allow microphone access and try again."
          );
        } else {
          const audioUrl = URL.createObjectURL(audioBlob);

          setRecordedAudioBlob(audioBlob);
          setRecordedAudioUrl(audioUrl);
          setRecordingDuration(Number(duration.toFixed(1)));
        }

        setIsRecording(false);
        stopMicrophoneStream();
      };

      recorder.start(250);
      setIsRecording(true);
    } catch (error) {
      console.error("Unable to start microphone recording:", error);

      if (
        error instanceof DOMException &&
        error.name === "NotAllowedError"
      ) {
        setRecordingError(
          "Microphone permission was denied. Please allow microphone access in your browser."
        );
      } else if (
        error instanceof DOMException &&
        error.name === "NotFoundError"
      ) {
        setRecordingError("No microphone was found on this device.");
      } else {
        setRecordingError(
          "Unable to access the microphone. Please try again."
        );
      }

      setIsRecording(false);
      stopMicrophoneStream();
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;

    if (!recorder || recorder.state !== "recording") {
      return;
    }

    recorder.stop();
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
                if (isPlayingSample) {
                  stopSampleAudio();
                } else {
                  playSampleAudio(playbackSpeed);
                }
              }}
              disabled={isRecording}
              className="min-w-36 rounded-2xl bg-white px-5 py-3 font-semibold text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPlayingSample ? "■ Stop" : "▶ Listen"}
            </button>

            <button
              type="button"
              onClick={() => playSampleAudio(0.75)}
              disabled={isRecording}
              className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              🐢 Slow Audio
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
              Listen first, then record yourself saying the same sentence.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={() => void startRecording()}
                  className="rounded-2xl bg-violet-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-violet-400"
                >
                  🎤 Start Recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="animate-pulse rounded-2xl bg-red-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-red-400"
                >
                  ■ Stop Recording
                </button>
              )}

              {recordedAudioUrl && !isRecording ? (
                <button
                  type="button"
                  onClick={resetRecording}
                  className="rounded-2xl border border-white/15 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15"
                >
                  ↻ Record Again
                </button>
              ) : null}
            </div>

            {isRecording ? (
              <div className="mt-5 flex items-center justify-center gap-3 text-sm font-medium text-red-100">
                <span className="h-3 w-3 animate-pulse rounded-full bg-red-400" />
                Recording…
              </div>
            ) : null}

            {recordingError ? (
              <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {recordingError}
              </div>
            ) : null}

            {recordedAudioUrl ? (
              <div className="mx-auto mt-6 max-w-md rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-3 text-sm text-white/70">
                  Recorded duration: {recordingDuration} seconds
                </p>

                <audio
                  controls
                  preload="metadata"
                  src={recordedAudioUrl}
                  className="w-full"
                />

                <p className="mt-3 text-xs text-white/40">
                  Audio size:{" "}
                  {recordedAudioBlob
                    ? `${(recordedAudioBlob.size / 1024).toFixed(1)} KB`
                    : "0 KB"}
                </p>
              </div>
            ) : null}
          </div>

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
            disabled={currentIndex === 0 || isRecording}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Previous
          </button>

          <button
            type="button"
            disabled={!recordedAudioBlob || isRecording}
            className="rounded-xl bg-violet-500/30 px-5 py-3 text-sm font-semibold text-white/60 disabled:cursor-not-allowed"
            title="Pronunciation checking will be connected in the next step."
          >
            Check Score
          </button>

          <button
            type="button"
            onClick={goToNextSentence}
            disabled={
              currentIndex === sentences.length - 1 || isRecording
            }
            className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}