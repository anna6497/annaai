import AnnaAvatar from "./AnnaAvatar";

type ChatHeaderProps = {
  connected: boolean;
  checkingConnection: boolean;
  recording: boolean;
  processing: boolean;
  hydrated: boolean;
  speaking?: boolean;
  onNewChat: () => void;
};

function NewChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export default function ChatHeader({
  connected,
  checkingConnection,
  recording,
  processing,
  hydrated,
  speaking = false,
  onNewChat,
}: ChatHeaderProps) {
  let statusText = "Offline";
  let statusClass = "text-slate-300";
  let statusDotClass = "bg-slate-400";

  if (checkingConnection) {
    statusText = "Connecting...";
    statusClass = "text-purple-200/75";
    statusDotClass = "animate-pulse bg-amber-300";
  } else if (recording) {
    statusText = "Listening";
    statusClass = "text-rose-200";
    statusDotClass =
      "animate-pulse bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.9)]";
  } else if (speaking) {
    statusText = "Speaking";
    statusClass = "text-pink-200";
    statusDotClass =
      "animate-pulse bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.9)]";
  } else if (processing) {
    statusText = "Thinking";
    statusClass = "text-fuchsia-200";
    statusDotClass =
      "animate-pulse bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.9)]";
  } else if (connected) {
    statusText = "Online";
    statusClass = "text-emerald-300";
    statusDotClass =
      "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]";
  }

  const avatarOnline =
    connected && !checkingConnection;

  return (
    <header className="anna-header-card relative overflow-hidden rounded-[30px] border border-purple-300/20 px-5 py-5 shadow-[0_24px_70px_rgba(10,5,30,0.35)] backdrop-blur-2xl sm:px-7 sm:py-6">
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <AnnaAvatar
            size="lg"
            online={avatarOnline}
            speaking={speaking}
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Anna
              </h1>

              <span className="rounded-lg border border-fuchsia-300/35 bg-fuchsia-500/15 px-2 py-1 text-xs font-bold text-fuchsia-100 backdrop-blur-md">
                AI
              </span>
            </div>

            <p className="mt-1 truncate text-base font-medium text-purple-100/75 sm:text-lg">
              Your Chinese AI Friend
            </p>

            <div
              className={[
                "mt-2 flex items-center gap-2 text-sm font-medium",
                statusClass,
              ].join(" ")}
            >
              <span
                className={[
                  "h-2.5 w-2.5 rounded-full",
                  statusDotClass,
                ].join(" ")}
                aria-hidden="true"
              />

              <span>{statusText}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          disabled={!hydrated}
          className={[
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl",
            "border border-purple-200/20 bg-white/5 px-3.5 py-3",
            "text-sm font-semibold text-purple-50 backdrop-blur-xl",
            "transition duration-200 hover:scale-[1.02] hover:border-pink-300/30 hover:bg-pink-400/10",
            "active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",
            "sm:px-5",
          ].join(" ")}
        >
          <NewChatIcon />

          <span className="hidden sm:inline">
            New Chat
          </span>
        </button>
      </div>
    </header>
  );
}