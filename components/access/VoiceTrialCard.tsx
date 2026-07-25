"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ensureVoiceTrial } from "@/lib/voice-trial";
import type { VoiceTrialStatus } from "@/types/access";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function VoiceTrialCard() {
  const [status, setStatus] = useState<VoiceTrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    ensureVoiceTrial()
      .then((result) => active && setStatus(result))
      .catch((error) => active && setMessage(error instanceof Error ? error.message : "Trial status load failed."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <section className="rounded-[2rem] border border-purple-300/15 bg-gradient-to-br from-purple-950/90 via-violet-950/80 to-slate-950 p-7">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-300">AI Speaking</p>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black">Coming Soon</h2>
          <p className="mt-3 max-w-xl leading-7 text-white/55">New users can try AI Speaking for 1 day, up to 5 minutes total.</p>
        </div>
        <div className="text-5xl">🎙️</div>
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
        {loading ? <p className="text-white/50">Loading trial...</p> : message ? <p className="text-red-200">{message}</p> : status ? <>
          <p className="text-sm text-white/45">Trial remaining</p>
          <p className="mt-2 text-3xl font-black text-purple-200">{formatTime(status.secondsRemaining)}</p>
          <p className="mt-2 text-sm text-white/45">{status.expired ? "Trial expired" : status.exhausted ? "5-minute limit reached" : "Available now"}</p>
        </> : null}
      </div>
      <Link href="/call" className={`mt-6 block rounded-2xl px-5 py-3 text-center font-black transition ${status?.available ? "bg-purple-600 hover:bg-purple-500" : "pointer-events-none bg-white/10 text-white/35"}`}>
        {status?.available ? "Try AI Speaking" : "Coming Soon"}
      </Link>
    </section>
  );
}
