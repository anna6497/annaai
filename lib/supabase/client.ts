"use client";

import { createBrowserClient } from "@supabase/ssr";

function requiredEnv(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} is missing.`);
  return value;
}

export function createClient() {
  return createBrowserClient(
    requiredEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  );
}

export const createSupabaseBrowserClient = createClient;
