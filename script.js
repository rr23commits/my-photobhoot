// DOM elements
const camera = document.getElementById("camera");
const captureButton = document.getElementById("capture");
const retakeButton = document.getElementById("retake");
const customizeButton = document.getElementById("customize");
const canvas = document.getElementById("canvas");
const countdown = document.getElementById("countdown");

// Create preview images for the three-shot strip
let photoImgs = [];
for (let i = 0; i < 3; i++) {
  let img = document.createElement("img");
  img.id = `photo-preview-${i}`;
  img.className = "strip-photo";
  document.querySelector(".camera-container").appendChild(img);
  photoImgs.push(img);
}

// Hide retake initially
retakeButton.style.display = "none";

// Disable customize until capture
customizeButton.disabled = true;

// Start camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => camera.srcObject = stream)
  .catch(err => console.error("Camera error:", err));

// Floating heart animation
function createHeart() {
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.textContent = '💖';
  heart.style.left = Math.random() * window.innerWidth + 'px';
  heart.style.fontSize = 20 + Math.random() * 30 + 'px';
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 2000);
}

// Capture 3 photos
captureButton.addEventListener("click", async () => {
  captureButton.disabled = true;
  customizeButton.disabled = true;

  // Clear old photos immediately
  localStorage.removeItem("capturedPhotos");

  let capturedPhotos = []; // Array to store all 3 photos

  for (let i = 0; i < 3; i++) {
    let count = 3;
    countdown.style.display = "block";
    countdown.textContent = count;

    await new Promise(resolve => {
      const interval = setInterval(() => {
        count--;
        createHeart();

        if (count > 0) {
          countdown.textContent = count;
        } else {
          clearInterval(interval);
          countdown.style.display = "none";

          // Capture photo
          canvas.width = camera.videoWidth;
          canvas.height = camera.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(camera, 0, 0, canvas.width, canvas.height);

          const imageData = canvas.toDataURL("image/png");

          // Save to array
          capturedPhotos.push(imageData);

          // Show preview
          photoImgs[i].src = imageData;
          photoImgs[i].style.display = "block";

          resolve();
        }
      }, 1000);
    });
  }

  // Save all 3 photos as an array in localStorage
  localStorage.setItem("capturedPhotos", JSON.stringify(capturedPhotos));

  // Enable customize button
  customizeButton.disabled = false;

  // Hide camera, show retake
  camera.style.display = "none";
  retakeButton.style.display = "inline-block";
});

// Retake photos
retakeButton.addEventListener("click", () => {
  // Remove stored array of photos
  localStorage.removeItem("capturedPhotos");

  retakeButton.style.display = "none";
  captureButton.disabled = false;
  customizeButton.disabled = true;
  camera.style.display = "block";

  photoImgs.forEach(img => img.style.display = "none");
});

// Customize button
customizeButton.addEventListener("click", () => {
  if (localStorage.getItem("capturedPhotos")) {
    window.location.href = "photo.html";
  } else {
    alert("You need to capture photos first!");
  }
});
