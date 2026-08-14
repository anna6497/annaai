"use client";

import Link from "next/link";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

type AccessType =
  | "free"
  | "paid";

type LibraryItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  access_type: AccessType;
  file_path: string;
  cover_path: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type ApiResult = {
  ok?: boolean;
  error?: string;

  bucket?: string;
  path?: string;
  token?: string;

  item?: LibraryItem;
  items?: LibraryItem[];
};

const CATEGORIES = [
  "HSK",
  "Speaking",
  "Grammar",
  "Vocabulary",
  "Mini Notes",
  "Worksheets",
  "Other",
];

const MAX_PDF_SIZE =
  25 * 1024 * 1024;

const MAX_COVER_SIZE =
  5 * 1024 * 1024;

const ALLOWED_COVER_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function formatFileSize(
  bytes: number | null,
) {
  if (
    !bytes ||
    bytes <= 0
  ) {
    return "-";
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

export default function AdminLibraryPage() {
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
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState("HSK");

  const [
    accessType,
    setAccessType,
  ] =
    useState<AccessType>(
      "free",
    );

  const [
    isPublished,
    setIsPublished,
  ] =
    useState(true);

  const [
    sortOrder,
    setSortOrder,
  ] =
    useState("0");

  const [
    pdf,
    setPdf,
  ] =
    useState<
      File | null
    >(null);

  const [
    cover,
    setCover,
  ] =
    useState<
      File | null
    >(null);

  const [
    coverPreview,
    setCoverPreview,
  ] =
    useState("");

  const getAccessToken =
    useCallback(
      async () => {
        const {
          data: {
            session,
          },
          error:
            sessionError,
        } =
          await supabase.auth.getSession();

        if (
          sessionError ||
          !session
        ) {
          throw new Error(
            "Please login again.",
          );
        }

        return session.access_token;
      },
      [supabase],
    );

  async function readApiResponse(
    response: Response,
  ): Promise<ApiResult> {
    const text =
      await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(
        text,
      ) as ApiResult;
    } catch {
      throw new Error(
        response.ok
          ? "Server returned an invalid response."
          : `Request failed (${response.status}): ${text.slice(
              0,
              180,
            )}`,
      );
    }
  }

  async function requestSignedUpload(
    token: string,
    kind:
      | "pdf"
      | "cover",
    file: File,
  ) {
    const response =
      await fetch(
        "/api/admin/library/upload-url",
        {
          method:
            "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              kind,

              fileName:
                file.name,

              contentType:
                file.type,

              fileSize:
                file.size,
            }),
        },
      );

    const result =
      await readApiResponse(
        response,
      );

    if (
      !response.ok
    ) {
      throw new Error(
        result.error ||
          "Unable to prepare upload.",
      );
    }

    if (
      !result.bucket ||
      !result.path ||
      !result.token
    ) {
      throw new Error(
        "Signed upload information is incomplete.",
      );
    }

    return {
      bucket:
        result.bucket,

      path:
        result.path,

      uploadToken:
        result.token,
    };
  }

  async function uploadToStorage(
    bucket: string,
    path: string,
    uploadToken: string,
    file: File,
  ) {
    const {
      error:
        uploadError,
    } =
      await supabase.storage
        .from(
          bucket,
        )
        .uploadToSignedUrl(
          path,
          uploadToken,
          file,
          {
            contentType:
              file.type,
          },
        );

    if (
      uploadError
    ) {
      throw new Error(
        `File upload failed: ${uploadError.message}`,
      );
    }
  }

  const loadItems =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const token =
            await getAccessToken();

          const response =
            await fetch(
              "/api/admin/library",
              {
                method:
                  "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },

                cache:
                  "no-store",
              },
            );

          const result =
            await readApiResponse(
              response,
            );

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
        } catch (
          loadError
        ) {
          console.error(
            "Library load failed:",
            loadError,
          );

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
      [
        getAccessToken,
      ],
    );

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(
    () => {
      return () => {
        if (
          coverPreview
        ) {
          URL.revokeObjectURL(
            coverPreview,
          );
        }
      };
    },
    [coverPreview],
  );

  function handleCoverChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target
        .files?.[0] ??
      null;

    if (
      coverPreview
    ) {
      URL.revokeObjectURL(
        coverPreview,
      );
    }

    setCover(file);

    if (file) {
      setCoverPreview(
        URL.createObjectURL(
          file,
        ),
      );
    } else {
      setCoverPreview(
        "",
      );
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory("HSK");
    setAccessType(
      "free",
    );
    setIsPublished(
      true,
    );
    setSortOrder("0");
    setPdf(null);
    setCover(null);

    if (
      coverPreview
    ) {
      URL.revokeObjectURL(
        coverPreview,
      );
    }

    setCoverPreview("");

    const pdfInput =
      document.getElementById(
        "library-pdf",
      ) as HTMLInputElement | null;

    const coverInput =
      document.getElementById(
        "library-cover",
      ) as HTMLInputElement | null;

    if (
      pdfInput
    ) {
      pdfInput.value =
        "";
    }

    if (
      coverInput
    ) {
      coverInput.value =
        "";
    }
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      submitting
    ) {
      return;
    }

    setError("");
    setSuccess("");

    if (
      !title.trim()
    ) {
      setError(
        "Title is required.",
      );

      return;
    }

    if (!pdf) {
      setError(
        "Please choose a PDF file.",
      );

      return;
    }

    if (
      pdf.type !==
      "application/pdf"
    ) {
      setError(
        "Only PDF files are allowed.",
      );

      return;
    }

    if (
      pdf.size <= 0
    ) {
      setError(
        "PDF file is empty.",
      );

      return;
    }

    if (
      pdf.size >
      MAX_PDF_SIZE
    ) {
      setError(
        "PDF must be 25 MB or smaller.",
      );

      return;
    }

    if (cover) {
      if (
        !ALLOWED_COVER_TYPES.includes(
          cover.type,
        )
      ) {
        setError(
          "Cover must be JPG, PNG or WEBP.",
        );

        return;
      }

      if (
        cover.size >
        MAX_COVER_SIZE
      ) {
        setError(
          "Cover must be 5 MB or smaller.",
        );

        return;
      }
    }

    setSubmitting(true);

    try {
      const token =
        await getAccessToken();

      /*
       * STEP 1
       *
       * Ask Anna API for a signed PDF upload token.
       *
       * Only tiny JSON metadata goes through Vercel.
       */
      const pdfUpload =
        await requestSignedUpload(
          token,
          "pdf",
          pdf,
        );

      /*
       * STEP 2
       *
       * Upload PDF directly:
       *
       * Browser -> Supabase Storage
       *
       * The PDF binary does NOT pass through
       * /api/admin/library.
       */
      await uploadToStorage(
        pdfUpload.bucket,
        pdfUpload.path,
        pdfUpload.uploadToken,
        pdf,
      );

      /*
       * STEP 3
       *
       * Optional cover image direct upload.
       */
      let coverPath = "";

      if (cover) {
        const coverUpload =
          await requestSignedUpload(
            token,
            "cover",
            cover,
          );

        await uploadToStorage(
          coverUpload.bucket,
          coverUpload.path,
          coverUpload.uploadToken,
          cover,
        );

        coverPath =
          coverUpload.path;
      }

      /*
       * STEP 4
       *
       * PDF and cover are now in Supabase.
       *
       * Send ONLY metadata to Anna API.
       */
      const response =
        await fetch(
          "/api/admin/library",
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                title:
                  title.trim(),

                description:
                  description.trim(),

                category,

                access_type:
                  accessType,

                file_path:
                  pdfUpload.path,

                cover_path:
                  coverPath,

                file_name:
                  pdf.name,

                file_size_bytes:
                  pdf.size,

                is_published:
                  isPublished,

                sort_order:
                  Number(
                    sortOrder ||
                      "0",
                  ),
              }),
          },
        );

      const result =
        await readApiResponse(
          response,
        );

      if (
        !response.ok
      ) {
        throw new Error(
          result.error ||
            "Unable to save library resource.",
        );
      }

      setSuccess(
        "PDF uploaded successfully.",
      );

      resetForm();

      await loadItems();
    } catch (
      submitError
    ) {
      console.error(
        "Library upload failed:",
        submitError,
      );

      setError(
        submitError instanceof
        Error
          ? submitError.message
          : "Unable to upload PDF.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  async function deleteItem(
    item: LibraryItem,
  ) {
    if (
      deletingId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${item.title}"?\n\nThis will also delete the PDF and cover from storage.`,
      );

    if (
      !confirmed
    ) {
      return;
    }

    setDeletingId(
      item.id,
    );

    setError("");
    setSuccess("");

    try {
      const token =
        await getAccessToken();

      const response =
        await fetch(
          `/api/admin/library?id=${encodeURIComponent(
            item.id,
          )}`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      const result =
        await readApiResponse(
          response,
        );

      if (
        !response.ok
      ) {
        throw new Error(
          result.error ||
            "Delete failed.",
        );
      }

      setItems(
        (
          current,
        ) =>
          current.filter(
            (
              currentItem,
            ) =>
              currentItem.id !==
              item.id,
          ),
      );

      setSuccess(
        "Library item deleted.",
      );
    } catch (
      deleteError
    ) {
      console.error(
        "Delete failed:",
        deleteError,
      );

      setError(
        deleteError instanceof
        Error
          ? deleteError.message
          : "Unable to delete item.",
      );
    } finally {
      setDeletingId(
        null,
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#09030f] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">
              Admin Portal
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Anna&apos;s Library
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Upload and manage free and premium PDF resources.
            </p>
          </div>

          <Link
            href="/admin"
            className="flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-bold text-white/80"
          >
            ← Admin Home
          </Link>
        </header>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            {success}
          </div>
        ) : null}

        <div className="mt-8 grid gap-7 lg:grid-cols-[390px_1fr]">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-300">
              Add Resource
            </p>

            <form
              onSubmit={
                submit
              }
              className="mt-6 space-y-5"
            >
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/60">
                  Title
                </span>

                <input
                  value={
                    title
                  }
                  onChange={(
                    event,
                  ) =>
                    setTitle(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="HSK 1 Mini Notes"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-fuchsia-400/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/60">
                  Description
                </span>

                <textarea
                  value={
                    description
                  }
                  onChange={(
                    event,
                  ) =>
                    setDescription(
                      event
                        .target
                        .value,
                    )
                  }
                  rows={
                    4
                  }
                  placeholder="Short description..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-fuchsia-400/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/60">
                  Category
                </span>

                <select
                  value={
                    category
                  }
                  onChange={(
                    event,
                  ) =>
                    setCategory(
                      event
                        .target
                        .value,
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#140b1c] px-4 py-3 outline-none"
                >
                  {CATEGORIES.map(
                    (
                      item,
                    ) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {
                          item
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <div>
                <span className="mb-2 block text-xs font-bold text-white/60">
                  Access
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAccessType(
                        "free",
                      )
                    }
                    className={[
                      "rounded-2xl border px-4 py-3 text-sm font-black",
                      accessType ===
                      "free"
                        ? "border-green-400/50 bg-green-500/15 text-green-200"
                        : "border-white/10 bg-white/[0.03] text-white/45",
                    ].join(
                      " ",
                    )}
                  >
                    Free
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAccessType(
                        "paid",
                      )
                    }
                    className={[
                      "rounded-2xl border px-4 py-3 text-sm font-black",
                      accessType ===
                      "paid"
                        ? "border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-200"
                        : "border-white/10 bg-white/[0.03] text-white/45",
                    ].join(
                      " ",
                    )}
                  >
                    Paid
                  </button>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/60">
                  PDF
                </span>

                <input
                  id="library-pdf"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(
                    event,
                  ) =>
                    setPdf(
                      event
                        .target
                        .files?.[0] ??
                        null,
                    )
                  }
                  className="block w-full rounded-2xl border border-dashed border-white/15 bg-black/20 p-3 text-xs text-white/60"
                />

                {pdf ? (
                  <p className="mt-2 text-xs text-purple-200">
                    {pdf.name} ·{" "}
                    {formatFileSize(
                      pdf.size,
                    )}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/60">
                  Cover Image
                </span>

                <input
                  id="library-cover"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleCoverChange
                  }
                  className="block w-full rounded-2xl border border-dashed border-white/15 bg-black/20 p-3 text-xs text-white/60"
                />

                {coverPreview ? (
                  <img
                    src={
                      coverPreview
                    }
                    alt="Cover preview"
                    className="mt-3 aspect-[3/4] w-28 rounded-xl object-cover"
                  />
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/60">
                  Sort Order
                </span>

                <input
                  type="number"
                  value={
                    sortOrder
                  }
                  onChange={(
                    event,
                  ) =>
                    setSortOrder(
                      event
                        .target
                        .value,
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>
                  <span className="block text-sm font-bold">
                    Published
                  </span>

                  <span className="mt-1 block text-xs text-white/40">
                    Users can see this resource.
                  </span>
                </span>

                <input
                  type="checkbox"
                  checked={
                    isPublished
                  }
                  onChange={(
                    event,
                  ) =>
                    setIsPublished(
                      event
                        .target
                        .checked,
                    )
                  }
                  className="h-5 w-5 accent-fuchsia-500"
                />
              </label>

              <button
                type="submit"
                disabled={
                  submitting
                }
                className="flex h-13 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-4 font-black disabled:opacity-50"
              >
                {submitting
                  ? "Uploading..."
                  : "Upload PDF"}
              </button>
            </form>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
                  Library Files
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {items.length} Resources
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadItems()
                }
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold text-white/70"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.035] p-8 text-center text-sm text-white/40">
                Loading library...
              </div>
            ) : items.length ===
              0 ? (
              <div className="mt-5 rounded-[24px] border border-dashed border-white/10 p-10 text-center">
                <div className="text-4xl">
                  📚
                </div>

                <p className="mt-3 font-bold">
                  No PDF resources yet
                </p>

                <p className="mt-1 text-xs text-white/40">
                  Upload your first PDF from the form.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {items.map(
                  (
                    item,
                  ) => (
                    <article
                      key={
                        item.id
                      }
                      className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={[
                                "rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider",
                                item.access_type ===
                                "paid"
                                  ? "bg-fuchsia-500/15 text-fuchsia-200"
                                  : "bg-green-500/15 text-green-200",
                              ].join(
                                " ",
                              )}
                            >
                              {
                                item.access_type
                              }
                            </span>

                            <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-[9px] font-black text-white/50">
                              {
                                item.category
                              }
                            </span>

                            {!item.is_published ? (
                              <span className="rounded-lg bg-yellow-500/10 px-2 py-1 text-[9px] font-black text-yellow-200">
                                HIDDEN
                              </span>
                            ) : null}
                          </div>

                          <h3 className="mt-3 truncate text-lg font-black">
                            {
                              item.title
                            }
                          </h3>

                          {item.description ? (
                            <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/45">
                              {
                                item.description
                              }
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-black/15 p-3 text-[11px] text-white/45">
                        <p className="truncate">
                          {item.file_name ||
                            "PDF"}
                        </p>

                        <p className="mt-1">
                          {formatFileSize(
                            item.file_size_bytes,
                          )}
                        </p>

                        <p className="mt-1">
                          {new Date(
                            item.created_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          item.id
                        }
                        onClick={() =>
                          void deleteItem(
                            item,
                          )
                        }
                        className="mt-4 flex h-10 w-full items-center justify-center rounded-xl border border-red-400/20 bg-red-500/[0.07] text-xs font-bold text-red-200 disabled:opacity-40"
                      >
                        {deletingId ===
                        item.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </article>
                  ),
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}