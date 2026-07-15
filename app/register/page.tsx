"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { createClient } from "../../lib/supabase/client";

function RegisterForm() {
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const nextPath = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/call";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) { setMessage("Email နဲ့ Password ဖြည့်ပေးပါ။"); return; }
    if (password.length < 6) { setMessage("Password အနည်းဆုံး 6 လုံးထားပါ။"); return; }
    if (password !== confirmPassword) { setMessage("Password နှစ်ခု မတူပါ။"); return; }
    setSubmitting(true); setMessage(""); setSuccess(false);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(nextPath)}` },
      });
      if (error) { setMessage(error.message); return; }
      if (data.session) { window.location.assign(nextPath); return; }
      setSuccess(true);
      setMessage("Account ဖွင့်ပြီးပါပြီ။ Email ထဲက confirmation link ကိုနှိပ်ပြီး Login ဝင်ပါ။");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Account ဖွင့်မရပါ။");
    } finally { setSubmitting(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 px-5 py-12 text-white">
      <section className="w-full max-w-xl rounded-[42px] border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-2xl sm:p-12">
        <div className="text-center"><div className="text-6xl">✨</div><h1 className="mt-5 text-5xl font-extrabold">Create Account</h1><p className="mt-4 text-lg text-white/60">Start speaking Chinese with Anna</p></div>
        <form onSubmit={register} className="mt-10 space-y-5">
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-3xl border border-white/10 bg-black/25 px-6 py-5 text-lg outline-none" />
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-3xl border border-white/10 bg-black/25 px-6 py-5 text-lg outline-none" />
          <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full rounded-3xl border border-white/10 bg-black/25 px-6 py-5 text-lg outline-none" />
          {message && <p className={`rounded-2xl px-4 py-3 text-sm ${success ? "border border-green-300/20 bg-green-500/15 text-green-100" : "border border-red-300/20 bg-red-500/15 text-red-100"}`}>{message}</p>}
          <button type="submit" disabled={submitting} className="w-full rounded-3xl bg-fuchsia-600 px-6 py-5 text-xl font-bold disabled:opacity-50">{submitting ? "Creating…" : "Create Account"}</button>
        </form>
        <p className="mt-8 text-center text-white/60">Already have an account? <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-bold text-purple-200">Login</Link></p>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading…</main>}><RegisterForm /></Suspense>;
}
