import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type LoginBody = {
  email?: string;
  password?: string;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid request body.",
      },
      {
        status: 400,
      },
    );
  }

  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";

  if (!email) {
    return NextResponse.json(
      {
        ok: false,
        error: "Email is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!password) {
    return NextResponse.json(
      {
        ok: false,
        error: "Password is required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const supabase = await createClient();

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      console.error("Login sign-in error:", error);

      const normalizedMessage =
        error.message.toLowerCase();

      let message = error.message || "Login failed.";

      if (
        normalizedMessage.includes(
          "invalid login credentials",
        )
      ) {
        message = "Email သို့မဟုတ် Password မှားနေပါတယ်။";
      } else if (
        normalizedMessage.includes(
          "email not confirmed",
        )
      ) {
        message =
          "Email confirmation လုပ်ပြီးမှ Login ဝင်နိုင်ပါတယ်။";
      }

      return NextResponse.json(
        {
          ok: false,
          error: message,
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

    if (!data.user || !data.session) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Login အောင်မြင်ပေမယ့် session မရရှိပါ။ ပြန်စမ်းပေးပါ။",
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
          id: data.user.id,
          email: data.user.email ?? email,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Login API unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Login service is temporarily unavailable.",
      },
      {
        status: 500,
      },
    );
  }
}