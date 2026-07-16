import { NextResponse } from "next/server";
import {
  startVoiceUsage,
  stopVoiceUsage,
} from "../../../../lib/voice-usage";

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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Realtime session မဖွင့်နိုင်ပါ။";
  }
}

export async function POST(
  request: Request
) {
  let usageStarted = false;

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

    console.log(
      "Starting voice usage check..."
    );

    const usage =
      await startVoiceUsage();

    console.log(
      "Voice usage result:",
      usage
    );

    usageStarted = usage.allowed;

    if (
      !usage.allowed ||
      usage.remainingSeconds <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "ဒီနေ့ Voice Usage limit ပြည့်သွားပါပြီ။ မနက်ဖြန် ပြန်သုံးနိုင်ပါတယ်။",
          ...usage,
        },
        { status: 429 }
      );
    }

    const sdp =
      await request.text();

    if (!sdp.trim()) {
      await stopVoiceUsage();

      return NextResponse.json(
        {
          error:
            "WebRTC SDP မတွေ့ပါ။",
        },
        { status: 400 }
      );
    }

    const sessionConfig = {
      type: "realtime",
      model: "gpt-realtime-2.1",
      instructions:
        ANNA_INSTRUCTIONS,
      output_modalities: ["audio"],
      audio: {
        input: {
          noise_reduction: {
            type: "near_field",
          },
          transcription: {
            model:
              "gpt-4o-transcribe",
            prompt:
              "The speaker is speaking Mandarin Chinese. Transcribe accurately using Simplified Chinese characters. Do not translate or add pinyin.",
          },
          turn_detection: {
            type: "semantic_vad",
            eagerness: "low",
            create_response: true,
            interrupt_response: true,
          },
        },
        output: {
          voice: "marin",
        },
      },
    };

    const formData =
      new FormData();

    formData.set("sdp", sdp);

    formData.set(
      "session",
      JSON.stringify(sessionConfig)
    );

    console.log(
      "Requesting OpenAI Realtime session..."
    );

    const response =
      await fetch(
        "https://api.openai.com/v1/realtime/calls",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${apiKey}`,
          },
          body: formData,
          cache: "no-store",
        }
      );

    const responseBody =
      await response.text();

    console.log(
      "OpenAI Realtime status:",
      response.status
    );

    if (!response.ok) {
      console.error(
        "OpenAI Realtime response error:",
        response.status,
        responseBody
      );

      await stopVoiceUsage();

      return NextResponse.json(
        {
          error:
            responseBody ||
            `Realtime session မဖွင့်နိုင်ပါ။ (${response.status})`,
        },
        {
          status: response.status,
        }
      );
    }

    return new NextResponse(
      responseBody,
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/sdp",
          "Cache-Control":
            "no-store, max-age=0",
          "X-Voice-Plan":
            usage.plan,
          "X-Voice-Limit-Seconds":
            String(
              usage.limitSeconds
            ),
          "X-Voice-Used-Seconds":
            String(
              usage.usedSeconds
            ),
          "X-Voice-Remaining-Seconds":
            String(
              usage.remainingSeconds
            ),
        },
      }
    );
  } catch (error) {
    console.error(
      "Realtime session failed:",
      error
    );

    if (usageStarted) {
      try {
        await stopVoiceUsage();
      } catch (stopError) {
        console.error(
          "Failed to stop voice usage:",
          stopError
        );
      }
    }

    const message =
      getErrorMessage(error);

    return NextResponse.json(
      {
        error:
          message ===
          "UNAUTHORIZED"
            ? "Login ဝင်ပြီးမှ Voice သုံးနိုင်ပါတယ်။"
            : message ||
              "Realtime session မဖွင့်နိုင်ပါ။",
      },
      {
        status:
          message ===
          "UNAUTHORIZED"
            ? 401
            : 500,
      }
    );
  }
}