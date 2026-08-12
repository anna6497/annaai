import { NextResponse } from "next/server";

import {
  getVocabularyByLevel,
} from "@/lib/hsk-vocabulary";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";

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


type MobileWritingCharacter = {
  index: number;

  hanzi: string;

  pinyin: string;

  myanmar: string;

  radical: string;

  example: string;

  examplePinyin: string;

  exampleMyanmar: string;
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
      error:
        "HSK level access required.",
    },
    {
      status: 403,

      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}


function isHskLevel(
  value: number,
): value is HskLevel {
  return (
    Number.isInteger(
      value,
    ) &&
    value >= 1 &&
    value <= 9
  );
}


function isChineseCharacter(
  character: string,
): boolean {
  return /[\u3400-\u9fff]/u.test(
    character,
  );
}


/*
 * Website WritingClient currently builds
 * its writing list from HSK vocabulary.
 *
 * Mobile must use the same source so both
 * website and app stay synchronized.
 */
function buildWritingCharacters(
  level: HskLevel,
): MobileWritingCharacter[] {
  const words =
    getVocabularyByLevel(
      level,
    );

  const seen =
    new Set<string>();

  const characters:
    MobileWritingCharacter[] =
      [];


  for (
    const word
    of words
  ) {
    for (
      const character
      of Array.from(
        word.hanzi,
      )
    ) {
      if (
        !isChineseCharacter(
          character,
        ) ||
        seen.has(
          character,
        )
      ) {
        continue;
      }


      seen.add(
        character,
      );


      /*
       * Find the best vocabulary entry
       * containing this character.
       *
       * Character-specific pronunciation
       * data does not currently exist in
       * the vocabulary source, so for
       * single-character words we can
       * safely show that word's Pinyin
       * and meaning.
       *
       * For characters coming from
       * multi-character words we avoid
       * showing misleading whole-word
       * Pinyin as character Pinyin.
       */
      const sourceWord:
        HskVocabularyItem =
          word;


      const isSingleCharacterWord =
        Array.from(
          sourceWord.hanzi,
        ).length === 1;


      const example =
        sourceWord.example ??
        sourceWord.examples?.[0]
          ?.hanzi ??
        "";


      const examplePinyin =
        sourceWord.examplePinyin ??
        sourceWord.examples?.[0]
          ?.pinyin ??
        "";


      const exampleMyanmar =
        sourceWord.exampleMyanmar ??
        sourceWord.examples?.[0]
          ?.meaningMyanmar ??
        sourceWord.examples?.[0]
          ?.meaning ??
        "";


      const myanmar =
        sourceWord.myanmar ??
        sourceWord.meaningMyanmar ??
        "";


      characters.push({
        index:
          characters.length,

        hanzi:
          character,

        pinyin:
          isSingleCharacterWord
            ? sourceWord.pinyin ??
              ""
            : "",

        myanmar:
          isSingleCharacterWord
            ? myanmar
            : "",

        /*
         * Current HSK vocabulary dataset
         * does not provide radical data.
         */
        radical:
          "",

        example,

        examplePinyin,

        exampleMyanmar,
      });
    }
  }


  return characters;
}


export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    const {
      level:
        rawLevel,
    } =
      await context.params;


    const levelNumber =
      Number(
        rawLevel,
      );


    if (
      !isHskLevel(
        levelNumber,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid HSK level.",
        },
        {
          status:
            400,
        },
      );
    }


    const level =
      levelNumber;


    /*
     * HSK 1:
     * free
     *
     * HSK 2-9:
     * existing HSK purchase required.
     */
    if (
      level !== 1
    ) {
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


      if (
        !accessToken
      ) {
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
        return unauthorized();
      }


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
            "product_code,level,lifetime",
          )
          .eq(
            "user_id",
            user.id,
          );


      if (
        accessError
      ) {
        console.error(
          "Mobile HSK Writing access error:",
          accessError,
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


      const allowed =
        (
          accessRows ??
          []
        ).some(
          (
            row,
          ) =>
            row.product_code ===
              "hsk_full" ||
            row.product_code ===
              `hsk_${level}` ||
            Number(
              row.level,
            ) ===
              level,
        );


      if (
        !allowed
      ) {
        return forbidden();
      }
    }


    const characters =
      buildWritingCharacters(
        level,
      );


    const CHARACTERS_PER_LESSON =
      5;


    const lessonCount =
      characters.length ===
      0
        ? 0
        : Math.ceil(
            characters.length /
              CHARACTERS_PER_LESSON,
          );


    const lessons =
      Array.from(
        {
          length:
            lessonCount,
        },
        (
          _,
          lessonIndex,
        ) => {
          const start =
            lessonIndex *
            CHARACTERS_PER_LESSON;


          const lessonCharacters =
            characters.slice(
              start,
              start +
                CHARACTERS_PER_LESSON,
            );


          return {
            lessonNumber:
              lessonIndex +
              1,

            title:
              `Lesson ${
                lessonIndex +
                1
              }`,

            characterCount:
              lessonCharacters.length,

            characters:
              lessonCharacters,
          };
        },
      );


    return NextResponse.json(
      {
        level,

        free:
          level === 1,

        characterCount:
          characters.length,

        lessonCount,

        characters,

        lessons,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "Mobile HSK Writing endpoint error:",
      error,
    );


    return NextResponse.json(
      {
        error:
          "Unable to load HSK Writing.",
      },
      {
        status:
          500,
      },
    );
  }
}