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
  id: number;

  text: string;

  options:
    QueueChineseOptions;

  generation: number;

  audioPromise:
    Promise<Blob | null>;

  audioBlob:
    Blob | null;

  audioError:
    unknown | null;
};


let currentAudio:
  HTMLAudioElement | null =
  null;

let currentObjectUrl:
  string | null =
  null;

let playbackGeneration =
  0;

let queueItemId =
  0;

const speechQueue:
  QueueItem[] =
  [];

let queueRunning =
  false;

let queueIdleCallback:
  (() => void) | null =
  null;


/**
 * Keep a small in-memory cache.
 *
 * Backend already has WAV cache,
 * but this avoids another browser
 * request for recently used text.
 */
const audioBlobCache =
  new Map<
    string,
    Blob
  >();

const MAX_AUDIO_CACHE_ITEMS =
  30;


/**
 * How many future sentences
 * may generate simultaneously.
 *
 * 3 works well for CPU Piper:
 *
 * current sentence playing
 * + next 2/3 sentences preparing.
 */
const MAX_PREFETCH_ITEMS =
  3;


/**
 * Prevent browser cache from
 * growing forever.
 */
function saveAudioToMemoryCache(
  key: string,
  blob: Blob,
): void {
  if (
    audioBlobCache.has(
      key,
    )
  ) {
    audioBlobCache.delete(
      key,
    );
  }

  audioBlobCache.set(
    key,
    blob,
  );

  while (
    audioBlobCache.size >
    MAX_AUDIO_CACHE_ITEMS
  ) {
    const oldestKey =
      audioBlobCache
        .keys()
        .next()
        .value;

    if (
      typeof oldestKey !==
      "string"
    ) {
      break;
    }

    audioBlobCache.delete(
      oldestKey,
    );
  }
}


function getAudioCacheKey(
  text: string,
  speed:
    | "normal"
    | "slow",
): string {
  return (
    `${speed}:` +
    text.trim()
  );
}


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

  window
    .speechSynthesis
    .cancel();
}


/**
 * Important:
 *
 * Clearing the queue invalidates
 * existing prefetch promises too.
 */
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
    window
      .speechSynthesis
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


/**
 * Browser Mandarin fallback.
 */
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

      if (
        chineseVoice
      ) {
        utterance.voice =
          chineseVoice;
      }

      utterance.onstart =
        () => {
          if (
            generation ===
            playbackGeneration
          ) {
            options
              .onStart?.();
          }
        };

      utterance.onend =
        () => {
          if (
            generation ===
            playbackGeneration
          ) {
            options
              .onEnd?.();
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
            options
              .onError?.(
                event,
              );
          }

          reject(
            new Error(
              "Browser TTS failed.",
            ),
          );
        };

      window
        .speechSynthesis
        .speak(
          utterance,
        );
    },
  );
}


/**
 * Fetch/generate Piper WAV.
 *
 * This function does NOT play audio.
 * That distinction is what allows
 * prefetching while another sentence
 * is already playing.
 */
async function fetchPiperAudio(
  text: string,
  speed:
    | "normal"
    | "slow",
  generation: number,
): Promise<Blob | null> {
  if (
    generation !==
    playbackGeneration
  ) {
    return null;
  }

  const key =
    getAudioCacheKey(
      text,
      speed,
    );

  const cached =
    audioBlobCache.get(
      key,
    );

  if (cached) {
    return cached;
  }

  try {
    const blob =
      await getAnnaTtsAudio(
        text,
        speed,
      );

    if (
      generation !==
      playbackGeneration
    ) {
      return null;
    }

    saveAudioToMemoryCache(
      key,
      blob,
    );

    return blob;
  } catch (
    error
  ) {
    console.warn(
      "Piper audio prefetch failed:",
      text,
      error,
    );

    throw error;
  }
}


/**
 * Play an already prepared Blob.
 *
 * There is no network request here.
 */
async function playPreparedAudio(
  audioBlob: Blob,
  options:
    SpeakChineseOptions,
  generation: number,
): Promise<void> {
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

  audio.preload =
    "auto";

  audio.volume =
    options.volume ??
    1;

  /**
   * Explicitly ask the browser
   * to load/decode the WAV.
   */
  audio.load();

  await new Promise<void>(
    (
      resolve,
      reject,
    ) => {
      let settled =
        false;

      const finish =
        () => {
          if (settled) {
            return;
          }

          settled =
            true;

          cleanupAudio();

          resolve();
        };

      const fail =
        (
          error: unknown,
        ) => {
          if (settled) {
            return;
          }

          settled =
            true;

          cleanupAudio();

          reject(
            error,
          );
        };

      audio.onplay =
        () => {
          if (
            generation ===
            playbackGeneration
          ) {
            options
              .onStart?.();
          }
        };

      audio.onended =
        () => {
          if (
            generation ===
            playbackGeneration
          ) {
            options
              .onEnd?.();
          }

          finish();
        };

      audio.onerror =
        (
          event,
        ) => {
          fail(
            event,
          );
        };

      audio
        .play()
        .catch(
          (
            error,
          ) => {
            fail(
              error,
            );
          },
        );
    },
  );
}


/**
 * Normal one-shot Piper playback.
 *
 * Used by replay buttons and
 * Sentence Builder.
 */
async function playPiperAudio(
  text: string,
  options:
    SpeakChineseOptions,
  generation: number,
): Promise<void> {
  const speed =
    options.speed ??
    "normal";

  const audioBlob =
    await fetchPiperAudio(
      text,
      speed,
      generation,
    );

  if (
    !audioBlob ||
    generation !==
      playbackGeneration
  ) {
    return;
  }

  await playPreparedAudio(
    audioBlob,
    options,
    generation,
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
      options
        .onError?.(
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


/**
 * Begin preparing a queue item
 * immediately.
 *
 * This is the key improvement.
 */
function createQueueItem(
  text: string,
  options:
    QueueChineseOptions,
  generation: number,
): QueueItem {
  const speed =
    options.speed ??
    "normal";

  const item:
    QueueItem = {
      id:
        ++queueItemId,

      text,

      options,

      generation,

      audioPromise:
        Promise.resolve(
          null,
        ),

      audioBlob:
        null,

      audioError:
        null,
    };

  item.audioPromise =
    fetchPiperAudio(
      text,
      speed,
      generation,
    )
      .then(
        (
          blob,
        ) => {
          if (
            generation ===
            playbackGeneration
          ) {
            item.audioBlob =
              blob;
          }

          return blob;
        },
      )
      .catch(
        (
          error,
        ) => {
          item.audioError =
            error;

          return null;
        },
      );

  return item;
}


/**
 * Ensure several future sentences
 * are generating at the same time.
 */
function prefetchUpcomingItems(): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const generation =
    playbackGeneration;

  const items =
    speechQueue.slice(
      0,
      MAX_PREFETCH_ITEMS,
    );

  for (
    const item
    of items
  ) {
    if (
      item.generation !==
      generation
    ) {
      continue;
    }

    /**
     * createQueueItem() already
     * starts the promise.
     *
     * Referencing it here documents
     * that these requests should remain
     * active while playback continues.
     */
    void item.audioPromise;
  }
}


/**
 * Play a prefetched queue item.
 */
async function playQueueItem(
  item: QueueItem,
  generation: number,
): Promise<void> {
  if (
    generation !==
    playbackGeneration
  ) {
    return;
  }

  let audioBlob =
    item.audioBlob;

  if (!audioBlob) {
    audioBlob =
      await item.audioPromise;
  }

  if (
    generation !==
    playbackGeneration
  ) {
    return;
  }

  if (audioBlob) {
    try {
      await playPreparedAudio(
        audioBlob,
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

      return;
    } catch (
      playbackError
    ) {
      console.warn(
        "Prepared Piper audio playback failed:",
        playbackError,
      );
    }
  }

  /**
   * Piper failed:
   * use browser Mandarin only
   * for this sentence.
   */
  await playWithBrowserTts(
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
}


/**
 * Continuous playback queue.
 *
 * Important:
 *
 * Sentence 2/3 TTS requests have
 * already started before Sentence 1
 * playback finishes.
 */
async function runSpeechQueue():
  Promise<void> {
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
      generation ===
        playbackGeneration
    ) {
      if (
        speechQueue.length ===
        0
      ) {
        break;
      }

      /**
       * Keep future audio warm.
       */
      prefetchUpcomingItems();

      const item =
        speechQueue.shift();

      if (!item) {
        continue;
      }

      if (
        item.generation !==
        generation
      ) {
        continue;
      }

      /**
       * After shifting current item,
       * immediately make sure all
       * remaining future items continue
       * downloading/generating.
       */
      prefetchUpcomingItems();

      try {
        await playQueueItem(
          item,
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

    /**
     * Race protection:
     *
     * A new sentence may have arrived
     * exactly while queueRunning was
     * being changed to false.
     */
    if (
      generation ===
        playbackGeneration &&
      speechQueue.length >
        0
    ) {
      void runSpeechQueue();
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
   * Prevent duplicate queued
   * sentence events.
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

  const generation =
    playbackGeneration;

  /**
   * IMPORTANT:
   *
   * createQueueItem() starts the
   * Piper request NOW.
   *
   * It does not wait for previous
   * audio to finish.
   */
  const item =
    createQueueItem(
      cleaned,
      options,
      generation,
    );

  speechQueue.push(
    item,
  );

  if (
    options.onQueueIdle
  ) {
    queueIdleCallback =
      options.onQueueIdle;
  }

  /**
   * Start/preload future sentences.
   */
  prefetchUpcomingItems();

  void runSpeechQueue();
}


export function isSpeechQueueBusy():
  boolean {
  return (
    queueRunning ||
    speechQueue.length >
      0
  );
}