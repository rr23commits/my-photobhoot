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
];

// Default is B&W-first per the design.
export const DEFAULT_STOCK = FILM_STOCKS[0];

export function stockById(id) {
  return FILM_STOCKS.find((s) => s.id === id) || DEFAULT_STOCK;
}
