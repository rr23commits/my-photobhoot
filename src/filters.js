/****************************
 * FILM STOCKS
 * Single source of truth for filter name <-> CSS <-> flavor text.
 * Consumed by the booth control bar and the Selection & Save screen.
 ****************************/

export const FILM_STOCKS = [
  {
    id: "classic-silver",
    name: "Classic Silver",
    css: "grayscale(1) contrast(1.05)",
    stock: "Ilford HP5 400",
    flavor:
      "Clean black-and-white silver-gelatin look with balanced mid-tones.",
  },
  {
    id: "sepia-grain",
    name: "Sepia Grain",
    css: "sepia(0.8) contrast(1.05)",
    stock: "Kodak Portra (toned)",
    flavor: "Warm sepia toning reminiscent of aged darkroom prints.",
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    css: "grayscale(1) contrast(1.6) brightness(0.95)",
    stock: "Kodak Tri-X 400",
    flavor:
      "Punchy monochrome with deep blacks and organic micro-contrast.",
  },
  {
    id: "lofi-haze",
    name: "Lofi Haze",
    css: "grayscale(0.6) contrast(0.85) brightness(1.1)",
    stock: "Expired Consumer 200",
    flavor: "Faded, hazy low-contrast wash with muted color.",
  },
  {
    id: "noir",
    name: "Noir",
    css: "grayscale(1) contrast(1.9) brightness(0.85)",
    stock: "Fomapan 100 (push)",
    flavor: "Deep-shadow, high-drama monochrome for moody portraits.",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    css: "sepia(0.35) saturate(1.3) contrast(1.05) brightness(1.05)",
    stock: "Kodak Gold 200",
    flavor: "Warm, glowing color with a nostalgic amber cast.",
  },
  {
    id: "cyanotype",
    name: "Cyanotype",
    css: "grayscale(1) sepia(1) hue-rotate(160deg) saturate(3) brightness(0.95)",
    stock: "Blueprint Process",
    flavor: "Cool cyan-blue monochrome, like an antique blueprint.",
  },
];

// Default is B&W-first per the design.
export const DEFAULT_STOCK = FILM_STOCKS[0];

export function stockById(id) {
  return FILM_STOCKS.find((s) => s.id === id) || DEFAULT_STOCK;
}

// Strip frame / backing colors ("designs"). The strip background is drawn
// behind the photos and baked into the export.
export const FRAMES = [
  { id: "classic-white", name: "Classic White", color: "#ffffff" },
  { id: "cream", name: "Cream", color: "#f4f0e6" },
  { id: "kraft", name: "Kraft", color: "#c9b48f" },
  { id: "charcoal", name: "Charcoal", color: "#1c1c1c" },
];

export const DEFAULT_FRAME = FRAMES[0];

export function frameById(id) {
  return FRAMES.find((f) => f.id === id) || DEFAULT_FRAME;
}

// Readable caption color for a given background (dark bg -> light text).
export function captionColorFor(hex) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  // Rec. 601 luma
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma < 130 ? "#f4f2ec" : "#141414";
}
