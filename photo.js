const canvas = document.getElementById("canvas");
const photo1 = document.getElementById("photo1");
const photo2 = document.getElementById("photo2");
const photo3 = document.getElementById("photo3");

const filterButtons = document.querySelectorAll("#filters button");
const downloadButton = document.getElementById("download");
const frameButtons = document.querySelectorAll("#frames button");
const polaroid = document.getElementById("polaroid");

let frameColor = "#ffffff";
frameButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    frameColor = btn.dataset.color;
    polaroid.style.background = frameColor; // live preview
  });
});

let currentFilter = "none";

// Load captured photo from localStorage
const capturedPhoto = localStorage.getItem("capturedPhoto");
if (!capturedPhoto) {
  alert("No photo found 😭 Please take a photo first!");
  window.location.href = "index.html";
}

// Load captured photos for the strip
const photo1Src = localStorage.getItem("capturedPhoto1");
const photo2Src = localStorage.getItem("capturedPhoto2");
const photo3Src = localStorage.getItem("capturedPhoto3");

if (!photo1Src || !photo2Src || !photo3Src) {
  alert("No photos found 😭 Please take photos first!");
  window.location.href = "index.html";
}

photo1.src = photo1Src;
photo2.src = photo2Src;
photo3.src = photo3Src;


// Apply filters
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    photo1.style.filter = currentFilter;
    photo2.style.filter = currentFilter;
    photo3.style.filter = currentFilter;
  });
});

// Download 3-photo strip
downloadButton.addEventListener("click", () => {
  const captionInput = document.getElementById("caption");

  const padding = 20;
  const spacing = 10;
  const captionHeight = 50;
  const radius = 20;

  // Use scaled photo dimensions for the strip
  const photoWidth = 280;
  const photoHeight = 210; // maintain aspect ratio

  canvas.width = photoWidth + padding * 2;
  canvas.height = (photoHeight * 3) + (spacing * 2) + padding * 2 + captionHeight;

  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = frameColor;
  roundRect(ctx, 0, 0, canvas.width, canvas.height, radius);
  ctx.fill();

  // Draw 3 photos
  [photo1, photo2, photo3].forEach((p, i) => {
    ctx.drawImage(
      p,
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

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "cute-strip.png";
  link.click();
});


function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
