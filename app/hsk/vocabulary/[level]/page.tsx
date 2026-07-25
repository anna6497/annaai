import PurchaseRequired from "@/components/access/PurchaseRequired";
import { getServerHskAccess } from "@/lib/server-hsk-access";
import VocabularyClient from "./VocabularyClient";
import type { HskLevel } from "@/types/hsk-vocabulary";

interface Props {
  params: Promise<{ level: string }>;
}

function isHskLevel(value: number): value is HskLevel {
  return Number.isInteger(value) && value >= 1 && value <= 9;
}

export default async function VocabularyPage({ params }: Props) {
  const { level: levelText } = await params;
  const parsedLevel = Number(levelText);

  if (!isHskLevel(parsedLevel)) {
    return (
      <main className="min-h-screen bg-[#080011] px-4 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center">
          Invalid HSK level.
        </div>
      </main>
    );
  }

  const level: HskLevel = parsedLevel;
  const access = await getServerHskAccess(level);

  if (!access.allowed) {
    return <PurchaseRequired level={level} reason={access.reason} />;
  }

  return <VocabularyClient level={level} />;
}
