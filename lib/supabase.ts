import { createClient } from "@supabase/supabase-js";

// Use PUBLISHABLE_KEY because that is what you named it in your .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase variables are missing! URL:",
    supabaseUrl,
    "Key:",
    supabaseAnonKey,
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
