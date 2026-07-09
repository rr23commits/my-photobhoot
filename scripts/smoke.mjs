/****************************
 * Node smoke test for the pure-logic modules (no DOM/canvas).
 * Verifies film-stock definitions and storage helpers behave correctly.
 * Run: node scripts/smoke.mjs
 ****************************/
import assert from "node:assert/strict";

// --- localStorage shim so storage.js can load under Node --------------
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { FILM_STOCKS, DEFAULT_STOCK, stockById, FRAMES, DEFAULT_FRAME, frameById, captionColorFor } =
  await import("../src/filters.js");
const { savePhotos, loadPhotos, clearPhotos, saveSettings, loadSettings } =
  await import("../src/storage.js");

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

// --- Film stocks -------------------------------------------------------
check("film stocks defined (>=4)", () => assert.ok(FILM_STOCKS.length >= 4));
check("film stock ids are unique", () =>
  assert.equal(new Set(FILM_STOCKS.map((s) => s.id)).size, FILM_STOCKS.length)
);
check("default stock is B&W Classic Silver", () => {
  assert.equal(DEFAULT_STOCK.id, "classic-silver");
  assert.match(DEFAULT_STOCK.css, /grayscale\(1\)/);
});
check("every stock has id/name/css/stock/flavor", () =>
  FILM_STOCKS.forEach((s) =>
    ["id", "name", "css", "stock", "flavor"].forEach((k) =>
      assert.ok(s[k], `${s.id} missing ${k}`)
    )
  )
);
check("stockById falls back to default on unknown", () =>
  assert.equal(stockById("nope").id, DEFAULT_STOCK.id)
);
check("lofi-haze retains color (not full grayscale)", () =>
  assert.doesNotMatch(stockById("lofi-haze").css, /grayscale\(1\)/)
);

// --- Frames ------------------------------------------------------------
check("frames defined with color hex", () => {
  assert.ok(FRAMES.length >= 2);
  FRAMES.forEach((f) => assert.match(f.color, /^#[0-9a-f]{6}$/i));
});
check("frameById falls back to default", () =>
  assert.equal(frameById("nope").id, DEFAULT_FRAME.id)
);
check("captionColor is dark on light frame, light on dark frame", () => {
  assert.equal(captionColorFor("#ffffff"), "#141414");
  assert.equal(captionColorFor("#1c1c1c"), "#f4f2ec");
});

// --- Storage -----------------------------------------------------------
check("loadPhotos null when empty", () => {
  clearPhotos();
  assert.equal(loadPhotos(), null);
});
check("save/load round-trips a 3-photo strip", () => {
  savePhotos(["a", "b", "c"]);
  assert.deepEqual(loadPhotos(), ["a", "b", "c"]);
});
check("clearPhotos removes the strip", () => {
  savePhotos(["x"]);
  clearPhotos();
  assert.equal(loadPhotos(), null);
});
check("settings round-trip bw flag", () => {
  saveSettings({ bw: false });
  assert.equal(loadSettings().bw, false);
});
check("loadSettings returns {} when unset", () => {
  store.delete("captureSettings");
  assert.deepEqual(loadSettings(), {});
});

console.log(`\n${passed} checks passed.`);
