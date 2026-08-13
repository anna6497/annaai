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

async function hasPaidAccess(
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

    const id =
      new URL(
        request.url,
      ).searchParams
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
      error: itemError,
    } =
      await admin
        .from(
          "library_items",
        )
        .select(
          `
            id,
            access_type,
            file_path,
            is_published
          `,
        )
        .eq(
          "id",
          id,
        )
        .maybeSingle();

    if (itemError) {
      throw itemError;
    }

    if (
      !item ||
      !item.is_published
    ) {
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

    if (
      item.access_type ===
      "paid"
    ) {
      const allowed =
        await hasPaidAccess(
          user.id,
        );

      if (!allowed) {
        return NextResponse.json(
          {
            error:
              "Paid Library access required.",
          },
          {
            status: 403,
          },
        );
      }
    }

    const {
      data,
      error,
    } =
      await admin.storage
        .from(
          "library-files",
        )
        .createSignedUrl(
          item.file_path,
          60 * 5,
        );

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        ok: true,
        url:
          data.signedUrl,
        expiresIn:
          300,
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
      "Library download error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to open PDF.",
      },
      {
        status: 500,
      },
    );
  }
}