/****************************
 * LANDING PAGE
 * Normally static. But if an OAuth redirect lands here (session tokens in
 * the URL hash — e.g. Supabase fell back to the Site URL), finish the
 * sign-in and forward to the gallery so the user isn't stranded.
 ****************************/
// PKCE returns ?code=… ; the legacy implicit flow returns #access_token=…
if (
  window.location.search.includes("code=") ||
  window.location.hash.includes("access_token")
) {
  import("./supabase.js").then(({ supabase }) => {
    // The client consumes the hash on init; wait for the session, then go.
    const go = () => window.location.replace("/gallery.html");
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) go();
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go();
    });
  });
}
