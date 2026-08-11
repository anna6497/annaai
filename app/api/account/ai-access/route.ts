import { NextResponse } from "next/server";

import {
  getAiSpeakingAccess,
} from "@/lib/ai-speaking-access";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const access =
      await getAiSpeakingAccess();

    return NextResponse.json(
      access,
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Account AI access API error:",
      error,
    );

    return NextResponse.json(
      {
        active: false,
        planCode: null,
        planTitle: null,
        durationLabel: null,
        startsAt: null,
        expiresAt: null,
        lifetime: false,
      },
      {
        status: 500,
      },
    );
  }
}