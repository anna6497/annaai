import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UploadKind =
  | "pdf"
  | "cover";

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
        "id,role",
      )
      .eq(
        "id",
        user.id,
      )
      .maybeSingle();

  if (
    profileError
  ) {
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
  };
}

function safeExtension(
  fileName: string,
  fallback: string,
) {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(
        /[^a-z0-9]/g,
        "",
      );

  return extension ||
    fallback;
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

    const kind =
      String(
        body?.kind ??
          "",
      ) as UploadKind;

    const fileName =
      String(
        body?.fileName ??
          "",
      ).trim();

    const contentType =
      String(
        body?.contentType ??
          "",
      ).trim();

    const fileSize =
      Number(
        body?.fileSize ??
          0,
      );

    if (
      kind !== "pdf" &&
      kind !== "cover"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid upload type.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !fileName
    ) {
      return NextResponse.json(
        {
          error:
            "File name is required.",
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
            "Invalid file size.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      kind === "pdf"
    ) {
      if (
        contentType !==
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
    }

    if (
      kind === "cover"
    ) {
      const allowed =
        [
          "image/jpeg",
          "image/png",
          "image/webp",
        ];

      if (
        !allowed.includes(
          contentType,
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
        fileSize >
        5 *
          1024 *
          1024
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

    const bucket =
      kind === "pdf"
        ? "library-files"
        : "library-covers";

    const extension =
      kind === "pdf"
        ? "pdf"
        : safeExtension(
            fileName,
            contentType ===
              "image/png"
              ? "png"
              : contentType ===
                  "image/webp"
                ? "webp"
                : "jpg",
          );

    const path =
      kind === "pdf"
        ? `${itemId}/document.pdf`
        : `${itemId}/cover.${extension}`;

    const {
      data,
      error,
    } =
      await admin.storage
        .from(
          bucket,
        )
        .createSignedUploadUrl(
          path,
        );

    if (
      error ||
      !data
    ) {
      throw new Error(
        error?.message ||
          "Unable to create signed upload URL.",
      );
    }

    return NextResponse.json({
      ok: true,
      bucket,
      path,
      token:
        data.token,
    });
  } catch (
    error
  ) {
    console.error(
      "Library signed upload error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Unable to prepare upload.",
      },
      {
        status: 500,
      },
    );
  }
}