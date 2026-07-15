import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INSTRUCTIONS = `
You are Anna, a warm and friendly Chinese-speaking friend for Burmese learners.

RULES:
- The user speaks Mandarin Chinese.
- Reply naturally in Simplified Chinese.
- Use 2–4 short, everyday Mandarin sentences.
- React like a friend and ask one short follow-up question when natural.
- Speak and output Chinese Hanzi only.
- Never speak or output pinyin, Burmese, labels, explanations, or markdown.
- Keep listening for the next turn until the user stops.
`.trim();

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY မတွေ့ပါ။" },
        { status: 500 }
      );
    }

    const sdp = await request.text();

    if (!sdp.trim()) {
      return NextResponse.json(
        { error: "WebRTC SDP မတွေ့ပါ။" },
        { status: 400 }
      );
    }

    const sessionConfig = {
      type: "realtime",
      model: "gpt-realtime-2.1",
      instructions: INSTRUCTIONS,
      output_modalities: ["audio"],
      audio: {
        input: {
          noise_reduction: {
            type: "near_field",
          },
          transcription: {
            model: "gpt-4o-transcribe",
            prompt:
              "The speaker is speaking Mandarin Chinese. Transcribe accurately using Simplified Chinese characters. Do not translate and do not add pinyin.",
          },
          turn_detection: {
            type: "semantic_vad",
            eagerness: "auto",
            create_response: true,
            interrupt_response: true,
          },
        },
        output: {
          voice: "marin",
        },
      },
    };

    const formData = new FormData();
    formData.set("sdp", sdp);
    formData.set("session", JSON.stringify(sessionConfig));

    const openAIResponse = await fetch(
      "https://api.openai.com/v1/realtime/calls",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
        cache: "no-store",
      }
    );

    const responseText = await openAIResponse.text();

    if (!openAIResponse.ok) {
      console.error(
        "Realtime session error:",
        openAIResponse.status,
        responseText
      );

      return NextResponse.json(
        {
          error:
            responseText ||
            `Realtime session မဖွင့်နိုင်ပါ။ (${openAIResponse.status})`,
        },
        { status: openAIResponse.status }
      );
    }

    return new NextResponse(responseText, {
      status: 200,
      headers: {
        "Content-Type": "application/sdp",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Realtime session route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Realtime session မဖွင့်နိုင်ပါ။",
      },
      { status: 500 }
    );
  }
}
