/****************************
 * SELECTION & SAVE CONTROLLER
 * photo.html — film-stock filters, caption, share/export, discard.
 ****************************/
import { composeStrip } from "./strip.js";
import { loadPhotos, clearPhotos, loadSettings } from "./storage.js";
import {
  FILM_STOCKS,
  DEFAULT_STOCK,
  stockById,
  FRAMES,
  DEFAULT_FRAME,
  captionColorFor,
} from "./filters.js";

const canvas = document.getElementById("canvas");
const photoEls = [0, 1, 2].map((i) => document.getElementById(`photo-${i}`));
const captionInput = document.getElementById("caption");
const filtersEl = document.getElementById("filters");
const framesEl = document.getElementById("frames");
const polaroid = document.getElementById("polaroid");
const stockName = document.getElementById("stock-name");
const stockDesc = document.getElementById("stock-desc");
const shareBtn = document.getElementById("share");
const discardBtn = document.getElementById("discard");
const sessionId = document.getElementById("session-id");
const recTimer = document.getElementById("rec-timer");

// --- Load captured photos, or bounce back to the booth -----------------
const photos = loadPhotos();
if (!photos || photos.length !== 3) {
  alert("No photos found. Please take a strip first.");
  window.location.href = "/index.html";
  throw new Error("No captured photos in storage; redirecting to booth.");
}
photoEls.forEach((img, i) => (img.src = photos[i]));

// --- Session flavor ----------------------------------------------------
sessionId.textContent = `SESSION ID #${String(
  Math.floor(Math.random() * 900) + 100
)}-${String(Math.floor(Math.random() * 90) + 10)}`;
let elapsed = 0;
setInterval(() => {
  elapsed += 1;
  const m = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const s = String(elapsed % 60).padStart(2, "0");
  recTimer.textContent = `${m}:${s}`;
}, 1000);

// --- Film-stock selection ----------------------------------------------
let selectedStock = DEFAULT_STOCK;

function applyStock(stock) {
  selectedStock = stock;
  photoEls.forEach((img) => (img.style.filter = stock.css));
  stockName.textContent = stock.name;
  stockDesc.textContent = `${stock.stock} — ${stock.flavor}`;
  filtersEl.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.stock === stock.id);
  });
}

FILM_STOCKS.forEach((stock) => {
  const btn = document.createElement("button");
  btn.className = "chip";
  btn.dataset.stock = stock.id;
  btn.innerHTML = `<span class="chip__name">${stock.name}</span><span class="chip__stock mono-label mono-label--muted">${stock.stock}</span>`;
  btn.addEventListener("click", () => applyStock(stock));
  filtersEl.appendChild(btn);
});

// Default to the booth's B&W choice: B&W film -> Classic Silver,
// otherwise the stock that keeps the most color (Lofi Haze).
const startStock = loadSettings().bw === false ? stockById("lofi-haze") : DEFAULT_STOCK;
applyStock(startStock);

// --- Frame / background selection --------------------------------------
let selectedFrame = DEFAULT_FRAME;

function applyFrame(frame) {
  selectedFrame = frame;
  polaroid.style.background = frame.color;
  framesEl.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.frame === frame.id);
  });
}

FRAMES.forEach((frame) => {
  const btn = document.createElement("button");
  btn.className = "swatch";
  btn.dataset.frame = frame.id;
  btn.title = frame.name;
  btn.setAttribute("aria-label", `${frame.name} frame`);
  btn.style.background = frame.color;
  btn.addEventListener("click", () => applyFrame(frame));
  framesEl.appendChild(btn);
});

applyFrame(DEFAULT_FRAME);

// --- Compose the strip to a canvas -------------------------------------
async function buildStrip() {
  // Make sure the source images are decoded before reading naturalWidth.
  await Promise.all(
    photoEls.map((img) => (img.complete ? Promise.resolve() : img.decode()))
  );
  composeStrip(canvas, {
    photos: photoEls,
    filterCss: selectedStock.css,
    caption: captionInput.value,
    background: selectedFrame.color,
    captionColor: captionColorFor(selectedFrame.color),
  });
  return canvas;
}

// --- Share Artifact (Web Share API, download fallback) -----------------
shareBtn.addEventListener("click", async () => {
  const built = await buildStrip();
  built.toBlob(async (blob) => {
    const file = new File([blob], "photo-strip.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "My PhotoBhoot strip" });
        return;
      } catch {
        /* user cancelled — fall through to download */
      }
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "photo-strip.png";
    link.click();
    URL.revokeObjectURL(link.href);
  }, "image/png");
});

// --- Discard & Retake --------------------------------------------------
discardBtn.addEventListener("click", () => {
  if (!confirm("Discard this strip and retake?")) return;
  clearPhotos();
  window.location.href = "/index.html";
});

// --- Stubs (Phase 3 — accounts/gallery/print) --------------------------
document.querySelectorAll("[data-stub]").forEach((el) => {
  el.addEventListener("click", () => alert(`${el.dataset.stub} is coming soon.`));
});
