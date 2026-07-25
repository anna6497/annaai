import Link from "next/link";
import { formatMmk } from "@/lib/hsk-products";
import type { HskProduct } from "@/types/access";

export default function HskProductCard({ product, unlocked }: { product: HskProduct; unlocked: boolean }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Lifetime Access</p>
          <h2 className="mt-3 text-2xl font-black">{product.name}</h2>
          <p className="mt-2 text-sm text-white/50">{product.description}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xl">{unlocked ? "✅" : product.isFree ? "🎁" : "🔒"}</div>
      </div>
      <div className="mt-6">
        {product.originalPriceMmk ? <p className="text-sm text-white/35 line-through">{formatMmk(product.originalPriceMmk)}</p> : null}
        <p className="mt-1 text-3xl font-black text-emerald-200">{product.isFree ? "FREE" : formatMmk(product.priceMmk)}</p>
      </div>
      <Link href={unlocked ? "/hsk" : `/payment?hsk=${encodeURIComponent(product.code)}`} className={`mt-6 block rounded-2xl px-5 py-3 text-center font-black transition ${unlocked ? "bg-emerald-600 hover:bg-emerald-500" : "bg-fuchsia-600 hover:bg-fuchsia-500"}`}>
        {unlocked ? "Open Learning" : product.isFree ? "Start Free" : "Buy Access"}
      </Link>
    </article>
  );
}
