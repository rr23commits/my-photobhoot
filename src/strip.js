/****************************
 * STRIP / CANVAS
 * Shared canvas logic used by both the booth (capture) and the
 * Selection & Save screen (compose + export). Removes the duplicated
 * scaling code that capture and download each used to re-implement.
 ****************************/

// Capture one downscaled, mirrored, exposure-adjusted frame from a video.
// Returns a JPEG data-URL (far smaller than PNG, keeps localStorage under quota).
export function captureFrame(video, { maxWidth = 640, exposure = 1 } = {}) {
  const scale = Math.min(1, maxWidth / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth * scale;
  canvas.height = video.videoHeight * scale;

  const ctx = canvas.getContext("2d");
  ctx.filter = `brightness(${exposure})`; // bake exposure into the shot
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1); // mirror to match the selfie preview
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.85);
}

// Layout constants for the exported strip.
const LAYOUT = {
  padding: 24,
  spacing: 12,
  captionHeight: 56,
  maxPhotoWidth: 280,
};

// Compose the final polaroid strip into `canvas` and return it.
// `filterCss` is baked in so the export matches the on-screen preview
// (CSS filters do NOT transfer to canvas on their own).
export function composeStrip(
  canvas,
  { photos, filterCss = "none", caption = "", background = "#ffffff" }
) {
  const { padding, spacing, captionHeight, maxPhotoWidth } = LAYOUT;

  const scaledHeights = photos.map(
    (img) => img.naturalHeight * (maxPhotoWidth / img.naturalWidth)
  );
  const totalHeight =
    scaledHeights.reduce((sum, h) => sum + h, 0) +
    spacing * (photos.length - 1) +
    padding * 2 +
    captionHeight;

  canvas.width = maxPhotoWidth + padding * 2;
  canvas.height = totalHeight;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let y = padding;
  ctx.filter = filterCss;
  photos.forEach((img, i) => {
    ctx.drawImage(img, padding, y, maxPhotoWidth, scaledHeights[i]);
    y += scaledHeights[i] + spacing;
  });
  ctx.filter = "none"; // reset before drawing the caption

  ctx.font = "16px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#141414";
  ctx.textAlign = "center";
  ctx.fillText(
    (caption || "MY PHOTOBHOOT").toUpperCase(),
    canvas.width / 2,
    canvas.height - padding
  );

  return canvas;
}
