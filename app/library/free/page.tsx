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

export default function FreeLibraryPage() {
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
            "/login?next=/library/free",
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

          const freeItems =
            (
              result.items ??
              []
            ).filter(
              (
                item:
                  LibraryItem,
              ) =>
                item.accessType ===
                "free",
            );

          setItems(
            freeItems,
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
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
              Free Library
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              For Free User
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
              Choose a category to explore free Chinese learning PDFs.
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
            Loading free resources...
          </div>
        ) : (
          <>
            {!selectedCategory ? (
              <section className="mt-10">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                  Categories
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Choose what you want to study
                </h2>

                {categories.length ===
                0 ? (
                  <div className="mt-6 rounded-[26px] border border-dashed border-white/10 p-10 text-center text-sm text-white/40">
                    No free resources yet.
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
                            className="group rounded-[26px] border border-emerald-400/15 bg-gradient-to-br from-[#10261f] to-[#0d1113] p-5 text-left transition hover:-translate-y-1 hover:border-emerald-300/30"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-2xl">
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
                              Open category
                            </p>

                            <div className="mt-5 text-sm font-black text-emerald-300">
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
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                    Free Resources
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
                    No PDFs in this category.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleItems.map(
                      (
                        item,
                      ) => (
                        <FreeLibraryCard
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
          </>
        )}
      </div>
    </main>
  );
}

function FreeLibraryCard({
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
      <div className="aspect-[3/4] bg-gradient-to-br from-emerald-950/60 to-[#100b14]">
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
      </div>

      <div className="p-5">
        <div className="flex gap-2">
          <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-[9px] font-black uppercase text-white/50">
            {
              item.category
            }
          </span>

          <span className="rounded-lg bg-emerald-500/15 px-2 py-1 text-[9px] font-black uppercase text-emerald-200">
            FREE
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
          className="mt-5 flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-sm font-black text-white disabled:opacity-50"
        >
          {opening
            ? "Opening..."
            : "Open PDF"}
        </button>
      </div>
    </article>
  );
}