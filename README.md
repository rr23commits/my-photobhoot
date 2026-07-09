# PhotoBhoot

An analog film-lab photo booth on the web. Step into the booth, take a
three-shot strip, develop it with black-and-white film stocks and frames,
add a caption, and save it to a private gallery.

Built with plain HTML/CSS/JS (ES modules) + Vite, with Supabase for Google
auth, storage, and the gallery database.

## Run locally

The Supabase client is bundled by Vite, so a build step is required:

```bash
npm install
npm run dev        # dev server with hot reload
# open the URL it prints (e.g. http://localhost:5173)
```

To preview the production build:

```bash
npm run build && npm run preview
```

Run the logic tests:

```bash
npm test
```

## Pages

| Page          | File           | Purpose                                   |
| ------------- | -------------- | ----------------------------------------- |
| Landing       | `index.html`   | Brand home + entry points                 |
| Booth Session | `booth.html`   | Live camera, exposure/flash, 3-shot strip |
| Selection     | `photo.html`   | Film stocks, frames, caption, save/share  |
| Gallery       | `gallery.html` | Saved strips (view / download / delete)   |
| Sign in       | `login.html`   | Google sign-in                            |

## Project structure

```
index.html / booth.html / photo.html / gallery.html / login.html
style.css                 design tokens + all screen styles
src/
  capture.js              booth controller (camera, capture)
  customize.js            selection & save controller
  strip.js                shared canvas: captureFrame + composeStrip
  filters.js              film stocks + frames (single source of truth)
  storage.js              localStorage helpers for the in-progress strip
  supabase.js             Supabase client (auth guard, helpers)
  config.js               Supabase URL + publishable key
vite.config.js            multi-page build config
scripts/smoke.mjs         node logic tests
```

## Customizing

- **Add a film stock:** append an object to `FILM_STOCKS` in `src/filters.js`
  (`id`, `name`, `css` filter string, `stock`, `flavor`). It auto-renders as
  a chip and bakes into the export.
- **Add a frame color:** append `{ id, name, color }` to `FRAMES` in the same
  file.

## Backend (Supabase)

- **Auth:** Google OAuth (users are stored automatically in `auth.users`).
- **Database:** a `strips` table (`user_id`, `image_url`, `caption`,
  `film_stock`, `frame`, `created_at`) with row-level security so each user
  sees only their own strips.
- **Storage:** a **private** `strips` bucket holding the composed PNGs, read
  via short-lived signed URLs, with select/insert/delete policies scoped to
  each user's folder.
- Set your project URL and publishable (anon) key in `src/config.js`.

## Deploy (Vercel)

1. Push to GitHub, then import the repo at vercel.com (Vite is auto-detected:
   build `npm run build`, output `dist`).
2. In Supabase → Authentication → URL Configuration, add your Vercel domain as
   the Site URL and to the redirect allowlist (`https://<domain>/**`). Keep
   `http://localhost:4173/**` for local dev.
