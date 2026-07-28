import { createClient } from "@supabase/supabase-js";

const defaultProjectUrl = "https://fpfmtmykncuknwlnakiv.supabase.co";
const defaultPublishableKey = "sb_publishable_d4gndkVlAefETqs_KdlIHQ_hNbbXV7x";

// Publishable keys are intentionally safe in browser bundles. Environment
// overrides make local/preview project switching possible without code changes.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || defaultProjectUrl;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || defaultPublishableKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
  : null;
