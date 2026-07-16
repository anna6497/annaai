import Link from "next/link";

export default function MaintenanceLink() {
  return (
    <Link
      href="/admin/maintenance"
      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15"
    >
      🛠️ Server Maintenance
    </Link>
  );
}
