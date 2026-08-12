const rawVoiceServer =
  process.env.NEXT_PUBLIC_VOICE_API_URL ??
  "https://api.annaai.online";

const rawVoiceApiVersion =
  process.env.NEXT_PUBLIC_VOICE_API_VERSION ??
  "v7";

export const VOICE_SERVER =
  rawVoiceServer
    .trim()
    .replace(/\/+$/, "");

export const VOICE_API_VERSION =
  rawVoiceApiVersion
    .trim()
    .toLowerCase();

export const LANGUAGE =
  "zh-CN";

export const MAX_RECORDING_SECONDS =
  30;

export function getVoiceServerUrl(
  pathname: string,
): string {
  const cleanPath =
    pathname.startsWith("/")
      ? pathname
      : `/${pathname}`;

  if (
    VOICE_API_VERSION ===
    "v7"
  ) {
    if (
      cleanPath ===
      "/voice-chat"
    ) {
      return (
        `${VOICE_SERVER}` +
        "/v7/voice-chat"
      );
    }

    if (
      cleanPath ===
      "/text-chat"
    ) {
      return (
        `${VOICE_SERVER}` +
        "/v7/text-chat"
      );
    }

    if (
      cleanPath ===
      "/health"
    ) {
      return (
        `${VOICE_SERVER}` +
        "/v7/health"
      );
    }

    if (
      cleanPath ===
      "/tts"
    ) {
      return (
        `${VOICE_SERVER}` +
        "/v7/tts"
      );
    }
  }

  return (
    `${VOICE_SERVER}` +
    cleanPath
  );
}