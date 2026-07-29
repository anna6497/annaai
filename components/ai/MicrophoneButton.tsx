type MicrophoneButtonProps = {
  recording: boolean;
  processing: boolean;
  connected: boolean;
  speaking: boolean;
  muted: boolean;
  speakerEnabled: boolean;
  recordingSeconds: number;
  onStart: () => void;
  onStop: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
};

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function MicrophoneIcon({
  recording,
  processing,
}: {
  recording: boolean;
  processing: boolean;
}) {
  if (processing) {
    return (
      <span
        className="flex items-center gap-2"
        aria-hidden="true"
      >
        <span className="h-3 w-3 animate-pulse rounded-full bg-white" />

        <span className="h-3 w-3 animate-pulse rounded-full bg-white [animation-delay:150ms]" />

        <span className="h-3 w-3 animate-pulse rounded-full bg-white [animation-delay:300ms]" />
      </span>
    );
  }

  if (recording) {
    return (
      <span
        className="h-9 w-9 rounded-lg bg-white shadow-[0_0_18px_rgba(255,255,255,0.65)] sm:h-10 sm:w-10"
        aria-hidden="true"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-12 w-12 fill-none stroke-current sm:h-14 sm:w-14"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="9"
        y="3"
        width="6"
        height="12"
        rx="3"
      />

      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M9 21h6" />
    </svg>
  );
}

function MuteIcon({
  muted,
}: {
  muted: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-7 w-7 fill-none stroke-current"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="9"
        y="3"
        width="6"
        height="12"
        rx="3"
      />

      {!muted && (
        <>
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
          <path d="M9 21h6" />
        </>
      )}

      {muted && (
        <>
          <path d="M4 4 20 20" />
          <path d="M5 11a7 7 0 0 0 10.5 6.1" />
          <path d="M12 18v3" />
          <path d="M9 21h6" />
        </>
      )}
    </svg>
  );
}

function SpeakerIcon({
  enabled,
}: {
  enabled: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-7 w-7 fill-none stroke-current"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />

      {enabled ? (
        <>
          <path d="M15 9a4 4 0 0 1 0 6" />
          <path d="M18 6a8 8 0 0 1 0 12" />
        </>
      ) : (
        <>
          <path d="m16 10 5 5" />
          <path d="m21 10-5 5" />
        </>
      )}
    </svg>
  );
}

export default function MicrophoneButton({
  recording,
  processing,
  connected,
  speaking,
  muted,
  speakerEnabled,
  recordingSeconds,
  onStart,
  onStop,
  onToggleMute,
  onToggleSpeaker,
}: MicrophoneButtonProps) {
  const microphoneDisabled =
    !connected || processing || speaking;

  let helperText = "Tap to speak Chinese";

  if (!connected) {
    helperText = "Voice server is offline";
  } else if (processing) {
    helperText = "Anna is preparing her reply...";
  } else if (speaking) {
    helperText = "Anna is speaking...";
  } else if (recording) {
    helperText = `Listening · ${formatTime(
      recordingSeconds
    )}`;
  } else if (!speakerEnabled) {
    helperText = "Speaker is turned off";
  } else if (muted) {
    helperText = "Automatic voice reply is muted";
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full items-center justify-center gap-5 sm:gap-16">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            className={[
              "flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16",
              "border backdrop-blur-md transition duration-200",
              "hover:scale-105 active:scale-95",
              muted
                ? "border-rose-300/40 bg-rose-500/15 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.18)]"
                : "border-purple-300/20 bg-white/5 text-purple-100/75 hover:border-pink-300/30 hover:text-white",
            ].join(" ")}
            aria-label={
              muted
                ? "Turn automatic voice reply on"
                : "Mute automatic voice reply"
            }
            aria-pressed={muted}
          >
            <MuteIcon muted={muted} />
          </button>

          <span
            className={[
              "text-xs font-medium sm:text-sm",
              muted
                ? "text-rose-200"
                : "text-purple-100/60",
            ].join(" ")}
          >
            {muted ? "Muted" : "Auto Voice"}
          </span>
        </div>

        <div className="relative flex flex-col items-center">
          {(recording || speaking) && (
            <>
              <span
                className={[
                  "anna-mic-ring absolute top-0 h-28 w-28 rounded-full border sm:h-32 sm:w-32",
                  speaking
                    ? "border-fuchsia-400/60"
                    : "border-pink-400/60",
                ].join(" ")}
              />

              <span
                className={[
                  "anna-mic-ring anna-mic-ring-delay absolute top-0 h-28 w-28 rounded-full border sm:h-32 sm:w-32",
                  speaking
                    ? "border-violet-400/50"
                    : "border-fuchsia-400/50",
                ].join(" ")}
              />
            </>
          )}

          <button
            type="button"
            onClick={recording ? onStop : onStart}
            disabled={microphoneDisabled}
            className={[
              "anna-mic-button relative z-10 flex h-28 w-28 items-center justify-center rounded-full",
              "border-2 border-pink-200/60 text-white",
              "shadow-[0_0_25px_rgba(236,72,153,0.8),0_0_70px_rgba(168,85,247,0.55)]",
              "transition duration-300 hover:scale-105 active:scale-95",
              "disabled:cursor-not-allowed disabled:opacity-45",
              "sm:h-32 sm:w-32",
              recording
                ? "bg-gradient-to-br from-rose-500 via-pink-500 to-red-500"
                : speaking
                  ? "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500"
                  : "bg-gradient-to-br from-pink-400 via-fuchsia-500 to-violet-600",
              processing ? "anna-mic-processing" : "",
            ].join(" ")}
            aria-label={
              recording
                ? "Stop recording"
                : processing
                  ? "Processing voice"
                  : speaking
                    ? "Anna is speaking"
                    : "Start recording"
            }
          >
            {speaking ? (
              <span
                className="flex h-14 items-end gap-1.5"
                aria-hidden="true"
              >
                <span className="h-5 w-2 animate-pulse rounded-full bg-white" />
                <span className="h-10 w-2 animate-pulse rounded-full bg-white [animation-delay:100ms]" />
                <span className="h-14 w-2 animate-pulse rounded-full bg-white [animation-delay:200ms]" />
                <span className="h-8 w-2 animate-pulse rounded-full bg-white [animation-delay:300ms]" />
                <span className="h-4 w-2 animate-pulse rounded-full bg-white [animation-delay:400ms]" />
              </span>
            ) : (
              <MicrophoneIcon
                recording={recording}
                processing={processing}
              />
            )}
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onToggleSpeaker}
            className={[
              "flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16",
              "border backdrop-blur-md transition duration-200",
              "hover:scale-105 active:scale-95",
              speakerEnabled
                ? "border-pink-300/30 bg-pink-500/10 text-pink-100 shadow-[0_0_20px_rgba(236,72,153,0.15)]"
                : "border-purple-300/15 bg-white/5 text-purple-100/35",
            ].join(" ")}
            aria-label={
              speakerEnabled
                ? "Turn speaker off"
                : "Turn speaker on"
            }
            aria-pressed={speakerEnabled}
          >
            <SpeakerIcon enabled={speakerEnabled} />
          </button>

          <span
            className={[
              "text-xs font-medium sm:text-sm",
              speakerEnabled
                ? "text-pink-100/80"
                : "text-purple-100/40",
            ].join(" ")}
          >
            {speakerEnabled
              ? "Speaker On"
              : "Speaker Off"}
          </span>
        </div>
      </div>

      <p
        className={[
          "mt-5 text-center text-base font-medium sm:text-lg",
          recording
            ? "text-rose-200"
            : processing
              ? "text-fuchsia-200"
              : speaking
                ? "animate-pulse text-pink-200"
                : "text-purple-100/85",
        ].join(" ")}
      >
        {helperText}
      </p>
    </div>
  );
}