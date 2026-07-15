import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  text?: unknown;
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

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    if (!text) {
      return NextResponse.json(
        { error: "ဖတ်ပြရန် Chinese စာမရှိပါ။" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "marin",
      input: text,
      instructions:
        "Speak warm, friendly, natural Mandarin Chinese. Read only the Chinese text.",
      response_format: "mp3",
    });

    const audio = Buffer.from(
      await speech.arrayBuffer()
    );

    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Speech error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "အသံထုတ်မရပါ။",
      },
      { status: 500 }
    );
  }
}
