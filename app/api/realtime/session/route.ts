import { NextResponse } from "next/server";
import { startVoiceUsage, stopVoiceUsage } from "../../../../lib/voice-usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANNA_INSTRUCTIONS = `
You are Anna, the user's warm, playful Chinese-speaking friend.

LANGUAGE:
- Speak natural Simplified Mandarin Chinese.
- Speak and output Hanzi only.
- Never speak pinyin, Burmese, English, headings, or formatting labels.

NORMAL CONVERSATION:
- Reply with one or two short natural Chinese sentences only.
- Never exceed two sentences unless the user explicitly asks for a story,
  a detailed explanation, a role-play, or a song.
- Keep ordinary replies concise and let the user speak more than you.
- Ask at most one short follow-up question.
- Do not repeat or summarize what the user just said.

SPECIAL REQUESTS:
- If the user asks you to speak slowly, actually use shorter clauses,
  simple words, clear pauses, and a noticeably slower speaking pace.
- If asked for a complete story, finish the story before asking one final question.
- Do not repeatedly ask whether the user wants to continue.
- Correct important pronunciation mistakes briefly, playfully, and kindly.
- You may gently scold laziness without insulting the user.
- You may sing a short original Chinese song or hum.
- Never reproduce copyrighted song lyrics.

PUSH-TO-TALK BEHAVIOR:
- The user speaks only while holding the microphone button.
- Wait for the user's completed turn, then answer.
- Do not fill silence with extra speech.
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
          transcription: {
            model: "gpt-4o-transcribe",
            prompt: [
              "The speaker is speaking Mandarin Chinese.",
              "Transcribe the exact spoken words into Simplified Chinese.",
              "Do not paraphrase or replace words with a more common phrase.",
              "Preserve short beginner expressions exactly.",
              "Possible phrases include 我不想听, 我不喜欢吃, 我听不懂, 请再说一次.",
              "Output only Simplified Chinese.",
              "Do not translate and do not add pinyin.",
            ].join(" "),
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 400,
            silence_duration_ms: 550,
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
