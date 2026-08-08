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
  streamVoiceAudio,
} from "@/lib/ai/api";

import {
  MAX_RECORDING_SECONDS,
} from "@/lib/ai/constants";

import {
  clearSpeechQueue,
  queueChineseSentence,
  speakChinese,
  stopSpeaking,
} from "@/lib/ai/speech";

import type {
  AiPracticeMode,
  AnnaCorrection,
  AnnaReply,
  ConversationHistoryMessage,
} from "@/types/ai";

type Status =
  | "checking"
  | "connected"
  | "offline";

type ConversationState =
  | "ready"
  | "listening"
  | "processing"
  | "streaming"
  | "speaking"
  | "error";

const MEMORY_STORAGE_KEY =
  "anna-ai-conversation-memory-v1";

const MAX_MEMORY_MESSAGES =
  40;

const EMPTY_CORRECTION:
  AnnaCorrection = {
    needed: false,
    original: "",
    corrected: "",
    pinyin: "",
  };

function loadSavedMemory():
  ConversationHistoryMessage[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage
        .getItem(
          MEMORY_STORAGE_KEY,
        );

    if (!raw) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(
        raw,
      );

    if (
      !Array.isArray(
        parsed,
      )
    ) {
      return [];
    }

    return parsed
      .filter(
        (
          item,
        ): item is ConversationHistoryMessage =>
          typeof item ===
            "object" &&
          item !== null &&
          "role" in item &&
          "content" in item &&
          (
            (
              item as
                ConversationHistoryMessage
            ).role ===
              "user" ||
            (
              item as
                ConversationHistoryMessage
            ).role ===
              "assistant"
          ) &&
          typeof (
            item as
              ConversationHistoryMessage
          ).content ===
            "string" &&
          (
            item as
              ConversationHistoryMessage
          ).content
            .trim()
            .length > 0,
      )
      .slice(
        -MAX_MEMORY_MESSAGES,
      );
  } catch (
    error
  ) {
    console.error(
      "Unable to load conversation memory:",
      error,
    );

    return [];
  }
}

function saveMemory(
  messages:
    ConversationHistoryMessage[],
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage
      .setItem(
        MEMORY_STORAGE_KEY,

        JSON.stringify(
          messages.slice(
            -MAX_MEMORY_MESSAGES,
          ),
        ),
      );
  } catch (
    error
  ) {
    console.error(
      "Unable to save conversation memory:",
      error,
    );
  }
}

function clearSavedMemory(): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage
      .removeItem(
        MEMORY_STORAGE_KEY,
      );
  } catch (
    error
  ) {
    console.error(
      "Unable to clear conversation memory:",
      error,
    );
  }
}

function getConversationStatusText(
  conversationState:
    ConversationState,
  seconds: number,
): string {
  switch (
    conversationState
  ) {
    case "listening":
      return (
        `Listening... ${seconds}s / ` +
        `${MAX_RECORDING_SECONDS}s`
      );

    case "processing":
      return "Anna is understanding...";

    case "streaming":
      return "Anna is replying live...";

    case "speaking":
      return "Anna is speaking...";

    case "error":
      return "Something went wrong. Please try again.";

    case "ready":
    default:
      return "Your turn — tap the microphone";
  }
}

export default function ChatWindow() {
  const [
    mode,
    setMode,
  ] =
    useState<AiPracticeMode>(
      "practice",
    );

  const [
    status,
    setStatus,
  ] =
    useState<Status>(
      "checking",
    );

  const [
    conversationState,
    setConversationState,
  ] =
    useState<ConversationState>(
      "ready",
    );

  const [
    isRecording,
    setIsRecording,
  ] =
    useState(
      false,
    );

  const [
    isProcessing,
    setIsProcessing,
  ] =
    useState(
      false,
    );

  const [
    speakerEnabled,
    setSpeakerEnabled,
  ] =
    useState(
      true,
    );

  const [
    transcript,
    setTranscript,
  ] =
    useState("");

  const [
    builderInput,
    setBuilderInput,
  ] =
    useState("");

  const [
    reply,
    setReply,
  ] =
    useState<
      AnnaReply | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    seconds,
    setSeconds,
  ] =
    useState(0);

  const [
    memoryCount,
    setMemoryCount,
  ] =
    useState(0);

  const mediaRecorderRef =
    useRef<
      MediaRecorder | null
    >(null);

  const streamRef =
    useRef<
      MediaStream | null
    >(null);

  const chunksRef =
    useRef<
      Blob[]
    >([]);

  const timerRef =
    useRef<
      number | null
    >(null);

  const historyRef =
    useRef<
      ConversationHistoryMessage[]
    >([]);

  const streamDoneRef =
    useRef(
      false,
    );

  const refreshHealth =
    useCallback(
      async () => {
        setStatus(
          "checking",
        );

        const online =
          await checkVoiceServer();

        setStatus(
          online
            ? "connected"
            : "offline",
        );
      },
      [],
    );

  const stopRecordingTimer =
    useCallback(
      () => {
        if (
          timerRef.current !==
          null
        ) {
          window.clearInterval(
            timerRef.current,
          );

          timerRef.current =
            null;
        }
      },
      [],
    );

  const stopMicrophoneStream =
    useCallback(
      () => {
        streamRef.current
          ?.getTracks()
          .forEach(
            (
              track,
            ) => {
              track.stop();
            },
          );

        streamRef.current =
          null;
      },
      [],
    );

  const resetCurrentResult =
    useCallback(
      () => {
        stopSpeaking();

        clearSpeechQueue();

        streamDoneRef.current =
          false;

        setTranscript("");

        setReply(
          null,
        );

        setError("");

        setSeconds(
          0,
        );

        setConversationState(
          "ready",
        );
      },
      [],
    );

  useEffect(
    () => {
      const memory =
        loadSavedMemory();

      historyRef.current =
        memory;

      setMemoryCount(
        memory.length,
      );

      void refreshHealth();

      return () => {
        stopSpeaking();

        stopRecordingTimer();

        stopMicrophoneStream();
      };
    },
    [
      refreshHealth,
      stopMicrophoneStream,
      stopRecordingTimer,
    ],
  );

  const switchMode = (
    nextMode:
      AiPracticeMode,
  ) => {
    if (
      isRecording ||
      isProcessing ||
      conversationState ===
        "speaking"
    ) {
      return;
    }

    setMode(
      nextMode,
    );

    resetCurrentResult();
  };

  const stopRecording =
    useCallback(
      () => {
        const recorder =
          mediaRecorderRef
            .current;

        if (
          recorder &&
          recorder.state !==
            "inactive"
        ) {
          recorder.stop();
        }
      },
      [],
    );

  useEffect(
    () => {
      if (
        isRecording &&
        seconds >=
          MAX_RECORDING_SECONDS
      ) {
        stopRecording();
      }
    },
    [
      isRecording,
      seconds,
      stopRecording,
    ],
  );

  const playChinese =
    useCallback(
      (
        hanzi: string,
        speed:
          | "normal"
          | "slow" =
          "normal",
      ) => {
        if (
          !speakerEnabled ||
          !hanzi.trim()
        ) {
          setConversationState(
            "ready",
          );

          return;
        }

        void speakChinese(
          hanzi,
          {
            speed,

            volume: 1,

            onStart: () => {
              setConversationState(
                "speaking",
              );
            },

            onEnd: () => {
              setConversationState(
                "ready",
              );
            },

            onError: () => {
              setConversationState(
                "ready",
              );
            },
          },
        );
      },
      [
        speakerEnabled,
      ],
    );

  const saveConversationTurn =
    useCallback(
      (
        userText: string,
        annaText: string,
      ) => {
        const cleanedUser =
          userText.trim();

        const cleanedAnna =
          annaText.trim();

        if (
          !cleanedUser ||
          !cleanedAnna
        ) {
          return;
        }

        const newMessages:
          ConversationHistoryMessage[] =
          [
            {
              role:
                "user",

              content:
                cleanedUser,
            },

            {
              role:
                "assistant",

              content:
                cleanedAnna,
            },
          ];

        const updatedHistory =
          [
            ...historyRef.current,
            ...newMessages,
          ].slice(
            -MAX_MEMORY_MESSAGES,
          );

        historyRef.current =
          updatedHistory;

        saveMemory(
          updatedHistory,
        );

        setMemoryCount(
          updatedHistory.length,
        );
      },
      [],
    );

  const processFallbackVoice =
    useCallback(
      async (
        audioBlob: Blob,
      ) => {
        const result =
          await sendAudio(
            audioBlob,
            historyRef.current,
          );

        const cleanedTranscript =
          result.transcript
            .trim();

        setTranscript(
          cleanedTranscript,
        );

        setReply(
          result.reply,
        );

        saveConversationTurn(
          cleanedTranscript,
          result.reply.hanzi,
        );

        setError("");

        if (
          speakerEnabled
        ) {
          playChinese(
            result.reply.hanzi,
          );
        } else {
          setConversationState(
            "ready",
          );
        }
      },
      [
        playChinese,
        saveConversationTurn,
        speakerEnabled,
      ],
    );

  const processStreamingVoice =
    useCallback(
      async (
        audioBlob: Blob,
      ): Promise<boolean> => {
        let streamedTranscript =
          "";

        let finalHanzi =
          "";

        let finalPinyin =
          "";

        let correction:
          AnnaCorrection =
          EMPTY_CORRECTION;

        streamDoneRef.current =
          false;

        setReply(
          {
            hanzi: "",
            pinyin: "",
            correction:
              EMPTY_CORRECTION,
          },
        );

        const supported =
          await streamVoiceAudio(
            audioBlob,
            historyRef.current,
            (
              event,
            ) => {
              if (
                event.type ===
                "start"
              ) {
                setConversationState(
                  "processing",
                );

                return;
              }

              if (
                event.type ===
                "transcript"
              ) {
                streamedTranscript =
                  event.transcript
                    .trim();

                setTranscript(
                  streamedTranscript,
                );

                setConversationState(
                  "streaming",
                );

                return;
              }

              if (
                event.type ===
                "token"
              ) {
                setConversationState(
                  (
                    current,
                  ) =>
                    current ===
                      "speaking"
                      ? current
                      : "streaming",
                );

                setReply(
                  (
                    current,
                  ) => ({
                    hanzi:
                      (
                        current
                          ?.hanzi ??
                        ""
                      ) +
                      event.text,

                    pinyin:
                      current
                        ?.pinyin ??
                      "",

                    correction:
                      current
                        ?.correction ??
                      EMPTY_CORRECTION,
                  }),
                );

                return;
              }

              if (
                event.type ===
                "sentence"
              ) {
                if (
                  speakerEnabled
                ) {
                  queueChineseSentence(
                    event.sentence,
                    {
                      speed:
                        "normal",

                      volume:
                        1,

                      onStart:
                        () => {
                          setConversationState(
                            "speaking",
                          );
                        },

                      onQueueIdle:
                        () => {
                          if (
                            streamDoneRef
                              .current
                          ) {
                            setConversationState(
                              "ready",
                            );
                          } else {
                            setConversationState(
                              "streaming",
                            );
                          }
                        },

                      onError:
                        (
                          queueError,
                        ) => {
                          console.warn(
                            "Streaming sentence audio error:",
                            queueError,
                          );
                        },
                    },
                  );
                }

                return;
              }

              if (
                event.type ===
                "correction"
              ) {
                correction =
                  event.correction;

                setReply(
                  (
                    current,
                  ) => ({
                    hanzi:
                      current
                        ?.hanzi ??
                      finalHanzi,

                    pinyin:
                      current
                        ?.pinyin ??
                      finalPinyin,

                    correction:
                      event.correction,
                  }),
                );

                return;
              }

              if (
                event.type ===
                "done"
              ) {
                finalHanzi =
                  event.hanzi
                    .trim();

                finalPinyin =
                  event.pinyin
                    .trim();

                streamDoneRef.current =
                  true;

                setReply(
                  (
                    current,
                  ) => ({
                    hanzi:
                      finalHanzi ||
                      current
                        ?.hanzi ||
                      "",

                    pinyin:
                      finalPinyin,

                    correction:
                      current
                        ?.correction ??
                      correction,
                  }),
                );

                if (
                  !speakerEnabled
                ) {
                  setConversationState(
                    "ready",
                  );
                }

                return;
              }

              if (
                event.type ===
                "complete"
              ) {
                streamDoneRef.current =
                  true;

                return;
              }

              if (
                event.type ===
                "error"
              ) {
                throw new Error(
                  event.error,
                );
              }
            },
          );

        if (!supported) {
          return false;
        }

        if (
          streamedTranscript &&
          finalHanzi
        ) {
          saveConversationTurn(
            streamedTranscript,
            finalHanzi,
          );
        }

        return true;
      },
      [
        saveConversationTurn,
        speakerEnabled,
      ],
    );

  const startRecording =
    useCallback(
      async () => {
        if (
          mode !==
            "practice" ||
          isRecording ||
          isProcessing ||
          conversationState ===
            "speaking"
        ) {
          return;
        }

        stopSpeaking();

        clearSpeechQueue();

        setError("");

        setTranscript("");

        setReply(
          null,
        );

        setSeconds(
          0,
        );

        setConversationState(
          "listening",
        );

        try {
          if (
            !navigator
              .mediaDevices
              ?.getUserMedia
          ) {
            throw new Error(
              "Microphone is not supported by this browser.",
            );
          }

          if (
            typeof MediaRecorder ===
            "undefined"
          ) {
            throw new Error(
              "Audio recording is not supported by this browser.",
            );
          }

          const stream =
            await navigator
              .mediaDevices
              .getUserMedia(
                {
                  audio: {
                    echoCancellation:
                      true,

                    noiseSuppression:
                      true,

                    autoGainControl:
                      true,
                  },
                },
              );

          streamRef.current =
            stream;

          const preferredTypes =
            [
              "audio/webm;codecs=opus",
              "audio/webm",
              "audio/mp4",
              "audio/ogg;codecs=opus",
            ];

          const mimeType =
            preferredTypes.find(
              (
                type,
              ) =>
                MediaRecorder
                  .isTypeSupported(
                    type,
                  ),
            );

          const recorder =
            mimeType
              ? new MediaRecorder(
                  stream,
                  {
                    mimeType,
                  },
                )
              : new MediaRecorder(
                  stream,
                );

          mediaRecorderRef.current =
            recorder;

          chunksRef.current =
            [];

          recorder.ondataavailable =
            (
              event,
            ) => {
              if (
                event.data.size >
                0
              ) {
                chunksRef.current
                  .push(
                    event.data,
                  );
              }
            };

          recorder.onerror =
            (
              recorderError,
            ) => {
              console.error(
                "MediaRecorder error:",
                recorderError,
              );

              stopRecordingTimer();

              stopMicrophoneStream();

              setIsRecording(
                false,
              );

              setConversationState(
                "error",
              );

              setError(
                "Microphone recording failed. Please try again.",
              );
            };

          recorder.onstop =
            async () => {
              stopRecordingTimer();

              stopMicrophoneStream();

              setIsRecording(
                false,
              );

              const audioBlob =
                new Blob(
                  chunksRef.current,
                  {
                    type:
                      recorder.mimeType ||
                      "audio/webm",
                  },
                );

              chunksRef.current =
                [];

              if (
                audioBlob.size ===
                0
              ) {
                setConversationState(
                  "error",
                );

                setError(
                  "Recorded audio is empty. Please record again.",
                );

                return;
              }

              setConversationState(
                "processing",
              );

              setIsProcessing(
                true,
              );

              try {
                const streamed =
                  await processStreamingVoice(
                    audioBlob,
                  );

                if (!streamed) {
                  await processFallbackVoice(
                    audioBlob,
                  );
                }

                setError("");
              } catch (
                caughtError
              ) {
                console.error(
                  "Voice conversation failed:",
                  caughtError,
                );

                stopSpeaking();

                setConversationState(
                  "error",
                );

                setError(
                  caughtError instanceof
                    Error
                    ? caughtError.message
                    : "Voice processing failed. Please try again.",
                );
              } finally {
                setIsProcessing(
                  false,
                );
              }
            };

          recorder.start(
            200,
          );

          setIsRecording(
            true,
          );

          setConversationState(
            "listening",
          );

          timerRef.current =
            window.setInterval(
              () => {
                setSeconds(
                  (
                    current,
                  ) =>
                    current +
                    1,
                );
              },
              1000,
            );
        } catch (
          caughtError
        ) {
          console.error(
            "Unable to start recording:",
            caughtError,
          );

          stopRecordingTimer();

          stopMicrophoneStream();

          setIsRecording(
            false,
          );

          setConversationState(
            "error",
          );

          if (
            caughtError instanceof
              DOMException &&
            caughtError.name ===
              "NotAllowedError"
          ) {
            setError(
              "Microphone permission မရပါ။ Browser permission ကို Allow လုပ်ပါ။",
            );

            return;
          }

          if (
            caughtError instanceof
              DOMException &&
            caughtError.name ===
              "NotFoundError"
          ) {
            setError(
              "Microphone မတွေ့ပါ။ Microphone connection ကိုစစ်ပါ။",
            );

            return;
          }

          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : "Microphone ကိုဖွင့်၍မရပါ။",
          );
        }
      },
      [
        conversationState,
        isProcessing,
        isRecording,
        mode,
        processFallbackVoice,
        processStreamingVoice,
        stopMicrophoneStream,
        stopRecordingTimer,
      ],
    );

  const handleBuilderSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
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
          "မြန်မာစာကြောင်းကို အရင်ရေးပါ။",
        );

        return;
      }

      stopSpeaking();

      setError("");

      setReply(
        null,
      );

      setTranscript(
        cleaned,
      );

      setConversationState(
        "processing",
      );

      setIsProcessing(
        true,
      );

      try {
        const result =
          await sendTextMessage(
            cleaned,
            "sentence_builder",
            [],
          );

        setReply(
          result.reply,
        );

        if (
          speakerEnabled
        ) {
          playChinese(
            result.reply.hanzi,
          );
        } else {
          setConversationState(
            "ready",
          );
        }
      } catch (
        caughtError
      ) {
        console.error(
          "Sentence Builder failed:",
          caughtError,
        );

        setConversationState(
          "error",
        );

        setError(
          caughtError instanceof
            Error
            ? caughtError.message
            : "Sentence Builder error occurred.",
        );
      } finally {
        setIsProcessing(
          false,
        );
      }
    };

  const newConversation =
    () => {
      stopSpeaking();

      clearSpeechQueue();

      historyRef.current =
        [];

      clearSavedMemory();

      setMemoryCount(
        0,
      );

      setBuilderInput("");

      resetCurrentResult();
    };

  const handleSpeakerToggle =
    () => {
      const nextEnabled =
        !speakerEnabled;

      setSpeakerEnabled(
        nextEnabled,
      );

      if (
        !nextEnabled
      ) {
        stopSpeaking();

        clearSpeechQueue();

        if (
          conversationState ===
            "speaking"
        ) {
          setConversationState(
            "ready",
          );
        }
      }
    };

  const handleReplyReplay =
    () => {
      if (
        !reply ||
        !reply.hanzi ||
        isRecording ||
        isProcessing
      ) {
        return;
      }

      playChinese(
        reply.hanzi,
      );
    };

  const handleCorrectionReplay =
    () => {
      const correction =
        reply?.correction;

      if (
        !correction
          ?.needed ||
        !correction
          .corrected ||
        isRecording ||
        isProcessing
      ) {
        return;
      }

      playChinese(
        correction.corrected,
        "slow",
      );
    };

  const statusText =
    getConversationStatusText(
      conversationState,
      seconds,
    );

  const correction =
    reply?.correction;

  const showCorrection =
    mode ===
      "practice" &&
    correction
      ?.needed ===
      true &&
    Boolean(
      correction
        .corrected
        .trim(),
    );

  return (
    <main className="min-h-screen bg-[#12001f] px-4 py-4 text-white sm:px-6">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[32px] border border-purple-500/40 bg-[#26053b] shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-400/20 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold tracking-[0.22em] text-purple-200">
                ANNA AI
              </p>

              <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-2 py-1 text-[10px] font-black tracking-wider text-fuchsia-200">
                V7 LIVE PREVIEW
              </span>
            </div>

            <h1 className="mt-1 text-2xl font-bold">
              {mode ===
              "practice"
                ? "Chinese Practice"
                : "Sentence Builder"}
            </h1>

            <p className="mt-1 text-xs text-white/35">
              Memory:{" "}
              {memoryCount} /{" "}
              {MAX_MEMORY_MESSAGES}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={() =>
                void refreshHealth()
              }
              className="rounded-full border border-purple-300/20 bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              <span
                className={`mr-2 inline-block h-2 w-2 rounded-full ${
                  status ===
                  "connected"
                    ? "bg-emerald-400"
                    : status ===
                        "checking"
                      ? "animate-pulse bg-amber-300"
                      : "bg-red-400"
                }`}
              />

              {status ===
              "connected"
                ? "Connected"
                : status ===
                    "checking"
                  ? "Checking"
                  : "Offline"}
            </button>

            <button
              type="button"
              onClick={
                handleSpeakerToggle
              }
              className="rounded-full border border-purple-300/20 bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              {speakerEnabled
                ? "🔊 Speaker"
                : "🔇 Muted"}
            </button>

            <button
              type="button"
              disabled={
                isRecording ||
                isProcessing
              }
              onClick={
                newConversation
              }
              className="rounded-full border border-purple-300/20 bg-white/5 px-4 py-2 transition hover:bg-white/10 disabled:opacity-40"
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
                isProcessing ||
                conversationState ===
                  "speaking"
              }
              onClick={() =>
                switchMode(
                  "practice",
                )
              }
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                mode ===
                "practice"
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
                isProcessing ||
                conversationState ===
                  "speaking"
              }
              onClick={() =>
                switchMode(
                  "sentence_builder",
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
                value={
                  builderInput
                }
                onChange={(
                  event,
                ) =>
                  setBuilderInput(
                    event.target
                      .value,
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
              <div className="flex items-center justify-between border-b border-purple-400/20 px-5 py-3">
                <span className="text-xs font-bold tracking-[0.2em] text-purple-200">
                  YOU SAID
                </span>

                {conversationState ===
                "listening" ? (
                  <span className="flex items-center gap-2 text-xs font-bold text-red-200">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                    LISTENING
                  </span>
                ) : null}
              </div>

              <div className="px-5 py-6 text-2xl font-bold leading-relaxed">
                {transcript ||
                  (
                    conversationState ===
                    "listening"
                      ? "正在听你说话..."
                      : "စကားပြောပြီးရင် ဒီနေရာမှာ ပေါ်လာပါမယ်။"
                  )}
              </div>
            </section>
          )}

          {mode ===
            "sentence_builder" &&
          transcript ? (
            <section className="rounded-[24px] border border-purple-400/25 bg-purple-900/20">
              <div className="border-b border-purple-400/15 px-5 py-3 text-xs font-bold tracking-[0.18em] text-purple-200">
                မူရင်းမြန်မာစာ
              </div>

              <div className="px-5 py-4 text-base leading-7">
                {transcript}
              </div>
            </section>
          ) : null}

          {showCorrection &&
          correction ? (
            <section className="overflow-hidden rounded-[26px] border border-emerald-400/35 bg-emerald-500/[0.08]">
              <div className="flex items-center justify-between gap-4 border-b border-emerald-400/20 px-5 py-4">
                <div>
                  <p className="text-xs font-black tracking-[0.18em] text-emerald-200">
                    ✨ MORE NATURAL
                  </p>

                  <p className="mt-1 text-xs text-emerald-100/60">
                    ဒီလိုပြောရင် ပိုသဘာဝကျပါတယ်
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    isRecording ||
                    isProcessing
                  }
                  onClick={
                    handleCorrectionReplay
                  }
                  className="rounded-full border border-emerald-300/30 bg-emerald-300/10 p-3 text-xl disabled:opacity-40"
                >
                  🔊
                </button>
              </div>

              {correction.original ? (
                <div className="border-b border-emerald-400/15 px-5 py-4">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-emerald-200/60">
                    YOU SAID
                  </p>

                  <p className="mt-2 text-lg text-white/50 line-through decoration-red-400/70">
                    {correction.original}
                  </p>
                </div>
              ) : null}

              <div className="border-b border-emerald-400/15 px-5 py-5">
                <p className="text-[11px] font-bold tracking-[0.16em] text-emerald-200">
                  更自然的说法
                </p>

                <p className="mt-3 text-2xl font-bold leading-relaxed text-emerald-50">
                  {correction.corrected}
                </p>
              </div>

              {correction.pinyin ? (
                <div className="px-5 py-4">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-emerald-200/70">
                    拼音 · PINYIN
                  </p>

                  <p className="mt-2 text-base font-semibold leading-relaxed text-emerald-50/90">
                    {correction.pinyin}
                  </p>
                </div>
              ) : null}
            </section>
          ) : null}

          <section
            className={`overflow-hidden rounded-[28px] border bg-[#180128] ${
              conversationState ===
              "speaking"
                ? "border-fuchsia-400/50 shadow-[0_0_35px_rgba(217,70,239,0.16)]"
                : conversationState ===
                    "streaming"
                  ? "border-violet-400/50"
                  : "border-purple-400/20"
            }`}
          >
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
                disabled={
                  !reply?.hanzi ||
                  isRecording ||
                  isProcessing
                }
                onClick={
                  handleReplyReplay
                }
                className="rounded-full border border-purple-300/20 bg-white/5 p-3 text-xl disabled:opacity-40"
              >
                🔊
              </button>
            </div>

            {conversationState ===
            "processing" ? (
              <div className="border-b border-purple-400/20 px-5 py-4 text-violet-200">
                Anna is understanding...
              </div>
            ) : null}

            {conversationState ===
            "streaming" ? (
              <div className="border-b border-violet-400/20 bg-violet-400/[0.05] px-5 py-3 text-sm text-violet-200">
                <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                Anna is replying live...
              </div>
            ) : null}

            {conversationState ===
            "speaking" ? (
              <div className="border-b border-fuchsia-400/20 bg-fuchsia-400/[0.05] px-5 py-3 text-sm text-fuchsia-200">
                <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" />
                Anna is speaking...
              </div>
            ) : null}

            <div className="border-b border-purple-400/20 px-5 py-5">
              <p className="text-xs font-bold tracking-[0.16em] text-purple-300">
                中文 · HANZI
              </p>

              <p className="mt-4 whitespace-pre-wrap text-2xl font-bold leading-relaxed">
                {reply?.hanzi ||
                  (
                    conversationState ===
                    "streaming"
                      ? "▌"
                      : mode ===
                          "practice"
                        ? "Anna 的回复会显示在这里。"
                        : "Chinese sentence will appear here."
                  )}

                {conversationState ===
                "streaming" &&
                reply?.hanzi ? (
                  <span className="ml-1 animate-pulse text-fuchsia-300">
                    ▌
                  </span>
                ) : null}
              </p>
            </div>

            <div className="px-5 py-5">
              <p className="text-xs font-bold tracking-[0.16em] text-purple-300">
                拼音 · PINYIN
              </p>

              <p className="mt-4 whitespace-pre-wrap text-lg font-semibold leading-relaxed">
                {reply?.pinyin ||
                  (
                    conversationState ===
                    "streaming" ||
                    conversationState ===
                    "speaking"
                      ? "Hanzi ပြီးရင် Pinyin ပေါ်လာပါမယ်..."
                      : "Pinyin will appear here."
                  )}
              </p>
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-4 text-sm text-red-100">
              ⚠️ {error}
            </div>
          ) : null}

          {mode ===
          "practice" ? (
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
                    "connected" ||
                  conversationState ===
                    "speaking"
                }
                className={`grid h-32 w-32 place-items-center rounded-full border-[3px] text-5xl shadow-[0_0_35px_rgba(192,38,255,0.45)] ${
                  isRecording
                    ? "border-red-200 bg-red-500"
                    : "border-purple-200 bg-gradient-to-b from-fuchsia-500 to-purple-700"
                } disabled:opacity-50`}
              >
                {isRecording
                  ? "■"
                  : "🎤"}
              </button>

              <p className="mt-5 text-sm font-medium text-purple-100">
                {statusText}
              </p>

              {conversationState ===
              "listening" ? (
                <p className="mt-2 text-xs text-white/40">
                  Tap again when you finish speaking.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}