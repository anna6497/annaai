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
    "按一下麦克风，跟我说中文吧！😄"
  );

  const [isListening, setIsListening] =
    useState(false);

  const [isLoading, setIsLoading] =
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

  const autoConversationRef =
    useRef(false);

  const busyRef = useRef(false);

  const manuallyStoppingRef =
    useRef(false);

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

  function extractChineseText(
    text: string
  ) {
    const chineseLines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) =>
        /[\u4e00-\u9fff]/.test(line)
      );

    return chineseLines
      .slice(0, 2)
      .join(" ");
  }

  function cleanUpAudio() {
    if (audioRef.current) {
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

  function restartListeningAfterDelay() {
    if (!autoConversationRef.current) {
      changeStatus("ready");
      return;
    }

    window.setTimeout(() => {
      if (
        autoConversationRef.current &&
        !busyRef.current &&
        !manuallyStoppingRef.current
      ) {
        startListening();
      }
    }, 700);
  }

  async function saveConversation(
    userMessage: string,
    annaReply: string
  ) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          "Conversation user error:",
          userError
        );

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
        "Unexpected conversation save error:",
        saveError
      );
    }
  }

  async function speakChinese(
    text: string
  ) {
    const chineseText =
      extractChineseText(text);

    if (!chineseText) {
      busyRef.current = false;
      setIsSpeaking(false);
      restartListeningAfterDelay();
      return;
    }

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
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.error ||
            "Speech generation failed."
        );
      }

      const audioBlob =
        await response.blob();

      const audioUrl =
        URL.createObjectURL(audioBlob);

      const audio =
        new Audio(audioUrl);

      audioRef.current = audio;
      audioUrlRef.current = audioUrl;

      audio.onended = () => {
        cleanUpAudio();

        setIsSpeaking(false);
        busyRef.current = false;

        if (
          autoConversationRef.current
        ) {
          restartListeningAfterDelay();
        } else {
          changeStatus("ready");
        }
      };

      audio.onerror = () => {
        cleanUpAudio();

        setIsSpeaking(false);
        busyRef.current = false;

        setError(
          "Anna အသံဖွင့်မရပါ။"
        );

        restartListeningAfterDelay();
      };

      await audio.play();
    } catch (speechError) {
      console.error(
        "Speech error:",
        speechError
      );

      cleanUpAudio();

      setIsSpeaking(false);
      busyRef.current = false;

      setError(
        speechError instanceof Error
          ? speechError.message
          : "Anna အသံထုတ်မရပါ။ ပြန်စမ်းကြည့်ပါ။"
      );

      restartListeningAfterDelay();
    }
  }

  async function askAnna(text: string) {
    const cleanMessage = text.trim();

    if (
      !cleanMessage ||
      busyRef.current
    ) {
      return;
    }

    try {
      busyRef.current = true;

      setIsLoading(true);
      changeStatus("thinking");
      setError("");

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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Anna could not reply."
        );
      }

      const annaReply =
        typeof data.reply === "string"
          ? data.reply
          : "ခဏလောက်နေရင် ပြန်စမ်းကြည့်ပါနော်။";

      if (
        typeof data.responseId ===
        "string"
      ) {
        previousResponseIdRef.current =
          data.responseId;
      }

      setReply(annaReply);
      setIsLoading(false);

      busyRef.current = false;

      // Conversation history ကို
      // Supabase ထဲသိမ်းမယ်
      void saveConversation(
        cleanMessage,
        annaReply
      );

      await speakChinese(annaReply);
    } catch (requestError) {
      console.error(
        "Chat error:",
        requestError
      );

      setIsLoading(false);
      busyRef.current = false;

      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI connection failed."
      );

      restartListeningAfterDelay();
    }
  }

  function startListening() {
    setError("");

    if (
      busyRef.current ||
      isListening ||
      manuallyStoppingRef.current
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

    try {
      if (recognitionRef.current) {
        manuallyStoppingRef.current =
          true;

        recognitionRef.current.onerror =
          null;

        recognitionRef.current.onend =
          null;

        recognitionRef.current.abort?.();

        recognitionRef.current = null;

        manuallyStoppingRef.current =
          false;
      }

      const recognition =
        new Recognition();

      recognitionRef.current =
        recognition;

      recognition.lang = "zh-CN";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (
        event
      ) => {
        const transcript =
          event.results[0][0].transcript.trim();

        setMessage(transcript);
        setIsListening(false);

        busyRef.current = false;
        recognitionRef.current = null;

        void askAnna(transcript);
      };

      recognition.onerror = (
        event
      ) => {
        setIsListening(false);

        busyRef.current = false;
        recognitionRef.current = null;

        if (
          event.error === "aborted"
        ) {
          if (
            autoConversationRef.current &&
            !manuallyStoppingRef.current
          ) {
            restartListeningAfterDelay();
          } else {
            changeStatus("ready");
          }

          return;
        }

        if (
          event.error ===
          "not-allowed"
        ) {
          updateAutoConversation(false);

          setError(
            "Microphone permission ကို Allow လုပ်ပေးပါ။"
          );

          changeStatus("ready");
          return;
        }

        if (
          event.error === "no-speech"
        ) {
          restartListeningAfterDelay();
          return;
        }

        console.error(
          "Microphone recognition error:",
          event.error
        );

        setError(
          `Microphone error: ${event.error}`
        );

        restartListeningAfterDelay();
      };

      recognition.onend = () => {
        setIsListening(false);

        if (
          recognitionRef.current ===
          recognition
        ) {
          recognitionRef.current = null;
        }
      };

      busyRef.current = true;

      setIsListening(true);
      changeStatus("listening");

      recognition.start();
    } catch (listeningError) {
      console.error(
        "Start listening error:",
        listeningError
      );

      setIsListening(false);
      busyRef.current = false;
      recognitionRef.current = null;

      setError(
        "Microphone ကို စတင်လို့မရပါ။ ခဏစောင့်ပြီး ပြန်နှိပ်ပါ။"
      );

      changeStatus("ready");
    }
  }

  function startConversation() {
    manuallyStoppingRef.current =
      false;

    updateAutoConversation(true);
    startListening();
  }

  function stopConversation() {
    manuallyStoppingRef.current =
      true;

    updateAutoConversation(false);

    if (recognitionRef.current) {
      recognitionRef.current.onerror =
        null;

      recognitionRef.current.onend =
        null;

      recognitionRef.current.abort?.();

      recognitionRef.current = null;
    }

    cleanUpAudio();

    busyRef.current = false;

    setIsListening(false);
    setIsLoading(false);
    setIsSpeaking(false);
    setError("");

    changeStatus("ready");

    window.setTimeout(() => {
      manuallyStoppingRef.current =
        false;
    }, 300);
  }

  function startNewChat() {
    stopConversation();

    previousResponseIdRef.current =
      null;

    setMessage("");

    setReply(
      "新的聊天开始啦！跟我说中文吧 😄"
    );

    setError("");
    changeStatus("ready");
  }

  function handleMainButton() {
    if (autoConversation) {
      stopConversation();
      return;
    }

    startConversation();
  }

  function getStatusText() {
    if (isListening) {
      return "🎙️ Listening...";
    }

    if (isLoading) {
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
      <div className="max-h-64 overflow-y-auto rounded-3xl border border-white/10 bg-black/30 p-5">
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

        <p className="whitespace-pre-line text-lg font-semibold leading-8">
          {isLoading
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
          isLoading ||
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
          placeholder="တရုတ်လို ရိုက်လည်းရတယ်..."
          disabled={
            isLoading ||
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
            isLoading ||
            isSpeaking ||
            isListening
          }
          className="rounded-2xl bg-white/15 px-4 font-semibold transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </div>

      <p className="text-xs text-white/40">
        Anna’s voice is AI-generated.
      </p>
    </div>
  );
}