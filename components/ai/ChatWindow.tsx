"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  checkVoiceServer,
  sendAudio,
  sendTextMessage,
} from "@/lib/ai/api";
import {
  MAX_RECORDING_SECONDS,
} from "@/lib/ai/constants";
import {
  speakChinese,
  stopSpeaking,
} from "@/lib/ai/speech";
import type {
  AiPracticeMode,
  AnnaReply,
  ConversationHistoryMessage,
} from "@/types/ai";

type Status =
  | "checking"
  | "connected"
  | "offline";

const MEMORY_STORAGE_KEY =
  "anna-ai-conversation-memory-v1";

const MAX_MEMORY_MESSAGES = 40;

function loadSavedMemory(): ConversationHistoryMessage[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(
      MEMORY_STORAGE_KEY
    );

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (
          item
        ): item is ConversationHistoryMessage =>
          typeof item === "object" &&
          item !== null &&
          "role" in item &&
          "content" in item &&
          (
            (item as ConversationHistoryMessage)
              .role === "user" ||
            (item as ConversationHistoryMessage)
              .role === "assistant"
          ) &&
          typeof (
            item as ConversationHistoryMessage
          ).content === "string" &&
          (
            item as ConversationHistoryMessage
          ).content.trim().length > 0
      )
      .slice(-MAX_MEMORY_MESSAGES);
  } catch {
    return [];
  }
}

function saveMemory(
  messages: ConversationHistoryMessage[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      MEMORY_STORAGE_KEY,
      JSON.stringify(
        messages.slice(-MAX_MEMORY_MESSAGES)
      )
    );
  } catch {
    // Ignore localStorage failures.
  }
}

function clearSavedMemory(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(
      MEMORY_STORAGE_KEY
    );
  } catch {
    // Ignore localStorage failures.
  }
}

export default function ChatWindow() {
  const [mode, setMode] =
    useState<AiPracticeMode>(
      "practice"
    );

  const [status, setStatus] =
    useState<Status>("checking");

  const [isRecording, setIsRecording] =
    useState(false);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [
    speakerEnabled,
    setSpeakerEnabled,
  ] = useState(true);

  const [transcript, setTranscript] =
    useState("");

  const [builderInput, setBuilderInput] =
    useState("");

  const [reply, setReply] =
    useState<AnnaReply | null>(null);

  const [error, setError] =
    useState("");

  const [seconds, setSeconds] =
    useState(0);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const chunksRef =
    useRef<Blob[]>([]);

  const timerRef =
    useRef<number | null>(null);

  const historyRef =
    useRef<
      ConversationHistoryMessage[]
    >([]);

  const refreshHealth =
    useCallback(async () => {
      setStatus("checking");

      const online =
        await checkVoiceServer();

      setStatus(
        online
          ? "connected"
          : "offline"
      );
    }, []);

  useEffect(() => {
    historyRef.current =
      loadSavedMemory();

    void refreshHealth();

    return () => {
      stopSpeaking();

      if (
        timerRef.current !== null
      ) {
        window.clearInterval(
          timerRef.current
        );
      }

      streamRef.current
        ?.getTracks()
        .forEach((track) =>
          track.stop()
        );
    };
  }, [refreshHealth]);

  const resetCurrentResult =
    useCallback(() => {
      stopSpeaking();
      setTranscript("");
      setReply(null);
      setError("");
      setSeconds(0);
    }, []);

  const switchMode = (
    nextMode: AiPracticeMode
  ) => {
    if (
      isRecording ||
      isProcessing
    ) {
      return;
    }

    setMode(nextMode);
    resetCurrentResult();
  };

  const stopRecording =
    useCallback(() => {
      const recorder =
        mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state !== "inactive"
      ) {
        recorder.stop();
      }
    }, []);

  useEffect(() => {
    if (
      isRecording &&
      seconds >=
        MAX_RECORDING_SECONDS
    ) {
      stopRecording();
    }
  }, [
    isRecording,
    seconds,
    stopRecording,
  ]);

  const startRecording =
    useCallback(async () => {
      if (
        mode !== "practice" ||
        isRecording ||
        isProcessing
      ) {
        return;
      }

      setError("");
      setTranscript("");
      setReply(null);
      setSeconds(0);

      try {
        const stream =
          await navigator.mediaDevices
            .getUserMedia({
              audio: true,
            });

        streamRef.current = stream;

        const preferredTypes = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4",
        ];

        const mimeType =
          preferredTypes.find((type) =>
            MediaRecorder
              .isTypeSupported(type)
          );

        const recorder = mimeType
          ? new MediaRecorder(
              stream,
              { mimeType }
            )
          : new MediaRecorder(
              stream
            );

        mediaRecorderRef.current =
          recorder;

        chunksRef.current = [];

        recorder.ondataavailable = (
          event
        ) => {
          if (event.data.size > 0) {
            chunksRef.current.push(
              event.data
            );
          }
        };

        recorder.onerror = () => {
          setError(
            "Microphone recording failed."
          );

          setIsRecording(false);
        };

        recorder.onstop =
          async () => {
            if (
              timerRef.current !== null
            ) {
              window.clearInterval(
                timerRef.current
              );

              timerRef.current = null;
            }

            stream
              .getTracks()
              .forEach((track) =>
                track.stop()
              );

            setIsRecording(false);

            const audioBlob =
              new Blob(
                chunksRef.current,
                {
                  type:
                    recorder.mimeType ||
                    "audio/webm",
                }
              );

            if (
              audioBlob.size === 0
            ) {
              setError(
                "Recorded audio is empty."
              );

              return;
            }

            setIsProcessing(true);

            try {
              const result =
                await sendAudio(
                  audioBlob,
                  historyRef.current
                );

              setTranscript(
                result.transcript
              );

              setReply(
                result.reply
              );

              const updatedHistory: ConversationHistoryMessage[] =
                [
                  ...historyRef.current,
                  {
                    role: "user",
                    content:
                      result.transcript,
                  },
                  {
                    role:
                      "assistant",
                    content:
                      result.reply.hanzi,
                  },
                ].slice(
                  -MAX_MEMORY_MESSAGES
                );

              historyRef.current =
                updatedHistory;

              saveMemory(
                updatedHistory
              );

              if (
                speakerEnabled
              ) {
                speakChinese(
                  result.reply.hanzi
                );
              }
            } catch (
              caughtError
            ) {
              setError(
                caughtError instanceof Error
                  ? caughtError.message
                  : "Unknown error occurred."
              );
            } finally {
              setIsProcessing(false);
            }
          };

        recorder.start(250);

        setIsRecording(true);

        timerRef.current =
          window.setInterval(
            () => {
              setSeconds(
                (current) =>
                  current + 1
              );
            },
            1000
          );
      } catch {
        setError(
          "Microphone permission မရပါ။ Browser permission ကို Allow လုပ်ပါ။"
        );
      }
    }, [
      mode,
      isProcessing,
      isRecording,
      speakerEnabled,
    ]);

  const handleBuilderSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (
        mode !==
          "sentence_builder" ||
        isProcessing
      ) {
        return;
      }

      const cleaned =
        builderInput.trim();

      if (!cleaned) {
        setError(
          "မြန်မာစာကြောင်းကို အရင်ရေးပါ။"
        );

        return;
      }

      setError("");
      setReply(null);
      setTranscript(cleaned);
      setIsProcessing(true);

      try {
        const result =
          await sendTextMessage(
            cleaned,
            "sentence_builder",
            []
          );

        setReply(result.reply);

        if (speakerEnabled) {
          speakChinese(
            result.reply.hanzi
          );
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unknown error occurred."
        );
      } finally {
        setIsProcessing(false);
      }
    };

  const newConversation = () => {
    historyRef.current = [];
    clearSavedMemory();
    setBuilderInput("");
    resetCurrentResult();
  };

  return (
    <main className="min-h-screen bg-[#12001f] px-4 py-4 text-white sm:px-6">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[32px] border border-purple-500/40 bg-[#26053b] shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-400/20 px-6 py-5">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-purple-200">
              ANNA AI
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              {mode === "practice"
                ? "Chinese Practice"
                : "Sentence Builder"}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={() =>
                void refreshHealth()
              }
              className="rounded-full border border-purple-300/20 bg-white/5 px-4 py-2"
            >
              <span
                className={`mr-2 inline-block h-2 w-2 rounded-full ${
                  status ===
                  "connected"
                    ? "bg-emerald-400"
                    : status ===
                        "checking"
                      ? "bg-amber-300"
                      : "bg-red-400"
                }`}
              />

              {status === "connected"
                ? "Connected"
                : status === "checking"
                  ? "Checking"
                  : "Offline"}
            </button>

            <button
              type="button"
              onClick={() => {
                setSpeakerEnabled(
                  (current) =>
                    !current
                );

                stopSpeaking();
              }}
              className="rounded-full border border-purple-300/20 bg-white/5 px-4 py-2"
            >
              {speakerEnabled
                ? "🔊 Speaker"
                : "🔇 Muted"}
            </button>

            <button
              type="button"
              onClick={
                newConversation
              }
              className="rounded-full border border-purple-300/20 bg-white/5 px-4 py-2"
            >
              New
            </button>
          </div>
        </header>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 rounded-2xl border border-purple-400/25 bg-black/10 p-1">
            <button
              type="button"
              disabled={
                isRecording ||
                isProcessing
              }
              onClick={() =>
                switchMode(
                  "practice"
                )
              }
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                mode === "practice"
                  ? "bg-gradient-to-r from-fuchsia-600 to-purple-700 shadow-lg"
                  : "text-purple-200 hover:bg-white/5"
              } disabled:opacity-50`}
            >
              🎤 Chinese Practice
            </button>

            <button
              type="button"
              disabled={
                isRecording ||
                isProcessing
              }
              onClick={() =>
                switchMode(
                  "sentence_builder"
                )
              }
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                mode ===
                "sentence_builder"
                  ? "bg-gradient-to-r from-fuchsia-600 to-purple-700 shadow-lg"
                  : "text-purple-200 hover:bg-white/5"
              } disabled:opacity-50`}
            >
              ✍️ Sentence Builder
            </button>
          </div>

          {mode ===
          "sentence_builder" ? (
            <form
              onSubmit={
                handleBuilderSubmit
              }
              className="space-y-3"
            >
              <label
                htmlFor="builder-input"
                className="block text-xs font-bold tracking-[0.18em] text-purple-200"
              >
                မြန်မာ → တရုတ်
              </label>

              <textarea
                id="builder-input"
                value={builderInput}
                onChange={(event) =>
                  setBuilderInput(
                    event.target.value
                  )
                }
                placeholder="ဥပမာ — မနက်ဖြန် ကျွန်မ အလုပ်သွားမယ်။"
                rows={4}
                disabled={
                  isProcessing
                }
                className="w-full resize-none rounded-[24px] border border-purple-400/40 bg-purple-950/40 px-5 py-4 text-base leading-7 text-white outline-none placeholder:text-purple-300/55 focus:border-fuchsia-400 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={
                  isProcessing ||
                  status !==
                    "connected"
                }
                className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-700 px-5 py-4 font-bold shadow-lg transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing
                  ? "Chinese sentence ဖွဲ့နေပါတယ်..."
                  : "တရုတ်စာကြောင်း ဖွဲ့မယ်"}
              </button>
            </form>
          ) : (
            <section className="min-h-28 rounded-[28px] border border-purple-400/40 bg-purple-900/30">
              <div className="border-b border-purple-400/20 px-5 py-3 text-xs font-bold tracking-[0.2em] text-purple-200">
                YOU SAID
              </div>

              <div className="px-5 py-6 text-2xl font-bold leading-relaxed">
                {transcript ||
                  "စကားပြောပြီးရင် ဒီနေရာမှာ ပေါ်လာပါမယ်။"}
              </div>
            </section>
          )}

          {mode ===
            "sentence_builder" &&
            transcript && (
              <section className="rounded-[24px] border border-purple-400/25 bg-purple-900/20">
                <div className="border-b border-purple-400/15 px-5 py-3 text-xs font-bold tracking-[0.18em] text-purple-200">
                  မူရင်းမြန်မာစာ
                </div>

                <div className="px-5 py-4 text-base leading-7">
                  {transcript}
                </div>
              </section>
            )}

          <section className="overflow-hidden rounded-[28px] border border-purple-400/20 bg-[#180128]">
            <div className="flex items-center justify-between border-b border-purple-400/20 px-5 py-4">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-purple-200">
                  {mode ===
                  "practice"
                    ? "ANNA REPLY"
                    : "CHINESE SENTENCE"}
                </p>

                <p className="mt-1 text-sm font-semibold">
                  中文 · 拼音
                </p>
              </div>

              <button
                type="button"
                disabled={!reply}
                onClick={() =>
                  reply &&
                  speakChinese(
                    reply.hanzi
                  )
                }
                className="rounded-full border border-purple-300/20 bg-white/5 p-3 text-xl disabled:opacity-40"
                aria-label="Play Chinese sentence"
              >
                🔊
              </button>
            </div>

            <div className="border-b border-purple-400/20 px-5 py-5">
              <p className="text-xs font-bold tracking-[0.16em] text-purple-300">
                中文 · HANZI
              </p>

              <p className="mt-4 whitespace-pre-wrap text-2xl font-bold leading-relaxed">
                {reply?.hanzi ||
                  (mode ===
                  "practice"
                    ? "Anna 的回复会显示在这里。"
                    : "Chinese sentence will appear here.")}
              </p>
            </div>

            <div className="px-5 py-5">
              <p className="text-xs font-bold tracking-[0.16em] text-purple-300">
                拼音 · PINYIN
              </p>

              <p className="mt-4 whitespace-pre-wrap text-lg font-semibold leading-relaxed">
                {reply?.pinyin ||
                  "Pinyin will appear here."}
              </p>
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {mode === "practice" && (
            <div className="flex flex-col items-center border-t border-purple-300/20 pt-7">
              <button
                type="button"
                onClick={
                  isRecording
                    ? stopRecording
                    : () =>
                        void startRecording()
                }
                disabled={
                  isProcessing ||
                  status !==
                    "connected"
                }
                className={`grid h-32 w-32 place-items-center rounded-full border-[3px] shadow-[0_0_35px_rgba(192,38,255,0.45)] transition-all duration-200 active:scale-95 ${
                  isRecording
                    ? "border-red-200 bg-red-500"
                    : "border-purple-200 bg-gradient-to-b from-fuchsia-500 to-purple-700"
                } disabled:cursor-not-allowed disabled:opacity-50`}
                aria-label={
                  isRecording
                    ? "Stop recording"
                    : "Start recording"
                }
              >
                {isProcessing ? (
                  <span className="text-5xl font-bold leading-none">
                    …
                  </span>
                ) : isRecording ? (
                  <span className="block h-10 w-10 rounded-lg bg-white" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16"
                    aria-hidden="true"
                  >
                    <rect
                      x="8"
                      y="2.5"
                      width="8"
                      height="13"
                      rx="4"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    />

                    <path
                      d="M5.5 11.5V12.5C5.5 16.09 8.41 19 12 19C15.59 19 18.5 16.09 18.5 12.5V11.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M12 19V22"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M8.5 22H15.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>

              <p className="mt-4 text-sm text-purple-100">
                {isProcessing
                  ? "Anna is thinking..."
                  : isRecording
                    ? `Recording ${seconds}s / ${MAX_RECORDING_SECONDS}s`
                    : "Tap the microphone and speak Chinese"}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
