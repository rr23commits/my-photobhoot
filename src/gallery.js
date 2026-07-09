/****************************
 * GALLERY PAGE
 * Requires a session; lists the user's saved strips and opens a viewer
 * (download / delete) when one is clicked.
 ****************************/
import { supabase, requireAuth, STRIPS_BUCKET } from "./supabase.js";

const grid = document.getElementById("gallery-grid");
const empty = document.getElementById("gallery-empty");
const emailEl = document.getElementById("user-email");
const signoutBtn = document.getElementById("signout");

const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewer-img");
const viewerMeta = document.getElementById("viewer-meta");
const downloadBtn = document.getElementById("viewer-download");
const deleteBtn = document.getElementById("viewer-delete");

let activeStrip = null; // the strip currently open in the viewer

signoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/login.html";
});

// --- Viewer open/close -------------------------------------------------
function openViewer(strip) {
  activeStrip = strip;
  viewerImg.src = strip.image_url;
  viewerMeta.textContent = metaLine(strip);
  deleteBtn.disabled = false;
  deleteBtn.textContent = "Delete";
  viewer.hidden = false;
}

function closeViewer() {
  viewer.hidden = true;
  activeStrip = null;
}

viewer.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close")) closeViewer();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !viewer.hidden) closeViewer();
});

function metaLine(strip) {
  const date = new Date(strip.created_at)
    .toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
  const parts = [strip.film_stock, strip.frame].filter(Boolean).map((s) => s.toUpperCase());
  return [...parts, date].join(" · ");
}

// The storage path is everything after the bucket name in the public URL.
function storagePath(imageUrl) {
  const marker = `/${STRIPS_BUCKET}/`;
  const i = imageUrl.indexOf(marker);
  return i === -1 ? null : imageUrl.slice(i + marker.length);
}

// --- Download ----------------------------------------------------------
downloadBtn.addEventListener("click", async () => {
  if (!activeStrip) return;
  try {
    const res = await fetch(activeStrip.image_url);
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "photo-strip.png";
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Download failed:", err);
    alert("Couldn't download this strip.");
  }
});

// --- Delete ------------------------------------------------------------
deleteBtn.addEventListener("click", async () => {
  if (!activeStrip) return;
  if (!confirm("Delete this strip permanently?")) return;

  deleteBtn.disabled = true;
  deleteBtn.textContent = "Deleting…";
  try {
    const path = storagePath(activeStrip.image_url);
    if (path) await supabase.storage.from(STRIPS_BUCKET).remove([path]);

    const { error } = await supabase.from("strips").delete().eq("id", activeStrip.id);
    if (error) throw error;

    document.querySelector(`[data-strip-id="${activeStrip.id}"]`)?.remove();
    closeViewer();
    if (!grid.children.length) empty.hidden = false;
  } catch (err) {
    console.error("Delete failed:", err);
    alert(`Couldn't delete this strip: ${err.message}`);
    deleteBtn.disabled = false;
    deleteBtn.textContent = "Delete";
  }
});

// --- Load the gallery --------------------------------------------------
const user = await requireAuth();
if (user) {
  emailEl.textContent = user.email || "";

  const { data, error } = await supabase
    .from("strips")
    .select("id, image_url, caption, film_stock, frame, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    empty.hidden = false;
    empty.textContent = `Couldn't load your gallery: ${error.message}`;
  } else if (!data.length) {
    empty.hidden = false;
  } else {
    for (const strip of data) {
      const card = document.createElement("button");
      card.className = "gallery-card";
      card.dataset.stripId = strip.id;
      card.setAttribute("aria-label", `Open strip from ${metaLine(strip)}`);

      const img = document.createElement("img");
      img.src = strip.image_url;
      img.alt = strip.caption || "Saved photo strip";
      img.loading = "lazy";

      const meta = document.createElement("span");
      meta.className = "gallery-card__meta";
      meta.textContent = metaLine(strip);

      card.append(img, meta);
      card.addEventListener("click", () => openViewer(strip));
      grid.appendChild(card);
    }
  }
}
