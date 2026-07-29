import Image from "next/image";

type AnnaAvatarProps = {
  size?: "sm" | "md" | "lg";
  online?: boolean;
  speaking?: boolean;
  showStatus?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: {
    wrapper: "h-11 w-11",
    imageSize: 44,
    status: "h-3.5 w-3.5 border-2",
    firstRing: "-inset-1",
    secondRing: "-inset-2",
  },

  md: {
    wrapper: "h-16 w-16",
    imageSize: 64,
    status: "h-4 w-4 border-[3px]",
    firstRing: "-inset-2",
    secondRing: "-inset-3",
  },

  lg: {
    wrapper: "h-20 w-20 sm:h-24 sm:w-24",
    imageSize: 96,
    status: "h-[18px] w-[18px] border-[3px]",
    firstRing: "-inset-3",
    secondRing: "-inset-5",
  },
} as const;

export default function AnnaAvatar({
  size = "md",
  online = true,
  speaking = false,
  showStatus = true,
  className = "",
}: AnnaAvatarProps) {
  const classes = sizeClasses[size];

  return (
    <div
      className={[
        "relative shrink-0",
        classes.wrapper,
        className,
      ].join(" ")}
      aria-label={
        speaking
          ? "Anna is speaking"
          : online
            ? "Anna is online"
            : "Anna is offline"
      }
    >
      <span
        className={[
          "pointer-events-none absolute rounded-full border",
          classes.secondRing,
          speaking
            ? "animate-ping border-pink-400/55"
            : "border-violet-400/30",
        ].join(" ")}
        aria-hidden="true"
      />

      <span
        className={[
          "pointer-events-none absolute rounded-full border",
          classes.firstRing,
          speaking
            ? "animate-pulse border-fuchsia-300/70"
            : "border-purple-300/45",
        ].join(" ")}
        aria-hidden="true"
      />

      <div
        className={[
          "relative z-10 h-full w-full overflow-hidden rounded-full",
          "border border-purple-200/45",
          "bg-gradient-to-br from-violet-500 via-purple-700 to-fuchsia-700",
          "shadow-[0_0_18px_rgba(147,51,234,0.75),0_0_38px_rgba(126,34,206,0.45)]",
          "transition duration-300",
          speaking
            ? "scale-105 shadow-[0_0_28px_rgba(236,72,153,0.85),0_0_55px_rgba(168,85,247,0.65)]"
            : "",
        ].join(" ")}
      >
        <Image
          src="/images/anna-avatar.png"
          alt="Anna"
          width={classes.imageSize}
          height={classes.imageSize}
          priority={size === "lg"}
          className={[
            "h-full w-full select-none rounded-full object-cover",
            speaking
              ? "animate-[anna-avatar-talk_650ms_ease-in-out_infinite]"
              : "",
          ].join(" ")}
        />

        <span
          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-pink-300/10"
          aria-hidden="true"
        />
      </div>

      {showStatus && (
        <span
          className={[
            "absolute bottom-0 right-0 z-20 rounded-full border-[#261044]",
            classes.status,
            speaking
              ? "animate-pulse bg-pink-400 shadow-[0_0_11px_rgba(244,114,182,0.95)]"
              : online
                ? "bg-emerald-400 shadow-[0_0_11px_rgba(52,211,153,0.9)]"
                : "bg-slate-400",
          ].join(" ")}
          aria-hidden="true"
        />
      )}
    </div>
  );
}