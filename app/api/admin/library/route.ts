import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    data: {
      user,
    },
    error:
      userError,
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
    data:
      profile,
    error:
      profileError,
  } =
    await admin
      .from(
        "profiles",
      )
      .select(
        "id,email,role",
      )
      .eq(
        "id",
        user.id,
      )
      .maybeSingle();

  if (
    profileError
  ) {
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

  if (
    role !==
    "admin"
  ) {
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

export async function GET(
  request: NextRequest,
) {
  try {
    const auth =
      await requireAdmin(
        request,
      );

    if (
      "error" in auth
    ) {
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
      items:
        data ?? [],
    });
  } catch (
    error
  ) {
    console.error(
      "Admin library GET error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
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
  try {
    const auth =
      await requireAdmin(
        request,
      );

    if (
      "error" in auth
    ) {
      return auth.error;
    }

    const {
      admin,
    } = auth;

    const body =
      await request.json();

    const title =
      String(
        body?.title ??
          "",
      ).trim();

    const description =
      String(
        body?.description ??
          "",
      ).trim();

    const category =
      String(
        body?.category ??
          "Other",
      ).trim() ||
      "Other";

    const accessType =
      String(
        body?.access_type ??
          "free",
      ) === "paid"
        ? "paid"
        : "free";

    const filePath =
      String(
        body?.file_path ??
          "",
      ).trim();

    const coverPath =
      String(
        body?.cover_path ??
          "",
      ).trim();

    const fileName =
      String(
        body?.file_name ??
          "",
      ).trim();

    const fileSize =
      Number(
        body?.file_size_bytes ??
          0,
      );

    const isPublished =
      body?.is_published !==
      false;

    const rawSortOrder =
      Number(
        body?.sort_order ??
          0,
      );

    const sortOrder =
      Number.isFinite(
        rawSortOrder,
      )
        ? Math.trunc(
            rawSortOrder,
          )
        : 0;

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

    if (!filePath) {
      return NextResponse.json(
        {
          error:
            "PDF file path is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !filePath.endsWith(
        "/document.pdf",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid PDF storage path.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isFinite(
        fileSize,
      ) ||
      fileSize <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid PDF file size.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      fileSize >
      25 *
        1024 *
        1024
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

    /*
     * Confirm that the PDF was actually uploaded
     * before creating the database record.
     */
    const {
      data:
        pdfInfo,
      error:
        pdfInfoError,
    } =
      await admin.storage
        .from(
          "library-files",
        )
        .info(
          filePath,
        );

    if (
      pdfInfoError ||
      !pdfInfo
    ) {
      return NextResponse.json(
        {
          error:
            "Uploaded PDF could not be verified.",
        },
        {
          status: 400,
        },
      );
    }

    if (coverPath) {
      const {
        data:
          coverInfo,
        error:
          coverInfoError,
      } =
        await admin.storage
          .from(
            "library-covers",
          )
          .info(
            coverPath,
          );

      if (
        coverInfoError ||
        !coverInfo
      ) {
        return NextResponse.json(
          {
            error:
              "Uploaded cover could not be verified.",
          },
          {
            status: 400,
          },
        );
      }
    }

    const {
      data:
        item,
      error:
        insertError,
    } =
      await admin
        .from(
          "library_items",
        )
        .insert({
          title,

          description:
            description ||
            null,

          category,

          access_type:
            accessType,

          file_path:
            filePath,

          cover_path:
            coverPath ||
            null,

          file_name:
            fileName ||
            "document.pdf",

          file_size_bytes:
            fileSize,

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

    if (
      insertError
    ) {
      /*
       * Database insert failed:
       * remove newly uploaded objects
       * so orphan files are not left behind.
       */
      await admin.storage
        .from(
          "library-files",
        )
        .remove([
          filePath,
        ]);

      if (
        coverPath
      ) {
        await admin.storage
          .from(
            "library-covers",
          )
          .remove([
            coverPath,
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
  } catch (
    error
  ) {
    console.error(
      "Admin library POST error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Unable to create library item.",
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

    if (
      "error" in auth
    ) {
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
        .get(
          "id",
        )
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
      data:
        item,
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

    if (
      loadError
    ) {
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

    if (
      deleteError
    ) {
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
  } catch (
    error
  ) {
    console.error(
      "Admin library DELETE error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Unable to delete library item.",
      },
      {
        status: 500,
      },
    );
  }
}