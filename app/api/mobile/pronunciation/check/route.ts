import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    {
      error: "Unauthorized",
    },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function getVoiceApiUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_VOICE_API_URL?.trim();

  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_VOICE_API_URL is not configured.",
    );
  }

  return apiUrl.replace(/\/+$/, "");
}

export async function POST(
  request: Request,
) {
  try {
    const authorization =
      request.headers.get(
        "authorization",
      );

    if (
      !authorization?.startsWith(
        "Bearer ",
      )
    ) {
      return unauthorized();
    }

    const accessToken =
      authorization
        .slice(7)
        .trim();

    if (!accessToken) {
      return unauthorized();
    }

    const admin =
      createSupabaseAdminClient();

    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await admin.auth.getUser(
        accessToken,
      );

    if (
      userError ||
      !user
    ) {
      return unauthorized();
    }

    const formData =
      await request.formData();

    const audio =
      formData.get(
        "audio",
      );

    const sentenceId =
      formData.get(
        "sentence_id",
      );

    const targetText =
      formData.get(
        "target_text",
      );

    const durationSeconds =
      formData.get(
        "duration_seconds",
      );

    if (
      !(audio instanceof File)
    ) {
      return NextResponse.json(
        {
          error:
            "Audio file is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof sentenceId !==
        "string" ||
      !sentenceId.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "sentence_id is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof targetText !==
        "string" ||
      !targetText.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "target_text is required.",
        },
        {
          status: 400,
        },
      );
    }

    const voiceFormData =
      new FormData();

    voiceFormData.append(
      "audio",
      audio,
      audio.name ||
        "pronunciation.m4a",
    );

    voiceFormData.append(
      "sentence_id",
      sentenceId,
    );

    voiceFormData.append(
      "target_text",
      targetText,
    );

    voiceFormData.append(
      "duration_seconds",
      typeof durationSeconds ===
        "string"
        ? durationSeconds
        : "0",
    );

    const voiceResponse =
      await fetch(
        `${getVoiceApiUrl()}/v6/pronunciation/check`,
        {
          method:
            "POST",

          body:
            voiceFormData,
        },
      );

    const body =
      await voiceResponse
        .json()
        .catch(
          () => null,
        );

    if (!voiceResponse.ok) {
      const detail =
        body &&
        typeof body ===
          "object" &&
        "detail" in body &&
        typeof body.detail ===
          "string"
          ? body.detail
          : "Pronunciation checking failed.";

      return NextResponse.json(
        {
          error:
            detail,
        },
        {
          status:
            voiceResponse.status,
        },
      );
    }

    return NextResponse.json(
      body,
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Mobile pronunciation endpoint error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Pronunciation checking failed.",
      },
      {
        status: 500,
      },
    );
  }
}