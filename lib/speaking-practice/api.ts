export type IncorrectCharacter = {
  expected: string;
  recognized: string;
};

export type PronunciationCheckResponse = {
  sentence_id: string;
  target_text: string;
  recognized_text: string;
  detected_language: string;
  language_probability: number;
  duration_seconds: number;
  processing_seconds: number;

  scores: {
    overall: number;
    accuracy: number;
    completeness: number;
    fluency: number;
  };

  feedback: {
    missing_characters: string[];
    extra_characters: string[];
    incorrect_characters: IncorrectCharacter[];
  };

  coach: {
    title: string;
    message: string;
    focus_characters: string[];
    tone_scoring_available: boolean;
    tone_note: string;
  };
};

type CheckPronunciationInput = {
  audioBlob: Blob;
  sentenceId: string;
  targetText: string;
  durationSeconds: number;
};

function getVoiceApiUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_VOICE_API_URL?.trim();

  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_VOICE_API_URL is not configured."
    );
  }

  return apiUrl.replace(/\/+$/, "");
}

function getAudioExtension(audioBlob: Blob): string {
  const mimeType = audioBlob.type.toLowerCase();

  if (mimeType.includes("mp4")) {
    return "m4a";
  }

  if (mimeType.includes("ogg")) {
    return "ogg";
  }

  if (mimeType.includes("wav")) {
    return "wav";
  }

  if (mimeType.includes("mpeg")) {
    return "mp3";
  }

  return "webm";
}

function getErrorMessage(body: unknown): string {
  if (
    body &&
    typeof body === "object" &&
    "detail" in body
  ) {
    const detail = body.detail;

    if (typeof detail === "string") {
      return detail;
    }
  }

  return "Pronunciation checking failed.";
}

export async function checkPronunciation({
  audioBlob,
  sentenceId,
  targetText,
  durationSeconds,
}: CheckPronunciationInput): Promise<PronunciationCheckResponse> {
  if (audioBlob.size === 0) {
    throw new Error("The recorded audio is empty.");
  }

  const formData = new FormData();

  formData.append(
    "audio",
    audioBlob,
    `pronunciation.${getAudioExtension(audioBlob)}`
  );

  formData.append("sentence_id", sentenceId);
  formData.append("target_text", targetText);
  formData.append(
    "duration_seconds",
    String(durationSeconds)
  );

  const response = await fetch(
    `${getVoiceApiUrl()}/v6/pronunciation/check`,
    {
      method: "POST",
      body: formData,
    }
  );

  const body: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(body));
  }

  return body as PronunciationCheckResponse;
}