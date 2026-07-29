export type AiPracticeMode =
  | "practice"
  | "sentence_builder";

export interface ConversationHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnnaReply {
  hanzi: string;
  pinyin: string;
}

export interface TextChatResponse {
  message: string;
  mode: AiPracticeMode;
  reply: AnnaReply;
}

export interface VoiceChatResponse {
  transcript: string;
  mode: AiPracticeMode;
  reply: AnnaReply;
}

export interface VoiceServerHealth {
  status: "ok" | "degraded";
  ollama_running: boolean;
  version?: string;
}
