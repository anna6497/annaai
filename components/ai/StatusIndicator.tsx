type StatusIndicatorProps = {
  connected: boolean;
  recording: boolean;
  processing: boolean;
};

export default function StatusIndicator({
  connected,
  recording,
  processing,
}: StatusIndicatorProps) {
  let label = "Voice server offline";
  let dotClass = "bg-slate-400";
  let textClass = "text-slate-300";

  if (recording) {
    label = "Listening to you";
    dotClass = "bg-rose-400 animate-pulse";
    textClass = "text-rose-200";
  } else if (processing) {
    label = "Processing your voice";
    dotClass = "bg-fuchsia-400 animate-pulse";
    textClass = "text-fuchsia-200";
  } else if (connected) {
    label = "Voice server is ready";
    dotClass =
      "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]";
    textClass = "text-purple-100";
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-white/5 px-4 py-2 backdrop-blur-lg">
      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      <span className={`text-xs font-medium sm:text-sm ${textClass}`}>
        {label}
      </span>
    </div>
  );
}