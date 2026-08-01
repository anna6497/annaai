import UserAccessManager from "@/components/admin/UserAccessManager";
import { getAdminUsers } from "@/lib/admin-portal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminUsersPage() {
  try {
    const users = await getAdminUsers();

    return (
      <main className="px-4 py-8 sm:px-7 lg:px-10">
        <section className="mx-auto max-w-[1500px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
              Access Management
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Users & Lifetime Access
            </h1>

            <p className="mt-2 text-white/50">
              User search, paid status နှင့် HSK lifetime permission ကို
              manage လုပ်နိုင်ပါတယ်။
            </p>
          </div>

          <div className="mt-6">
            <UserAccessManager users={users} />
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error("ADMIN_USERS_PAGE_ERROR:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error while loading admin users.";

    return (
      <main className="px-4 py-8 sm:px-7 lg:px-10">
        <section className="mx-auto max-w-[1100px]">
          <div className="rounded-[2rem] border border-rose-300/20 bg-rose-400/[0.06] p-6">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-rose-300">
              Admin Users Error
            </p>

            <h1 className="mt-2 text-3xl font-black text-white">
              Users could not be loaded
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/55">
              Admin users database query failed. The detailed error is
              displayed below.
            </p>

            <div className="mt-5 rounded-2xl border border-rose-300/15 bg-black/20 p-4">
              <p className="break-words font-mono text-sm text-rose-100">
                {errorMessage}
              </p>
            </div>

            <a
              href="/admin/users"
              className="mt-5 inline-flex rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-500"
            >
              Try Again
            </a>
          </div>
        </section>
      </main>
    );
  }
}