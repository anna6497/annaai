import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/payments", label: "Payments" },
    { href: "/admin/users", label: "Users & Access" },
  ];

  return (
    <div className="min-h-screen bg-[#07000f] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07000f]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300">
              Anna AI
            </p>
            <p className="mt-1 text-xl font-black">Admin Portal</p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-white/75 hover:border-fuchsia-400/50 hover:bg-fuchsia-500/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/50 hover:bg-white/10 hover:text-white"
            >
              Back to App
            </Link>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
