import { hex } from "../core/math.js";
import { PAL, THEME } from "../ui/kingdom-theme.js";

/* ================= THE BANNER OF THE KINGDOM, THE MINECRAFT WAY =================
   A cloth of 20 x 40 pixels (the size of a Minecraft banner) painted in layers, as a banner is made on a loom there: the field in the colour of
   the kingdom, the pattern in its second colour, a gradient towards the hem, a border in the light colour, a fringe in metal, and last the
   emblem in metal (gold, or silver on a yellow field): three tones lit from the top, a few details in ink, a dark rim cut into the cloth.
   Pure data: bannerArt() gives one colour per pixel (null = no cloth). The 3D banners (models/banner.js) and the picture of the banner
   (kingdom-banner.js drawBanner) are made from it. Visual only: never read by the simulation. */
export const BW = 20,
  BH = 40;

/* where the emblem sits on the cloth (its top left pixel), and its size */
const EX = 3,
  EY = 11,
  EN = 14;

/* the 16 emblems of EMB (same order) drawn on a 14 x 14 grid, symmetric on the two middle columns like the cloth.
   # metal (shaded by its place), o a highlight, d its dark tone, x ink (a door, a band) */
export const EMB14 = [
  /* 0 cross */
  "....######....|....######....|.....####.....|##...####...##|##############|##############|##############|##############|##...####...##|.....####.....|.....####.....|.....####.....|....######....|....######....",
  /* 1 star */
  "......##......|......##......|.....####.....|.....####.....|##############|.############.|..##########..|...########...|...########...|..##########..|..####..####..|.####....####.|.###......###.|##..........##",
  /* 2 crown */
  "..............|......oo......|o.....##.....o|##...####...##|##...####...##|###.######.###|##############|##############|##############|xxxxxxxxxxxxxx|#o##o####o##o#|##############|##############|..............",
  /* 3 crossed swords */
  "##..........##|.##........##.|..##......##..|...##....##...|....##..##....|.....####.....|......##......|.....####.....|.##.##..##.##.|..###....###..|..###....###..|.##.##..##.##.|##..........##|##..........##",
  /* 4 tower */
  "###..####..###|###..####..###|##############|##############|.############.|..##########..|..##########..|..####xx####..|..####xx####..|..##########..|..##########..|..###xxxx###..|.####xxxx####.|#####xxxx#####",
  /* 5 sun */
  "......##......|..#...##...#..|...#......#...|.....####.....|....######....|...########...|##.########.##|##.########.##|...########...|....######....|.....####.....|...#......#...|..#...##...#..|......##......",
  /* 6 tree */
  "......##......|.....####.....|....######....|...########...|.....####.....|....######....|...########...|..##########..|....######....|...########...|..##########..|.############.|......dd......|.....dddd.....",
  /* 7 bolt */
  "........####..|.......####...|......####....|.....####.....|....####......|...#########..|..#########...|......####....|.....####.....|....####......|...####.......|...###........|..##..........|..#...........",
  /* 8 moon and star */
  "....#####.....|..#####.......|.#####........|.####......#..|#####.....###.|####.......#..|####..........|####..........|#####.........|#####.......#.|.######...###.|.############.|..##########..|....######....",
  /* 9 anchor */
  ".....####.....|.....#..#.....|.....####.....|......##......|..##########..|......##......|......##......|#.....##.....#|##....##....##|###...##...###|.###..##..###.|..##########..|...########...|.....####.....",
  /* 10 key */
  "....######....|...########...|...###..###...|...###..###...|...########...|....######....|......##......|......##......|......##......|......#####...|......##......|......#####...|......####....|......##......",
  /* 11 axe */
  "....##....#...|....##...###..|....##.#####..|..###########.|..###########.|....##.######.|....##...####.|....##....###.|....##.....#..|....##........|....##........|....##........|....##........|....##........",
  /* 12 fleur-de-lis */
  "......##......|.....####.....|.....####.....|.....####.....|.##..####..##.|####.####.####|##.##.##.##.##|#..##.##.##..#|...########...|..##########..|...########...|...##.##.##...|..##..##..##..|......##......",
  /* 13 eagle */
  "......##......|#....####....#|##...####...##|###..####..###|####.####.####|##############|.############.|..##########..|....######....|....######....|...########...|..##.####.##..|..#...##...#..|.....####.....",
  /* 14 flame */
  ".....#........|.....##.......|......##......|.....####.....|....#####..#..|...######.##..|..###########.|..###########.|.####oo######.|.###oooo#####.|.###oooo####..|.####oo#####..|..#########...|...#######....",
  /* 15 shield */
  "##############|##############|##############|######xx######|#####xxxx#####|####xx##xx####|###xx####xx###|##xx######xx##|##x########x##|.############.|.############.|..##########..|...########...|.....####.....",
].map((s) => s.split("|"));

/* the 8 patterns of the kingdom (bannerPattern, the vector one of the menus) cut for a cloth of 20 x 40: true = the second colour */
const PAT = [
  () => false,
  /* per pale */
  (x) => x >= BW / 2,
  /* chevron */
  (x, y) => {
    const d = Math.floor(Math.abs(x - 9.5));
    return y >= 17 + d && y < 24 + d;
  },
  /* bend */
  (x, y) => y - 2 * x >= -6 && y - 2 * x <= 7,
  /* quarterly */
  (x, y) => x < BW / 2 === y < 18,
  /* fess */
  (x, y) => y >= 14 && y < 22,
  /* bordure */
  (x, y) => x < 3 || x > BW - 4 || y < 3 || y > 33,
  /* saltire */
  (x, y) => Math.abs(y - 17.5 - 1.75 * (x - 9.5)) < 3.6 || Math.abs(y - 17.5 + 1.75 * (x - 9.5)) < 3.6,
];

/* a colour k times as bright (over 1: towards white) */
export const tone = (c, k) =>
  "#" +
  hex(c)
    .map((v) =>
      Math.max(0, Math.min(255, Math.round(k > 1 ? v + (255 - v) * (k - 1) : v * k)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

/* gold and silver: light, mid, dark, ink */
const METAL = {
  g: ["#fff1b0", "#f2c64a", "#b47c1c", "#6e4a12"],
  s: ["#ffffff", "#d6dce8", "#8e98ac", "#555e72"],
};
/* the same rule as the emblems of the menus: silver on the yellow fields */
const metalOf = (c) => METAL[c === 3 || c === 10 || c === 11 ? "s" : "g"];

/* the cloth darkens towards the hem (the gradient of a Minecraft banner), in bands of a few rows */
const hemK = (y) => (y < 14 ? 1.05 : 1.05 - Math.floor((y - 12) / 3) * 0.035);

const CACHE = {};

/* the banner of a kingdom (th: colour c, emblem e, second colour c2, pattern p): { px: BW * BH colours from the top left, key } */
export function bannerArt(th = THEME) {
  const c = th.c | 0,
    c2 = th.c2 | 0,
    p = (th.p | 0) % PAT.length,
    e = (th.e | 0) % EMB14.length,
    key = c + "|" + c2 + "|" + p + "|" + e;
  if (CACHE[key]) return CACHE[key];
  const P = PAL[c][1],
    S = PAL[c][2],
    C2 = PAL[c2][1],
    M = metalOf(c),
    px = new Array(BW * BH).fill(null);
  /* field, pattern, gradient */
  for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) px[y * BW + x] = tone(PAT[p](x, y) ? C2 : P, hemK(y));
  /* border in the light colour, darker under the crossbar */
  for (let y = 0; y < BH - 2; y++) px[y * BW] = px[y * BW + BW - 1] = tone(S, y > 26 ? 0.9 : 1);
  for (let x = 0; x < BW; x++) {
    px[x] = tone(S, 0.82);
    px[(BH - 3) * BW + x] = tone(S, 0.9);
    /* the fringe: a band of metal and five tassels below it */
    px[(BH - 2) * BW + x] = x % 4 === 0 || x % 4 === 3 ? M[2] : M[1];
    px[(BH - 1) * BW + x] = x % 4 === 1 || x % 4 === 2 ? (x % 4 === 1 ? M[1] : M[2]) : null;
  }
  /* the emblem */
  const E = EMB14[e],
    at = (i, j) => (j >= 0 && j < EN && i >= 0 && i < EN ? E[j][i] : "."),
    on = (i, j) => at(i, j) !== ".";
  for (let j = -1; j <= EN; j++)
    for (let i = -1; i <= EN; i++) {
      const q = (EY + j) * BW + EX + i,
        ch = at(i, j);
      if (ch === "x") px[q] = M[3];
      else if (ch === "o") px[q] = M[0];
      else if (ch === "d") px[q] = M[2];
      else if (ch === "#") px[q] = !on(i, j - 1) ? M[0] : !on(i, j + 1) || !on(i + 1, j) ? M[2] : M[1];
      else {
        let near = false;
        for (let b = -1; b <= 1 && !near; b++) for (let a = -1; a <= 1; a++) if (on(i + a, j + b)) near = true;
        if (near && px[q]) px[q] = tone(px[q], 0.56);
      }
    }
  return (CACHE[key] = { px, key });
}

/* the cloth as rectangles of one colour, [x, y, w, h, colour] in pixels from the top left: as few as a greedy sweep finds (about 150) */
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
