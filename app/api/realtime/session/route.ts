import { NextResponse } from "next/server";
import {
  startVoiceUsage,
  stopVoiceUsage,
} from "../../../../lib/voice-usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANNA_INSTRUCTIONS = `
You are Anna, the user's warm, playful Chinese-speaking friend.

LANGUAGE:
- Speak natural Simplified Mandarin.
- Speak and output Hanzi only.
- Never speak pinyin, Burmese, English, labels, or explanations about formatting.

DEFAULT RESPONSE LENGTH:
- For ordinary conversation, reply with exactly ONE short natural Chinese sentence.
- Keep ordinary replies under about 18 Chinese characters whenever possible.
- Do not repeat the user's sentence.
- Do not add greetings, summaries, encouragement, or multiple follow-up questions unless useful.
- Ask at most one short follow-up question.
- Never turn a simple user message into a lesson.

LONGER RESPONSES:
- Give a longer response only when the user explicitly asks for a story,
  detailed explanation, example, correction, role-play, or song.
- Even then, be concise and avoid repetition.
- For a story, finish the requested story before asking one final short question.
- Do not repeatedly ask whether the user wants to continue.

SPEAKING STYLE:
- If the user asks you to speak slowly, use short clauses, simple words,
  clear pauses, and a noticeably slower pace until they ask for normal speed.
- If the user's pronunciation has an important mistake, correct it briefly,
  playfully, and kindly in one short sentence.
- You may laugh naturally, but never humiliate or insult the user.
- You may gently scold laziness without being hurtful.
- You may sing only a very short original Chinese song or hum.
- Never reproduce copyrighted song lyrics.

CONVERSATION:
- Be warm, friendly, playful, and natural.
- Let the user speak more than you.
- Prefer short reactions such as “真的呀？”、“太好了！”、“你今天怎么样？”
  instead of long speeches.
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
          noise_reduction: {
            type: "near_field",
          },
          transcription: {
            model: "gpt-4o-transcribe",
            prompt:
              "The speaker is speaking Mandarin Chinese. Transcribe accurately in Simplified Chinese. Do not translate. Do not add pinyin.",
          },
          turn_detection: {
            type: "semantic_vad",
            eagerness: "medium",
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
    formData.set(
      "session",
      JSON.stringify(sessionConfig)
    );

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

    const responseBody = await response.text();

    if (!response.ok) {
      await stopVoiceUsage();

      console.error(
        "OpenAI Realtime session error:",
        response.status,
        responseBody
      );

      let friendlyError =
        `Realtime session မဖွင့်နိုင်ပါ။ (${response.status})`;

      try {
        const parsed = JSON.parse(responseBody);
        const apiMessage =
          parsed?.error?.message ||
          parsed?.error ||
          responseBody;

        if (
          typeof apiMessage === "string" &&
          apiMessage.includes("insufficient_quota")
        ) {
          friendlyError =
            "OpenAI API credit မလောက်တော့ပါ။ Billing နဲ့ balance ကို စစ်ပါ။";
        } else if (typeof apiMessage === "string") {
          friendlyError = apiMessage;
        }
      } catch {
        if (responseBody.trim()) {
          friendlyError = responseBody;
        }
      }

      return NextResponse.json(
        { error: friendlyError },
        { status: response.status }
      );
    }

    return new NextResponse(responseBody, {
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

    const message = getErrorMessage(error);

    return NextResponse.json(
      {
        error:
          message === "UNAUTHORIZED"
            ? "Login ဝင်ပြီးမှ Voice သုံးနိုင်ပါတယ်။"
            : message ||
              "Realtime session မဖွင့်နိုင်ပါ။",
      },
      {
        status:
          message === "UNAUTHORIZED" ? 401 : 500,
      }
    );
  }
}
