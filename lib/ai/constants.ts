export const VOICE_SERVER =
  process.env.NEXT_PUBLIC_VOICE_SERVER_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";

export const LANGUAGE = "zh-CN";
export const MAX_RECORDING_SECONDS = 30;
