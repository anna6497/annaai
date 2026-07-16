import { NextResponse } from "next/server";
import { startVoiceUsage, stopVoiceUsage } from "../../../../lib/voice-usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANNA_INSTRUCTIONS = `
You are Anna, the user's warm, playful Chinese-speaking friend.

- Speak natural Simplified Mandarin.
- Speak and output Hanzi only.
- Never speak pinyin or Burmese.
- Normally answer with 2–5 natural sentences.
- If the user asks you to speak slowly, actually use shorter clauses,
  clear pauses, and a noticeably slower pace until they ask for normal speed.
- If asked for a complete story or detailed explanation, finish it from
  beginning to end before asking one final question.
- Do not repeatedly ask whether the user wants to continue.
- Correct important pronunciation mistakes playfully but kindly.
- You may gently scold laziness without insulting the user.
- You may sing short original Chinese songs or hum.
- Do not reproduce copyrighted lyrics.
`.trim();

export async function POST(request: Request) {
  let usageStarted = false;

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY မတွေ့ပါ။" },
        { status: 500 }
      );
    }

    const usage = await startVoiceUsage();
    usageStarted = usage.allowed;

    if (!usage.allowed || usage.remainingSeconds <= 0) {
      return NextResponse.json(
        {
          error:
            "ဒီနေ့ Voice Usage limit ပြည့်သွားပါပြီ။ မနက်ဖြန် ပြန်သုံးနိုင်ပါတယ်။",
          ...usage,
        },
        { status: 429 }
      );
    }

    const sdp = await request.text();

    if (!sdp.trim()) {
      await stopVoiceUsage();
      return NextResponse.json(
        { error: "WebRTC SDP မတွေ့ပါ။" },
        { status: 400 }
      );
    }

    const sessionConfig = {
      type: "realtime",
      model: "gpt-realtime-2.1",
      instructions: ANNA_INSTRUCTIONS,
      output_modalities: ["audio"],
      audio: {
        input: {
          /*
           * Do not apply Realtime noise reduction here.
           * Some phones already process the microphone audio.
           * Test this version against the previous one and keep
           * whichever produces the better transcript on your devices.
           */
          transcription: {
            model: "gpt-4o-transcribe",
            prompt: [
              "The speaker is speaking Mandarin Chinese.",
              "Transcribe the exact spoken words into Simplified Chinese.",
              "Do not paraphrase or replace the sentence with a more common phrase.",
              "Preserve short beginner expressions exactly.",
              "Examples of possible phrases include:",
              "我不想听。",
              "我不想说。",
              "我不喜欢吃。",
              "我听不懂。",
              "请再说一次。",
              "Output only Simplified Chinese.",
              "Do not translate and do not add pinyin.",
            ].join(" "),
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 400,
            silence_duration_ms: 900,
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

    const response = await fetch(
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

    const body = await response.text();

    if (!response.ok) {
      await stopVoiceUsage();

      return NextResponse.json(
        {
          error:
            body ||
            `Realtime session မဖွင့်နိုင်ပါ။ (${response.status})`,
        },
        { status: response.status }
      );
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/sdp",
        "Cache-Control": "no-store, max-age=0",
        "X-Voice-Plan": usage.plan,
        "X-Voice-Limit-Seconds": String(
          usage.limitSeconds
        ),
        "X-Voice-Used-Seconds": String(
          usage.usedSeconds
        ),
        "X-Voice-Remaining-Seconds": String(
          usage.remainingSeconds
        ),
      },
    });
  } catch (error) {
    if (usageStarted) {
      try {
        await stopVoiceUsage();
      } catch {}
    }

    const message =
      error instanceof Error
        ? error.message
        : "Realtime session မဖွင့်နိုင်ပါ။";

    return NextResponse.json(
      {
        error:
          message === "UNAUTHORIZED"
            ? "Login ဝင်ပြီးမှ Voice သုံးနိုင်ပါတယ်။"
            : message,
      },
      {
        status:
          message === "UNAUTHORIZED" ? 401 : 500,
      }
    );
  }
}
