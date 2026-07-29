import type {
  AiPracticeMode,
  AnnaReply,
  ConversationHistoryMessage,
  TextChatResponse,
  VoiceChatResponse,
  VoiceServerHealth,
} from "@/types/ai";

import { VOICE_SERVER } from "./constants";

interface ServerError {
  detail?: string;
}

const VOICE_TIMEOUT_MS = 190_000;
const TEXT_TIMEOUT_MS = 130_000;
const HEALTH_TIMEOUT_MS = 5_000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller =
    new AbortController();

  const timer = window.setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timer);
  }
}

async function readJson<T>(
  response: Response
): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function isAnnaReply(
  value: unknown
): value is AnnaReply {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const reply =
    value as Partial<AnnaReply>;

  return (
    typeof reply.hanzi === "string" &&
    reply.hanzi.trim().length > 0 &&
    typeof reply.pinyin === "string" &&
    reply.pinyin.trim().length > 0
  );
}

function getErrorMessage(
  data: ServerError | null,
  fallback: string
): string {
  return data?.detail?.trim() || fallback;
}

function getFilename(
  mimeType: string
): string {
  if (mimeType.includes("ogg")) {
    return "recording.ogg";
  }

  if (mimeType.includes("mp4")) {
    return "recording.mp4";
  }

  if (mimeType.includes("wav")) {
    return "recording.wav";
  }

  return "recording.webm";
}

export async function sendAudio(
  audio: Blob,
  history: ConversationHistoryMessage[]
): Promise<VoiceChatResponse> {
  const formData = new FormData();

  formData.append(
    "audio",
    audio,
    getFilename(audio.type)
  );

  formData.append(
    "mode",
    "practice"
  );

  formData.append(
    "history",
    JSON.stringify(history)
  );

  let response: Response;

  try {
    response = await fetchWithTimeout(
      `${VOICE_SERVER}/voice-chat`,
      {
        method: "POST",
        body: formData,
      },
      VOICE_TIMEOUT_MS
    );
  } catch (error) {
    const isTimeout =
      error instanceof DOMException &&
      error.name === "AbortError";

    throw new Error(
      isTimeout
        ? "Voice processing အချိန်ကြာလွန်းပါတယ်။ ပြန်စမ်းပါ။"
        : "Voice server ကို ချိတ်ဆက်လို့မရပါ။ Backend server run နေတာ စစ်ပါ။"
    );
  }

  const data = await readJson<
    VoiceChatResponse | ServerError
  >(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data as ServerError | null,
        `Voice processing failed (${response.status}).`
      )
    );
  }

  if (
    !data ||
    !("transcript" in data) ||
    !("reply" in data) ||
    typeof data.transcript !==
      "string" ||
    !data.transcript.trim() ||
    !isAnnaReply(data.reply)
  ) {
    throw new Error(
      "Voice server returned an invalid response."
    );
  }

  return data;
}

export async function sendTextMessage(
  message: string,
  mode: AiPracticeMode,
  history: ConversationHistoryMessage[] = []
): Promise<TextChatResponse> {
  const cleaned = message.trim();

  if (!cleaned) {
    throw new Error(
      mode === "sentence_builder"
        ? "မြန်မာစာကြောင်းကို အရင်ရေးပါ။"
        : "Message cannot be empty."
    );
  }

  let response: Response;

  try {
    response = await fetchWithTimeout(
      `${VOICE_SERVER}/text-chat`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          message: cleaned,
          mode,
          history,
        }),
      },
      TEXT_TIMEOUT_MS
    );
  } catch (error) {
    const isTimeout =
      error instanceof DOMException &&
      error.name === "AbortError";

    throw new Error(
      isTimeout
        ? "Anna reply အချိန်ကြာလွန်းပါတယ်။ ပြန်စမ်းပါ။"
        : "Voice server ကို ချိတ်ဆက်လို့မရပါ။"
    );
  }

  const data = await readJson<
    TextChatResponse | ServerError
  >(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data as ServerError | null,
        `Text chat failed (${response.status}).`
      )
    );
  }

  if (
    !data ||
    !("message" in data) ||
    !("reply" in data) ||
    !isAnnaReply(data.reply)
  ) {
    throw new Error(
      "Text chat server returned an invalid response."
    );
  }

  return data;
}

export async function checkVoiceServer(): Promise<boolean> {
  try {
    const response =
      await fetchWithTimeout(
        `${VOICE_SERVER}/health`,
        {
          method: "GET",
          cache: "no-store",
        },
        HEALTH_TIMEOUT_MS
      );

    if (!response.ok) {
      return false;
    }

    const data =
      await readJson<VoiceServerHealth>(
        response
      );

    return (
      data?.status === "ok" &&
      data.ollama_running === true
    );
  } catch {
    return false;
  }
}
