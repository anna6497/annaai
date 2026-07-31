const rawVoiceServer =
  process.env.NEXT_PUBLIC_VOICE_API_URL ?? "";

export const VOICE_SERVER =
  rawVoiceServer.trim().replace(/\/+$/, "");

export const LANGUAGE = "zh-CN";

export const MAX_RECORDING_SECONDS = 30;

export function getVoiceServerUrl(
  pathname: string,
): string {
  if (!VOICE_SERVER) {
    throw new Error(
      "NEXT_PUBLIC_VOICE_API_URL is not configured.",
    );
  }

  const cleanPath = pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;

  return `${VOICE_SERVER}${cleanPath}`;
}