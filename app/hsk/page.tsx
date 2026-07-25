"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserHskAccess, hasHskLevelAccess } from "@/lib/hsk-access";
import type { UserHskAccess } from "@/types/access";

export default function HskPage() {
  const [rows, setRows] = useState<UserHskAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getUserHskAccess().then((data) => active && setRows(data)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-screen bg-[#090014] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold">← Dashboard</Link>
          <Link href="/hsk/store" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold">HSK Store</Link>
        </header>
        <section className="py-12">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">HSK 3.0 Learning</p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">Choose your level</h1>
          <p className="mt-4 max-w-2xl leading-7 text-white/55">HSK 1 Flashcards and Writing are free. HSK 2–9 require lifetime access. Reading is coming soon.</p>
        </section>
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 9 }, (_, index) => {
            const level = index + 1;
            const unlocked = hasHskLevelAccess(level, rows);
            return (
              <article key={level} className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6">
                <div className="flex items-start justify-between">
                  <div><p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Level</p><h2 className="mt-2 text-3xl font-black">HSK {level}</h2></div>
                  <span className="text-2xl">{loading ? "…" : unlocked ? "✅" : "🔒"}</span>
                </div>
                <div className="mt-6 space-y-3 text-sm text-white/60"><p>📇 Flashcards</p><p>✍️ Writing</p><p>📖 Reading — Coming Soon</p></div>
                {unlocked ? (
                  <div className="mt-6 grid gap-3">
                    <Link href={`/hsk/flashcards/${level}`} className="rounded-2xl bg-emerald-600 px-4 py-3 text-center font-bold hover:bg-emerald-500">Flashcards</Link>
                    <Link href={`/hsk/writing/${level}/lessons`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center font-bold hover:bg-white/10">Writing</Link>
                  </div>
                ) : <Link href="/hsk/store" className="mt-6 block rounded-2xl bg-fuchsia-600 px-4 py-3 text-center font-bold hover:bg-fuchsia-500">Unlock Level</Link>}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
