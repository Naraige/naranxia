import { hex } from "../core/math.js";
import { PAL, THEME } from "../ui/kingdom-theme.js";

/* ================= THE BANNERS, THE MINECRAFT WAY =================
   A cloth of 20 x 40 pixels (the size of a Minecraft banner) made of patterns only, no emblem (the King: "stop with icon in banner just
   pattern"), painted in layers as a banner is made on a loom there: the field in the first colour, the pattern in the second, a shade
   towards the hem, a border in the light colour, a fringe in metal with five tassels.
   Pure data: bannerArt() gives one colour per pixel (null = no cloth). The 3D banners (models/banner.js), the picture of the banner and the
   pattern tiles of the menu (kingdom-banner.js) and the gonfalon of the HUD (banner-icon.js) are made from it.
   Visual only: never read by the simulation. */
export const BW = 20,
  BH = 40;

/* the middle of the cloth that the patterns are laid on: the border takes the outer pixel, the fringe the two last rows */
const CX = 9.5,
  CY = 18.5;

/* the patterns: for a pixel of the cloth, the share of the second colour (true / false, or 0..1 for the gradient). The first 8 are the
   patterns the kingdoms always had (a saved kingdom keeps its number); their names are PATN in ui/title-menu.js, in the same order */
export const PATS = [
  /* 0 plain */
  () => 0,
  /* 1 per pale */
  (x) => x >= BW / 2,
  /* 2 chevron */
  (x, y) => {
    const d = Math.floor(Math.abs(x - CX));
    return y >= 11 + d && y < 18 + d;
  },
  /* 3 bend */
  (x, y) => y - 2 * x >= -7 && y - 2 * x <= 6,
  /* 4 quarterly */
  (x, y) => x < BW / 2 === y < 19,
  /* 5 fess */
  (x, y) => y >= 14 && y < 24,
  /* 6 bordure */
  (x, y) => x < 4 || x > BW - 5 || y < 4 || y > 33,
  /* 7 saltire */
  (x, y) => Math.abs(y - CY - 2 * (x - CX)) < 4 || Math.abs(y - CY + 2 * (x - CX)) < 4,
  /* 8 cross */
  (x, y) => (x >= 7 && x < 13) || (y >= 16 && y < 22),
  /* 9 pale */
  (x) => x >= 7 && x < 13,
  /* 10 lozenge */
  (x, y) => Math.abs(x - CX) / 7.2 + Math.abs(y - CY) / 13.5 <= 1,
  /* 11 roundel */
  (x, y) => (x - CX) * (x - CX) + (y - CY) * (y - CY) <= 56,
  /* 12 per bend */
  (x, y) => y - CY > 2 * (x - CX),
  /* 13 pile */
  (x, y) => Math.abs(x - CX) < 9.6 * (1 - y / 28),
  /* 14 checky */
  (x, y) => (((x / 5) | 0) + (((y + 1) / 6) | 0)) % 2 === 1,
  /* 15 gradient: the second colour at the top, fading into the field in eight steps */
  (x, y) => Math.max(0, Math.min(1, Math.round((1 - (y - 2) / 30) * 8) / 8)),
];

const h2 = (v) => Math.max(0, Math.min(255, Math.round(v)));
const str = (a) => "#" + a.map((v) => h2(v).toString(16).padStart(2, "0")).join("");
/* a colour k times as bright (over 1: towards white) */
export const tone = (c, k) => str(hex(c).map((v) => (k > 1 ? v + (255 - v) * (k - 1) : v * k)));
/* f of colour b in colour a */
export const blend = (a, b, f) => {
  const A = hex(a),
    B = hex(b);
  return str(A.map((v, i) => v + (B[i] - v) * f));
};

/* gold and silver: light, mid, dark */
const METAL = {
  g: ["#fff1b0", "#f2c64a", "#b47c1c"],
  s: ["#ffffff", "#d6dce8", "#8e98ac"],
};
/* silver on the yellow fields, where gold would not show */
const metalOf = (c) => METAL[c === 3 || c === 10 || c === 11 ? "s" : "g"];

/* the cloth darkens towards the hem, in bands of three rows */
const hemK = (y) => (y < 14 ? 1.05 : 1.05 - Math.floor((y - 12) / 3) * 0.035);

const CACHE = {};

/* the banner of a kingdom, a guild or a foreign realm (th: colour c, second colour c2, pattern p; the kingdom of the player when left out):
   { px: BW * BH colours from the top left, key } */
export function bannerArt(th = THEME) {
  const c = Math.abs(th.c | 0) % PAL.length,
    c2 = Math.abs(th.c2 | 0) % PAL.length,
    p = Math.abs(th.p | 0) % PATS.length,
    key = c + "|" + c2 + "|" + p;
  if (CACHE[key]) return CACHE[key];
  const P = PAL[c][1],
    S = PAL[c][2],
    C2 = PAL[c2][1],
    M = metalOf(c),
    px = new Array(BW * BH).fill(null);
  /* field and pattern, shaded towards the hem */
  for (let y = 0; y < BH; y++)
    for (let x = 0; x < BW; x++) {
      const f = +PATS[p](x, y);
      px[y * BW + x] = tone(f <= 0 ? P : f >= 1 ? C2 : blend(P, C2, f), hemK(y));
    }
  /* border in the light colour, darker under the crossbar */
  for (let y = 0; y < BH - 2; y++) px[y * BW] = px[y * BW + BW - 1] = tone(S, y > 26 ? 0.9 : 1);
  for (let x = 0; x < BW; x++) {
    px[x] = tone(S, 0.82);
    px[(BH - 3) * BW + x] = tone(S, 0.9);
    /* the fringe: a band of metal and five tassels below it */
    px[(BH - 2) * BW + x] = x % 4 === 0 || x % 4 === 3 ? M[2] : M[1];
    px[(BH - 1) * BW + x] = x % 4 === 1 || x % 4 === 2 ? (x % 4 === 1 ? M[1] : M[2]) : null;
  }
  return (CACHE[key] = { px, key });
}

/* the share of the second colour on a smaller cloth of w x h pixels (the gonfalon of the HUD): the same pattern, sampled */
export function patShare(p, w, h) {
  const m = new Float32Array(w * h),
    f = PATS[Math.abs(p | 0) % PATS.length];
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++)
      m[j * w + i] = +f(1 + Math.floor(((i + 0.5) * (BW - 2)) / w), 1 + Math.floor(((j + 0.5) * 36) / h));
  return m;
}

/* the cloth as rectangles of one colour, [x, y, w, h, colour] in pixels from the top left: as few as a greedy sweep finds */
export function bannerRects(px) {
  const R = [],
    done = new Uint8Array(BW * BH);
  for (let y = 0; y < BH; y++)
    for (let x = 0; x < BW; x++) {
      const i = y * BW + x,
        c = px[i];
      if (done[i] || !c) continue;
      let w = 1,
        h = 1;
      while (x + w < BW && !done[i + w] && px[i + w] === c) w++;
      grow: while (y + h < BH) {
        for (let q = 0; q < w; q++) if (done[i + h * BW + q] || px[i + h * BW + q] !== c) break grow;
        h++;
      }
      for (let b = 0; b < h; b++) done.fill(1, i + b * BW, i + b * BW + w);
      R.push([x, y, w, h, c]);
    }
  return R;
}
