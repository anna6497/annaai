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


/**
 * Hanzi typing speed.
 *
 * 45ms = about 22 characters / second.
 *
 * Change this later if you want
 * Anna typing slower/faster.
 */
const HANZI_CHARACTER_DELAY_MS =
  45;


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

  const microphoneStreamRef =
    useRef<
      MediaStream | null
    >(null);

  const audioChunksRef =
    useRef<
      Blob[]
    >([]);

  const recordingTimerRef =
    useRef<
      number | null
    >(null);

  const historyRef =
    useRef<
      ConversationHistoryMessage[]
    >([]);


  /**
   * Live Hanzi typing refs.
   */
  const hanziQueueRef =
    useRef<
      string[]
    >([]);

  const hanziTimerRef =
    useRef<
      number | null
    >(null);

  const displayedHanziRef =
    useRef("");

  const finalHanziRef =
    useRef("");

  const pendingPinyinRef =
    useRef("");

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
          recordingTimerRef
            .current !==
          null
        ) {
          window.clearInterval(
            recordingTimerRef
              .current,
          );

          recordingTimerRef
            .current =
            null;
        }
      },
      [],
    );


  const stopMicrophoneStream =
    useCallback(
      () => {
        microphoneStreamRef
          .current
          ?.getTracks()
          .forEach(
            (
              track,
            ) => {
              track.stop();
            },
          );

        microphoneStreamRef
          .current =
          null;
      },
      [],
    );


  const stopHanziTyping =
    useCallback(
      () => {
        if (
          hanziTimerRef.current !==
          null
        ) {
          window.clearInterval(
            hanziTimerRef.current,
          );

          hanziTimerRef.current =
            null;
        }

        hanziQueueRef.current =
          [];
      },
      [],
    );


  /**
   * Character-by-character Hanzi renderer.
   *
   * Backend may send 1, 3, or even
   * 20 characters in one token.
   *
   * We split every token into characters
   * and display only one per timer tick.
   */
  const startHanziTyping =
    useCallback(
      () => {
        if (
          hanziTimerRef.current !==
          null
        ) {
          return;
        }

        hanziTimerRef.current =
          window.setInterval(
            () => {
              const nextCharacter =
                hanziQueueRef
                  .current
                  .shift();

              if (
                nextCharacter !==
                undefined
              ) {
                displayedHanziRef
                  .current +=
                  nextCharacter;

                setReply(
                  (
                    current,
                  ) => ({
                    hanzi:
                      displayedHanziRef
                        .current,

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

              /**
               * Queue is empty.
               *
               * If backend has finished,
               * make sure no final character
               * was missed.
               */
              if (
                streamDoneRef.current &&
                finalHanziRef.current
              ) {
                const displayed =
                  displayedHanziRef
                    .current;

                const finalText =
                  finalHanziRef
                    .current;

                if (
                  finalText.startsWith(
                    displayed,
                  ) &&
                  finalText.length >
                    displayed.length
                ) {
                  const missingText =
                    finalText.slice(
                      displayed.length,
                    );

                  hanziQueueRef
                    .current
                    .push(
                      ...Array.from(
                        missingText,
                      ),
                    );

                  return;
                }

                if (
                  displayed !==
                  finalText &&
                  !finalText.startsWith(
                    displayed,
                  )
                ) {
                  displayedHanziRef
                    .current =
                    finalText;
                }
              }

              if (
                hanziTimerRef.current !==
                null
              ) {
                window.clearInterval(
                  hanziTimerRef
                    .current,
                );

                hanziTimerRef
                  .current =
                  null;
              }

              /**
               * Pinyin appears only
               * AFTER Hanzi typing finishes.
               */
              if (
                streamDoneRef.current
              ) {
                setReply(
                  (
                    current,
                  ) => ({
                    hanzi:
                      displayedHanziRef
                        .current ||
                      finalHanziRef
                        .current,

                    pinyin:
                      pendingPinyinRef
                        .current,

                    correction:
                      current
                        ?.correction ??
                      EMPTY_CORRECTION,
                  }),
                );

                if (
                  !speakerEnabled
                ) {
                  setConversationState(
                    "ready",
                  );
                }
              }
            },
            HANZI_CHARACTER_DELAY_MS,
          );
      },
      [
        speakerEnabled,
      ],
    );


  const queueLiveHanzi =
    useCallback(
      (
        text: string,
      ) => {
        if (!text) {
          return;
        }

        hanziQueueRef
          .current
          .push(
            ...Array.from(
              text,
            ),
          );

        startHanziTyping();
      },
      [
        startHanziTyping,
      ],
    );


  const resetStreamingState =
    useCallback(
      () => {
        stopHanziTyping();

        displayedHanziRef.current =
          "";

        finalHanziRef.current =
          "";

        pendingPinyinRef.current =
          "";

        streamDoneRef.current =
          false;
      },
      [
        stopHanziTyping,
      ],
    );


  const resetCurrentResult =
    useCallback(
      () => {
        stopSpeaking();

        clearSpeechQueue();

        resetStreamingState();

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
      [
        resetStreamingState,
      ],
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

        clearSpeechQueue();

        stopRecordingTimer();

        stopMicrophoneStream();

        stopHanziTyping();
      };
    },
    [
      refreshHealth,
      stopHanziTyping,
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

            volume:
              1,

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

        resetStreamingState();

        setReply(
          {
            hanzi:
              "",

            pinyin:
              "",

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


              /**
               * CRITICAL FIX:
               *
               * DO NOT call:
               *
               * setReply(current => current + event.text)
               *
               * because React/browser can batch it.
               *
               * Instead add characters to
               * our animation queue.
               */
              if (
                event.type ===
                "token"
              ) {
                queueLiveHanzi(
                  event.text,
                );

                setConversationState(
                  (
                    current,
                  ) =>
                    current ===
                      "speaking"
                      ? current
                      : "streaming",
                );

                return;
              }


              /**
               * Sentence complete.
               *
               * TTS can start while the next
               * Hanzi is still being generated.
               */
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
                              .current &&
                            hanziQueueRef
                              .current
                              .length ===
                              0 &&
                            hanziTimerRef
                              .current ===
                              null
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


              /**
               * Backend final result.
               *
               * IMPORTANT:
               * We store final text in refs.
               * We do NOT put full Hanzi into state.
               *
               * Otherwise the whole sentence
               * would suddenly appear.
               */
              if (
                event.type ===
                "done"
              ) {
                finalHanzi =
                  event.hanzi
                    .trim();

                finalHanziRef
                  .current =
                  finalHanzi;

                pendingPinyinRef
                  .current =
                  event.pinyin
                    .trim();

                streamDoneRef
                  .current =
                  true;

                /**
                 * Ensure all final characters
                 * exist in animation queue.
                 */
                const projectedText =
                  (
                    displayedHanziRef
                      .current +
                    hanziQueueRef
                      .current
                      .join("")
                  );

                if (
                  finalHanzi.startsWith(
                    projectedText,
                  ) &&
                  finalHanzi.length >
                    projectedText.length
                ) {
                  const missing =
                    finalHanzi.slice(
                      projectedText.length,
                    );

                  hanziQueueRef
                    .current
                    .push(
                      ...Array.from(
                        missing,
                      ),
                    );

                  startHanziTyping();
                }

                return;
              }


              /**
               * Deferred More Natural.
               */
              if (
                event.type ===
                "correction"
              ) {
                setReply(
                  (
                    current,
                  ) => ({
                    hanzi:
                      current
                        ?.hanzi ??
                      displayedHanziRef
                        .current,

                    pinyin:
                      current
                        ?.pinyin ??
                      "",

                    correction:
                      event.correction,
                  }),
                );

                return;
              }


              if (
                event.type ===
                "complete"
              ) {
                streamDoneRef
                  .current =
                  true;

                /**
                 * If backend reply happened
                 * to contain zero token events,
                 * still animate final text.
                 */
                if (
                  finalHanzi &&
                  !displayedHanziRef
                    .current &&
                  hanziQueueRef
                    .current
                    .length ===
                    0
                ) {
                  hanziQueueRef
                    .current
                    .push(
                      ...Array.from(
                        finalHanzi,
                      ),
                    );

                  startHanziTyping();
                }

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
          resetStreamingState();

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
        queueLiveHanzi,
        resetStreamingState,
        saveConversationTurn,
        speakerEnabled,
        startHanziTyping,
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

        resetStreamingState();

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


          microphoneStreamRef
            .current =
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

          audioChunksRef.current =
            [];


          recorder.ondataavailable =
            (
              event,
            ) => {
              if (
                event.data.size >
                0
              ) {
                audioChunksRef
                  .current
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
                  audioChunksRef
                    .current,
                  {
                    type:
                      recorder.mimeType ||
                      "audio/webm",
                  },
                );


              audioChunksRef.current =
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

                clearSpeechQueue();

                stopHanziTyping();

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


          recordingTimerRef
            .current =
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
        resetStreamingState,
        stopHanziTyping,
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

      resetStreamingState();

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
            streamDoneRef.current
              ? "ready"
              : "streaming",
          );
        }
      }
    };


  const handleReplyReplay =
    () => {
      const finalText =
        finalHanziRef.current ||
        reply?.hanzi ||
        "";


      if (
        !finalText ||
        isRecording ||
        isProcessing
      ) {
        return;
      }


      playChinese(
        finalText,
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
    <main className="min-h-screen bg-[#09030f] px-4 pb-28 pt-5 text-white sm:px-6">
      <section className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[25px] font-extrabold tracking-tight text-white">
              AI Speaking
            </h1>

            <button
              type="button"
              onClick={() => void refreshHealth()}
              className="mt-1 inline-flex items-center gap-2 text-left"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "connected"
                    ? "bg-emerald-400"
                    : status === "checking"
                      ? "animate-pulse bg-amber-300"
                      : "bg-red-400"
                }`}
              />

              <span className="text-xs text-[#8e8098]">
                {status === "connected"
                  ? "Anna V7"
                  : status === "checking"
                    ? "Checking Anna V7..."
                    : "Anna V7 Offline"}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={newConversation}
            disabled={isRecording || isProcessing}
            className="inline-flex h-10 items-center gap-1.5 rounded-[13px] border border-[#432453] bg-[#251330] px-3.5 text-[13px] font-semibold text-white disabled:opacity-40"
          >
            <span className="text-lg leading-none">＋</span>
            New
          </button>
        </header>

        {/* Anna avatar / status */}
        <section className="mt-8 flex flex-col items-center">
          <div
            className={`flex h-28 w-28 items-center justify-center rounded-full border-2 transition-all ${
              conversationState === "listening"
                ? "border-rose-500 bg-rose-500/10 shadow-[0_0_40px_rgba(244,63,94,0.25)]"
                : conversationState === "speaking"
                  ? "border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_45px_rgba(217,70,239,0.30)]"
                  : "border-transparent bg-purple-500/10"
            }`}
          >
            <div className="h-[84px] w-[84px] overflow-hidden rounded-full bg-[#a855f7]">
              <img
                src="/images/anna-avatar.png"
                alt="Anna"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <h2 className="mt-3 text-xl font-bold text-white">
            Anna
          </h2>

          <p className="mt-1 text-center text-[13px] text-[#8f8099]">
            {statusText}
          </p>

          <p className="mt-1 text-[10px] text-[#65586e]">
            Memory: {memoryCount} / {MAX_MEMORY_MESSAGES}
          </p>
        </section>

        {/* Keep Sentence Builder available without changing V7 speaking logic */}
        <div className="mt-5 grid grid-cols-2 rounded-2xl border border-[#2f1b3a] bg-[#12091c] p-1">
          <button
            type="button"
            disabled={
              isRecording ||
              isProcessing ||
              conversationState === "speaking"
            }
            onClick={() => switchMode("practice")}
            className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${
              mode === "practice"
                ? "bg-[#281237] text-fuchsia-200"
                : "text-[#796b82]"
            } disabled:opacity-40`}
          >
            🎤 Speaking
          </button>

          <button
            type="button"
            disabled={
              isRecording ||
              isProcessing ||
              conversationState === "speaking"
            }
            onClick={() => switchMode("sentence_builder")}
            className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${
              mode === "sentence_builder"
                ? "bg-[#281237] text-fuchsia-200"
                : "text-[#796b82]"
            } disabled:opacity-40`}
          >
            ✍️ Sentence Builder
          </button>
        </div>

        {mode === "sentence_builder" ? (
          <form
            onSubmit={handleBuilderSubmit}
            className="mt-4 rounded-[20px] border border-[#2f1b3a] bg-[#130a1b] p-4"
          >
            <label
              htmlFor="builder-input"
              className="text-[10px] font-black tracking-[0.14em] text-fuchsia-300"
            >
              MYANMAR → CHINESE
            </label>

            <textarea
              id="builder-input"
              value={builderInput}
              onChange={(event) => setBuilderInput(event.target.value)}
              placeholder="ဥပမာ — မနက်ဖြန် ကျွန်မ အလုပ်သွားမယ်။"
              rows={4}
              disabled={isProcessing}
              className="mt-3 w-full resize-none rounded-2xl border border-[#432453] bg-[#0d0612] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-[#6e6077] focus:border-fuchsia-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isProcessing || status !== "connected"}
              className="mt-3 h-12 w-full rounded-2xl bg-fuchsia-600 px-4 text-sm font-black text-white disabled:opacity-40"
            >
              {isProcessing
                ? "Chinese sentence ဖွဲ့နေပါတယ်..."
                : "တရုတ်စာကြောင်း ဖွဲ့မယ်"}
            </button>
          </form>
        ) : null}

        {/* User transcript */}
        {mode === "practice" && (transcript || conversationState === "listening") ? (
          <section className="mt-4 rounded-[18px] border border-[#47235a] bg-[#251034] p-[17px]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#d8b4fe]">
                YOU SAID
              </p>

              {conversationState === "listening" ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
                  LISTENING
                </span>
              ) : null}
            </div>

            <p className="mt-3 text-[19px] font-semibold leading-7 text-white">
              {transcript ||
                (conversationState === "listening"
                  ? "正在听你说话..."
                  : "")}
            </p>
          </section>
        ) : null}

        {mode === "sentence_builder" && transcript ? (
          <section className="mt-4 rounded-[18px] border border-[#47235a] bg-[#251034] p-[17px]">
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#d8b4fe]">
              မူရင်းမြန်မာစာ
            </p>

            <p className="mt-3 text-base leading-7 text-white">
              {transcript}
            </p>
          </section>
        ) : null}

        {/* More Natural correction + slow TTS */}
        {showCorrection && correction ? (
          <section className="mt-4 rounded-[18px] border border-emerald-400/35 bg-emerald-500/[0.08] p-[17px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black tracking-[0.14em] text-emerald-300">
                  ✨ MORE NATURAL
                </p>

                <p className="mt-1 text-[10px] text-emerald-200/60">
                  ဒီလိုပြောရင် ပိုသဘာဝကျပါတယ်
                </p>
              </div>

              <button
                type="button"
                onClick={handleCorrectionReplay}
                disabled={isRecording || isProcessing}
                aria-label="Listen to corrected sentence"
                className="grid h-[38px] w-[38px] place-items-center rounded-full bg-emerald-400/10 text-lg text-emerald-100 disabled:opacity-40"
              >
                🔊
              </button>
            </div>

            {correction.original ? (
              <div className="mt-4">
                <p className="text-[10px] font-bold tracking-[0.12em] text-emerald-300/70">
                  YOU SAID
                </p>

                <p className="mt-1.5 text-base text-[#9b8ca4] line-through decoration-rose-400/70">
                  {correction.original}
                </p>
              </div>
            ) : null}

            <div className="mt-4">
              <p className="text-[10px] font-bold tracking-[0.12em] text-emerald-300">
                更自然的说法
              </p>

              <p className="mt-2 text-xl font-bold leading-7 text-emerald-50">
                {correction.corrected}
              </p>
            </div>

            {correction.pinyin ? (
              <p className="mt-2 text-[13px] leading-5 text-emerald-200/85">
                {correction.pinyin}
              </p>
            ) : null}
          </section>
        ) : null}

        {/* Anna reply */}
        <section
          className={`mt-4 rounded-[20px] border bg-[#130a1b] p-[18px] transition ${
            conversationState === "speaking"
              ? "border-fuchsia-500/45 shadow-[0_0_35px_rgba(217,70,239,0.12)]"
              : conversationState === "streaming"
                ? "border-violet-500/45"
                : "border-[#2f1b3a]"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#d8b4fe]">
              {mode === "practice" ? "ANNA REPLY" : "CHINESE SENTENCE"}
            </p>

            <button
              type="button"
              onClick={handleReplyReplay}
              disabled={!reply?.hanzi || isRecording || isProcessing}
              aria-label="Replay Anna reply"
              className="grid h-[38px] w-[38px] place-items-center rounded-full bg-[#261432] text-lg disabled:opacity-35"
            >
              🔊
            </button>
          </div>

          {conversationState === "processing" ? (
            <div className="mt-4 flex items-center gap-2 text-[13px] text-[#b89bc6]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-fuchsia-400" />
              Anna is understanding...
            </div>
          ) : null}

          <p className="mt-4 text-[11px] font-bold tracking-[0.12em] text-[#c084fc]">
            中文 · HANZI
          </p>

          <p className="mt-2 whitespace-pre-wrap text-[21px] font-bold leading-8 text-white">
            {reply?.hanzi ||
              (conversationState === "processing" ||
              conversationState === "streaming"
                ? ""
                : mode === "practice"
                  ? "你好！今天想聊什么？"
                  : "Chinese sentence will appear here.")}

            {conversationState === "streaming" ||
            conversationState === "speaking" ? (
              <span className="ml-1 animate-pulse text-fuchsia-300">
                ▌
              </span>
            ) : null}
          </p>

          <div className="my-[18px] h-px bg-[#2f1b3a]" />

          <p className="text-[11px] font-bold tracking-[0.12em] text-[#c084fc]">
            拼音 · PINYIN
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-[22px] text-[#c1afcc]">
            {reply?.pinyin ||
              (conversationState === "processing" ||
              conversationState === "streaming" ||
              conversationState === "speaking"
                ? "Hanzi ပြီးရင် Pinyin ပေါ်လာပါမယ်..."
                : mode === "practice"
                  ? "Nǐ hǎo! Jīntiān xiǎng liáo shénme?"
                  : "")}
          </p>
        </section>

        {error ? (
          <div className="mt-4 rounded-[14px] border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-200">
            ⚠️ {error}
          </div>
        ) : null}

        {/* Mobile-style speaking controls */}
        {mode === "practice" ? (
          <>
            <div className="mt-7 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={handleSpeakerToggle}
                aria-label={speakerEnabled ? "Mute speaker" : "Enable speaker"}
                className={`grid h-[52px] w-[52px] place-items-center rounded-full border border-[#382342] bg-[#21132a] text-[22px] ${
                  speakerEnabled ? "" : "opacity-45"
                }`}
              >
                {speakerEnabled ? "🔊" : "🔇"}
              </button>

              <button
                type="button"
                onClick={
                  isRecording
                    ? stopRecording
                    : () => void startRecording()
                }
                disabled={
                  !isRecording &&
                  (isProcessing ||
                    status !== "connected" ||
                    conversationState === "streaming" ||
                    conversationState === "speaking")
                }
                aria-label={isRecording ? "Stop recording" : "Start recording"}
                className={`grid h-[78px] w-[78px] place-items-center rounded-full text-[34px] text-white shadow-[0_0_30px_rgba(168,85,247,0.28)] transition active:scale-95 ${
                  isRecording
                    ? "bg-red-500"
                    : "bg-[#a855f7]"
                } disabled:opacity-50`}
              >
                {isProcessing ? (
                  <span className="h-7 w-7 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                ) : isRecording ? (
                  "■"
                ) : (
                  "🎤"
                )}
              </button>

              <button
                type="button"
                onClick={newConversation}
                disabled={isRecording || isProcessing}
                aria-label="New conversation"
                className="grid h-[52px] w-[52px] place-items-center rounded-full border border-[#382342] bg-[#21132a] text-[22px] disabled:opacity-40"
              >
                ↻
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] text-[#786a81]">
              {isRecording
                ? "Tap again when you finish speaking"
                : "Tap the microphone and speak Mandarin"}
            </p>
          </>
        ) : null}
      </section>
    </main>
  );
}