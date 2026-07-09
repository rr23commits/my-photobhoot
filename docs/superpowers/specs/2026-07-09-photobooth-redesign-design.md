# My PhotoBhoot — Analog Film-Lab Redesign

**Date:** 2026-07-09
**Scope:** Phase 1 (visual redesign), Phase 2 (Vite + module structure), Phase 4 (sharing + film controls). Phase 3 (accounts + gallery backend) is owned by the user; this spec only leaves visual hooks for it.

## 1. Direction

Full aesthetic pivot from "cute pink emoji photobooth" to an **analog film-lab / editorial** look, based on the user's reference mockups.

- **Palette:** warm paper background, ink-black text, gray secondaries, a single warm-red accent used *only* for primary/destructive actions.
- **No emoji anywhere in the UI.** Text labels and minimal line icons only. (Emoji allowed only inside the user's own caption text.)
- **B&W-film-first.** Default filter is a black-and-white film stock.

### Design tokens

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F4F2EC` | app background |
| `--panel` | `#FFFFFF` | cards, control bars |
| `--panel-alt`| `#EDEBE4` | insets, strip backing |
| `--ink` | `#141414` | primary text, wordmark |
| `--gray` | `#6B6B6B` | secondary labels |
| `--hair` | `#D8D5CC` | 1px hairline borders |
| `--accent` | `#D64A38` | record, Save to Gallery, Discard |
| serif | Newsreader (display) | wordmark, panel headings |
| mono | IBM Plex Mono | all labels, nav, body copy, metadata |

Diagonal hairline hatch (`repeating-linear-gradient`) on strip backing panels for the darkroom texture.

## 2. Screens & components

### 2.1 Booth Session (was `index.html` / capture)
- **Top bar:** serif wordmark `BOOTH SESSION` left; mono nav `CAPTURE · GALLERY · SETTINGS` + `● REC 00:00` live timer right. GALLERY/SETTINGS are visual stubs (see §4).
- **Viewfinder:** live camera with corner-bracket framing overlay, mirrored preview. Countdown renders large-centered over it.
- **Right rail:** the developing strip — `STRIP #NNNN` + date, 3 photo slots filling as shots are taken.
- **Control bar (bottom):** `EXPOSURE` slider, `FLASH` toggle, `B&W FILM` toggle, `EXPORT STRIP` button, share icon.
- Mobile: viewfinder stacks over strip; bottom tab bar `GALLERY · ●record · FILTERS`.

### 2.2 Selection & Save (was `photo.html` / customize)
- **Left column:** film-stock filter chips — `CLASSIC SILVER · SEPIA GRAIN · HIGH CONTRAST · LOFI HAZE`; below, a "Film Stock" info card describing the selected stock (flavor text).
- **Center:** strip preview with selected filter + frame applied live, caption input.
- **Right "Save Strip" panel:** `SAVE TO GALLERY` (accent, stub → "coming soon"), `SHARE ARTIFACT` (ink), `ORDER PHYSICAL 4×6 PRINT` (stub). Separate `DISCARD & RETAKE` block (accent outline) that clears storage and returns to booth.
- **Souvenir Ready:** post-save confirmation state (mobile screen in ref) — shown after Export/Share.

## 3. Film controls (all real)

- **Exposure:** slider maps to `brightness(0.5–1.5)`, applied live to the video via CSS filter and **baked into the captured frame** via `ctx.filter` at capture time.
- **Flash:** a full-screen white overlay flashed for ~120ms at the capture moment (screen flash — webcams have no real flash).
- **Film-stock filters** (CSS filter strings, applied to preview AND baked into the downloaded canvas):
  - Classic Silver → `grayscale(1) contrast(1.05)`
  - Sepia Grain → `sepia(0.8) contrast(1.05)`
  - High Contrast → `grayscale(1) contrast(1.6) brightness(0.95)`
  - Lofi Haze → `grayscale(0.6) contrast(0.85) brightness(1.1)`
- Default stock: Classic Silver (B&W-first).

## 4. Stubs (visual now, wired later)

- **Save to Gallery** and **Order Physical Print:** render exactly as designed but open a small "coming soon" note; no backend call. Leaves a clear seam for the user's Phase-3 accounts/gallery work.
- **Share Artifact:** functional-lite — compose the strip and use the Web Share API where available (`navigator.share` with the PNG file), falling back to download. Full public-link sharing is deferred to Phase 4 proper.

## 5. Architecture (Phase 2)

Vite multi-page build. ES modules, no globals.

```
package.json            vite (dev/build/preview)
vite.config.js          inputs: index.html, photo.html
index.html              Booth Session markup
photo.html              Selection & Save markup
src/
  capture.js            booth session controller
  customize.js          selection & save controller
  strip.js              captureFrame() + composeStrip() — shared canvas logic
  filters.js            film-stock definitions (name, css, flavor text)
  storage.js            localStorage get/set/clear for captured photos
style.css               design tokens + all screen styles
```

- `strip.js` removes the duplicated scaling/canvas code that capture and download each re-implement today.
- `filters.js` is the single source of truth for filter name ↔ CSS ↔ flavor text, consumed by both the control bar and the Selection screen.
- `storage.js` centralizes the `capturedPhotos` key and wraps `setItem` in try/catch (quota handling).

## 6. Preserved fixes

The five bug fixes already applied stay: filters baked into download, `return`/`throw` after redirect, mirrored capture, JPEG downscale for storage quota, camera-permission fallback.

## 7. Out of scope

- Accounts, real gallery persistence, real print ordering (Phase 3, user-owned).
- Real public share links / OG previews (Phase 4 proper).
- GIF/boomerang, stickers (Phase 4 extras, later).

## 8. Testing / verification

- `npm run build` compiles both pages with no errors.
- Manual walkthrough in `npm run dev`: grant camera → 3-shot capture with countdown + flash → exposure visibly changes preview and is baked into shots → Selection screen: each film stock changes preview → Export downloads a strip whose filter matches the preview → Discard clears storage and returns to booth.
