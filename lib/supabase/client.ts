import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

export function createSupabaseBrowserClient() {
  const { url, key } = getSupabaseConfig();

  return createBrowserClient(url, key);
}

// Backward compatibility
export const createClient = createSupabaseBrowserClient;