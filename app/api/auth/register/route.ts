import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

function normalizeEmail(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase();
}

export async function POST(
  request: Request,
) {
  let body: RegisterBody;

  try {
    body =
      (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid request body.",
      },
      {
        status: 400,
      },
    );
  }

  const name =
    body.name?.trim() ??
    "";

  const email =
    normalizeEmail(
      body.email ?? "",
    );

  const password =
    body.password ?? "";

  if (!name) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Name is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!email) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Email is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    password.length < 6
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Password must be at least 6 characters.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const supabase =
      await createClient();

    const {
      data,
      error,
    } =
      await supabase.auth.signUp(
        {
          email,
          password,

          options: {
            data: {
              name,
            },
          },
        },
      );

    if (error) {
      console.error(
        "Register sign-up error:",
        error,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            error.message ||
            "Register failed.",
        },
        {
          status:
            error.status &&
            error.status >= 400 &&
            error.status < 600
              ? error.status
              : 400,
        },
      );
    }

    if (!data.user) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Account could not be created.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        ok: true,

        user: {
          id:
            data.user.id,

          email:
            data.user.email ??
            email,
        },

        hasSession:
          Boolean(
            data.session,
          ),

        requiresEmailConfirmation:
          !data.session,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Register API unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Registration service is temporarily unavailable.",
      },
      {
        status: 500,
      },
    );
  }
}