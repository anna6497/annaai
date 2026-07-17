import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Next.js internal files, API routes and public files
  // should not be redirected to maintenance.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or Supabase public key"
    );

    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(name, value);
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  /*
   * Read global maintenance setting.
   */
  const { data: settings, error: settingsError } =
    await supabase
      .from("app_settings")
      .select("maintenance_mode")
      .eq("id", "global")
      .maybeSingle();

  if (settingsError) {
    console.error(
      "Could not read maintenance setting:",
      settingsError.message
    );

    // Keep the website online when Supabase temporarily fails.
    return response;
  }

  const maintenanceMode =
    settings?.maintenance_mode === true;

  /*
   * When maintenance is OFF:
   * - Allow every normal page.
   * - Redirect /maintenance back to home.
   */
  if (!maintenanceMode) {
    if (pathname === "/maintenance") {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";

      return NextResponse.redirect(homeUrl);
    }

    return response;
  }

  /*
   * Always allow maintenance page.
   */
  if (pathname === "/maintenance") {
    return response;
  }

  /*
   * Admin routes must remain reachable.
   * requireAdmin() inside admin pages should protect them.
   */
  if (pathname.startsWith("/admin")) {
    return response;
  }

  /*
   * Check whether the signed-in user is an admin.
   */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error(
      "Could not verify current user:",
      userError.message
    );
  }

  if (user?.id) {
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Could not read profile role:",
        profileError.message
      );
    }

    if (profile?.role === "admin") {
      return response;
    }
  }

  /*
   * Maintenance is ON and user is not an admin.
   */
  const maintenanceUrl = request.nextUrl.clone();
  maintenanceUrl.pathname = "/maintenance";
  maintenanceUrl.search = "";

  return NextResponse.redirect(maintenanceUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};