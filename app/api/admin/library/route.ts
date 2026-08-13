import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PDF_SIZE =
  25 * 1024 * 1024;

const MAX_COVER_SIZE =
  5 * 1024 * 1024;

const ALLOWED_COVER_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function getBearerToken(
  request: NextRequest,
) {
  const authorization =
    request.headers.get(
      "authorization",
    );

  if (
    !authorization ||
    !authorization
      .toLowerCase()
      .startsWith("bearer ")
  ) {
    return null;
  }

  return authorization
    .slice(7)
    .trim();
}

async function requireAdmin(
  request: NextRequest,
) {
  const admin =
    createSupabaseAdminClient();

  const token =
    getBearerToken(request);

  if (!token) {
    return {
      error:
        NextResponse.json(
          {
            error:
              "Unauthorized.",
          },
          {
            status: 401,
          },
        ),
    };
  }

  const {
    data: { user },
    error: userError,
  } =
    await admin.auth.getUser(
      token,
    );

  if (
    userError ||
    !user
  ) {
    return {
      error:
        NextResponse.json(
          {
            error:
              "Invalid login session.",
          },
          {
            status: 401,
          },
        ),
    };
  }

  const {
    data: profile,
    error: profileError,
  } =
    await admin
      .from("profiles")
      .select(
        "id,email,role",
      )
      .eq(
        "id",
        user.id,
      )
      .maybeSingle();

  if (profileError) {
    console.error(
      "Admin profile check failed:",
      profileError,
    );

    return {
      error:
        NextResponse.json(
          {
            error:
              "Unable to verify admin access.",
          },
          {
            status: 500,
          },
        ),
    };
  }

  const role =
    typeof profile?.role ===
      "string"
      ? profile.role
          .trim()
          .toLowerCase()
      : "";

  if (role !== "admin") {
    return {
      error:
        NextResponse.json(
          {
            error:
              "Admin access required.",
          },
          {
            status: 403,
          },
        ),
    };
  }

  return {
    admin,
    user,
    profile,
  };
}

function getExtension(
  name: string,
  fallback: string,
) {
  const extension =
    name
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    !extension ||
    extension ===
      name.toLowerCase()
  ) {
    return fallback;
  }

  return extension
    .replace(
      /[^a-z0-9]/g,
      "",
    ) || fallback;
}

export async function GET(
  request: NextRequest,
) {
  try {
    const auth =
      await requireAdmin(
        request,
      );

    if ("error" in auth) {
      return auth.error;
    }

    const {
      admin,
    } = auth;

    const {
      data,
      error,
    } =
      await admin
        .from(
          "library_items",
        )
        .select(
          `
            id,
            title,
            description,
            category,
            access_type,
            file_path,
            cover_path,
            file_name,
            file_size_bytes,
            is_published,
            sort_order,
            created_at,
            updated_at
          `,
        )
        .order(
          "sort_order",
          {
            ascending: true,
          },
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      items: data ?? [],
    });
  } catch (error) {
    console.error(
      "Admin library GET error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load library.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  let uploadedPdfPath = "";
  let uploadedCoverPath = "";

  try {
    const auth =
      await requireAdmin(
        request,
      );

    if ("error" in auth) {
      return auth.error;
    }

    const {
      admin,
    } = auth;

    const formData =
      await request.formData();

    const title =
      String(
        formData.get(
          "title",
        ) ?? "",
      ).trim();

    const description =
      String(
        formData.get(
          "description",
        ) ?? "",
      ).trim();

    const category =
      String(
        formData.get(
          "category",
        ) ?? "Other",
      ).trim() ||
      "Other";

    const accessType =
      String(
        formData.get(
          "access_type",
        ) ?? "free",
      ) === "paid"
        ? "paid"
        : "free";

    const isPublished =
      String(
        formData.get(
          "is_published",
        ) ?? "true",
      ) !== "false";

    const sortValue =
      Number(
        formData.get(
          "sort_order",
        ) ?? 0,
      );

    const sortOrder =
      Number.isFinite(
        sortValue,
      )
        ? Math.trunc(
            sortValue,
          )
        : 0;

    const pdf =
      formData.get(
        "pdf",
      );

    const cover =
      formData.get(
        "cover",
      );

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Title is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !(pdf instanceof File)
    ) {
      return NextResponse.json(
        {
          error:
            "PDF file is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      pdf.type !==
      "application/pdf"
    ) {
      return NextResponse.json(
        {
          error:
            "Only PDF files are allowed.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      pdf.size <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "PDF file is empty.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      pdf.size >
      MAX_PDF_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "PDF must be 25 MB or smaller.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      cover instanceof File &&
      cover.size > 0
    ) {
      if (
        !ALLOWED_COVER_TYPES.includes(
          cover.type,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Cover must be JPG, PNG or WEBP.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        cover.size >
        MAX_COVER_SIZE
      ) {
        return NextResponse.json(
          {
            error:
              "Cover must be 5 MB or smaller.",
          },
          {
            status: 400,
          },
        );
      }
    }

    const itemId =
      crypto.randomUUID();

    uploadedPdfPath =
      `${itemId}/document.pdf`;

    const pdfBuffer =
      Buffer.from(
        await pdf.arrayBuffer(),
      );

    const {
      error:
        pdfUploadError,
    } =
      await admin.storage
        .from(
          "library-files",
        )
        .upload(
          uploadedPdfPath,
          pdfBuffer,
          {
            contentType:
              "application/pdf",

            cacheControl:
              "3600",

            upsert:
              false,
          },
        );

    if (pdfUploadError) {
      throw new Error(
        `PDF upload failed: ${pdfUploadError.message}`,
      );
    }

    if (
      cover instanceof File &&
      cover.size > 0
    ) {
      const extension =
        getExtension(
          cover.name,
          cover.type ===
            "image/png"
            ? "png"
            : cover.type ===
                "image/webp"
              ? "webp"
              : "jpg",
        );

      uploadedCoverPath =
        `${itemId}/cover.${extension}`;

      const coverBuffer =
        Buffer.from(
          await cover.arrayBuffer(),
        );

      const {
        error:
          coverUploadError,
      } =
        await admin.storage
          .from(
            "library-covers",
          )
          .upload(
            uploadedCoverPath,
            coverBuffer,
            {
              contentType:
                cover.type,

              cacheControl:
                "3600",

              upsert:
                false,
            },
          );

      if (
        coverUploadError
      ) {
        await admin.storage
          .from(
            "library-files",
          )
          .remove([
            uploadedPdfPath,
          ]);

        throw new Error(
          `Cover upload failed: ${coverUploadError.message}`,
        );
      }
    }

    const {
      data: item,
      error:
        insertError,
    } =
      await admin
        .from(
          "library_items",
        )
        .insert({
          id:
            itemId,

          title,

          description:
            description ||
            null,

          category,

          access_type:
            accessType,

          file_path:
            uploadedPdfPath,

          cover_path:
            uploadedCoverPath ||
            null,

          file_name:
            pdf.name,

          file_size_bytes:
            pdf.size,

          is_published:
            isPublished,

          sort_order:
            sortOrder,
        })
        .select(
          `
            id,
            title,
            description,
            category,
            access_type,
            file_path,
            cover_path,
            file_name,
            file_size_bytes,
            is_published,
            sort_order,
            created_at,
            updated_at
          `,
        )
        .single();

    if (insertError) {
      await admin.storage
        .from(
          "library-files",
        )
        .remove([
          uploadedPdfPath,
        ]);

      if (
        uploadedCoverPath
      ) {
        await admin.storage
          .from(
            "library-covers",
          )
          .remove([
            uploadedCoverPath,
          ]);
      }

      throw insertError;
    }

    return NextResponse.json(
      {
        ok: true,
        item,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Admin library POST error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload library item.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  request: NextRequest,
) {
  try {
    const auth =
      await requireAdmin(
        request,
      );

    if ("error" in auth) {
      return auth.error;
    }

    const {
      admin,
    } = auth;

    const url =
      new URL(
        request.url,
      );

    const id =
      url.searchParams
        .get("id")
        ?.trim();

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Library item id is required.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: item,
      error:
        loadError,
    } =
      await admin
        .from(
          "library_items",
        )
        .select(
          `
            id,
            file_path,
            cover_path
          `,
        )
        .eq(
          "id",
          id,
        )
        .maybeSingle();

    if (loadError) {
      throw loadError;
    }

    if (!item) {
      return NextResponse.json(
        {
          error:
            "Library item not found.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      error:
        deleteError,
    } =
      await admin
        .from(
          "library_items",
        )
        .delete()
        .eq(
          "id",
          id,
        );

    if (deleteError) {
      throw deleteError;
    }

    if (
      item.file_path
    ) {
      await admin.storage
        .from(
          "library-files",
        )
        .remove([
          item.file_path,
        ]);
    }

    if (
      item.cover_path
    ) {
      await admin.storage
        .from(
          "library-covers",
        )
        .remove([
          item.cover_path,
        ]);
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Admin library DELETE error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete library item.",
      },
      {
        status: 500,
      },
    );
  }
}