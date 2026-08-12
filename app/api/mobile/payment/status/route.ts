import { NextResponse } from "next/server";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


function unauthorized() {
  return NextResponse.json(
    {
      error: "Unauthorized",
    },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}


export async function GET(
  request: Request,
) {
  try {
    const authorization =
      request.headers.get(
        "authorization",
      );

    if (
      !authorization?.startsWith(
        "Bearer ",
      )
    ) {
      return unauthorized();
    }

    const token =
      authorization
        .slice(7)
        .trim();

    if (!token) {
      return unauthorized();
    }

    const admin =
      createSupabaseAdminClient();

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
      return unauthorized();
    }

    const {
      data,
      error,
    } =
      await admin
        .from(
          "payment_requests",
        )
        .select(
          `
            id,
            product_code,
            product_title,
            amount_mmk,
            payment_method,
            status,
            admin_note,
            created_at,
            reviewed_at
          `,
        )
        .eq(
          "user_id",
          user.id,
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          },
        )
        .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        payments:
          data ?? [],
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Mobile payment status error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load payment status.",
      },
      {
        status: 500,
      },
    );
  }
}