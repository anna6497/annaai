"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState("Anna Learner");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          window.location.replace("/login?next=/dashboard");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("name,email")
          .eq("id", user.id)
          .maybeSingle();

        if (!active) {
          return;
        }

        const profileName =
          typeof profile?.name === "string" &&
          profile.name.trim().length > 0
            ? profile.name.trim()
            : "Anna Learner";

        const profileEmail =
          typeof profile?.email === "string" &&
          profile.email.trim().length > 0
            ? profile.email.trim()
            : user.email ?? "";

        setName(profileName);
        setEmail(profileEmail);
      } catch (error) {
        console.error("Failed to load dashboard user:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [supabase]);

  async function logout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await supabase.auth.signOut();
      window.location.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090014] px-4 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-purple-400" />

          <p className="mt-4 text-sm font-semibold text-white/60">
            Dashboard loading...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090014] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-black transition hover:text-purple-300"
          >
            🤖 Anna-AI
          </Link>

          <button
            type="button"
            onClick={() => void logout()}
            disabled={loggingOut}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </header>

        <section className="py-12">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-300">
            Learning Dashboard
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
            မင်္ဂလာပါ {name}
          </h1>

          {email && (
            <p className="mt-3 break-all text-white/50">
              {email}
            </p>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-[2rem] border border-purple-300/20 bg-gradient-to-br from-purple-950 via-violet-950 to-slate-950 p-7 shadow-2xl shadow-purple-950/30">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-300">
                    AI Speaking
                  </p>

                  <h2 className="mt-4 text-3xl font-black">
                    Anna AI Speaking
                  </h2>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl shadow-lg">
                  🎙️
                </div>
              </div>

              <p className="mt-4 max-w-lg leading-7 text-white/55">
                Practice natural Chinese conversation with Anna using
                voice, Hanzi, Pinyin and Myanmar translation.
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-white/45">
                  AI Speaking Features
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <FeatureItem
                    icon="🇨🇳"
                    label="Hanzi"
                  />

                  <FeatureItem
                    icon="📝"
                    label="Pinyin"
                  />

                  <FeatureItem
                    icon="🇲🇲"
                    label="Myanmar"
                  />
                </div>
              </div>

              <Link
                href="/dashboard/ai"
                className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-600 px-5 py-3 font-black text-white shadow-lg shadow-purple-950/40 transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
              >
                <span>🎤</span>
                <span>Start Speaking</span>
                <span>→</span>
              </Link>
            </div>
          </article>

          <Link
            href="/hsk"
            className="group relative overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-950/80 via-teal-950/70 to-slate-950 p-7 shadow-2xl shadow-emerald-950/20 transition hover:-translate-y-1 hover:border-emerald-300/25"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
                    HSK Learning
                  </p>

                  <h2 className="mt-4 text-3xl font-black">
                    Flashcards + Writing
                  </h2>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl">
                  📚
                </div>
              </div>

              <p className="mt-4 max-w-lg leading-7 text-white/55">
                HSK 1 is free. Unlock HSK 2–9 individually or buy
                the full lifetime package.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <FeatureItem
                  icon="🃏"
                  label="Flashcards"
                />

                <FeatureItem
                  icon="✍️"
                  label="Writing"
                />
              </div>

              <div className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 font-black transition group-hover:bg-emerald-500">
                Open HSK →
              </div>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}

interface FeatureItemProps {
  icon: string;
  label: string;
}

function FeatureItem({
  icon,
  label,
}: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
      <span className="text-xl">{icon}</span>

      <span className="text-sm font-bold text-white/80">
        {label}
      </span>
    </div>
  );
}