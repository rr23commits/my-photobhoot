/****************************
 * SUPABASE CLIENT
 * Loaded from the ESM CDN so the app needs no build step. Swap for the
 * npm package (@supabase/supabase-js) if you add a bundler later.
 ****************************/
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const STRIPS_BUCKET = "strips";

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Redirect to the sign-in page if not authenticated; returns the user
// object otherwise. Use at the top of pages that require a session.
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    window.location.href = "/login.html";
    return null;
  }
  return user;
}

// True once a real anon key has been pasted into config.js.
export function isConfigured() {
  return SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";
}
