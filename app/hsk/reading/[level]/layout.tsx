import PurchaseRequired from "@/components/access/PurchaseRequired";
import { getServerHskAccess } from "@/lib/server-hsk-access";

import type {
  HskLevel,
} from "@/types/hsk-vocabulary";

interface ReadingLevelLayoutProps {
  children: React.ReactNode;

  params: Promise<{
    level: string;
  }>;
}

function isHskLevel(
  value: number,
): value is HskLevel {
  return (
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 9
  );
}

export default async function ReadingLevelLayout({
  children,
  params,
}: ReadingLevelLayoutProps) {
  const {
    level: levelText,
  } = await params;

  const parsedLevel =
    Number(levelText);

  if (
    !isHskLevel(
      parsedLevel,
    )
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080011] px-4 text-white">
        <section className="w-full max-w-xl rounded-[2rem] border border-red-400/20 bg-red-500/10 p-8 text-center">
          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Invalid HSK Level
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/55">
            HSK level must be
            between 1 and 9.
          </p>
        </section>
      </main>
    );
  }

  const level: HskLevel =
    parsedLevel;

  const access =
    await getServerHskAccess(
      level,
    );

  if (!access.allowed) {
    const reason =
      access.reason ===
      "authenticated"
        ? `Please sign in and purchase HSK ${level} lifetime access, or unlock all paid levels with the HSK 2–9 Full Package.`
        : `Purchase HSK ${level} lifetime access or unlock all paid levels with the HSK 2–9 Full Package.`;

    return (
      <PurchaseRequired
        level={level}
        reason={reason}
      />
    );
  }

  return <>{children}</>;
}