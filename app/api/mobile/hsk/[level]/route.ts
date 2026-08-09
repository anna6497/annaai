import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getVocabulary } from "@/lib/hsk/vocabulary";

import type {
  HskLevel,
  HskVocabularyItem,
} from "@/types/hsk-vocabulary";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


type RouteContext = {
  params: Promise<{
    level: string;
  }>;
};


function parseLevel(
  value: string,
): HskLevel | null {
  const number =
    Number(value);

  if (
    !Number.isInteger(number) ||
    number < 1 ||
    number > 9
  ) {
    return null;
  }

  return number as HskLevel;
}


function unauthorized() {
  return NextResponse.json(
    {
      allowed: false,
      error: "Unauthorized",
    },
    {
      status: 401,
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}


function normalizeWord(
  item: HskVocabularyItem,
) {
  return {
    id:
      String(item.id),

    hanzi:
      item.hanzi,

    traditional:
      item.traditional ??
      "",

    pinyin:
      item.pinyin,

    level:
      Number(item.level),

    lesson:
      typeof item.lesson ===
      "number"
        ? item.lesson
        : null,

    english:
      item.english ??
      item.meaning ??
      "",

    myanmar:
      item.myanmar ??
      item.meaningMyanmar ??
      "",

    partOfSpeech:
      item.partOfSpeech ??
      [],

    tags:
      item.tags ??
      [],

    example:
      item.example ??
      "",

    examplePinyin:
      item.examplePinyin ??
      "",

    exampleMyanmar:
      item.exampleMyanmar ??
      "",
  };
}


export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    const {
      level: rawLevel,
    } =
      await context.params;


    const level =
      parseLevel(
        rawLevel,
      );


    if (!level) {
      return NextResponse.json(
        {
          allowed: false,
          error:
            "Invalid HSK level.",
        },
        {
          status: 400,
        },
      );
    }


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
      await admin.auth
        .getUser(
          accessToken,
        );


    if (
      userError ||
      !user
    ) {
      console.error(
        "Mobile HSK auth error:",
        userError?.message,
      );

      return unauthorized();
    }


    let allowed =
      level === 1;

    let accessSource:
      | "free"
      | "full"
      | "level"
      | "none" =
      level === 1
        ? "free"
        : "none";


    if (
      level !== 1
    ) {
      const {
        data:
          accessRows,
        error:
          accessError,
      } =
        await admin
          .from(
            "user_hsk_access",
          )
          .select(
            "product_code,level",
          )
          .eq(
            "user_id",
            user.id,
          );


      if (accessError) {
        console.error(
          "Mobile HSK access query failed:",
          {
            userId:
              user.id,

            level,

            message:
              accessError.message,
          },
        );

        return NextResponse.json(
          {
            allowed: false,
            error:
              "Unable to check HSK access.",
          },
          {
            status: 500,
          },
        );
      }


      const rows =
        accessRows ??
        [];


      const hasFull =
        rows.some(
          (
            row,
          ) =>
            row.product_code ===
            "hsk_full",
        );


      const hasLevel =
        rows.some(
          (
            row,
          ) =>
            row.product_code ===
              `hsk_${level}` ||
            Number(
              row.level,
            ) ===
              level,
        );


      if (hasFull) {
        allowed =
          true;

        accessSource =
          "full";
      } else if (
        hasLevel
      ) {
        allowed =
          true;

        accessSource =
          "level";
      }
    }


    if (!allowed) {
      return NextResponse.json(
        {
          allowed: false,

          level,

          accessSource:
            "none",

          words: [],
        },
        {
          status: 403,

          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }


    const words =
      getVocabulary(
        level,
      ).map(
        normalizeWord,
      );


    return NextResponse.json(
      {
        allowed:
          true,

        level,

        accessSource,

        count:
          words.length,

        words,
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
      "Mobile HSK endpoint error:",
      error,
    );

    return NextResponse.json(
      {
        allowed: false,
        error:
          "Unable to load HSK vocabulary.",
      },
      {
        status: 500,
      },
    );
  }
}