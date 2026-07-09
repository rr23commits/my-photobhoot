/****************************
 * GALLERY PAGE
 * Requires a session; lists the user's saved strips (from a PRIVATE bucket
 * via short-lived signed URLs) and opens a viewer (download / delete).
 ****************************/
import { supabase, requireAuth, STRIPS_BUCKET } from "./supabase.js";

const SIGNED_TTL = 3600; // seconds

const grid = document.getElementById("gallery-grid");
const empty = document.getElementById("gallery-empty");
const emailEl = document.getElementById("user-email");
const signoutBtn = document.getElementById("signout");

const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewer-img");
const viewerMeta = document.getElementById("viewer-meta");
const downloadBtn = document.getElementById("viewer-download");
const deleteBtn = document.getElementById("viewer-delete");

let activeStrip = null; // { id, path, displayUrl, ...meta }

signoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/login.html";
});

// Rows store the storage path; older rows may hold a full public URL.
function storagePath(imageUrl) {
  const marker = `/${STRIPS_BUCKET}/`;
  const i = imageUrl.indexOf(marker);
  return i === -1 ? imageUrl : imageUrl.slice(i + marker.length);
}

function metaLine(strip) {
  const date = new Date(strip.created_at)
    .toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
  const parts = [strip.film_stock, strip.frame].filter(Boolean).map((s) => s.toUpperCase());
  return [...parts, date].join(" · ");
}

// --- Viewer ------------------------------------------------------------
function openViewer(strip) {
  activeStrip = strip;
  viewerImg.src = strip.displayUrl;
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

downloadBtn.addEventListener("click", async () => {
  if (!activeStrip) return;
  try {
    const res = await fetch(activeStrip.displayUrl);
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

deleteBtn.addEventListener("click", async () => {
  if (!activeStrip) return;
  if (!confirm("Delete this strip permanently?")) return;

  deleteBtn.disabled = true;
  deleteBtn.textContent = "Deleting…";
  try {
    if (activeStrip.path) await supabase.storage.from(STRIPS_BUCKET).remove([activeStrip.path]);
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

// --- Load --------------------------------------------------------------
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
    // Batch-mint signed URLs for all strips (private bucket).
    const paths = data.map((s) => storagePath(s.image_url));
    const { data: signed } = await supabase.storage
      .from(STRIPS_BUCKET)
      .createSignedUrls(paths, SIGNED_TTL);

    data.forEach((row, i) => {
      const strip = {
        ...row,
        path: paths[i],
        displayUrl: signed?.[i]?.signedUrl || "",
      };

      const card = document.createElement("button");
      card.className = "gallery-card";
      card.dataset.stripId = strip.id;
      card.setAttribute("aria-label", `Open strip from ${metaLine(strip)}`);

      const img = document.createElement("img");
      img.src = strip.displayUrl;
      img.alt = strip.caption || "Saved photo strip";
      img.loading = "lazy";

      const meta = document.createElement("span");
      meta.className = "gallery-card__meta";
      meta.textContent = metaLine(strip);

      card.append(img, meta);
      card.addEventListener("click", () => openViewer(strip));
      grid.appendChild(card);
    });
  }
}
