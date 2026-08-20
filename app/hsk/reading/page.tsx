import Link from "next/link";
import { hskLevels } from "../../../lib/hsk-levels";

export default function ReadingPage() {
  return (
    <main className="min-h-screen bg-[#090014] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between">
          <Link
            href="/hsk"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            ← HSK
          </Link>

          <p className="font-black">
            📖 Reading
          </p>
        </header>

        <section className="pb-10 pt-14 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-pink-300">
            Chinese Stories
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            Choose Reading Level
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/55">
            ကိုယ့် HSK Level နဲ့ကိုက်ညီတဲ့
            Chinese stories များကို ဖတ်ရှုပါ။
          </p>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hskLevels.map((item) => (
            <Link
              key={item.level}
              href={`/hsk/reading/${item.level}`}
              className="group rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 transition hover:-translate-y-1 hover:border-pink-300/25"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-2xl font-black`}
              >
                {item.level}
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-widest text-pink-300">
                HSK Level {item.level}
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Reading Stories
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/50">
                Level {item.level} vocabulary နှင့်
                grammar အသုံးပြုထားသော stories များ။
              </p>

              <p className="mt-6 font-bold text-pink-300 transition group-hover:translate-x-1">
                Read Stories →
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}