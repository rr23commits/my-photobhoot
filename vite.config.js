import { defineConfig } from "vite";

// Multi-page build: Booth Session (index) + Selection & Save (photo).
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        photo: "photo.html",
        login: "login.html",
        gallery: "gallery.html",
      },
    },
  },
});
