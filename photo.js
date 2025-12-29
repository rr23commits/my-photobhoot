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

// Load photos from localStorage
const photos = JSON.parse(localStorage.getItem("capturedPhotos"));

if (!photos || photos.length !== 3) {
  alert("No photos found 😭 Please take photos first!");
  window.location.href = "index.html";
}

// Display photos
photoEls.forEach((img, i) => {
  img.src = photos[i];
});

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

// Download photo strip
downloadButton.addEventListener("click", () => {
  const captionInput = document.getElementById("caption");

  const padding = 20;
  const spacing = 10;
  const captionHeight = 50;
  const photoWidth = 280;
  const photoHeight = 210;

  canvas.width = photoWidth + padding * 2;
  canvas.height =
    photoHeight * 3 +
    spacing * 2 +
    padding * 2 +
    captionHeight;

  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = frameColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw photos
  photoEls.forEach((img, i) => {
    ctx.drawImage(
      img,
      padding,
      padding + i * (photoHeight + spacing),
      photoWidth,
      photoHeight
    );
  });

  // Caption
  ctx.font = "24px 'Fredoka One'";
  ctx.fillStyle = "#ff69b4";
  ctx.textAlign = "center";
  ctx.fillText(
    captionInput.value || "my cute moment 💕",
    canvas.width / 2,
    canvas.height - 20
  );

  // Download image
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "photo-strip.png";
  link.click();
});
