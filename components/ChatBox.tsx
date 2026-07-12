"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase";

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;

  start: () => void;
  stop: () => void;
  abort?: () => void;

  onresult:
    | ((
        event: SpeechRecognitionEventLike
      ) => void)
    | null;

  onerror:
    | ((
        event: SpeechRecognitionErrorEventLike
      ) => void)
    | null;

  onend: (() => void) | null;
}

type SpeechRecognitionConstructor =
  new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?:
      SpeechRecognitionConstructor;

    webkitSpeechRecognition?:
      SpeechRecognitionConstructor;
  }
}

export type ConversationStatus =
  | "ready"
  | "listening"
  | "thinking"
  | "speaking";

interface ChatBoxProps {
  onStatusChange?: (
    status: ConversationStatus
  ) => void;
}

const CHAT_TIMEOUT_MS = 25000;
const SPEECH_TIMEOUT_MS = 30000;
const RESTART_DELAY_MS = 700;

export default function ChatBox({
  onStatusChange,
}: ChatBoxProps) {
  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    []
  );

  const [message, setMessage] =
    useState("");

  const [reply, setReply] = useState(
    [
      "中文：按一下麦克风，跟我说中文吧！😄",
      "拼音：Àn yíxià màikèfēng, gēn wǒ shuō Zhōngwén ba!",
      "မြန်မာ：မိုက်ခရိုဖုန်းကို နှိပ်ပြီး Anna နဲ့ တရုတ်လို ပြောပါနော်။",
    ].join("\n")
  );

  const [isListening, setIsListening] =
    useState(false);

  const [isThinking, setIsThinking] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [
    autoConversation,
    setAutoConversation,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(
      null
    );

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const audioUrlRef =
    useRef<string | null>(null);

  const restartTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const audioWatchdogRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const chatAbortRef =
    useRef<AbortController | null>(null);

  const speechAbortRef =
    useRef<AbortController | null>(null);

  const autoConversationRef =
    useRef(false);

  const busyRef =
    useRef(false);

  const stoppingRef =
    useRef(false);

  const generationRef =
    useRef(0);

  const previousResponseIdRef =
    useRef<string | null>(null);

  function changeStatus(
    status: ConversationStatus
  ) {
    onStatusChange?.(status);
  }

  function updateAutoConversation(
    value: boolean
  ) {
    autoConversationRef.current = value;
    setAutoConversation(value);
  }

  function clearRestartTimer() {
    if (restartTimerRef.current) {
      clearTimeout(
        restartTimerRef.current
      );

      restartTimerRef.current = null;
    }
  }

  function clearAudioWatchdog() {
    if (audioWatchdogRef.current) {
      clearTimeout(
        audioWatchdogRef.current
      );

      audioWatchdogRef.current = null;
    }
  }

  function cleanUpRecognition() {
    const recognition =
      recognitionRef.current;

    if (!recognition) {
      return;
    }

    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;

    try {
      recognition.abort?.();
    } catch {
      // Browser abort error ကို မပြပါ။
    }

    recognitionRef.current = null;
  }

  function cleanUpAudio() {
    clearAudioWatchdog();

    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;

      audioRef.current.pause();
      audioRef.current.src = "";

      audioRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(
        audioUrlRef.current
      );

      audioUrlRef.current = null;
    }
  }

  function abortRequests() {
    chatAbortRef.current?.abort();
    speechAbortRef.current?.abort();

    chatAbortRef.current = null;
    speechAbortRef.current = null;
  }

  function extractChineseText(
    fullReply: string
  ) {
    const lines = fullReply
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const chineseLine = lines.find(
      (line) =>
        line.startsWith("中文：") ||
        line.startsWith("中文:")
    );

    if (chineseLine) {
      return chineseLine
        .replace(/^中文[：:]\s*/u, "")
        .trim();
    }

    const fallback = lines.find(
      (line) =>
        /[\u3400-\u9fff]/u.test(line) &&
        !line.startsWith("拼音") &&
        !line.startsWith("မြန်မာ")
    );

    return (
      fallback
        ?.replace(
          /^(中文|更自然)[：:]\s*/u,
          ""
        )
        .trim() ?? ""
    );
  }

  async function saveConversation(
    userMessage: string,
    annaReply: string
  ) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { error: saveError } =
        await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            user_message: userMessage,
            anna_reply: annaReply,
          });

      if (saveError) {
        console.error(
          "Conversation save error:",
          saveError
        );
      }
    } catch (saveError) {
      console.error(
        "Conversation save error:",
        saveError
      );
    }
  }

  function scheduleListeningRestart(
    delay = RESTART_DELAY_MS
  ) {
    clearRestartTimer();

    if (
      !autoConversationRef.current ||
      stoppingRef.current
    ) {
      busyRef.current = false;
      changeStatus("ready");
      return;
    }

    restartTimerRef.current =
      setTimeout(() => {
        restartTimerRef.current = null;

        if (
          autoConversationRef.current &&
          !stoppingRef.current &&
          !busyRef.current &&
          !recognitionRef.current
        ) {
          startListening();
        }
      }, delay);
  }

  async function requestAnnaReply(
    cleanMessage: string
  ) {
    let lastError:
      | Error
      | null = null;

    for (
      let attempt = 1;
      attempt <= 2;
      attempt += 1
    ) {
      const controller =
        new AbortController();

      chatAbortRef.current =
        controller;

      const timeout = setTimeout(() => {
        controller.abort();
      }, CHAT_TIMEOUT_MS);

      try {
        const response = await fetch(
          "/api/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              message: cleanMessage,

              previousResponseId:
                previousResponseIdRef.current,
            }),
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const data =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Anna reply မရပါ။"
          );
        }

        if (
          typeof data?.reply !==
            "string" ||
          !data.reply.trim()
        ) {
          throw new Error(
            "Anna reply was empty."
          );
        }

        return {
          reply: data.reply.trim(),

          responseId:
            typeof data.responseId ===
            "string"
              ? data.responseId
              : null,
        };
      } catch (requestError) {
        lastError =
          requestError instanceof Error
            ? requestError
            : new Error(
                "Anna reply မရပါ။"
              );

        if (
          attempt < 2 &&
          autoConversationRef.current
        ) {
          await new Promise<void>(
            (resolve) => {
              setTimeout(resolve, 800);
            }
          );

          continue;
        }
      } finally {
        clearTimeout(timeout);

        if (
          chatAbortRef.current ===
          controller
        ) {
          chatAbortRef.current = null;
        }
      }
    }

    throw (
      lastError ??
      new Error("Anna reply မရပါ။")
    );
  }

  async function speakChinese(
    fullReply: string,
    generation: number
  ) {
    const chineseText =
      extractChineseText(fullReply);

    if (
      !chineseText ||
      generation !==
        generationRef.current
    ) {
      busyRef.current = false;
      setIsSpeaking(false);
      scheduleListeningRestart();
      return;
    }

    const controller =
      new AbortController();

    speechAbortRef.current =
      controller;

    const timeout = setTimeout(() => {
      controller.abort();
    }, SPEECH_TIMEOUT_MS);

    try {
      busyRef.current = true;

      setIsSpeaking(true);
      changeStatus("speaking");
      cleanUpAudio();

      const response = await fetch(
        "/api/speech",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            text: chineseText,
          }),
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.error ||
            "Anna အသံထုတ်မရပါ။"
        );
      }

      if (
        generation !==
        generationRef.current
      ) {
        return;
      }

      const audioBlob =
        await response.blob();

      const audioUrl =
        URL.createObjectURL(audioBlob);

      const audio =
        new Audio(audioUrl);

      audio.preload = "auto";

      audioRef.current = audio;
      audioUrlRef.current = audioUrl;

      let finished = false;

      function finishSpeaking() {
        if (finished) {
          return;
        }

        finished = true;

        cleanUpAudio();

        setIsSpeaking(false);
        busyRef.current = false;

        if (
          generation ===
          generationRef.current
        ) {
          scheduleListeningRestart();
        }
      }

      audio.onended =
        finishSpeaking;

      audio.onerror = () => {
        setError(
          "Anna အသံဖွင့်မရပေမယ့် စကားဝိုင်းကို ဆက်ထားပါတယ်။"
        );

        finishSpeaking();
      };

      audioWatchdogRef.current =
        setTimeout(
          finishSpeaking,
          SPEECH_TIMEOUT_MS
        );

      await audio.play();
    } catch (speechError) {
      if (
        generation !==
        generationRef.current
      ) {
        return;
      }

      console.error(
        "Speech error:",
        speechError
      );

      cleanUpAudio();

      setIsSpeaking(false);
      busyRef.current = false;

      if (
        speechError instanceof DOMException &&
        speechError.name === "AbortError"
      ) {
        setError(
          "Anna အသံနည်းနည်းကြာသွားလို့ Listening ကို ပြန်စလိုက်ပါတယ်။"
        );
      } else {
        setError(
          speechError instanceof Error
            ? speechError.message
            : "Anna အသံထုတ်မရပါ။"
        );
      }

      scheduleListeningRestart();
    } finally {
      clearTimeout(timeout);

      if (
        speechAbortRef.current ===
        controller
      ) {
        speechAbortRef.current =
          null;
      }
    }
  }

  async function askAnna(
    text: string
  ) {
    const cleanMessage =
      text.trim();

    if (
      !cleanMessage ||
      busyRef.current
    ) {
      return;
    }

    const generation =
      generationRef.current;

    busyRef.current = true;

    setIsThinking(true);
    setError("");
    changeStatus("thinking");

    try {
      const result =
        await requestAnnaReply(
          cleanMessage
        );

      if (
        generation !==
        generationRef.current
      ) {
        return;
      }

      if (result.responseId) {
        previousResponseIdRef.current =
          result.responseId;
      }

      setReply(result.reply);

      void saveConversation(
        cleanMessage,
        result.reply
      );

      setIsThinking(false);
      busyRef.current = false;

      await speakChinese(
        result.reply,
        generation
      );
    } catch (requestError) {
      if (
        generation !==
        generationRef.current
      ) {
        return;
      }

      console.error(
        "Chat error:",
        requestError
      );

      setError(
        requestError instanceof DOMException &&
        requestError.name === "AbortError"
          ? "Anna reply ကြာသွားပါတယ်။ ထပ်ပြောကြည့်ပါနော်။"
          : requestError instanceof Error
            ? requestError.message
            : "AI connection failed."
      );
    } finally {
      if (
        generation ===
        generationRef.current
      ) {
        setIsThinking(false);
        busyRef.current = false;

        if (!audioRef.current) {
          scheduleListeningRestart();
        }
      }
    }
  }

  function startListening() {
    clearRestartTimer();
    setError("");

    if (
      stoppingRef.current ||
      busyRef.current ||
      recognitionRef.current
    ) {
      return;
    }

    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      setError(
        "ဒီ Browser မှာ microphone recognition မရပါ။ Google Chrome သုံးပါ။"
      );

      updateAutoConversation(false);
      changeStatus("ready");
      return;
    }

    const generation =
      generationRef.current;

    try {
      const recognition =
        new Recognition();

      recognitionRef.current =
        recognition;

      recognition.lang = "zh-CN";
      recognition.interimResults =
        false;

      recognition.continuous =
        false;

      recognition.onresult = (
        event
      ) => {
        const transcript =
          event.results[0]?.[0]?.transcript?.trim();

        recognitionRef.current =
          null;

        setIsListening(false);
        busyRef.current = false;

        if (
          !transcript ||
          generation !==
            generationRef.current
        ) {
          scheduleListeningRestart();
          return;
        }

        setMessage(transcript);

        void askAnna(transcript);
      };

      recognition.onerror = (
        event
      ) => {
        recognitionRef.current =
          null;

        setIsListening(false);
        busyRef.current = false;

        if (
          event.error ===
            "not-allowed" ||
          event.error ===
            "service-not-allowed"
        ) {
          updateAutoConversation(false);

          setError(
            "Microphone permission ကို Allow လုပ်ပေးပါ။"
          );

          changeStatus("ready");
          return;
        }

        if (
          event.error === "aborted"
        ) {
          if (!stoppingRef.current) {
            scheduleListeningRestart();
          }

          return;
        }

        if (
          event.error ===
            "no-speech" ||
          event.error ===
            "audio-capture" ||
          event.error === "network"
        ) {
          scheduleListeningRestart(
            1000
          );

          return;
        }

        setError(
          `Microphone error: ${event.error}`
        );

        scheduleListeningRestart(
          1000
        );
      };

      recognition.onend = () => {
        if (
          recognitionRef.current ===
          recognition
        ) {
          recognitionRef.current =
            null;
        }

        setIsListening(false);

        if (
          generation !==
            generationRef.current ||
          stoppingRef.current
        ) {
          return;
        }

        if (!busyRef.current) {
          scheduleListeningRestart();
        }
      };

      busyRef.current = true;

      setIsListening(true);
      changeStatus("listening");

      recognition.start();
    } catch (listeningError) {
      console.error(
        "Listening error:",
        listeningError
      );

      recognitionRef.current = null;

      setIsListening(false);
      busyRef.current = false;

      setError(
        "Microphone ပြန်စဖို့ ခဏစောင့်နေပါတယ်။"
      );

      scheduleListeningRestart(
        1000
      );
    }
  }

  function startConversation() {
    stoppingRef.current = false;

    generationRef.current += 1;

    updateAutoConversation(true);

    busyRef.current = false;

    startListening();
  }

  function stopConversation() {
    stoppingRef.current = true;

    generationRef.current += 1;

    updateAutoConversation(false);

    clearRestartTimer();
    abortRequests();
    cleanUpRecognition();
    cleanUpAudio();

    busyRef.current = false;

    setIsListening(false);
    setIsThinking(false);
    setIsSpeaking(false);
    setError("");

    changeStatus("ready");

    setTimeout(() => {
      stoppingRef.current = false;
    }, 300);
  }

  function startNewChat() {
    stopConversation();

    previousResponseIdRef.current =
      null;

    setMessage("");

    setReply(
      [
        "中文：新的聊天开始啦！今天想聊什么呀？",
        "拼音：Xīn de liáotiān kāishǐ la! Jīntiān xiǎng liáo shénme ya?",
        "မြန်မာ：စကားဝိုင်းအသစ် စပြီနော်။ ဒီနေ့ ဘာအကြောင်းပြောချင်လဲ။",
      ].join("\n")
    );
  }

  function handleMainButton() {
    if (autoConversation) {
      stopConversation();
    } else {
      startConversation();
    }
  }

  function getStatusText() {
    if (isListening) {
      return "🎙️ Listening...";
    }

    if (isThinking) {
      return "⏳ Anna is thinking...";
    }

    if (isSpeaking) {
      return "🔊 Anna is speaking...";
    }

    if (autoConversation) {
      return "💬 Conversation active";
    }

    return "🎤 Start Conversation";
  }

  return (
    <div className="space-y-4 text-center">
      <div className="max-h-96 overflow-y-auto rounded-3xl border border-white/10 bg-black/30 p-5">
        {message && (
          <div className="mb-4 rounded-2xl bg-purple-500/20 p-3 text-left">
            <p className="text-xs text-purple-200">
              You said
            </p>

            <p className="mt-1 text-lg">
              {message}
            </p>
          </div>
        )}

        <p className="whitespace-pre-line text-left text-base font-semibold leading-8">
          {isThinking
            ? "Anna is thinking... 🤔"
            : reply}
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-400/20 bg-red-500/20 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleMainButton}
        className={`rounded-full px-7 py-3 font-bold transition ${
          autoConversation
            ? "bg-red-500 hover:bg-red-400"
            : "bg-purple-600 hover:bg-purple-500"
        }`}
      >
        {autoConversation
          ? "⏹ Stop Conversation"
          : "🎤 Start Conversation"}
      </button>

      <p className="text-sm text-purple-200">
        {getStatusText()}
      </p>

      <button
        type="button"
        onClick={startNewChat}
        disabled={
          isThinking ||
          isListening ||
          isSpeaking
        }
        className="text-sm text-white/50 underline transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Start New Chat
      </button>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(event) =>
            setMessage(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();

              void askAnna(message);
            }
          }}
          placeholder="မြန်မာလို ဒါမှမဟုတ် တရုတ်လို ရိုက်လို့ရတယ်..."
          disabled={
            isThinking ||
            isSpeaking ||
            isListening
          }
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={() =>
            void askAnna(message)
          }
          disabled={
            !message.trim() ||
            isThinking ||
            isSpeaking ||
            isListening
          }
          className="rounded-2xl bg-white/15 px-4 font-semibold transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </div>

      <p className="text-xs text-white/40">
        Anna’s voice and replies are
        AI-generated.
      </p>
    </div>
  );
}