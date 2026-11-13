import { canvasesState } from "./canvases.js";

/* ================= UI toolkit: vector icons, rounded panels, smooth text ================= */
export const FF = '"Inter","Segoe UI",system-ui,-apple-system,Arial,sans-serif',
  FFT = '"Inter","Segoe UI",system-ui,-apple-system,Arial,sans-serif';
/* titles only (TTL, panel headers via TN): pixel font; body text keeps Inter. Offline the stack falls back to Inter. */
export const FFP = '"Pixelify Sans","Inter","Segoe UI",system-ui,-apple-system,Arial,sans-serif';

export const fontOf = (sz) => {
  const px = sz * 1.25;
  return px >= 16 ? "700 " + Math.round(px * 0.8) + "px " + FFT : "500 " + Math.round(px * 0.88) + "px " + FF;
};

export const setF = (sz, _w) => {
  canvasesState.ctx.font = fontOf(sz);
};

export const TWM = new Map();

export function initializeTypography() {
  try {
    document.fonts && document.fonts.load("500 16px Inter", "0");
    document.fonts.load('700 16px "Pixelify Sans"', "A");
  } catch {
    /* Keep the browser's fallback fonts when font loading is unavailable. */
  }
  try {
    if (document.fonts) {
      document.fonts.addEventListener("loadingdone", () => TWM.clear());
      document.fonts.ready.then(() => TWM.clear());
    }
  } catch {
    /* Font load notifications are optional; retain the current text measurement cache. */
  }
}

/* light theme: UI text is authored for dark panels, so light colors are mapped to dark inks (hue kept for colored text) */
export const LIGHT = true;
const INKM = new Map();
export function ink(c) {
  if (!LIGHT || !c || typeof c !== "string") return c;
  let r = INKM.get(c);
  if (r !== undefined) return r;
  let m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c),
    R,
    G,
    B,
    A = 1;
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    R = parseInt(h.slice(0, 2), 16);
    G = parseInt(h.slice(2, 4), 16);
    B = parseInt(h.slice(4, 6), 16);
  } else {
    m = /^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/.exec(c);
    if (!m) {
      INKM.set(c, c);
      return c;
    }
    R = +m[1];
    G = +m[2];
    B = +m[3];
    A = m[4] === undefined ? 1 : +m[4];
  }
  const Lm = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255,
    sat = Math.max(R, G, B) - Math.min(R, G, B);
  let o;
  if (sat < 50) {
    o = Lm > 0.85 ? [23, 32, 46] : Lm > 0.45 ? [74, 90, 114] : [R, G, B];
  } else {
    const k = Lm > 0.55 ? 0.5 : Lm > 0.35 ? 0.8 : 1;
    o = [Math.round(R * k), Math.round(G * k), Math.round(B * k)];
  }
  r =
    A < 1 || c[0] === "r"
      ? "rgba(" + o[0] + "," + o[1] + "," + o[2] + "," + A + ")"
      : "rgb(" + o[0] + "," + o[1] + "," + o[2] + ")";
  if (INKM.size > 400) INKM.clear();
  INKM.set(c, r);
  return r;
}

/* light buttons on a dark UI: text drawn inside a button rectangle gets the dark ink, everything else keeps its light colors */
const BR = [];
export const btnReset = () => {
  BR.length = 0;
};
export const btnAdd = (x, y, w, h) => {
  if (BR.length < 600) BR.push(x, y, w, h);
};
export const inBtn = (x, y) => {
  if (!LIGHT) return false;
  for (let i = BR.length - 4; i >= 0; i -= 4)
    if (x >= BR[i] - 1 && x <= BR[i] + BR[i + 2] + 1 && y >= BR[i + 1] - 1 && y <= BR[i + 1] + BR[i + 3] + 1)
      return true;
  return false;
};
