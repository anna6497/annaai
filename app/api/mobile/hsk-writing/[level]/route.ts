import { NextResponse } from "next/server";

import {
  getWritingCharacters,
  getWritingLessonCount,
  getWritingLessons,
  isValidHskLevel,
} from "@/lib/hsk-writing-data";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    level: string;
  }>;
};

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

function forbidden() {
  return NextResponse.json(
    {
      error: "HSK level access required.",
    },
    {
      status: 403,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    const { level: rawLevel } =
      await context.params;

    const level = Number(rawLevel);

    if (!isValidHskLevel(level)) {
      return NextResponse.json(
        {
          error: "Invalid HSK level.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * HSK 1 is free.
     *
     * HSK 2-9 require the user's
     * existing HSK purchase.
     */
    if (level !== 1) {
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
        data: { user },
        error: userError,
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
        data: accessRows,
        error: accessError,
      } =
        await admin
          .from("user_hsk_access")
          .select(
            "product_code,level",
          )
          .eq(
            "user_id",
            user.id,
          );

      if (accessError) {
        console.error(
          "Mobile HSK writing access error:",
          accessError,
        );

        return NextResponse.json(
          {
            error:
              "Unable to check HSK access.",
          },
          {
            status: 500,
          },
        );
      }

      const allowed =
        (accessRows ?? []).some(
          (row) =>
            row.product_code ===
              "hsk_full" ||
            row.product_code ===
              `hsk_${level}` ||
            Number(row.level) ===
              level,
        );

      if (!allowed) {
        return forbidden();
      }
    }

    const characters =
      getWritingCharacters(level);

    const lessons =
      getWritingLessons(level);

    return NextResponse.json(
      {
        level,

        free:
          level === 1,

        characterCount:
          characters.length,

        lessonCount:
          getWritingLessonCount(
            level,
          ),

        characters:
          characters.map(
            (
              character,
              index,
            ) => ({
              index,

              hanzi:
                character.hanzi,

              pinyin:
                character.pinyin,

              myanmar:
                character.myanmar,

              radical:
                character.radical,

              example:
                character.example,

              examplePinyin:
                character.examplePinyin,

              exampleMyanmar:
                character.exampleMyanmar,
            }),
          ),

        lessons:
          lessons.map(
            (lesson) => ({
              lessonNumber:
                lesson.lessonNumber,

              title:
                lesson.title,

              characterCount:
                lesson.characterCount,

              characters:
                lesson.characters.map(
                  (
                    character,
                    characterIndex,
                  ) => ({
                    index:
                      (lesson.lessonNumber -
                        1) *
                        5 +
                      characterIndex,

                    hanzi:
                      character.hanzi,

                    pinyin:
                      character.pinyin,

                    myanmar:
                      character.myanmar,

                    radical:
                      character.radical,

                    example:
                      character.example,

                    examplePinyin:
                      character.examplePinyin,

                    exampleMyanmar:
                      character.exampleMyanmar,
                  }),
                ),
            }),
          ),
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
      "Mobile HSK writing endpoint error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load HSK writing.",
      },
      {
        status: 500,
      },
    );
  }
}