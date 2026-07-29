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

export type AnnaReply = {
  hanzi: string;
  pinyin: string;

  /**
   * Kept optional for compatibility with older
   * MessageBubble versions.
   */
  myanmar?: string;
};

export type ChatMessage = {
  /**
   * Unique message identifier.
   */
  id: string;

  /**
   * Required by conversation storage and history.
   */
  sender: ConversationRole;

  /**
   * Required by MessageBubble and conversation memory.
   */
  text: string;

  /**
   * Anna's structured Chinese reply.
   * User messages may not have this value.
   */
  reply?: AnnaReply | null;

  /**
   * Unix timestamp created with Date.now().
   */
  createdAt: number;

  /**
   * Optional compatibility fields.
   * These do not replace sender and text.
   */
  role?: ConversationRole;
  content?: string;
  transcript?: string;
};

export type VoiceChatResponse = {
  transcript: string;
  reply: AnnaReply;
};

export type TextChatResponse = {
  /**
   * The backend response includes the original
   * or processed message together with Anna's reply.
   */
  message: string;
  reply: AnnaReply;
};

export type VoiceServerHealth = {
  status: string;
  ollama_running: boolean;

  /**
   * Optional backend service details.
   */
  whisper_loaded?: boolean;
  model?: string;
};

export type VoiceServerHealthResponse =
  VoiceServerHealth;