import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  hanzi?: unknown;
}

export async function POST(
  request: Request
) {
  try {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY မတွေ့ပါ။" },
        { status: 500 }
      );
    }

    const body =
      (await request.json()) as RequestBody;

    const hanzi =
      typeof body.hanzi === "string"
        ? body.hanzi.trim()
        : "";

    if (!hanzi) {
      return NextResponse.json(
        { error: "Hanzi မရှိပါ။" },
        { status: 400 }
      );
    }

    const openai =
      new OpenAI({ apiKey });

    const response =
      await openai.responses.create({
        model: "gpt-4.1-mini",
        instructions: `
Format the complete Chinese reply.

Return only JSON matching the schema.

Rules:
- Preserve every Chinese sentence.
- Produce complete Hanyu Pinyin with tone marks.
- Produce a complete natural Myanmar Unicode translation.
- Never shorten the reply.
- Do not add markdown.
`.trim(),
        input: hanzi,
        max_output_tokens: 2400,
        text: {
          format: {
            type: "json_schema",
            name:
              "mobile_complete_reply",
            strict: true,
            schema: {
              type: "object",
              properties: {
                hanzi: {
                  type: "string",
                },
                pinyin: {
                  type: "string",
                },
                myanmar: {
                  type: "string",
                },
              },
              required: [
                "hanzi",
                "pinyin",
                "myanmar",
              ],
              additionalProperties: false,
            },
          },
        },
      });

    const output =
      response.output_text?.trim();

    if (!output) {
      return NextResponse.json(
        { error: "Formatted reply မရပါ။" },
        { status: 502 }
      );
    }

    try {
      return NextResponse.json(
        JSON.parse(output),
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    } catch {
      console.error(
        "Format reply invalid JSON:",
        output
      );

      return NextResponse.json(
        {
          error:
            "Pinyin/Myanmar result မပြည့်စုံပါ။ ပြန်စမ်းပါ။",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error(
      "Format reply error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Reply format မလုပ်နိုင်ပါ။",
      },
      { status: 500 }
    );
  }
}
