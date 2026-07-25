import Link from "next/link";

import HskStoreGrid from "@/components/hsk/HskStoreGrid";
import "./store-animations.css";

export default function HskStorePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080011] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-fuchsia-300">
              Anna AI HSK Store
            </p>
            <h1 className="mt-2 text-4xl font-black sm:text-5xl">
              Choose your HSK package
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-white/55">
              HSK 1 is free. Buy one paid level for 10,000 MMK or unlock
              HSK 2–9 with the promotional Full Package.
            </p>
          </div>

          <Link
            href="/hsk"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:bg-white/10"
          >
            ← Back to HSK
          </Link>
        </header>

        <HskStoreGrid />
      </section>
    </main>
  );
}
