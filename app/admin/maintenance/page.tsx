import Link from "next/link";
import { requireAdmin } from "../../../lib/admin-auth";
import { createSupabaseAdminClient } from "../../../lib/supabase/admin";
import { saveMaintenanceSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMaintenancePage() {
  await requireAdmin();

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("app_settings")
    .select(
      "maintenance_mode, maintenance_message, updated_at"
    )
    .eq("id", "global")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const enabled =
    Boolean(data?.maintenance_mode);

  const message =
    typeof data?.maintenance_message === "string"
      ? data.maintenance_message
      : "We're improving Anna AI. Please come back later. Thank you ❤️";

  return (
    <main className="min-h-screen bg-[#090014] px-5 py-8 text-white">
      <section className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-950 via-fuchsia-950/70 to-slate-950 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-fuchsia-300">
              Anna AI Admin
            </p>
            <h1 className="mt-2 text-3xl font-black">
              Server Maintenance
            </h1>
          </div>

          <Link
            href="/admin"
            className="w-fit rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-bold hover:bg-white/15"
          >
            ← Dashboard
          </Link>
        </div>

        <form
          action={saveMaintenanceSettings}
          className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 sm:p-8"
        >
          <div className="flex items-center justify-between gap-5 rounded-3xl border border-white/10 bg-black/20 p-5">
            <div>
              <p className="text-lg font-black">
                Maintenance Mode
              </p>
              <p className="mt-1 text-sm leading-6 text-white/55">
                ON လုပ်လိုက်ရင် admin မဟုတ်တဲ့ users အားလုံး
                maintenance page ကိုပဲ မြင်ရပါမယ်။
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="maintenanceMode"
                defaultChecked={enabled}
                className="peer sr-only"
              />
              <span className="h-8 w-14 rounded-full bg-white/15 transition peer-checked:bg-fuchsia-600" />
              <span className="absolute left-1 h-6 w-6 rounded-full bg-white shadow-md transition peer-checked:translate-x-6" />
            </label>
          </div>

          <label className="mt-6 block">
            <span className="mb-3 block font-black">
              Maintenance Message
            </span>

            <textarea
              name="message"
              defaultValue={message}
              rows={6}
              maxLength={500}
              className="w-full resize-y rounded-3xl border border-white/10 bg-black/25 px-5 py-4 text-lg leading-8 text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400"
            />
          </label>

          <div className="mt-6 rounded-3xl border border-fuchsia-300/15 bg-fuchsia-500/10 p-5">
            <p className="text-sm font-black uppercase tracking-wide text-fuchsia-200">
              User Preview
            </p>

            <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-6 text-center">
              <div className="text-5xl">🛠️</div>
              <p className="mt-4 font-black text-fuchsia-200">
                Anna AI
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Server Maintenance
              </h2>
              <p className="mt-4 whitespace-pre-line leading-7 text-white/75">
                {message}
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="mt-7 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-4 text-lg font-black transition hover:brightness-110"
          >
            Save Maintenance Settings
          </button>

          {data?.updated_at && (
            <p className="mt-4 text-center text-xs text-white/35">
              Last updated:{" "}
              {new Date(data.updated_at).toLocaleString()}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
