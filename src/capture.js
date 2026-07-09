/****************************
 * BOOTH SESSION CONTROLLER
 * booth.html — live camera, exposure/flash, 3-shot capture.
 ****************************/
import { captureFrame } from "./strip.js";
import { savePhotos, clearPhotos, saveSettings } from "./storage.js";

const SHOT_COUNT = 3;
const COUNTDOWN_FROM = 3;

const camera = document.getElementById("camera");
const countdown = document.getElementById("countdown");
const flashOverlay = document.getElementById("flash-overlay");
const permission = document.getElementById("permission");
const exposureInput = document.getElementById("exposure");
const flashToggle = document.getElementById("flash-toggle");
const bwToggle = document.getElementById("bw-toggle");
const recordBtn = document.getElementById("record");
const continueBtn = document.getElementById("continue");
const slots = [0, 1, 2].map((i) => document.getElementById(`slot-${i}`));
const recTimer = document.getElementById("rec-timer");
const stripId = document.getElementById("strip-id");
const stripDate = document.getElementById("strip-date");

let exposure = 1;
let flashEnabled = false;
let bwPreview = true; // B&W-first per the design

// --- Session flavor: strip id, date, running REC timer -----------------
stripId.textContent = `STRIP #${String(Math.floor(Math.random() * 9000) + 1000)}`;
stripDate.textContent = new Date()
  .toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
  .toUpperCase();

let elapsed = 0;
setInterval(() => {
  elapsed += 1;
  const m = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const s = String(elapsed % 60).padStart(2, "0");
  recTimer.textContent = `${m}:${s}`;
}, 1000);

// --- Live preview filter (exposure + optional B&W) ---------------------
const BW_CSS = "grayscale(1) contrast(1.05)";

function applyPreviewFilter() {
  const bw = bwPreview ? ` ${BW_CSS}` : "";
  camera.style.filter = `brightness(${exposure})${bw}`;
  // Keep the already-captured rail thumbnails matching the live preview
  // (exposure is already baked into them, so only the B&W part applies here).
  slots.forEach((img) => (img.style.filter = bwPreview ? BW_CSS : "none"));
}

exposureInput.addEventListener("input", () => {
  exposure = parseFloat(exposureInput.value);
  applyPreviewFilter();
});

flashToggle.addEventListener("click", () => {
  flashEnabled = !flashEnabled;
  flashToggle.setAttribute("aria-pressed", String(flashEnabled));
  flashToggle.classList.toggle("is-on", flashEnabled);
  flashToggle.textContent = flashEnabled ? "Flash On" : "Flash Off";
});

bwToggle.addEventListener("click", () => {
  bwPreview = !bwPreview;
  bwToggle.setAttribute("aria-pressed", String(bwPreview));
  bwToggle.classList.toggle("is-on", bwPreview);
  applyPreviewFilter();
});

// --- Camera start ------------------------------------------------------
navigator.mediaDevices
  .getUserMedia({ video: { facingMode: "user" } })
  .then((stream) => {
    camera.srcObject = stream;
    applyPreviewFilter();
  })
  .catch((err) => {
    console.error("Camera error:", err);
    permission.hidden = false;
    recordBtn.disabled = true;
  });

// --- Helpers -----------------------------------------------------------
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function triggerFlash() {
  if (!flashEnabled) return;
  flashOverlay.classList.add("is-firing");
  setTimeout(() => flashOverlay.classList.remove("is-firing"), 140);
}

async function runCountdown() {
  countdown.classList.add("is-visible");
  for (let n = COUNTDOWN_FROM; n > 0; n--) {
    countdown.textContent = n;
    await wait(1000);
  }
  countdown.classList.remove("is-visible");
}

// --- Capture sequence --------------------------------------------------
recordBtn.addEventListener("click", async () => {
  recordBtn.disabled = true;
  continueBtn.disabled = true;
  clearPhotos();
  slots.forEach((img) => {
    img.removeAttribute("src");
    img.classList.remove("is-filled");
  });

  const captured = [];
  for (let i = 0; i < SHOT_COUNT; i++) {
    await runCountdown();
    triggerFlash();
    const dataUrl = captureFrame(camera, { exposure });
    captured.push(dataUrl);
    slots[i].src = dataUrl;
    slots[i].classList.add("is-filled");
    await wait(400); // brief beat between shots
  }

  try {
    savePhotos(captured);
  } catch (err) {
    console.error("Storage error:", err);
    alert("Couldn't save your strip (storage full). Try retaking it.");
    recordBtn.disabled = false;
    return;
  }
  // Carry the booth's B&W choice to the Selection screen's default stock.
  saveSettings({ bw: bwPreview });

  recordBtn.disabled = false;
  continueBtn.disabled = false;
});

// --- Continue to Selection & Save --------------------------------------
continueBtn.addEventListener("click", () => {
  window.location.href = "/photo.html";
});
