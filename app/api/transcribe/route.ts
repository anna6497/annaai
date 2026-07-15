import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const formData =
      await request.formData();

    const audio =
      formData.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "Audio file မတွေ့ပါ။" },
        { status: 400 }
      );
    }

    if (audio.size < 700) {
      return NextResponse.json(
        { error: "အသံဖိုင်က အလွန်တိုနေပါတယ်။" },
        { status: 400 }
      );
    }

    const openai =
      new OpenAI({ apiKey });

    const transcription =
      await openai.audio.transcriptions.create({
        file: audio,
        model: "gpt-4o-transcribe",
        prompt: [
          "The speaker is speaking Burmese, also called Myanmar language.",
          "Transcribe into Myanmar Unicode only.",
          "Do not translate.",
          "Do not use Latin romanization.",
          "Preserve the exact spoken wording as closely as possible.",
          "The speaker may use casual Burmese pronunciation and a Myanmar accent.",
        ].join(" "),
        response_format: "json",
      });

    const text =
      transcription.text?.trim();

    if (!text) {
      return NextResponse.json(
        {
          error:
            "အသံကို နားမလည်ပါ။ ပိုရှင်းရှင်း ပြန်ပြောပါ။",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { text },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Transcription error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "မြန်မာအသံကို စာသားပြောင်းမရပါ။",
      },
      { status: 500 }
    );
  }
}
