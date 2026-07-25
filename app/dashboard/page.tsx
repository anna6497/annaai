"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import VoiceTrialCard from "@/components/access/VoiceTrialCard";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("Anna Learner");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/login?next=/dashboard"); return; }
      const { data } = await supabase.from("profiles").select("name,email").eq("id", user.id).maybeSingle();
      if (active) {
        setName(typeof data?.name === "string" && data.name ? data.name : "Anna Learner");
        setEmail(typeof data?.email === "string" ? data.email : user.email ?? "");
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#090014] text-white">Dashboard loading...</main>;

  return (
    <main className="min-h-screen bg-[#090014] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="font-black">🤖 Anna-AI</Link>
          <button type="button" onClick={() => void logout()} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold">Logout</button>
        </header>
        <section className="py-12">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-300">Learning Dashboard</p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">မင်္ဂလာပါ {name}</h1>
          <p className="mt-3 text-white/50">{email}</p>
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <VoiceTrialCard />
          <Link href="/hsk" className="rounded-[2rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-950/80 via-teal-950/70 to-slate-950 p-7 transition hover:-translate-y-1">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">HSK Learning</p>
            <h2 className="mt-4 text-3xl font-black">Flashcards + Writing</h2>
            <p className="mt-4 leading-7 text-white/55">HSK 1 is free. Unlock HSK 2–9 individually or buy the full lifetime package.</p>
            <div className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-5 py-3 font-black">Open HSK →</div>
          </Link>
        </section>
      </div>
    </main>
  );
}
