import HskStoreGrid from "@/components/hsk/HskStoreGrid";
import { getUserHskAccess } from "@/lib/get-user-hsk-access";

export const dynamic = "force-dynamic";

export default async function HskStorePage() {
  const access = await getUserHskAccess();

  return (
    <main className="min-h-screen bg-[#080011] px-4 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
          Anna AI HSK Store
        </p>
        <h1 className="mt-2 text-4xl font-black">
          Learn Chinese Your Way
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-white/50">
          HSK 1 is free. Purchase individual paid levels or unlock HSK 2–9 with the Full Package.
        </p>

        <div className="mt-8">
          <HskStoreGrid
            unlockedLevels={[...access.levels]}
            fullPackage={access.fullPackage}
          />
        </div>
      </section>
    </main>
  );
}
