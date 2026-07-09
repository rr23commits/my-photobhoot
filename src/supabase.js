/****************************
 * SUPABASE CLIENT
 * Bundled from the npm package by Vite (pinned via package-lock), so no
 * third-party CDN executes in our origin.
 ****************************/
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // PKCE keeps the session out of the URL hash (uses ?code= + a one-time
    // exchange) instead of exposing tokens in the address bar / history.
    flowType: "pkce",
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});

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
