"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

function categoryIcon(
  category: string,
) {
  const normalized =
    category
      .trim()
      .toLowerCase();

  if (
    normalized.includes(
      "grammar",
    )
  ) {
    return "📝";
  }

  if (
    normalized.includes(
      "vocabulary",
    )
  ) {
    return "字";
  }

  if (
    normalized.includes(
      "hsk",
    )
  ) {
    return "📘";
  }

  if (
    normalized.includes(
      "speaking",
    )
  ) {
    return "🗣️";
  }

  if (
    normalized.includes(
      "worksheet",
    )
  ) {
    return "📄";
  }

  if (
    normalized.includes(
      "note",
    )
  ) {
    return "📚";
  }

  return "📖";
}

export default function PremiumLibraryPage() {
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
    error,
    setError,
  ] =
    useState("");

  const [
    openingId,
    setOpeningId,
  ] =
    useState<
      string | null
    >(null);

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<
      string | null
    >(null);

  const [
    hasPaidAccess,
    setHasPaidAccess,
  ] =
    useState(false);

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
            "/login?next=/library/premium",
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
                "Unable to load premium library.",
            );
          }

          setHasPaidAccess(
            Boolean(
              result.hasPaidAccess,
            ),
          );

          const paidItems =
            (
              result.items ??
              []
            ).filter(
              (
                item:
                  LibraryItem,
              ) =>
                item.accessType ===
                "paid",
            );

          setItems(
            paidItems,
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
              : "Unable to load premium library.",
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
      !hasPaidAccess ||
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

  const categories =
    Array.from(
      new Set(
        items.map(
          (item) =>
            item.category ||
            "Other",
        ),
      ),
    ).sort(
      (
        first,
        second,
      ) =>
        first.localeCompare(
          second,
        ),
    );

  const visibleItems =
    selectedCategory
      ? items.filter(
          (item) =>
            item.category ===
            selectedCategory,
        )
      : [];

  return (
    <main className="min-h-screen bg-[#09030f] px-4 pb-28 pt-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">
              Premium Library
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              For Paid User
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
              Premium Anna AI learning materials for paid members.
            </p>
          </div>

          <Link
            href="/library"
            className="flex h-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-bold text-white/65"
          >
            ← Library
          </Link>
        </header>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.035] p-12 text-center text-sm text-white/40">
            Loading premium resources...
          </div>
        ) : !hasPaidAccess ? (
          <section className="mt-10">
            <div className="relative overflow-hidden rounded-[30px] border border-fuchsia-400/20 bg-gradient-to-br from-[#35103c] via-[#17101c] to-[#09030f] p-7 text-center sm:p-10">
              <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-3xl" />

              <div className="relative">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[25px] border border-fuchsia-400/20 bg-fuchsia-500/10 text-4xl">
                  🔒
                </div>

                <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">
                  Premium Access
                </p>

                <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                  Paid Library Locked
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/45">
                  Purchase an Anna AI paid plan to unlock premium notes, worksheets and learning PDFs.
                </p>

                <Link
                  href="/app-account"
                  className="mx-auto mt-7 flex h-12 max-w-sm items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 text-sm font-black text-white"
                >
                  View My Access
                </Link>

                <Link
                  href="/dashboard/ai/pricing"
                  className="mx-auto mt-3 flex h-11 max-w-sm items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-xs font-bold text-white/60"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </section>
        ) : !selectedCategory ? (
          <section className="mt-10">
            <div className="rounded-[22px] border border-fuchsia-400/20 bg-fuchsia-500/10 px-5 py-4">
              <p className="text-sm font-black text-fuchsia-200">
                Premium Library Unlocked ✨
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                Your Anna AI paid access unlocks all premium library resources.
              </p>
            </div>

            <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-white/35">
              Categories
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Choose what you want to study
            </h2>

            {categories.length ===
            0 ? (
              <div className="mt-6 rounded-[26px] border border-dashed border-white/10 p-10 text-center text-sm text-white/40">
                No premium resources yet.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map(
                  (
                    category,
                  ) => {
                    const count =
                      items.filter(
                        (
                          item,
                        ) =>
                          item.category ===
                          category,
                      ).length;

                    return (
                      <button
                        key={
                          category
                        }
                        type="button"
                        onClick={() =>
                          setSelectedCategory(
                            category,
                          )
                        }
                        className="group rounded-[26px] border border-fuchsia-400/15 bg-gradient-to-br from-[#35103c] via-[#19101e] to-[#0c0910] p-5 text-left transition hover:-translate-y-1 hover:border-fuchsia-300/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-2xl">
                            {categoryIcon(
                              category,
                            )}
                          </div>

                          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-bold text-white/40">
                            {count} PDF
                            {count ===
                            1
                              ? ""
                              : "s"}
                          </span>
                        </div>

                        <p className="mt-5 text-lg font-black">
                          {
                            category
                          }
                        </p>

                        <p className="mt-2 text-xs text-white/40">
                          Premium resources
                        </p>

                        <div className="mt-5 text-sm font-black text-fuchsia-300">
                          View Resources →
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </section>
        ) : (
          <section className="mt-10">
            <button
              type="button"
              onClick={() =>
                setSelectedCategory(
                  null,
                )
              }
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/60"
            >
              ← Categories
            </button>

            <div className="mt-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">
                Premium Resources
              </p>

              <h2 className="mt-2 text-2xl font-black">
                {
                  selectedCategory
                }
              </h2>

              <p className="mt-2 text-sm text-white/35">
                {
                  visibleItems.length
                }{" "}
                PDF resource
                {visibleItems.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>

            {visibleItems.length ===
            0 ? (
              <div className="mt-6 rounded-[26px] border border-dashed border-white/10 p-10 text-center text-sm text-white/40">
                No premium PDFs in this category.
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map(
                  (
                    item,
                  ) => (
                    <PremiumLibraryCard
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
        )}
      </div>
    </main>
  );
}

function PremiumLibraryCard({
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
    <article className="overflow-hidden rounded-[26px] border border-fuchsia-400/15 bg-white/[0.045]">
      <div className="relative aspect-[3/4] bg-gradient-to-br from-fuchsia-950/70 to-[#100b14]">
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
            👑
          </div>
        )}

        <div className="absolute right-3 top-3 rounded-xl border border-fuchsia-300/20 bg-black/50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-fuchsia-200 backdrop-blur-md">
          Premium
        </div>
      </div>

      <div className="p-5">
        <div className="flex gap-2">
          <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-[9px] font-black uppercase text-white/50">
            {
              item.category
            }
          </span>

          <span className="rounded-lg bg-fuchsia-500/15 px-2 py-1 text-[9px] font-black uppercase text-fuchsia-200">
            PAID
          </span>
        </div>

        <h3 className="mt-3 text-lg font-black">
          {item.title}
        </h3>

        {item.description ? (
          <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/45">
            {
              item.description
            }
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 text-[10px] text-white/35">
          <span className="truncate">
            {item.fileName ||
              "PDF"}
          </span>

          <span className="shrink-0">
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
          className="mt-5 flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 text-sm font-black text-white disabled:opacity-50"
        >
          {opening
            ? "Opening..."
            : "Open Premium PDF"}
        </button>
      </div>
    </article>
  );
}