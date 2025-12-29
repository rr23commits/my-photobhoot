/****************************
 * PHOTO CUSTOMIZATION LOGIC
 * photo.html
 ****************************/

// DOM elements
const canvas = document.getElementById("canvas");
const photoEls = [
  document.getElementById("photo1"),
  document.getElementById("photo2"),
  document.getElementById("photo3")
];

const filterButtons = document.querySelectorAll("#filters button");
const frameButtons = document.querySelectorAll("#frames button");
const downloadButton = document.getElementById("download");
const polaroid = document.getElementById("polaroid");

// Load photos from localStorage individually
for (let i = 0; i < 3; i++) {
  const photoData = localStorage.getItem(`capturedPhoto${i + 1}`);
  if (!photoData) {
    alert("No photos found 😭 Please take photos first!");
    window.location.href = "index.html";
  }
  photoEls[i].src = photoData;
}

// Frame color handling
let frameColor = "#ffffff";
frameButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    frameColor = btn.dataset.color;
    polaroid.style.background = frameColor;
  });
});

// Apply filters
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    photoEls.forEach(img => {
      img.style.filter = btn.dataset.filter;
    });
  });
});

// Download photo strip with correct aspect ratio
downloadButton.addEventListener("click", () => {
  const captionInput = document.getElementById("caption");

  const padding = 20;
  const spacing = 10;
  const captionHeight = 50;
  const maxPhotoWidth = 280; // max width of each photo in strip

  // Calculate scaled heights to maintain aspect ratio
  const scaledHeights = photoEls.map(img => {
    const scale = maxPhotoWidth / img.naturalWidth;
    return img.naturalHeight * scale;
  });

  const totalHeight =
    scaledHeights.reduce((sum, h) => sum + h, 0) +
    spacing * (photoEls.length - 1) +
    padding * 2 +
    captionHeight;

  canvas.width = maxPhotoWidth + padding * 2;
  canvas.height = totalHeight;

  const ctx = canvas.getContext("2d");

  // Draw frame background
  ctx.fillStyle = frameColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each photo scaled
  let currentY = padding;
  photoEls.forEach((img, i) => {
    const scale = maxPhotoWidth / img.naturalWidth;
    const scaledHeight = img.naturalHeight * scale;

    ctx.drawImage(img, padding, currentY, maxPhotoWidth, scaledHeight);

    currentY += scaledHeight + spacing;
  });

  // Draw caption
  ctx.font = "24px 'Fredoka One'";
  ctx.fillStyle = "#ff69b4";
  ctx.textAlign = "center";
  ctx.fillText(
    captionInput.value || "my cute moment 💕",
    canvas.width / 2,
    canvas.height - 20
  );

  // Trigger download
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "photo-strip.png";
  link.click();
});
