"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  createClient,
} from "@/lib/supabase/client";

type LibraryItem = {
  id: string;
  title: string;
  description:
    | string
    | null;
  category: string;
  accessType:
    | "free"
    | "paid";
  coverUrl:
    | string
    | null;
  fileName:
    | string
    | null;
  fileSizeBytes:
    | number
    | null;
  locked: boolean;
  createdAt: string;
};

function formatFileSize(
  bytes:
    | number
    | null,
) {
  if (
    !bytes ||
    bytes <= 0
  ) {
    return "";
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

export default function LibraryPage() {
  const supabase =
    useMemo(
      () =>
        createClient(),
      [],
    );

  const [
    items,
    setItems,
  ] =
    useState<
      LibraryItem[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    openingId,
    setOpeningId,
  ] =
    useState<
      string | null
    >(null);

  const [
    hasPaidAccess,
    setHasPaidAccess,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const getToken =
    useCallback(
      async () => {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (!session) {
          window.location.replace(
            "/login?next=/library",
          );

          throw new Error(
            "Login required.",
          );
        }

        return session.access_token;
      },
      [supabase],
    );

  const loadLibrary =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const token =
            await getToken();

          const response =
            await fetch(
              "/api/library",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },

                cache:
                  "no-store",
              },
            );

          const result =
            await response.json();

          if (
            !response.ok
          ) {
            throw new Error(
              result.error ||
                "Unable to load library.",
            );
          }

          setItems(
            result.items ??
              [],
          );

          setHasPaidAccess(
            Boolean(
              result.hasPaidAccess,
            ),
          );
        } catch (
          loadError
        ) {
          if (
            loadError instanceof
              Error &&
            loadError.message ===
              "Login required."
          ) {
            return;
          }

          setError(
            loadError instanceof
            Error
              ? loadError.message
              : "Unable to load library.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [getToken],
    );

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  async function openPdf(
    item: LibraryItem,
  ) {
    if (
      item.locked
    ) {
      window.location.href =
        "/app-account";
      return;
    }

    if (
      openingId
    ) {
      return;
    }

    setOpeningId(
      item.id,
    );

    setError("");

    try {
      const token =
        await getToken();

      const response =
        await fetch(
          `/api/library/download?id=${encodeURIComponent(
            item.id,
          )}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            cache:
              "no-store",
          },
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result.error ||
            "Unable to open PDF.",
        );
      }

      window.open(
        result.url,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (
      openError
    ) {
      setError(
        openError instanceof
        Error
          ? openError.message
          : "Unable to open PDF.",
      );
    } finally {
      setOpeningId(
        null,
      );
    }
  }

  const freeItems =
    items.filter(
      (item) =>
        item.accessType ===
        "free",
    );

  const paidItems =
    items.filter(
      (item) =>
        item.accessType ===
        "paid",
    );

  return (
    <main className="min-h-screen bg-[#09030f] px-4 pb-28 pt-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">
              Anna AI
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Anna&apos;s Library
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
              Chinese learning notes, worksheets and PDF resources for Anna AI learners.
            </p>
          </div>

          <Link
            href="/app-home"
            className="flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-bold text-white/70"
          >
            ← Home
          </Link>
        </header>

        {hasPaidAccess ? (
          <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-3">
            <p className="text-sm font-black text-fuchsia-200">
              Premium Library Unlocked ✨
            </p>

            <p className="mt-1 text-xs text-white/45">
              Your paid Anna AI access unlocks premium resources.
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.035] p-12 text-center text-sm text-white/40">
            Loading Anna&apos;s Library...
          </div>
        ) : (
          <>
            <section className="mt-10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
                  Free Resources
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Learn for Free
                </h2>
              </div>

              {freeItems.length ===
              0 ? (
                <div className="mt-5 rounded-[24px] border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
                  Free PDFs will appear here.
                </div>
              ) : (
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {freeItems.map(
                    (
                      item,
                    ) => (
                      <LibraryCard
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                        opening={
                          openingId ===
                          item.id
                        }
                        onOpen={
                          openPdf
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </section>

            <section className="mt-12">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">
                  Premium Resources
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Paid Member Library
                </h2>

                {!hasPaidAccess ? (
                  <p className="mt-2 text-sm text-white/45">
                    Unlock any Anna AI paid plan to access premium PDFs.
                  </p>
                ) : null}
              </div>

              {paidItems.length ===
              0 ? (
                <div className="mt-5 rounded-[24px] border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
                  Premium PDFs will appear here.
                </div>
              ) : (
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {paidItems.map(
                    (
                      item,
                    ) => (
                      <LibraryCard
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                        opening={
                          openingId ===
                          item.id
                        }
                        onOpen={
                          openPdf
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function LibraryCard({
  item,
  opening,
  onOpen,
}: {
  item: LibraryItem;
  opening: boolean;
  onOpen: (
    item: LibraryItem,
  ) => Promise<void>;
}) {
  return (
    <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.045]">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-fuchsia-950/70 to-violet-950/40">
        {item.coverUrl ? (
          <img
            src={
              item.coverUrl
            }
            alt={
              item.title
            }
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            📚
          </div>
        )}

        {item.locked ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
            <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-center">
              <div className="text-2xl">
                🔒
              </div>

              <p className="mt-1 text-xs font-black">
                Premium
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-[9px] font-black uppercase text-white/50">
            {item.category}
          </span>

          <span
            className={[
              "rounded-lg px-2 py-1 text-[9px] font-black uppercase",
              item.accessType ===
              "paid"
                ? "bg-fuchsia-500/15 text-fuchsia-200"
                : "bg-green-500/15 text-green-200",
            ].join(
              " ",
            )}
          >
            {item.accessType}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-black">
          {item.title}
        </h3>

        {item.description ? (
          <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/45">
            {item.description}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between text-[10px] text-white/35">
          <span className="truncate">
            {item.fileName ||
              "PDF"}
          </span>

          <span>
            {formatFileSize(
              item.fileSizeBytes,
            )}
          </span>
        </div>

        <button
          type="button"
          disabled={
            opening
          }
          onClick={() =>
            void onOpen(
              item,
            )
          }
          className={[
            "mt-5 flex h-11 w-full items-center justify-center rounded-2xl text-sm font-black transition disabled:opacity-50",
            item.locked
              ? "border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200"
              : "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white",
          ].join(
            " ",
          )}
        >
          {opening
            ? "Opening..."
            : item.locked
              ? "Unlock Premium"
              : "Open PDF"}
        </button>
      </div>
    </article>
  );
}