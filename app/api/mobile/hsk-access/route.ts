import {
  NextResponse,
} from "next/server";

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
      error:
        "Unauthorized",
    },
    {
      status:
        401,

      headers: {
        "Cache-Control":
          "no-store",
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


    const accessToken =
      authorization
        .slice(7)
        .trim();


    if (!accessToken) {
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
        accessToken,
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
          "user_hsk_access",
        )
        .select(
          `
            product_code,
            level,
            lifetime,
            granted_at
          `,
        )
        .eq(
          "user_id",
          user.id,
        )
        .order(
          "granted_at",
          {
            ascending:
              false,
          },
        );


    if (error) {
      console.error(
        "Mobile HSK access query failed:",
        {
          userId:
            user.id,

          message:
            error.message,
        },
      );

      return NextResponse.json(
        {
          error:
            "Unable to check HSK access.",
        },
        {
          status:
            500,
        },
      );
    }


    const rows =
      data ??
      [];


    const hasFullPackage =
      rows.some(
        (
          row,
        ) =>
          row.product_code ===
            "hsk_full" &&
          Boolean(
            row.lifetime,
          ),
      );


    const unlockedLevels =
      new Set<number>(
        [
          1,
        ],
      );


    if (
      hasFullPackage
    ) {
      for (
        let level =
          2;
        level <=
        9;
        level +=
          1
      ) {
        unlockedLevels.add(
          level,
        );
      }
    } else {
      for (
        const row
        of rows
      ) {
        const level =
          Number(
            row.level,
          );

        if (
          Number.isInteger(
            level,
          ) &&
          level >=
            2 &&
          level <=
            9 &&
          Boolean(
            row.lifetime,
          )
        ) {
          unlockedLevels.add(
            level,
          );
        }


        if (
          typeof row.product_code ===
            "string"
        ) {
          const match =
            row.product_code.match(
              /^hsk_([2-9])$/,
            );

          if (
            match
          ) {
            unlockedLevels.add(
              Number(
                match[1],
              ),
            );
          }
        }
      }
    }


    return NextResponse.json(
      {
        hasFullPackage,

        unlockedLevels:
          Array.from(
            unlockedLevels,
          ).sort(
            (
              first,
              second,
            ) =>
              first -
              second,
          ),
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "Mobile HSK access endpoint error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to check HSK access.",
      },
      {
        status:
          500,
      },
    );
  }
}