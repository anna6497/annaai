import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Body {
  burmese?: unknown;
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY မတွေ့ပါ။" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Body;
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

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions: `
Convert the user's Burmese sentence into natural Mandarin.

Return JSON only.

Rules:
- Do not answer it as a conversation.
- Preserve the exact intended meaning.
- Use Simplified Chinese.
- Give complete pinyin with tone marks.
- Keep the original Burmese meaning in Myanmar Unicode.
- Give one spoken alternative only when useful.
`.trim(),
      input: burmese,
      max_output_tokens: 1200,
      text: {
        format: {
          type: "json_schema",
          name: "sentence_builder_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              hanzi: { type: "string" },
              pinyin: { type: "string" },
              myanmar: { type: "string" },
              alternativeHanzi: { type: "string" },
              alternativePinyin: { type: "string" },
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

    if (response.status === "incomplete") {
      return NextResponse.json(
        { error: "Chinese sentence generation မပြည့်စုံပါ။ ပြန်စမ်းပါ။" },
        { status: 502 }
      );
    }

    const output = response.output_text?.trim();

    if (!output) {
      return NextResponse.json(
        { error: "Chinese sentence မရပါ။" },
        { status: 502 }
      );
    }

    try {
      return NextResponse.json(JSON.parse(output), {
        headers: { "Cache-Control": "no-store" },
      });
    } catch {
      console.error("Invalid structured output:", output);
      return NextResponse.json(
        { error: "Chinese result format မှားသွားပါတယ်။ ပြန်စမ်းပါ။" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Sentence builder error:", error);

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
