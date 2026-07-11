"use client";

import Link from "next/link";
import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    []
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanEmail) {
      setError("Email ထည့်ပေးပါ။");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Password ထည့်ပေးပါ။");
      setLoading(false);
      return;
    }

    try {
      const {
        data,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError) {
        const message =
          loginError.message.toLowerCase();

        if (
          message.includes(
            "email not confirmed"
          )
        ) {
          setError(
            "Email confirmation မပြီးသေးပါ။ Email ထဲက confirmation link ကိုနှိပ်ပါ။"
          );
        } else if (
          message.includes(
            "invalid login credentials"
          )
        ) {
          setError(
            "Email သို့မဟုတ် Password မှားနေပါတယ်။"
          );
        } else {
          setError(loginError.message);
        }

        return;
      }

      if (!data.session || !data.user) {
        setError(
          "Login session မရပါ။ ပြန်စမ်းကြည့်ပါ။"
        );

        return;
      }

      // Session ကို browser storage မှာသေချာသိမ်းစေဖို့
      await supabase.auth.setSession({
        access_token:
          data.session.access_token,
        refresh_token:
          data.session.refresh_token,
      });

      // Login success ဖြစ်တာနဲ့ /call ကိုတိုက်ရိုက်သွားမယ်
      window.location.href = "/call";
    } catch (loginError) {
      console.error(
        "Login error:",
        loginError
      );

      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login ဝင်မရပါ။ ပြန်စမ်းကြည့်ပါ။"
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
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-white/60">
            Login to continue talking with Anna
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-4"
        >
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
                setEmail(
                  event.target.value
                )
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
                setPassword(
                  event.target.value
                )
              }
              required
              autoComplete="current-password"
              placeholder="Your password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-purple-600 px-5 py-3 font-bold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/60">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-purple-300 transition hover:text-purple-200"
          >
            Create Account
          </Link>
        </p>

        <p className="mt-3 text-center text-xs text-white/40">
          Email confirmation လုပ်ပြီးမှ
          Login ဝင်နိုင်ပါတယ်။
        </p>
      </div>
    </main>
  );
}