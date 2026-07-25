import UserAccessManager from "@/components/admin/UserAccessManager";
import { getAdminUsers } from "@/lib/admin-portal";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
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
            User search, paid status နှင့် HSK lifetime permission ကို manage
            လုပ်နိုင်ပါတယ်။
          </p>
        </div>

        <div className="mt-6">
          <UserAccessManager users={users} />
        </div>
      </section>
    </main>
  );
}
