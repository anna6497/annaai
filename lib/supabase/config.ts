export function getSupabaseUrl(): string {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing."
    );
  }

  return value;
}

export function getSupabasePublicKey(): string {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!value) {
    throw new Error(
      "Supabase public key is missing."
    );
  }

  return value;
}

export function getSupabaseConfig() {
  return {
    url: getSupabaseUrl(),
    publicKey: getSupabasePublicKey(),
  };
}