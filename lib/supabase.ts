import { createClient } from "./supabase/client";

export function createSupabaseBrowserClient() {
  return createClient();
}

export default createSupabaseBrowserClient;