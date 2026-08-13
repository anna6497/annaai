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
    request.headers.get("authorization");

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

async function getPaidAccess(
  userId: string,
) {
  const admin =
    createSupabaseAdminClient();

  const [
    aiResult,
    hskResult,
  ] = await Promise.all([
    admin
      .from(
        "ai_speaking_subscriptions",
      )
      .select("id")
      .eq(
        "user_id",
        userId,
      )
      .eq(
        "status",
        "active",
      )
      .limit(1)
      .maybeSingle(),

    admin
      .from(
        "user_hsk_access",
      )
      .select("user_id")
      .eq(
        "user_id",
        userId,
      )
      .limit(1)
      .maybeSingle(),
  ]);

  if (aiResult.error) {
    console.error(
      "Library AI access check failed:",
      aiResult.error,
    );
  }

  if (hskResult.error) {
    console.error(
      "Library HSK access check failed:",
      hskResult.error,
    );
  }

  return Boolean(
    aiResult.data ||
      hskResult.data,
  );
}

export async function GET(
  request: NextRequest,
) {
  try {
    const admin =
      createSupabaseAdminClient();

    const token =
      getBearerToken(request);

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
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
      return NextResponse.json(
        {
          error:
            "Invalid login session.",
        },
        {
          status: 401,
        },
      );
    }

    const hasPaidAccess =
      await getPaidAccess(
        user.id,
      );

    const {
      data: items,
      error: itemsError,
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
            cover_path,
            file_name,
            file_size_bytes,
            sort_order,
            created_at
          `,
        )
        .eq(
          "is_published",
          true,
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

    if (itemsError) {
      throw itemsError;
    }

    const results =
      await Promise.all(
        (items ?? []).map(
          async (item) => {
            let coverUrl:
              | string
              | null = null;

            if (
              item.cover_path
            ) {
              const {
                data,
                error,
              } =
                await admin.storage
                  .from(
                    "library-covers",
                  )
                  .createSignedUrl(
                    item.cover_path,
                    60 * 60,
                  );

              if (!error) {
                coverUrl =
                  data.signedUrl;
              }
            }

            const locked =
              item.access_type ===
                "paid" &&
              !hasPaidAccess;

            return {
              id:
                item.id,

              title:
                item.title,

              description:
                item.description,

              category:
                item.category,

              accessType:
                item.access_type,

              coverUrl,

              fileName:
                item.file_name,

              fileSizeBytes:
                item.file_size_bytes,

              locked,

              createdAt:
                item.created_at,
            };
          },
        ),
      );

    return NextResponse.json(
      {
        ok: true,

        hasPaidAccess,

        items:
          results,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Library GET error:",
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