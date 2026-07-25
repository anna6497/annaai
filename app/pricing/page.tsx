import Link from "next/link";
import { formatMmk } from "@/lib/hsk-products";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#090014] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4"><Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold">← Home</Link><Link href="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold">Dashboard</Link></header>
        <section className="py-12 text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-300">Anna AI Pricing</p><h1 className="mt-4 text-4xl font-black sm:text-5xl">Choose what you need</h1><p className="mx-auto mt-4 max-w-2xl leading-7 text-white/55">AI Speaking pricing is coming soon. HSK products are lifetime access.</p></section>
        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-purple-300/15 bg-gradient-to-br from-purple-950/90 via-violet-950/80 to-slate-950 p-8"><p className="text-sm font-black uppercase tracking-[0.2em] text-purple-300">AI Speaking</p><h2 className="mt-4 text-3xl font-black">Coming Soon</h2><p className="mt-4 leading-7 text-white/55">New users receive a 1-day trial with 5 minutes total AI voice usage.</p><div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5"><p className="text-sm text-white/45">Free Trial</p><p className="mt-2 text-2xl font-black">1 Day · 5 Minutes</p></div></article>
          <article className="rounded-[2rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-950/85 via-teal-950/75 to-slate-950 p-8"><p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">HSK Lifetime Package</p><h2 className="mt-4 text-3xl font-black">HSK 2–9 Full Package</h2><p className="mt-4 leading-7 text-white/55">Flashcards + Writing for HSK 2 to HSK 9.</p><div className="mt-6"><p className="text-white/35 line-through">{formatMmk(80000)}</p><p className="mt-2 text-4xl font-black text-emerald-200">{formatMmk(25000)}</p><p className="mt-2 text-sm font-bold text-emerald-300">Promotion · Lifetime Access</p></div><Link href="/hsk/store" className="mt-7 block rounded-2xl bg-emerald-600 px-5 py-3 text-center font-black hover:bg-emerald-500">View HSK Store</Link></article>
        </section>
      </div>
    </main>
  );
}
