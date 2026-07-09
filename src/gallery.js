/****************************
 * GALLERY PAGE
 * Requires a session; lists the signed-in user's saved strips.
 ****************************/
import { supabase, requireAuth } from "./supabase.js";

const grid = document.getElementById("gallery-grid");
const empty = document.getElementById("gallery-empty");
const emailEl = document.getElementById("user-email");
const signoutBtn = document.getElementById("signout");

signoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/login.html";
});

const user = await requireAuth();
if (user) {
  emailEl.textContent = user.email || "";

  const { data, error } = await supabase
    .from("strips")
    .select("id, image_url, caption, film_stock, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    empty.hidden = false;
    empty.textContent = `Couldn't load your gallery: ${error.message}`;
  } else if (!data.length) {
    empty.hidden = false;
  } else {
    for (const strip of data) {
      const card = document.createElement("figure");
      card.className = "gallery-card";

      const img = document.createElement("img");
      img.src = strip.image_url;
      img.alt = strip.caption || "Saved photo strip";
      img.loading = "lazy";

      const cap = document.createElement("figcaption");
      cap.className = "gallery-card__meta";
      const date = new Date(strip.created_at)
        .toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
        .toUpperCase();
      cap.textContent = `${(strip.film_stock || "").toUpperCase()} · ${date}`;

      card.append(img, cap);
      grid.appendChild(card);
    }
  }
}
