import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES =
  20 * 1024 * 1024;

export async function POST(
  request: Request
) {
  try {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY မတွေ့ပါ။",
        },
        { status: 500 }
      );
    }

    const formData =
      await request.formData();

    const audio =
      formData.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Audio file မတွေ့ပါ။",
        },
        { status: 400 }
      );
    }

    if (audio.size < 2000) {
      return NextResponse.json(
        {
          error:
            "အသံဖိုင်က အလွန်တိုနေပါတယ်။",
        },
        { status: 400 }
      );
    }

    if (
      audio.size >
      MAX_AUDIO_BYTES
    ) {
      return NextResponse.json(
        {
          error:
            "အသံဖိုင်က 20 MB ထက်ကြီးနေပါတယ်။",
        },
        { status: 413 }
      );
    }

    const openai =
      new OpenAI({ apiKey });

    /*
     * Do not pass language: "my".
     * The transcription endpoint can auto-detect Burmese from
     * the audio plus this explicit prompt.
     */
    const transcription =
      await openai.audio.transcriptions.create({
        file: audio,
        model:
          "gpt-4o-transcribe",
        prompt: [
          "This audio contains one sentence spoken in Burmese (Myanmar language).",
          "Transcribe the spoken words faithfully into standard Myanmar Unicode.",
          "Do not translate.",
          "Do not summarize.",
          "Do not guess a different meaning.",
          "Do not use Latin letters unless the speaker actually says an English word.",
          "Keep casual Burmese particles such as နော်, လေ, ပါ, တယ်, မယ် when spoken.",
          "Return only the transcript.",
        ].join(" "),
        response_format: "json",
        temperature: 0,
      });

    const text =
      transcription.text?.trim();

    if (!text) {
      return NextResponse.json(
        {
          error:
            "အသံကို နားမလည်ပါ။ ဖုန်းကို ပါးစပ်နား 15–25 cm ခန့်ထားပြီး ပြန်ပြောပါ။",
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
      "Burmese transcription error:",
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
