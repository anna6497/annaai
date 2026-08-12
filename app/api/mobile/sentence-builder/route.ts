import OpenAI from "openai";
import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  burmese?: unknown;
}

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

export async function POST(
  request: Request,
) {
  try {
    /*
     * Mobile app sends the current
     * Supabase access token here.
     */
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

    /*
     * Verify the token server-side.
     *
     * Service-role credentials stay
     * only on the website backend.
     */
    const admin =
      createSupabaseAdminClient();

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await admin.auth.getUser(
        accessToken,
      );

    if (
      userError ||
      !user
    ) {
      console.error(
        "Mobile Sentence Builder auth error:",
        userError?.message,
      );

      return unauthorized();
    }

    /*
     * Read and validate input.
     */
    let body: RequestBody;

    try {
      body =
        (await request.json()) as RequestBody;
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const burmese =
      typeof body.burmese ===
      "string"
        ? body.burmese.trim()
        : "";

    if (!burmese) {
      return NextResponse.json(
        {
          error:
            "မြန်မာစာ ရေးပေးပါ။",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Prevent unnecessarily huge
     * requests from the mobile app.
     */
    if (
      burmese.length >
      1000
    ) {
      return NextResponse.json(
        {
          error:
            "စာကြောင်းက ရှည်လွန်းပါတယ်။",
        },
        {
          status: 400,
        },
      );
    }

    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error(
        "OPENAI_API_KEY is missing.",
      );

      return NextResponse.json(
        {
          error:
            "Sentence Builder is temporarily unavailable.",
        },
        {
          status: 500,
        },
      );
    }

    const openai =
      new OpenAI({
        apiKey,
      });

    const response =
      await openai.responses.create({
        model:
          "gpt-4.1-mini",

        instructions: `
Convert the user's Burmese sentence into natural Mandarin.

Return only JSON matching the schema.

Rules:
- Never answer it as a conversation.
- Preserve the exact intended meaning.
- Use natural Simplified Chinese.
- Give complete Hanyu Pinyin with tone marks.
- Keep the original Burmese meaning in Myanmar Unicode.
- Give one concise spoken alternative only when useful.
- Do not add explanations outside the JSON.
        `.trim(),

        input:
          burmese,

        max_output_tokens:
          1000,

        text: {
          format: {
            type:
              "json_schema",

            name:
              "mobile_myanmar_sentence",

            strict:
              true,

            schema: {
              type:
                "object",

              properties: {
                hanzi: {
                  type:
                    "string",
                },

                pinyin: {
                  type:
                    "string",
                },

                myanmar: {
                  type:
                    "string",
                },

                alternativeHanzi: {
                  type:
                    "string",
                },

                alternativePinyin: {
                  type:
                    "string",
                },
              },

              required: [
                "hanzi",
                "pinyin",
                "myanmar",
                "alternativeHanzi",
                "alternativePinyin",
              ],

              additionalProperties:
                false,
            },
          },
        },
      });

    const output =
      response.output_text?.trim();

    if (!output) {
      return NextResponse.json(
        {
          error:
            "Sentence Builder did not return a result.",
        },
        {
          status: 502,
        },
      );
    }

    let result:
      Record<
        string,
        unknown
      >;

    try {
      result =
        JSON.parse(
          output,
        ) as Record<
          string,
          unknown
        >;
    } catch {
      console.error(
        "Mobile Sentence Builder invalid JSON:",
        output,
      );

      return NextResponse.json(
        {
          error:
            "Sentence Builder returned an invalid result. Please try again.",
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json(
      {
        hanzi:
          typeof result.hanzi ===
          "string"
            ? result.hanzi
            : "",

        pinyin:
          typeof result.pinyin ===
          "string"
            ? result.pinyin
            : "",

        myanmar:
          typeof result.myanmar ===
          "string"
            ? result.myanmar
            : "",

        alternativeHanzi:
          typeof result.alternativeHanzi ===
          "string"
            ? result.alternativeHanzi
            : "",

        alternativePinyin:
          typeof result.alternativePinyin ===
          "string"
            ? result.alternativePinyin
            : "",
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
      "Mobile Sentence Builder error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Sentence Builder failed. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}