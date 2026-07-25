import PurchaseRequired from "@/components/access/PurchaseRequired";
import { getServerHskAccess } from "@/lib/server-hsk-access";
import type { HskLevel } from "@/types/hsk-vocabulary";

import WritingClient from "./WritingClient";

interface Props {
  params: Promise<{
    level: string;
  }>;
}

function isHskLevel(value: number): value is HskLevel {
  return (
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 9
  );
}

export default async function WritingPage({
  params,
}: Props) {
  const { level: levelText } = await params;
  const parsedLevel = Number(levelText);

  if (!isHskLevel(parsedLevel)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080011] px-4 text-white">
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-2xl font-black">
            Invalid HSK level
          </h1>

          <p className="mt-3 text-white/60">
            HSK level must be between 1 and 9.
          </p>
        </div>
      </main>
    );
  }

  const level: HskLevel = parsedLevel;
  const access = await getServerHskAccess(level);

  if (!access.allowed) {
    return (
      <PurchaseRequired
        level={level}
        reason={access.reason}
      />
    );
  }

  return <WritingClient level={level} />;
}