/****************************
 * PHOTO STORAGE
 * Single source of truth for the captured-strip data in localStorage.
 ****************************/

const KEY = "capturedPhotos";

export function savePhotos(photos) {
  // Throws QuotaExceededError if the strip is too large; callers handle it.
  localStorage.setItem(KEY, JSON.stringify(photos));
}

export function loadPhotos() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function clearPhotos() {
  localStorage.removeItem(KEY);
}

// Capture-time settings (e.g. whether B&W film was loaded in the booth) so
// the Selection screen can honor the choice made in the booth.
const SETTINGS_KEY = "captureSettings";

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* non-critical; ignore quota errors for settings */
  }
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}
