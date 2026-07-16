import { NextResponse } from "next/server";
import { stopVoiceUsage } from "../../../../lib/voice-usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await stopVoiceUsage();

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Voice usage error";

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
