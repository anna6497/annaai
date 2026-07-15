function clean(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

export function getSupabaseConfig() {
  const rawUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = clean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!rawUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
  }

  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing."
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must look like https://PROJECT_REF.supabase.co"
    );
  }

  if (
    parsed.protocol !== "https:" ||
    !parsed.hostname.endsWith(".supabase.co")
  ) {
    throw new Error(
      "Use the Supabase Project URL only, for example https://PROJECT_REF.supabase.co"
    );
  }

  return { url: parsed.origin, key };
}
