"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useState,
} from "react";

type LoginApiResponse = {
  ok?: boolean;
  error?: string;

  user?: {
    id?: string;
    email?: string;
  };
};

function getSafeNextPath(
  requestedNext: string | null,
): string {
  if (
    requestedNext?.startsWith("/") &&
    !requestedNext.startsWith("//")
  ) {
    return requestedNext;
  }

  return "/dashboard";
}

function LoginForm() {
  const searchParams = useSearchParams();

  const nextPath = getSafeNextPath(
    searchParams.get("next"),
  );

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  async function login(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (
      !normalizedEmail ||
      !password
    ) {
      setMessage(
        "Email နဲ့ Password ဖြည့်ပေးပါ။",
      );

      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "same-origin",

          cache: "no-store",

          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
        },
      );

      let result: LoginApiResponse = {};

      try {
        result =
          (await response.json()) as LoginApiResponse;
      } catch {
        result = {};
      }

      if (
        !response.ok ||
        !result.ok
      ) {
        setMessage(
          result.error ||
            "Login မဝင်နိုင်ပါ။ ပြန်စမ်းပေးပါ။",
        );

        return;
      }

      /*
       * Login API uses the server-side
       * Supabase client.
       *
       * Supabase auth cookies are written
       * by the server response.
       *
       * A full navigation ensures the next
       * server-rendered page sees the new
       * authentication cookies.
       */
      window.location.replace(
        nextPath,
      );
    } catch (error) {
      console.error(
        "Login request error:",
        error,
      );

      setMessage(
        "Server ကို ဆက်သွယ်မရပါ။ Internet connection စစ်ပြီး ပြန်စမ်းပေးပါ။",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 px-5 py-12 text-white">
      <section className="w-full max-w-xl rounded-[42px] border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-2xl sm:p-12">
        <div className="text-center">
          <div className="text-6xl">
            🤖
          </div>

          <h1 className="mt-5 text-5xl font-extrabold">
            Welcome Back
          </h1>

          <p className="mt-4 text-lg text-white/60">
            Login to continue learning
            with Anna
          </p>
        </div>

        <form
          onSubmit={login}
          className="mt-10 space-y-6"
        >
          <label className="block">
            <span className="mb-3 block text-lg text-white/70">
              Email
            </span>

            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="you@example.com"
              disabled={submitting}
              className="w-full rounded-3xl border border-white/10 bg-black/25 px-6 py-5 text-lg outline-none transition focus:border-purple-300/50 focus:ring-2 focus:ring-purple-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-3 block text-lg text-white/70">
              Password
            </span>

            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="Your password"
              disabled={submitting}
              className="w-full rounded-3xl border border-white/10 bg-black/25 px-6 py-5 text-lg outline-none transition focus:border-purple-300/50 focus:ring-2 focus:ring-purple-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          {message && (
            <p
              role="alert"
              className="rounded-2xl border border-red-300/20 bg-red-500/15 px-4 py-3 text-sm leading-6 text-red-100"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-3xl bg-fuchsia-600 px-6 py-5 text-xl font-bold transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Logging in…"
              : "Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-white/60">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(
              nextPath,
            )}`}
            className="font-bold text-purple-200 hover:text-purple-100"
          >
            Create Account
          </Link>
        </p>
      </section>
    </main>
  );
}

function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-purple-400" />

        <p className="mt-4 text-white/60">
          Loading…
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<LoginLoading />}
    >
      <LoginForm />
    </Suspense>
  );
}