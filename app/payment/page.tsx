import Link from "next/link";
import PaymentForm from "@/components/payment/PaymentForm";
import { formatMmk, getPaymentProduct } from "@/lib/payment-products";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ hsk?: string }>;
}) {
  const params = await searchParams;
  const product = getPaymentProduct(params.hsk ?? null);

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080011] text-white">
        <Link href="/hsk/store" className="rounded-2xl bg-emerald-600 px-6 py-4 font-bold">
          Product not found — Open Store
        </Link>
      </main>
    );
  }

  const discount = product.originalPriceMmk
    ? Math.round(((product.originalPriceMmk - product.priceMmk) / product.originalPriceMmk) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-[#080011] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex justify-between">
          <Link href="/hsk/store" className="rounded-full border border-white/10 bg-white/5 px-4 py-2">← Store</Link>
          <Link href="/dashboard/payments" className="rounded-full border border-white/10 bg-white/5 px-4 py-2">My Payments</Link>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="h-fit rounded-[2rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-950 via-slate-950 to-purple-950 p-7">
            <p className="text-sm font-black text-emerald-300">LIFETIME ACCESS</p>
            <h1 className="mt-4 text-3xl font-black">{product.title}</h1>
            <p className="mt-4 text-white/55">{product.description}</p>
            {product.originalPriceMmk ? (
              <p className="mt-7 text-xl text-white/35 line-through">{formatMmk(product.originalPriceMmk)}</p>
            ) : null}
            <p className="mt-2 text-4xl font-black">{formatMmk(product.priceMmk)}</p>
            {discount > 0 ? <span className="mt-4 inline-flex rounded-full bg-red-500 px-4 py-2 font-black">SAVE {discount}%</span> : null}
            <p className="mt-7 rounded-2xl bg-black/20 p-4 text-sm text-white/50">
              Pay with KPay or QR Pay, then upload your payment slip.
            </p>
          </aside>

          <section>
            <h2 className="text-2xl font-black">Choose Payment Method</h2>
            <p className="mt-2 text-white/50">Only KPay and QR Pay are accepted.</p>
            <div className="mt-6"><PaymentForm product={product} /></div>
          </section>
        </div>
      </div>
    </main>
  );
}
