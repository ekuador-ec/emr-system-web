import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const apiKey = supabasePublishableKey || (import.meta.env.VITE_SUPABASE_ANON_KEY as string);

if (!supabaseUrl || !apiKey) {
  throw new Error(
    "Your supabase config is not complete. Please check your Environment Variables.",
  );
}

/**
 * Singleton Supabase client for the EMR application.
 * RLS policies in the database control actual data access.
 *
 * @see https://supabase.com/docs/guides/api/api-keys
 */
export const supabase = createClient(supabaseUrl, apiKey);
