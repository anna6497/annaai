"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { ChatMessage } from "@/types/ai";
import { speakChinese } from "@/lib/ai/speech";
import AnnaAvatar from "./AnnaAvatar";


interface MessageBubbleProps {
  message: ChatMessage;
}


export default function MessageBubble({
  message,
}: MessageBubbleProps) {
  const [speaking, setSpeaking] =
    useState(false);

  const isUser =
    message.sender === "user";

  const messageText =
    message.text?.trim() ?? "";

  const hanzi =
    message.reply?.hanzi?.trim() ||
    messageText;

  const pinyin =
    message.reply?.pinyin?.trim() || "";


  const stopSpeaking = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);


  const replayMessage =
    useCallback(() => {
      if (
        isUser ||
        !hanzi ||
        typeof window === "undefined"
      ) {
        return;
      }

      window.speechSynthesis?.cancel();
      setSpeaking(true);

      try {
        speakChinese(hanzi);

        /*
         * Browser SpeechSynthesis does not always expose
         * the utterance instance from a helper function,
         * so speaking state is reset after an estimated
         * duration.
         */
        const estimatedDuration =
          Math.max(
            1200,
            Math.min(
              hanzi.length * 280,
              12_000
            )
          );

        window.setTimeout(() => {
          setSpeaking(false);
        }, estimatedDuration);
      } catch (error) {
        console.error(
          "Could not replay Anna message:",
          error
        );

        setSpeaking(false);
      }
    }, [
      hanzi,
      isUser,
    ]);


  useEffect(() => {
    return () => {
      setSpeaking(false);
    };
  }, []);


  if (isUser) {
    return (
      <article className="flex justify-end">
        <div className="max-w-[86%] sm:max-w-[72%]">
          <div className="rounded-[24px] rounded-br-[8px] border border-violet-300/20 bg-gradient-to-br from-violet-500/90 to-fuchsia-600/90 px-5 py-3.5 shadow-[0_18px_45px_rgba(88,28,135,0.2)] backdrop-blur-xl">
            <p className="whitespace-pre-wrap break-words text-[16px] leading-7 text-white">
              {message.text ?? ""}
            </p>
          </div>
        </div>
      </article>
    );
  }


  return (
    <article className="flex items-start gap-3 sm:gap-4">
      <div className="mt-1 shrink-0">
        <AnnaAvatar
          size="sm"
          speaking={speaking}
        />
      </div>

      <div className="min-w-0 max-w-[88%] sm:max-w-[78%]">
        <div className="mb-2 flex items-center gap-2 px-1">
          <span className="text-sm font-semibold text-purple-100">
            Anna
          </span>

          {speaking && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-purple-200/70">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300" />
              Speaking
            </span>
          )}
        </div>

        <div className="overflow-hidden rounded-[25px] rounded-tl-[8px] border border-white/10 bg-white/[0.07] shadow-[0_20px_55px_rgba(15,3,40,0.22)] backdrop-blur-2xl">
          <div className="px-5 py-4 sm:px-6">
            <p className="whitespace-pre-wrap break-words text-[18px] font-medium leading-8 text-white sm:text-[19px]">
              {hanzi}
            </p>

            {pinyin && (
              <>
                <div className="my-3.5 h-px bg-gradient-to-r from-transparent via-purple-300/20 to-transparent" />

                <div>
                  <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-300/55">
                    Pinyin
                  </span>

                  <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-purple-100/80 italic sm:text-[16px]">
                    {pinyin}
                  </p>
                </div>
              </>
            )}

          </div>

          <div className="flex items-center justify-end border-t border-white/[0.07] px-4 py-2.5">
            <button
              type="button"
              onClick={
                speaking
                  ? stopSpeaking
                  : replayMessage
              }
              aria-label={
                speaking
                  ? "Stop Anna voice"
                  : "Replay Anna voice"
              }
              title={
                speaking
                  ? "Stop voice"
                  : "Replay Hanzi"
              }
              className="group inline-flex min-h-9 items-center gap-2 rounded-full border border-purple-300/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-purple-100/70 transition hover:border-purple-300/30 hover:bg-white/[0.09] hover:text-white active:scale-95"
            >
              {speaking ? (
                <>
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    <span className="absolute h-4 w-4 animate-ping rounded-full bg-purple-400/20" />

                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="relative h-4 w-4 fill-current"
                    >
                      <rect
                        x="6"
                        y="5"
                        width="4"
                        height="14"
                        rx="1"
                      />
                      <rect
                        x="14"
                        y="5"
                        width="4"
                        height="14"
                        rx="1"
                      />
                    </svg>
                  </span>

                  Stop
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-4 w-4 stroke-current transition-transform group-hover:scale-110"
                  >
                    <path
                      d="M11 5 6.8 8.5H4.5A1.5 1.5 0 0 0 3 10v4a1.5 1.5 0 0 0 1.5 1.5h2.3L11 19V5Z"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 9.25a4 4 0 0 1 0 5.5"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M17.8 6.5a8 8 0 0 1 0 11"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>

                  Replay
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}