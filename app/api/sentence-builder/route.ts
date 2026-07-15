import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  burmese?: unknown;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY မတွေ့ပါ။" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as RequestBody;

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

    const openai = new OpenAI({ apiKey });

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions: `
You are a Burmese-to-Chinese sentence builder.

Return valid JSON only:
{
  "hanzi": "one simple, natural Mandarin sentence",
  "pinyin": "complete Hanyu Pinyin with tone marks",
  "myanmar": "the same Burmese meaning",
  "alternativeHanzi": "one more natural spoken alternative or an empty string",
  "alternativePinyin": "complete pinyin for the alternative or an empty string"
}

CRITICAL RULES:
- Never answer the Burmese statement as a conversation.
- Never ask a follow-up question.
- Never add advice.
- Preserve exactly what the user is trying to say.
- Use natural Simplified Chinese.
- Keep the main sentence concise.
- Use Myanmar Unicode.
- Do not add markdown or explanations.
`.trim(),
      input: burmese,
      max_output_tokens: 600,
      text: {
        format: {
          type: "json_schema",
          name: "burmese_to_chinese_sentence",
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

    const output = response.output_text?.trim();

    if (!output) {
      return NextResponse.json(
        { error: "တရုတ်စာကြောင်း မရပါ။" },
        { status: 502 }
      );
    }

    return NextResponse.json(JSON.parse(output), {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
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
