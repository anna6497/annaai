export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#160927] px-6">
      <div
        className="flex flex-col items-center gap-5"
        role="status"
        aria-live="polite"
        aria-label="Loading Anna AI"
      >
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 animate-ping rounded-full border border-fuchsia-400/50" />
          <span className="absolute inset-2 animate-pulse rounded-full border border-purple-300/70" />
          <span className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_0_30px_rgba(168,85,247,0.65)]" />
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-white">
            Anna AI is loading
          </p>

          <p className="mt-1 text-sm text-purple-200/70">
            Preparing your speaking practice...
          </p>
        </div>
      </div>
    </main>
  );
}