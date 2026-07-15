import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  burmese?: unknown;
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

    const burmese =
      typeof body.burmese === "string"
        ? body.burmese.trim()
        : "";

    if (!burmese) {
      return NextResponse.json(
        { error: "မြန်မာစာ မရှိပါ။" },
        { status: 400 }
      );
    }

    const openai =
      new OpenAI({ apiKey });

    const response =
      await openai.responses.create({
        model: "gpt-4.1-mini",
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
`.trim(),
        input: burmese,
        max_output_tokens: 1000,
        text: {
          format: {
            type: "json_schema",
            name:
              "mobile_myanmar_sentence",
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
                alternativeHanzi: {
                  type: "string",
                },
                alternativePinyin: {
                  type: "string",
                },
              },
              required: [
                "hanzi",
                "pinyin",
                "myanmar",
                "alternativeHanzi",
                "alternativePinyin",
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
        { error: "တရုတ်စာကြောင်း မရပါ။" },
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
        "Sentence builder invalid JSON:",
        output
      );

      return NextResponse.json(
        {
          error:
            "တရုတ်စာကြောင်း result မပြည့်စုံပါ။ ပြန်စမ်းပါ။",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error(
      "Sentence builder error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "တရုတ်စာကြောင်း စီမရပါ။",
      },
      { status: 500 }
    );
  }
}
