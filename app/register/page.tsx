"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    []
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Name ထည့်ပေးပါ။");
      setLoading(false);
      return;
    }

    if (!cleanEmail) {
      setError("Email ထည့်ပေးပါ။");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(
        "Password အနည်းဆုံး 6 လုံးရှိရပါမယ်။"
      );
      setLoading(false);
      return;
    }

    try {
      const {
        data,
        error: signUpError,
      } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: cleanName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        setSuccess(
          "Account ဖွင့်ပြီး Login ဝင်သွားပါပြီ။"
        );

        window.setTimeout(() => {
          router.push("/call");
          router.refresh();
        }, 800);

        return;
      }

      setSuccess(
        "Account ဖွင့်ပြီးပါပြီ။ Email ထဲက confirmation link ကိုနှိပ်ပြီး Login ဝင်ပါ။"
      );

      setName("");
      setEmail("");
      setPassword("");
    } catch (registerError) {
      console.error(
        "Registration error:",
        registerError
      );

      setError(
        registerError instanceof Error
          ? registerError.message
          : "Account ဖွင့်မရပါ။ ပြန်စမ်းကြည့်ပါ။"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-5 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-7 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <p className="text-5xl">🤖</p>

          <h1 className="mt-3 text-3xl font-bold">
            Create Anna-AI Account
          </h1>

          <p className="mt-2 text-sm text-white/60">
            Start your 3-day free trial
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="mt-8 space-y-4"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm text-white/70"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              autoComplete="name"
              placeholder="Your name"
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-purple-400"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-white/70"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-purple-400"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-white/70"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-purple-400"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-2xl border border-red-400/20 bg-red-500/20 px-4 py-3 text-sm text-red-100"
            >
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-2xl border border-green-400/20 bg-green-500/20 px-4 py-3 text-sm text-green-100">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-purple-600 px-5 py-3 font-bold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-purple-300 transition hover:text-purple-200"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}