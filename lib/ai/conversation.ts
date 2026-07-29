import type {
  ChatMessage,
  ConversationHistoryMessage,
} from "@/types/ai";

const STORAGE_KEY = "anna-ai-conversation-v1";
const MAX_STORED_MESSAGES = 40;
const MAX_API_HISTORY_MESSAGES = 10;

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<ChatMessage>;

  return (
    typeof candidate.id === "string" &&
    (candidate.sender === "user" ||
      candidate.sender === "assistant") &&
    typeof candidate.text === "string" &&
    typeof candidate.createdAt === "number"
  );
}

export function loadConversation(): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return [];

    const parsed: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isChatMessage)
      .filter((message) => message.text.trim().length > 0)
      .slice(-MAX_STORED_MESSAGES);
  } catch {
    return [];
  }
}

export function saveConversation(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.slice(-MAX_STORED_MESSAGES))
    );
  } catch {
    // The conversation still works when browser storage is unavailable.
  }
}

export function clearStoredConversation(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

export function toConversationHistory(
  messages: ChatMessage[]
): ConversationHistoryMessage[] {
  return messages
    .filter((message) => message.text.trim().length > 0)
    .slice(-MAX_API_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.sender,
      content: message.text.trim(),
    }));
}
