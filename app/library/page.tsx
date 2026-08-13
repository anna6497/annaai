"use client";

import Link from "next/link";

export default function LibraryPage() {
  return (
    <main className="min-h-screen bg-[#09030f] px-4 pb-28 pt-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <header>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">
            ANNA&apos;S LIBRARY
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Anna AI Library
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
            Choose your library to explore Chinese learning
            notes, grammar guides, worksheets and PDF resources.
          </p>
        </header>

        {/* LIBRARY TYPE */}
        <section className="mt-9">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
            CHOOSE LIBRARY
          </p>

          <h2 className="mt-2 text-xl font-black">
            What would you like to study?
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {/* FREE USER */}
            <Link
              href="/library/free"
              className="
                group
                relative
                overflow-hidden
                rounded-[30px]
                border
                border-emerald-400/20
                bg-gradient-to-br
                from-[#123128]
                via-[#0d1d19]
                to-[#0b0b10]
                p-6
                transition
                duration-300
                hover:-translate-y-1
                hover:border-emerald-300/40
              "
            >
              <div
                className="
                  absolute
                  -right-12
                  -top-12
                  h-40
                  w-40
                  rounded-full
                  bg-emerald-500/10
                  blur-3xl
                "
              />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-[22px]
                      border
                      border-emerald-400/20
                      bg-emerald-400/10
                      text-3xl
                    "
                  >
                    📚
                  </div>

                  <span
                    className="
                      rounded-full
                      border
                      border-emerald-400/20
                      bg-emerald-400/10
                      px-3
                      py-1.5
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.16em]
                      text-emerald-300
                    "
                  >
                    FREE
                  </span>
                </div>

                <p
                  className="
                    mt-7
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-emerald-300
                  "
                >
                  FREE RESOURCES
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  For Free User
                </h2>

                <p className="mt-3 min-h-[48px] text-sm leading-6 text-white/45">
                  Explore free Chinese grammar, vocabulary,
                  study notes and learning resources.
                </p>

                <div
                  className="
                    mt-7
                    flex
                    h-12
                    items-center
                    justify-between
                    rounded-2xl
                    bg-emerald-500
                    px-5
                    text-sm
                    font-black
                    text-white
                  "
                >
                  <span>
                    Browse Free Library
                  </span>

                  <span className="text-lg">
                    →
                  </span>
                </div>
              </div>
            </Link>

            {/* PAID USER */}
            <Link
              href="/library/premium"
              className="
                group
                relative
                overflow-hidden
                rounded-[30px]
                border
                border-fuchsia-400/20
                bg-gradient-to-br
                from-[#35103c]
                via-[#1b0c20]
                to-[#0b0710]
                p-6
                transition
                duration-300
                hover:-translate-y-1
                hover:border-fuchsia-300/40
              "
            >
              <div
                className="
                  absolute
                  -right-12
                  -top-12
                  h-40
                  w-40
                  rounded-full
                  bg-fuchsia-500/10
                  blur-3xl
                "
              />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-[22px]
                      border
                      border-fuchsia-400/20
                      bg-fuchsia-400/10
                      text-3xl
                    "
                  >
                    👑
                  </div>

                  <span
                    className="
                      rounded-full
                      border
                      border-fuchsia-400/20
                      bg-fuchsia-400/10
                      px-3
                      py-1.5
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.16em]
                      text-fuchsia-300
                    "
                  >
                    PREMIUM
                  </span>
                </div>

                <p
                  className="
                    mt-7
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-fuchsia-300
                  "
                >
                  PREMIUM RESOURCES
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  For Paid User
                </h2>

                <p className="mt-3 min-h-[48px] text-sm leading-6 text-white/45">
                  Access premium Anna AI notes, worksheets,
                  guides and exclusive learning PDFs.
                </p>

                <div
                  className="
                    mt-7
                    flex
                    h-12
                    items-center
                    justify-between
                    rounded-2xl
                    bg-gradient-to-r
                    from-fuchsia-600
                    to-violet-600
                    px-5
                    text-sm
                    font-black
                    text-white
                  "
                >
                  <span>
                    Browse Premium Library
                  </span>

                  <span className="text-lg">
                    →
                  </span>
                </div>
              </div>
            </Link>

          </div>
        </section>

        {/* INFO */}
        <section
          className="
            mt-6
            rounded-[22px]
            border
            border-white/[0.07]
            bg-white/[0.025]
            px-5
            py-4
          "
        >
          <div className="flex gap-3">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-white/[0.05]
                text-base
              "
            >
              💡
            </div>

            <div>
              <p className="text-xs font-black text-white/70">
                Anna&apos;s Learning Library
              </p>

              <p className="mt-1 text-[11px] leading-5 text-white/35">
                Free resources are available to Anna AI users.
                Premium resources require eligible paid access.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}