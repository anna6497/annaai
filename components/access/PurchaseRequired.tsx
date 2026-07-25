import Link from "next/link";

interface PurchaseRequiredProps {
  level: number;
  reason?: string;
}

export default function PurchaseRequired({
  level,
  reason,
}: PurchaseRequiredProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080011] px-4 text-white">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl">
        <div className="text-6xl">🔒</div>

        <h1 className="mt-5 text-3xl font-black">
          HSK {level} Purchase Required
        </h1>

        <p className="mt-4 leading-7 text-white/55">
          {reason ??
            `Purchase HSK ${level} lifetime access or unlock all paid levels with the HSK 2–9 Full Package.`}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/payment?hsk=hsk_${level}`}
            className="rounded-2xl bg-emerald-600 px-5 py-3 font-black transition hover:bg-emerald-500"
          >
            Buy HSK {level}
          </Link>

          <Link
            href="/payment?hsk=hsk_full"
            className="rounded-2xl bg-fuchsia-600 px-5 py-3 font-black transition hover:bg-fuchsia-500"
          >
            Buy Full Package
          </Link>
        </div>

        <Link
          href="/hsk/store"
          className="mt-5 inline-block text-sm font-bold text-white/45 transition hover:text-white"
        >
          View all HSK packages
        </Link>
      </section>
    </main>
  );
}
