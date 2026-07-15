"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ChatBox, { type ConversationStatus } from "../../components/ChatBox";
import { createClient } from "../../lib/supabase/client";

interface Props { email: string; }
const STATUS: Record<ConversationStatus, string> = {
  ready: "Anna is ready",
  listening: "Anna is listening",
  thinking: "Anna is thinking",
  speaking: "Anna is speaking",
};

export default function CallClient({ email }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<ConversationStatus>("ready");
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally { setLoggingOut(false); }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="text-2xl font-bold">← Anna-AI</Link>
        <button onClick={() => void logout()} disabled={loggingOut} className="rounded-full bg-white/10 px-5 py-3 font-semibold disabled:opacity-50">
          {loggingOut ? "Logging out…" : "Logout"}
        </button>
      </header>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-12 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-[36px] border border-white/10 bg-white/10 p-7 backdrop-blur-xl">
          <div className="text-center">
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-purple-400/20 text-7xl">👧🏻</div>
            <h1 className="mt-6 text-5xl font-extrabold">Anna</h1>
            <p className="mt-2 text-xl text-purple-200">Your Chinese AI Friend</p>
            <div className="mt-7 inline-flex items-center gap-3 rounded-full bg-black/25 px-5 py-3 font-bold">
              <span className="h-3 w-3 rounded-full bg-green-400" />{STATUS[status]}
            </div>
            {email && <p className="mt-5 break-all text-sm text-white/50">{email}</p>}
          </div>
          <Link href="/pricing" className="mt-8 block rounded-2xl border border-white/15 px-5 py-4 text-center text-lg font-bold">View Plans</Link>
        </aside>
        <section className="rounded-[36px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-8">
          <ChatBox onStatusChange={setStatus} />
        </section>
      </section>
    </main>
  );
}
