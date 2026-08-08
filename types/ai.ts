export type AiPracticeMode =
  | "practice"
  | "sentence_builder";

export type ConversationRole =
  | "user"
  | "assistant";

export type ConversationHistoryMessage = {
  role: ConversationRole;
  content: string;
};

export type AnnaCorrection = {
  needed: boolean;
  original: string;
  corrected: string;
  pinyin: string;
};

export type AnnaReply = {
  hanzi: string;
  pinyin: string;

  /**
   * V7.2 Chinese correction.
   *
   * Optional so older backend responses
   * remain compatible during preview testing.
   */
  correction?: AnnaCorrection;

  /**
   * Legacy compatibility.
   */
  myanmar?: string;
};

export type ChatMessage = {
  id: string;

  sender: ConversationRole;

  text: string;

  reply?: AnnaReply | null;

  createdAt: number;

  role?: ConversationRole;
  content?: string;
  transcript?: string;
};

export type VoiceChatResponse = {
  transcript: string;

  mode?: AiPracticeMode;

  reply: AnnaReply;

  timings?: Record<
    string,
    number
  >;
};

export type TextChatResponse = {
  message: string;

  mode?: AiPracticeMode;

  reply: AnnaReply;

  timings?: Record<
    string,
    number
  >;
};

export type VoiceServerHealth = {
  status: string;

  ollama_running?: boolean;

  version?: string;

  service?: string;

  port?: number;

  whisper_loaded?: boolean;

  whisper_model?: string;

  whisper_device?: string;

  whisper_compute_type?: string;

  model?: string;

  ffmpeg_available?: boolean;

  piper_ready?: boolean;

  correction_enabled?: boolean;

  allowed_origins?: string[];
};

export type VoiceServerHealthResponse =
  VoiceServerHealth;