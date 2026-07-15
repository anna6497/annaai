import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY မတွေ့ပါ။" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "Audio file မတွေ့ပါ။" },
        { status: 400 }
      );
    }

    if (!audio.size) {
      return NextResponse.json(
        { error: "အသံဖိုင်က အလွတ်ဖြစ်နေပါတယ်။" },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "gpt-4o-transcribe",
      prompt: [
        "The speaker is speaking Burmese, also called Myanmar language.",
        "Transcribe in Myanmar Unicode.",
        "Do not translate.",
        "Do not romanize.",
        "Preserve the spoken words as closely as possible.",
      ].join(" "),
      response_format: "json",
    });

    const text = transcription.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "အသံကို နားမလည်ပါ။ ပိုရှင်းရှင်း ပြန်ပြောပါ။" },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { text },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Transcription error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "အသံကို စာသားပြောင်းမရပါ။",
      },
      { status: 500 }
    );
  }
}
