import {
  NextResponse,
} from "next/server";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


type IncorrectCharacter = {
  expected: string;

  recognized: string;
};


type RequestBody = {
  sentenceId?: unknown;

  level?: unknown;

  lesson?: unknown;

  category?: unknown;

  targetText?: unknown;

  recognizedText?: unknown;

  overallScore?: unknown;

  accuracyScore?: unknown;

  completenessScore?: unknown;

  fluencyScore?: unknown;

  missingCharacters?: unknown;

  extraCharacters?: unknown;

  incorrectCharacters?: unknown;

  recordingDurationSeconds?: unknown;

  processingSeconds?: unknown;
};


function unauthorized() {
  return NextResponse.json(
    {
      error:
        "Unauthorized",
    },
    {
      status:
        401,

      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}


function normalizeNumber(
  value: unknown,
): number {
  const number =
    Number(value);

  return Number.isFinite(
    number,
  )
    ? number
    : 0;
}


function normalizeStringArray(
  value: unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item ===
        "string",
    )
    .map(
      (
        item,
      ) =>
        item.trim(),
    )
    .filter(
      Boolean,
    );
}


function normalizeIncorrectCharacters(
  value: unknown,
): IncorrectCharacter[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value.flatMap(
    (
      item,
    ) => {
      if (
        !item ||
        typeof item !==
          "object" ||
        !(
          "expected" in
          item
        )
      ) {
        return [];
      }

      const expected =
        typeof item.expected ===
        "string"
          ? item.expected.trim()
          : "";

      const recognized =
        "recognized" in
          item &&
        typeof item.recognized ===
          "string"
          ? item.recognized.trim()
          : "";

      if (!expected) {
        return [];
      }

      return [
        {
          expected,
          recognized,
        },
      ];
    },
  );
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

    let body:
      RequestBody;

    try {
      body =
        (await request.json()) as
          RequestBody;
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status:
            400,
        },
      );
    }

    const sentenceId =
      typeof body.sentenceId ===
      "string"
        ? body.sentenceId.trim()
        : "";

    const targetText =
      typeof body.targetText ===
      "string"
        ? body.targetText.trim()
        : "";

    const recognizedText =
      typeof body.recognizedText ===
      "string"
        ? body.recognizedText.trim()
        : "";

    const category =
      typeof body.category ===
      "string"
        ? body.category.trim()
        : "";

    const level =
      normalizeNumber(
        body.level,
      );

    const lesson =
      normalizeNumber(
        body.lesson,
      );

    if (!sentenceId) {
      return NextResponse.json(
        {
          error:
            "sentenceId is required.",
        },
        {
          status:
            400,
        },
      );
    }

    if (!targetText) {
      return NextResponse.json(
        {
          error:
            "targetText is required.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      level < 1 ||
      level > 6
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid pronunciation level.",
        },
        {
          status:
            400,
        },
      );
    }

    const {
      data,
      error,
    } =
      await admin
        .from(
          "ai_speaking_pronunciation_attempts",
        )
        .insert({
          user_id:
            user.id,

          review_session_id:
            null,

          sentence_id:
            sentenceId,

          level,

          lesson,

          category,

          target_text:
            targetText,

          recognized_text:
            recognizedText,

          overall_score:
            normalizeNumber(
              body.overallScore,
            ),

          accuracy_score:
            normalizeNumber(
              body.accuracyScore,
            ),

          completeness_score:
            normalizeNumber(
              body.completenessScore,
            ),

          fluency_score:
            normalizeNumber(
              body.fluencyScore,
            ),

          missing_characters:
            normalizeStringArray(
              body.missingCharacters,
            ),

          extra_characters:
            normalizeStringArray(
              body.extraCharacters,
            ),

          incorrect_characters:
            normalizeIncorrectCharacters(
              body.incorrectCharacters,
            ),

          recording_duration_seconds:
            normalizeNumber(
              body.recordingDurationSeconds,
            ),

          processing_seconds:
            normalizeNumber(
              body.processingSeconds,
            ),
        })
        .select(
          "id",
        )
        .single();

    if (error) {
      console.error(
        "Mobile pronunciation attempt save error:",
        {
          userId:
            user.id,

          message:
            error.message,
        },
      );

      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status:
            500,
        },
      );
    }

    return NextResponse.json(
      {
        saved:
          true,

        id:
          String(
            data.id,
          ),
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "Mobile pronunciation attempt endpoint error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to save pronunciation attempt.",
      },
      {
        status:
          500,
      },
    );
  }
}