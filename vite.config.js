import { defineConfig } from "vite";

// Multi-page build. Every HTML entry must be listed here or it won't be
// emitted into dist/ (and would 404 on a static host like Vercel).
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html", // landing
        booth: "booth.html", // camera / capture
        photo: "photo.html", // selection & save
        login: "login.html",
        gallery: "gallery.html",
      },
    },
  },
});
