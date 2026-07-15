"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { createClient } from "../../lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const nextPath = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/call";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) { setMessage("Email နဲ့ Password ဖြည့်ပေးပါ။"); return; }
    setSubmitting(true); setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setMessage(error.message === "Invalid login credentials" ? "Email သို့မဟုတ် Password မှားနေပါတယ်။" : error.message);
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login မဝင်နိုင်ပါ။");
    } finally { setSubmitting(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 px-5 py-12 text-white">
      <section className="w-full max-w-xl rounded-[42px] border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-2xl sm:p-12">
        <div className="text-center"><div className="text-6xl">🤖</div><h1 className="mt-5 text-5xl font-extrabold">Welcome Back</h1><p className="mt-4 text-lg text-white/60">Login to continue talking with Anna</p></div>
        <form onSubmit={login} className="mt-10 space-y-6">
          <label className="block"><span className="mb-3 block text-lg text-white/70">Email</span><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-3xl border border-white/10 bg-black/25 px-6 py-5 text-lg outline-none" /></label>
          <label className="block"><span className="mb-3 block text-lg text-white/70">Password</span><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full rounded-3xl border border-white/10 bg-black/25 px-6 py-5 text-lg outline-none" /></label>
          {message && <p className="rounded-2xl border border-red-300/20 bg-red-500/15 px-4 py-3 text-sm text-red-100">{message}</p>}
          <button type="submit" disabled={submitting} className="w-full rounded-3xl bg-fuchsia-600 px-6 py-5 text-xl font-bold disabled:opacity-50">{submitting ? "Logging in…" : "Login"}</button>
        </form>
        <p className="mt-8 text-center text-white/60">Don&apos;t have an account? <Link href={`/register?next=${encodeURIComponent(nextPath)}`} className="font-bold text-purple-200">Create Account</Link></p>
        <p className="mt-4 text-center text-sm text-white/40">Email confirmation လုပ်ပြီးမှ Login ဝင်နိုင်ပါတယ်။</p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading…</main>}><LoginForm /></Suspense>;
}
