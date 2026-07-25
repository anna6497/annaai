import Link from "next/link";

import PaymentForm from "@/components/payment/PaymentForm";
import { formatMmk, getPaymentProduct } from "@/lib/payment-products";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string;
    hsk?: string;
  }>;
}) {
  const params = await searchParams;

  // New store links use ?product=...
  // Keep ?hsk=... as a fallback for older links.
  const productCode = params.product ?? params.hsk ?? null;
  const product = getPaymentProduct(productCode);

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080011] px-4 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-2xl font-black">Product not found</h1>
          <p className="mt-3 text-white/50">
            Please return to the store and choose a package again.
          </p>
          <Link
            href="/hsk/store"
            className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-6 py-4 font-bold hover:bg-emerald-500"
          >
            Open Store
          </Link>
        </div>
      </main>
    );
  }

  const discount = product.originalPriceMmk
    ? Math.round(
        ((product.originalPriceMmk - product.priceMmk) /
          product.originalPriceMmk) *
          100,
      )
    : 0;

  return (
    <main className="min-h-screen bg-[#080011] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap justify-between gap-3">
          <Link
            href="/hsk/store"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
          >
            ← Store
          </Link>

          <Link
            href="/dashboard/payments"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
          >
            My Payments
          </Link>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="h-fit rounded-[2rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-950 via-slate-950 to-purple-950 p-7 lg:sticky lg:top-6">
            <p className="text-sm font-black text-emerald-300">
              LIFETIME ACCESS
            </p>

            <h1 className="mt-4 text-3xl font-black">{product.title}</h1>

            <p className="mt-4 leading-7 text-white/55">
              {product.description}
            </p>

            {product.originalPriceMmk ? (
              <p className="mt-7 text-xl text-white/35 line-through">
                {formatMmk(product.originalPriceMmk)}
              </p>
            ) : null}

            <p className="mt-2 text-4xl font-black">
              {formatMmk(product.priceMmk)}
            </p>

            {discount > 0 ? (
              <span className="mt-4 inline-flex rounded-full bg-red-500 px-4 py-2 font-black">
                SAVE {discount}%
              </span>
            ) : null}

            <p className="mt-7 rounded-2xl bg-black/20 p-4 text-sm leading-6 text-white/55">
              QR ကို scan လုပ်ပြီး ငွေလွှဲပါ။ ပြီးရင် payment slip ကို upload
              လုပ်ပြီး submit လုပ်ပါ။
            </p>
          </aside>

          <section>
            <h2 className="text-2xl font-black">Choose Payment Method</h2>
            <p className="mt-2 text-white/50">
              KBZPay သို့မဟုတ် PromptPay ဖြင့် တိုက်ရိုက်ငွေပေးချေနိုင်ပါတယ်။
            </p>

            <div className="mt-6">
              <PaymentForm product={product} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
