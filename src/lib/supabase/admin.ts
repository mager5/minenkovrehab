import { createClient } from '@supabase/supabase-js';

// Note: This client should ONLY be used in secure server-side contexts (API routes, Server Actions)
// It has admin privileges and bypasses RLS policies!
export function createAdminClient() {
  // Старый вариант (оставлен для истории): жестко требовали NEXT_PUBLIC_SUPABASE_URL
  // return createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.SUPABASE_SERVICE_ROLE_KEY!,
  //   {
  //     auth: {
  //       autoRefreshToken: false,
  //       persistSession: false,
  //     },
  //   }
  // );

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;

  if (!url) {
    throw new Error(
      'Supabase URL is not configured (нужен NEXT_PUBLIC_SUPABASE_URL или SUPABASE_URL)'
    );
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Supabase service role key is not configured (нужен SUPABASE_SERVICE_ROLE_KEY)'
    );
  }

  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
