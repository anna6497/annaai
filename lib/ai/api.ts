import type {
  AiPracticeMode,
  AnnaCorrection,
  AnnaReply,
  ConversationHistoryMessage,
  TextChatResponse,
  VoiceChatResponse,
  VoiceServerHealth,
} from "@/types/ai";

import {
  getVoiceServerUrl,
} from "@/lib/ai/constants";


interface ServerError {
  detail?: string;
  error?: string;
}


export type TtsSpeed =
  | "normal"
  | "slow";


export type VoiceStreamEvent =
  | {
      type: "start";
    }
  | {
      type: "transcript";
      transcript: string;

      timings?: {
        audio?: number;
        stt?: number;
      };
    }
  | {
      type: "token";
      text: string;
    }
  | {
      type: "sentence";
      sentence: string;
    }
  | {
      type: "done";
      hanzi: string;
      pinyin: string;
    }
  | {
      type: "correction";
      correction: AnnaCorrection;
    }
  | {
      type: "complete";
      seconds?: number;
      audio_seconds?: number;
      stt_seconds?: number;
      llm_seconds?: number;
      correction_seconds?: number;
      sentences?: number;
      token_events?: number;
    }
  | {
      type: "error";
      error: string;
    };


export type TextStreamEvent =
  | {
      type: "start";
      message?: string;
    }
  | {
      type: "token";
      text: string;
    }
  | {
      type: "sentence";
      sentence: string;
    }
  | {
      type: "done";
      hanzi: string;
      pinyin: string;
    }
  | {
      type: "correction";
      correction: AnnaCorrection;
    }
  | {
      type: "complete";
      seconds?: number;
      correction_seconds?: number;
      sentences?: number;
      token_events?: number;
    }
  | {
      type: "error";
      error: string;
    };


const VOICE_TIMEOUT_MS =
  90_000;

const TEXT_TIMEOUT_MS =
  60_000;

const HEALTH_TIMEOUT_MS =
  8_000;

const TTS_TIMEOUT_MS =
  30_000;


async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller =
    new AbortController();

  const timer =
    globalThis.setTimeout(
      () => {
        controller.abort();
      },
      timeoutMs,
    );

  try {
    return await fetch(
      input,
      {
        ...init,

        signal:
          controller.signal,

        cache:
          "no-store",
      },
    );
  } finally {
    globalThis.clearTimeout(
      timer,
    );
  }
}


async function readJson<T>(
  response: Response,
): Promise<T | null> {
  try {
    return (
      await response.json()
    ) as T;
  } catch {
    return null;
  }
}


function isAnnaCorrection(
  value: unknown,
): value is AnnaCorrection {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const correction =
    value as
      Partial<AnnaCorrection>;

  return (
    typeof correction.needed ===
      "boolean" &&
    typeof correction.original ===
      "string" &&
    typeof correction.corrected ===
      "string" &&
    typeof correction.pinyin ===
      "string"
  );
}


function isAnnaReply(
  value: unknown,
): value is AnnaReply {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const reply =
    value as
      Partial<AnnaReply>;

  if (
    typeof reply.hanzi !==
      "string" ||
    !reply.hanzi.trim() ||
    typeof reply.pinyin !==
      "string" ||
    !reply.pinyin.trim()
  ) {
    return false;
  }

  if (
    reply.correction !==
      undefined &&
    !isAnnaCorrection(
      reply.correction,
    )
  ) {
    return false;
  }

  return true;
}


function getErrorMessage(
  data: ServerError | null,
  fallback: string,
): string {
  if (
    typeof data?.detail ===
      "string" &&
    data.detail.trim()
  ) {
    return data.detail.trim();
  }

  if (
    typeof data?.error ===
      "string" &&
    data.error.trim()
  ) {
    return data.error.trim();
  }

  return fallback;
}


function getFilename(
  mimeType: string,
): string {
  if (
    mimeType.includes(
      "ogg",
    )
  ) {
    return "recording.ogg";
  }

  if (
    mimeType.includes(
      "mp4",
    )
  ) {
    return "recording.mp4";
  }

  if (
    mimeType.includes(
      "wav",
    )
  ) {
    return "recording.wav";
  }

  return "recording.webm";
}


function isTimeoutError(
  error: unknown,
): boolean {
  return (
    error instanceof
      DOMException &&
    error.name ===
      "AbortError"
  );
}


function normalizeVoiceError(
  error: unknown,
): Error {
  if (
    isTimeoutError(
      error,
    )
  ) {
    return new Error(
      "Voice processing အချိန်ကြာလွန်းပါတယ်။ စာကြောင်းတိုတိုနဲ့ ပြန်စမ်းပါ။",
    );
  }

  if (
    error instanceof
      TypeError &&
    error.message
      .toLowerCase()
      .includes(
        "fetch",
      )
  ) {
    return new Error(
      "Anna AI Voice Server ကို ချိတ်ဆက်၍မရပါ။ Network ကိုစစ်ပြီး ပြန်စမ်းပါ။",
    );
  }

  if (
    error instanceof Error
  ) {
    return error;
  }

  return new Error(
    "Voice processing error ဖြစ်နေပါတယ်။",
  );
}


/**
 * Build another V7 endpoint
 * from the already configured
 * /v7/health endpoint.
 */
function getV7SiblingUrl(
  pathname: string,
): string {
  const healthUrl =
    getVoiceServerUrl(
      "/health",
    );

  const cleanPath =
    pathname.startsWith("/")
      ? pathname
      : `/${pathname}`;

  if (
    healthUrl.endsWith(
      "/health",
    )
  ) {
    return (
      healthUrl.slice(
        0,
        -"/health".length,
      ) +
      cleanPath
    );
  }

  return (
    healthUrl +
    cleanPath
  );
}


/**
 * Read NDJSON without waiting
 * for the complete response.
 */
async function consumeNdjsonStream<T>(
  response: Response,
  onEvent: (
    event: T,
  ) => void,
): Promise<void> {
  if (!response.body) {
    throw new Error(
      "Streaming response body is missing.",
    );
  }

  const reader =
    response.body
      .getReader();

  const decoder =
    new TextDecoder(
      "utf-8",
    );

  let buffer = "";

  while (true) {
    const {
      done,
      value,
    } =
      await reader.read();

    if (done) {
      break;
    }

    buffer +=
      decoder.decode(
        value,
        {
          stream: true,
        },
      );

    const lines =
      buffer.split(
        "\n",
      );

    buffer =
      lines.pop() ??
      "";

    for (
      const rawLine
      of lines
    ) {
      const line =
        rawLine.trim();

      if (!line) {
        continue;
      }

      try {
        const event =
          JSON.parse(
            line,
          ) as T;

        onEvent(
          event,
        );
      } catch (
        error
      ) {
        console.warn(
          "Invalid NDJSON line:",
          line,
          error,
        );
      }
    }
  }

  buffer +=
    decoder.decode();

  const remaining =
    buffer.trim();

  if (!remaining) {
    return;
  }

  try {
    const event =
      JSON.parse(
        remaining,
      ) as T;

    onEvent(
      event,
    );
  } catch (
    error
  ) {
    console.warn(
      "Invalid final NDJSON line:",
      remaining,
      error,
    );
  }
}


export async function sendAudio(
  audio: Blob,
  history:
    ConversationHistoryMessage[],
): Promise<VoiceChatResponse> {
  const formData =
    new FormData();

  formData.append(
    "audio",
    audio,
    getFilename(
      audio.type,
    ),
  );

  formData.append(
    "mode",
    "practice",
  );

  formData.append(
    "history",
    JSON.stringify(
      history,
    ),
  );

  let response: Response;

  try {
    response =
      await fetchWithTimeout(
        getVoiceServerUrl(
          "/voice-chat",
        ),
        {
          method:
            "POST",

          body:
            formData,
        },
        VOICE_TIMEOUT_MS,
      );
  } catch (
    error
  ) {
    throw normalizeVoiceError(
      error,
    );
  }

  const data =
    await readJson<
      VoiceChatResponse |
      ServerError
    >(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data as
          ServerError | null,

        `Voice processing failed (${response.status}).`,
      ),
    );
  }

  if (
    !data ||
    !(
      "transcript"
      in data
    ) ||
    !(
      "reply"
      in data
    ) ||
    typeof data.transcript !==
      "string" ||
    !data.transcript.trim() ||
    !isAnnaReply(
      data.reply,
    )
  ) {
    throw new Error(
      "Voice server returned an invalid response.",
    );
  }

  return data;
}


export async function streamVoiceAudio(
  audio: Blob,
  history:
    ConversationHistoryMessage[],
  onEvent: (
    event:
      VoiceStreamEvent,
  ) => void,
): Promise<boolean> {
  const formData =
    new FormData();

  formData.append(
    "audio",
    audio,
    getFilename(
      audio.type,
    ),
  );

  formData.append(
    "history",
    JSON.stringify(
      history,
    ),
  );

  let response: Response;

  try {
    response =
      await fetch(
        getV7SiblingUrl(
          "/voice-stream",
        ),
        {
          method:
            "POST",

          body:
            formData,

          cache:
            "no-store",

          headers: {
            Accept:
              "application/x-ndjson",
          },
        },
      );
  } catch (
    error
  ) {
    console.warn(
      "Voice stream connection failed:",
      error,
    );

    return false;
  }

  if (
    response.status ===
      404 ||
    response.status ===
      405
  ) {
    return false;
  }

  if (!response.ok) {
    const data =
      await readJson<
        ServerError
      >(response);

    throw new Error(
      getErrorMessage(
        data,

        `Voice streaming failed (${response.status}).`,
      ),
    );
  }

  await consumeNdjsonStream<
    VoiceStreamEvent
  >(
    response,
    (
      event,
    ) => {
      if (
        event.type ===
        "error"
      ) {
        throw new Error(
          event.error,
        );
      }

      onEvent(
        event,
      );
    },
  );

  return true;
}


export async function streamTextChat(
  message: string,
  history:
    ConversationHistoryMessage[],
  onEvent: (
    event:
      TextStreamEvent,
  ) => void,
): Promise<void> {
  const cleaned =
    message.trim();

  if (!cleaned) {
    throw new Error(
      "Message cannot be empty.",
    );
  }

  const response =
    await fetch(
      getV7SiblingUrl(
        "/stream-chat",
      ),
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/x-ndjson",
        },

        body:
          JSON.stringify(
            {
              message:
                cleaned,

              history,
            },
          ),

        cache:
          "no-store",
      },
    );

  if (!response.ok) {
    const data =
      await readJson<
        ServerError
      >(response);

    throw new Error(
      getErrorMessage(
        data,

        `Stream chat failed (${response.status}).`,
      ),
    );
  }

  await consumeNdjsonStream<
    TextStreamEvent
  >(
    response,
    (
      event,
    ) => {
      if (
        event.type ===
        "error"
      ) {
        throw new Error(
          event.error,
        );
      }

      onEvent(
        event,
      );
    },
  );
}


export async function sendTextMessage(
  message: string,
  mode: AiPracticeMode,
  history:
    ConversationHistoryMessage[] =
      [],
): Promise<TextChatResponse> {
  const cleaned =
    message.trim();

  if (!cleaned) {
    throw new Error(
      mode ===
        "sentence_builder"
        ? "မြန်မာစာကြောင်းကို အရင်ရေးပါ။"
        : "Message cannot be empty.",
    );
  }

  let response: Response;

  try {
    response =
      await fetchWithTimeout(
        getVoiceServerUrl(
          "/text-chat",
        ),
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              message:
                cleaned,

              mode,

              history,
            }),
        },
        TEXT_TIMEOUT_MS,
      );
  } catch (
    error
  ) {
    if (
      isTimeoutError(
        error,
      )
    ) {
      throw new Error(
        "Anna reply အချိန်ကြာလွန်းပါတယ်။ ပြန်စမ်းပါ။",
      );
    }

    throw new Error(
      "Anna AI Voice Server ကို ချိတ်ဆက်၍မရပါ။",
    );
  }

  const data =
    await readJson<
      TextChatResponse |
      ServerError
    >(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data as
          ServerError | null,

        `Text chat failed (${response.status}).`,
      ),
    );
  }

  if (
    !data ||
    !(
      "message"
      in data
    ) ||
    !(
      "reply"
      in data
    ) ||
    !isAnnaReply(
      data.reply,
    )
  ) {
    throw new Error(
      "Text chat server returned an invalid response.",
    );
  }

  return data;
}


export async function getAnnaTtsAudio(
  text: string,
  speed: TtsSpeed =
    "normal",
): Promise<Blob> {
  const cleaned =
    text.trim();

  if (!cleaned) {
    throw new Error(
      "TTS text cannot be empty.",
    );
  }

  let response: Response;

  try {
    response =
      await fetchWithTimeout(
        getVoiceServerUrl(
          "/tts",
        ),
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "audio/wav",
          },

          body:
            JSON.stringify({
              text:
                cleaned,

              speed,
            }),
        },
        TTS_TIMEOUT_MS,
      );
  } catch (
    error
  ) {
    if (
      isTimeoutError(
        error,
      )
    ) {
      throw new Error(
        "Anna TTS timed out.",
      );
    }

    throw new Error(
      "Anna Piper TTS server could not be reached.",
    );
  }

  if (!response.ok) {
    const data =
      await readJson<
        ServerError
      >(response);

    throw new Error(
      getErrorMessage(
        data,

        `TTS failed (${response.status}).`,
      ),
    );
  }

  const audioBlob =
    await response.blob();

  if (
    audioBlob.size <
      1000
  ) {
    throw new Error(
      "TTS returned invalid audio.",
    );
  }

  return audioBlob;
}


export async function checkVoiceServer(): Promise<boolean> {
  try {
    const response =
      await fetchWithTimeout(
        getVoiceServerUrl(
          "/health",
        ),
        {
          method:
            "GET",

          headers: {
            Accept:
              "application/json",
          },
        },
        HEALTH_TIMEOUT_MS,
      );

    if (!response.ok) {
      return false;
    }

    const data =
      await readJson<
        VoiceServerHealth
      >(response);

    return (
      data?.status ===
        "ok" ||
      data?.status ===
        "degraded"
    );
  } catch (
    error
  ) {
    console.error(
      "Voice health check failed:",
      error,
    );

    return false;
  }
}