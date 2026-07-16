"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || password.length < 6) {
      setError("Name, email နဲ့ အနည်းဆုံး 6 လုံးရှိတဲ့ password ဖြည့်ပါ။");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { name: cleanName },
          },
        });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Account create မအောင်မြင်ပါ။");

      if (data.session) {
        setMessage("Account created. 1-day free trial စတင်ပါပြီ။");
        router.replace("/call");
        router.refresh();
        return;
      }

      setMessage("Account created. Email confirmation လုပ်ပြီး Login ဝင်ပါ။");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Register မလုပ်နိုင်ပါ။"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#08001c] via-[#22003f] to-[#6d00a8] px-5 py-12 text-white">
      <section className="mx-auto max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="text-5xl">🤖</div>
          <h1 className="mt-4 text-4xl font-bold">Create Account</h1>
          <p className="mt-3 text-white/60">
            1-day free trial · 5 minutes voice/day
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-white/70">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-white outline-none focus:border-purple-300"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-white/70">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-white outline-none focus:border-purple-300"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-white/70">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-white outline-none focus:border-purple-300"
              placeholder="At least 6 characters"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-300/20 bg-red-500/20 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-2xl border border-green-300/20 bg-green-500/20 px-4 py-3 text-sm text-green-100">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-4 text-lg font-bold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating account…" : "Start 1-Day Free Trial"}
          </button>
        </form>

        <p className="mt-6 text-center text-white/60">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-white">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
