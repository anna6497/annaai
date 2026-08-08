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

export type QueueChineseOptions = {
  speed?:
    | "normal"
    | "slow";

  volume?: number;

  onStart?: () => void;

  onQueueIdle?: () => void;

  onError?: (
    error?: unknown,
  ) => void;
};

type QueueItem = {
  text: string;

  options:
    QueueChineseOptions;
};

let currentAudio:
  HTMLAudioElement | null =
    null;

let currentObjectUrl:
  string | null =
    null;

let playbackGeneration =
  0;

const speechQueue:
  QueueItem[] =
    [];

let queueRunning =
  false;

let queueIdleCallback:
  (() => void) | null =
    null;

function cleanupAudio(): void {
  if (currentAudio) {
    currentAudio.onplay =
      null;

    currentAudio.onended =
      null;

    currentAudio.onerror =
      null;

    currentAudio.pause();

    currentAudio.src =
      "";

    currentAudio =
      null;
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

function cancelBrowserSpeech(): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.speechSynthesis
    .cancel();
}

export function clearSpeechQueue(): void {
  speechQueue.splice(
    0,
    speechQueue.length,
  );

  queueRunning =
    false;

  queueIdleCallback =
    null;
}

export function stopSpeaking(): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  playbackGeneration +=
    1;

  clearSpeechQueue();

  cleanupAudio();

  cancelBrowserSpeech();
}

function findChineseVoice():
  SpeechSynthesisVoice |
  undefined {
  if (
    typeof window ===
    "undefined"
  ) {
    return undefined;
  }

  const voices =
    window.speechSynthesis
      .getVoices();

  return voices.find(
    (
      voice,
    ) => {
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
}

function playWithBrowserTts(
  text: string,
  options:
    SpeakChineseOptions,
  generation: number,
): Promise<void> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      if (
        typeof window ===
        "undefined"
      ) {
        resolve();

        return;
      }

      if (
        generation !==
        playbackGeneration
      ) {
        resolve();

        return;
      }

      cancelBrowserSpeech();

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
        options.pitch ??
        1;

      utterance.volume =
        options.volume ??
        1;

      const chineseVoice =
        findChineseVoice();

      if (chineseVoice) {
        utterance.voice =
          chineseVoice;
      }

      utterance.onstart =
        () => {
          if (
            generation ===
            playbackGeneration
          ) {
            options.onStart?.();
          }
        };

      utterance.onend =
        () => {
          if (
            generation ===
            playbackGeneration
          ) {
            options.onEnd?.();
          }

          resolve();
        };

      utterance.onerror =
        (
          event,
        ) => {
          if (
            generation ===
            playbackGeneration
          ) {
            options.onError?.(
              event,
            );
          }

          reject(
            new Error(
              "Browser TTS failed.",
            ),
          );
        };

      window.speechSynthesis
        .speak(
          utterance,
        );
    },
  );
}

async function playPiperAudio(
  text: string,
  options:
    SpeakChineseOptions,
  generation: number,
): Promise<void> {
  const audioBlob =
    await getAnnaTtsAudio(
      text,
      options.speed ??
        "normal",
    );

  if (
    generation !==
    playbackGeneration
  ) {
    return;
  }

  cleanupAudio();

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
    options.volume ??
    1;

  await new Promise<void>(
    (
      resolve,
      reject,
    ) => {
      audio.onplay =
        () => {
          if (
            generation ===
            playbackGeneration
          ) {
            options.onStart?.();
          }
        };

      audio.onended =
        () => {
          if (
            generation ===
            playbackGeneration
          ) {
            options.onEnd?.();
          }

          cleanupAudio();

          resolve();
        };

      audio.onerror =
        (
          event,
        ) => {
          cleanupAudio();

          reject(
            event,
          );
        };

      audio.play().catch(
        (
          error,
        ) => {
          cleanupAudio();

          reject(
            error,
          );
        },
      );
    },
  );
}

async function playOneChinese(
  text: string,
  options:
    SpeakChineseOptions,
  generation: number,
): Promise<void> {
  try {
    await playPiperAudio(
      text,
      options,
      generation,
    );
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
      "Piper TTS failed. Using browser Mandarin fallback.",
      piperError,
    );

    try {
      await playWithBrowserTts(
        text,
        options,
        generation,
      );
    } catch (
      browserError
    ) {
      options.onError?.(
        browserError,
      );

      throw browserError;
    }
  }
}

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

  try {
    await playOneChinese(
      text.trim(),
      options,
      generation,
    );
  } catch (
    error
  ) {
    console.error(
      "Chinese speech failed:",
      error,
    );
  }
}

async function runSpeechQueue(): Promise<void> {
  if (
    queueRunning
  ) {
    return;
  }

  queueRunning =
    true;

  const generation =
    playbackGeneration;

  try {
    while (
      speechQueue.length >
      0
    ) {
      if (
        generation !==
        playbackGeneration
      ) {
        break;
      }

      const item =
        speechQueue.shift();

      if (!item) {
        continue;
      }

      try {
        await playOneChinese(
          item.text,
          {
            speed:
              item.options
                .speed ??
              "normal",

            volume:
              item.options
                .volume ??
              1,

            onStart:
              item.options
                .onStart,

            onError:
              item.options
                .onError,
          },
          generation,
        );
      } catch (
        error
      ) {
        console.error(
          "Queued Chinese sentence failed:",
          error,
        );

        item.options
          .onError?.(
            error,
          );
      }
    }
  } finally {
    queueRunning =
      false;

    if (
      generation ===
      playbackGeneration &&
      speechQueue.length ===
        0
    ) {
      const callback =
        queueIdleCallback;

      queueIdleCallback =
        null;

      callback?.();
    }
  }
}

export function queueChineseSentence(
  text: string,
  options:
    QueueChineseOptions = {},
): void {
  if (
    typeof window ===
      "undefined"
  ) {
    return;
  }

  const cleaned =
    text.trim();

  if (!cleaned) {
    return;
  }

  /**
   * Prevent duplicate sentence
   * events from producing duplicate
   * audio.
   */
  const duplicate =
    speechQueue.some(
      (
        item,
      ) =>
        item.text ===
        cleaned,
    );

  if (duplicate) {
    return;
  }

  speechQueue.push(
    {
      text:
        cleaned,

      options,
    },
  );

  if (
    options.onQueueIdle
  ) {
    queueIdleCallback =
      options.onQueueIdle;
  }

  void runSpeechQueue();
}

export function isSpeechQueueBusy(): boolean {
  return (
    queueRunning ||
    speechQueue.length >
      0
  );
}