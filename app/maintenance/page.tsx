import { createSupabaseAdminClient } from "../../lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("app_settings")
    .select("maintenance_message")
    .eq("id", "global")
    .maybeSingle();

  const message =
    typeof data?.maintenance_message === "string" &&
    data.maintenance_message.trim()
      ? data.maintenance_message.trim()
      : "We're improving Anna AI. Please come back later. Thank you ❤️";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#090014] via-[#24003d] to-[#6f00a8] px-5 py-12 text-white">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
        <div className="text-7xl">🛠️</div>

        <p className="mt-6 text-sm font-black uppercase tracking-[0.28em] text-fuchsia-300">
          Anna AI
        </p>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          Server Maintenance
        </h1>

        <div className="mx-auto mt-7 h-px max-w-xs bg-white/15" />

        <p className="mt-7 whitespace-pre-line text-lg font-semibold leading-8 text-white/85">
          {message}
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm leading-6 text-white/60">
          Anna AI ကို ပိုကောင်းအောင် ပြင်ဆင်နေပါတယ်။
          ခဏနေရင် ပြန်ဝင်ကြည့်ပေးပါနော်။
        </div>
      </section>
    </main>
  );
}
