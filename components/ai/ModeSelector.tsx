"use client";

import type { AiPracticeMode } from "@/types/ai";

interface ModeSelectorProps {
  selectedMode: AiPracticeMode;
  disabled?: boolean;
  onSelectMode: (mode: AiPracticeMode) => void;
}

const OPTIONS: Array<{
  id: AiPracticeMode;
  icon: string;
  title: string;
  chineseTitle: string;
  description: string;
}> = [
  {
    id: "practice",
    icon: "🇨🇳",
    title: "Anna နဲ့ တရုတ်စကားလေ့ကျင့်မယ်",
    chineseTitle: "和 Anna 练习中文",
    description:
      "တရုတ်လို ပြောပြီး Anna နဲ့ အပြန်အလှန် လေ့ကျင့်ပါ။",
  },
  {
    id: "sentence_builder",
    icon: "🇲🇲",
    title: "မြန်မာမှ တရုတ်စာကြောင်းဖွဲ့မယ်",
    chineseTitle: "缅甸语转中文",
    description:
      "မြန်မာလို ရေးပါ။ Anna က Hanzi၊ Pinyin နဲ့ အဓိပ္ပာယ်ကို ပြပေးပါမယ်။",
  },
];

export default function ModeSelector({
  selectedMode,
  disabled = false,
  onSelectMode,
}: ModeSelectorProps) {
  return (
    <section aria-label="AI practice mode">
      <div className="grid gap-3 md:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected =
            selectedMode === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() =>
                onSelectMode(option.id)
              }
              aria-pressed={selected}
              className={[
                "relative overflow-hidden rounded-[24px] border p-4 text-left transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300",
                selected
                  ? "border-fuchsia-300/60 bg-gradient-to-br from-fuchsia-500/25 to-violet-500/15 shadow-[0_15px_45px_rgba(168,85,247,0.22)]"
                  : "border-white/10 bg-black/20 hover:border-purple-300/30 hover:bg-white/[0.06]",
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : "",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                  {option.icon}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-purple-200/55">
                    {option.chineseTitle}
                  </p>

                  <h2 className="mt-1 text-base font-black leading-6 text-white">
                    {option.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-purple-100/60">
                    {option.description}
                  </p>
                </div>

                <div
                  className={[
                    "ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-black",
                    selected
                      ? "border-fuchsia-200/60 bg-fuchsia-400 text-[#250331]"
                      : "border-white/15 bg-white/5 text-transparent",
                  ].join(" ")}
                >
                  ✓
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
