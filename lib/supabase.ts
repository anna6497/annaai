import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing in .env.local."
    );
  }

  if (!supabaseKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing in .env.local."
    );
  }

  // URL ထဲမှာ /rest/v1, /auth/v1 စတာတွေ မပါရပါ
  const cleanUrl = supabaseUrl
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/auth\/v1\/?$/i, "")
    .replace(/\/+$/, "");

  if (!supabaseClient) {
    supabaseClient = createClient(
      cleanUrl,
      supabaseKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }

  return supabaseClient;
}