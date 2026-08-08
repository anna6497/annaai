import {
  getAnnaTtsAudio,
} from "@/lib/ai/api";

export type SpeakChineseOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;

  speed?:
    | "normal"
    | "slow";

  onStart?: () => void;
  onEnd?: () => void;
  onError?: (
    error?: unknown,
  ) => void;
};

let currentAudio:
  HTMLAudioElement | null =
    null;

let currentObjectUrl:
  string | null =
    null;

let playbackGeneration = 0;

function cleanupPiperAudio(): void {
  if (currentAudio) {
    currentAudio.onplay =
      null;

    currentAudio.onended =
      null;

    currentAudio.onerror =
      null;

    currentAudio.pause();

    currentAudio.src = "";

    currentAudio = null;
  }

  if (
    currentObjectUrl
  ) {
    URL.revokeObjectURL(
      currentObjectUrl,
    );

    currentObjectUrl =
      null;
  }
}

export function stopSpeaking(): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  playbackGeneration += 1;

  cleanupPiperAudio();

  window.speechSynthesis.cancel();
}

function speakWithBrowser(
  text: string,
  options:
    SpeakChineseOptions,
  generation: number,
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  if (
    generation !==
    playbackGeneration
  ) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(
      text,
    );

  utterance.lang =
    "zh-CN";

  utterance.rate =
    options.rate ??
    (
      options.speed ===
        "slow"
        ? 0.78
        : 0.9
    );

  utterance.pitch =
    options.pitch ?? 1;

  utterance.volume =
    options.volume ?? 1;

  utterance.onstart =
    () => {
      if (
        generation !==
        playbackGeneration
      ) {
        return;
      }

      options.onStart?.();
    };

  utterance.onend =
    () => {
      if (
        generation !==
        playbackGeneration
      ) {
        return;
      }

      options.onEnd?.();
    };

  utterance.onerror =
    () => {
      if (
        generation !==
        playbackGeneration
      ) {
        return;
      }

      options.onError?.();
    };

  const voices =
    window.speechSynthesis
      .getVoices();

  const chineseVoice =
    voices.find(
      (voice) => {
        const language =
          voice.lang
            .toLowerCase();

        return (
          language ===
            "zh-cn" ||
          language.startsWith(
            "zh",
          )
        );
      },
    );

  if (chineseVoice) {
    utterance.voice =
      chineseVoice;
  }

  window.speechSynthesis.speak(
    utterance,
  );
}

/**
 * V7:
 * 1. Self-hosted Piper Mandarin
 * 2. Browser speechSynthesis fallback
 */
export async function speakChinese(
  text: string,
  options:
    SpeakChineseOptions = {},
): Promise<void> {
  if (
    typeof window ===
      "undefined" ||
    !text.trim()
  ) {
    return;
  }

  stopSpeaking();

  const generation =
    playbackGeneration;

  const cleaned =
    text.trim();

  try {
    const audioBlob =
      await getAnnaTtsAudio(
        cleaned,
        options.speed ??
          "normal",
      );

    if (
      generation !==
      playbackGeneration
    ) {
      return;
    }

    cleanupPiperAudio();

    const objectUrl =
      URL.createObjectURL(
        audioBlob,
      );

    const audio =
      new Audio(
        objectUrl,
      );

    currentObjectUrl =
      objectUrl;

    currentAudio =
      audio;

    audio.volume =
      options.volume ?? 1;

    audio.onplay =
      () => {
        if (
          generation !==
          playbackGeneration
        ) {
          return;
        }

        options.onStart?.();
      };

    audio.onended =
      () => {
        if (
          generation !==
          playbackGeneration
        ) {
          return;
        }

        cleanupPiperAudio();

        options.onEnd?.();
      };

    audio.onerror =
      () => {
        if (
          generation !==
          playbackGeneration
        ) {
          return;
        }

        cleanupPiperAudio();

        console.warn(
          "Piper audio playback failed. Falling back to browser TTS.",
        );

        speakWithBrowser(
          cleaned,
          options,
          generation,
        );
      };

    try {
      await audio.play();
    } catch (
      playError
    ) {
      if (
        generation !==
        playbackGeneration
      ) {
        return;
      }

      cleanupPiperAudio();

      console.warn(
        "Piper autoplay failed. Falling back to browser TTS.",
        playError,
      );

      speakWithBrowser(
        cleaned,
        options,
        generation,
      );
    }
  } catch (
    piperError
  ) {
    if (
      generation !==
      playbackGeneration
    ) {
      return;
    }

    console.warn(
      "Piper TTS unavailable. Falling back to browser TTS.",
      piperError,
    );

    speakWithBrowser(
      cleaned,
      options,
      generation,
    );
  }
}