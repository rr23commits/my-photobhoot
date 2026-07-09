/****************************
 * SIGN-IN PAGE
 * Google OAuth via Supabase. On success Supabase redirects back to the
 * gallery, where the session is picked up from the URL automatically.
 ****************************/
import { supabase, isConfigured } from "./supabase.js";

const btn = document.getElementById("google-signin");
const status = document.getElementById("login-status");

if (!isConfigured()) {
  status.textContent =
    "Supabase isn't configured yet — paste your anon key into src/config.js.";
  btn.disabled = true;
}

// Already signed in? Go straight to the gallery.
supabase.auth.getUser().then(({ data }) => {
  if (data.user) window.location.href = "/gallery.html";
});

btn.addEventListener("click", async () => {
  status.textContent = "";
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/gallery.html` },
  });
  if (error) status.textContent = error.message;
});
