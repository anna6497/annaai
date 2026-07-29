import AnnaAvatar from "./AnnaAvatar";

export default function ThinkingIndicator() {
  return (
    <div
      className="anna-message-enter flex items-center gap-3"
      role="status"
      aria-live="polite"
      aria-label="Anna is thinking"
    >
      <AnnaAvatar
        size="sm"
        online={true}
        speaking={false}
      />

      <div className="flex items-center gap-4 rounded-[22px] rounded-tl-md border border-fuchsia-300/20 bg-[#351557]/80 px-5 py-4 shadow-[0_14px_38px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <span className="text-sm font-semibold text-fuchsia-300">
          Anna is thinking
        </span>

        <span
          className="flex items-center gap-1.5"
          aria-hidden="true"
        >
          <span className="anna-thinking-dot h-2.5 w-2.5 rounded-full bg-fuchsia-400" />

          <span className="anna-thinking-dot anna-thinking-dot-2 h-2.5 w-2.5 rounded-full bg-fuchsia-400" />

          <span className="anna-thinking-dot anna-thinking-dot-3 h-2.5 w-2.5 rounded-full bg-fuchsia-400" />
        </span>
      </div>
    </div>
  );
}