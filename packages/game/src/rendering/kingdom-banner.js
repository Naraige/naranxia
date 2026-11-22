import { hex } from "../core/math.js";
import { bannerArt, BH, BW } from "./banner-art.js";
import { BANNER } from "./structures.js";
import { canvasesState, cvs } from "../ui/canvases.js";
import { circ, ICN, ln, poly } from "../ui/drawing.js";
import { IC, thIcons } from "../ui/icons.js";
import { THEME, themeSaved } from "../ui/kingdom-theme.js";

/* ---- the banner of the kingdom: its picture, the tiles of the menu where it is composed ---- */
export const lighten = (c, k) => {
  const h = hex(c);
  return (
    "#" +
    h
      .map((v) =>
        Math.round(v + (255 - v) * k)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
};

/* the picture of the banner that hangs on the walls of the kingdom (rendering/banner-art.js, models/banner.js): the crossbar with its gold
   knobs and the cloth of 20 x 40 pixels, four canvas pixels to each, in the middle of the 128 x 192 canvas */
export function drawBanner() {
  const g = BANNER.getContext("2d"),
    U = 4,
    X = (128 - BW * U) / 2,
    Y = (192 - (BH + 2) * U) / 2,
    px = bannerArt().px;
  g.clearRect(0, 0, 128, 192);
  g.fillStyle = "#5a3e24";
  g.fillRect(X, Y, BW * U, 2 * U);
  g.fillStyle = "#7a5632";
  g.fillRect(X, Y, BW * U, U);
  for (const x of [X - U, X + BW * U]) {
    g.fillStyle = "#d9a938";
    g.fillRect(x, Y - U / 2, U, 3 * U);
    g.fillStyle = "#f6dc7c";
    g.fillRect(x, Y - U / 2, U, U);
  }
  for (let i = 0; i < px.length; i++)
    if (px[i]) {
      g.fillStyle = px[i];
      g.fillRect(X + (i % BW) * U, Y + (2 + ((i / BW) | 0)) * U, U, U);
    }
}

export function saveTheme() {
  try {
    localStorage.setItem("dk_theme", JSON.stringify(THEME));
  } catch {
    /* The selected banner theme remains active in memory for this session. */
  }
  themeSaved();
}

/* a banner of the kingdom's two colours in pattern p, one canvas pixel to each pixel of the cloth (20 x 40): the tiles of the menu */
const TILES = {};
export function bannerTile(p) {
  const A = bannerArt({ c: THEME.c, c2: THEME.c2, p });
  if (TILES[A.key]) return TILES[A.key];
  const c = cvs(BW, BH),
    g = c.getContext("2d");
  for (let i = 0; i < A.px.length; i++)
    if (A.px[i]) {
      g.fillStyle = A.px[i];
      g.fillRect(i % BW, (i / BW) | 0, 1, 1);
    }
  return (TILES[A.key] = c);
}

export function gemSwatch(x, y, s, col) {
  canvasesState.ctx.save();
  canvasesState.ctx.shadowColor = "rgba(0,0,0,.5)";
  canvasesState.ctx.shadowBlur = 1.5;
  canvasesState.ctx.shadowOffsetY = 0.8;
  canvasesState.ctx.beginPath();
  canvasesState.ctx.arc(x + s / 2, y + s / 2, s / 2 - 0.3, 0, 6.283);
  const q = canvasesState.ctx.createRadialGradient(x + s * 0.36, y + s * 0.3, s * 0.05, x + s / 2, y + s / 2, s * 0.62);
  q.addColorStop(0, lighten(col, 0.6));
  q.addColorStop(0.45, col);
  q.addColorStop(1, lighten(col, -0.0) && "#00000000" === "" ? col : col);
  canvasesState.ctx.fillStyle = q;
  canvasesState.ctx.fill();
  canvasesState.ctx.restore();
  canvasesState.ctx.beginPath();
  canvasesState.ctx.arc(x + s / 2, y + s / 2, s / 2 - 0.3, 0, 6.283);
  const d = canvasesState.ctx.createRadialGradient(x + s / 2, y + s / 2, s * 0.25, x + s / 2, y + s / 2, s * 0.52);
  d.addColorStop(0, "rgba(0,0,0,0)");
  d.addColorStop(1, "rgba(0,0,0,.38)");
  canvasesState.ctx.fillStyle = d;
  canvasesState.ctx.fill();
  canvasesState.ctx.lineWidth = 0.9;
  canvasesState.ctx.strokeStyle = "#c99a3a";
  canvasesState.ctx.stroke();
  canvasesState.ctx.beginPath();
  canvasesState.ctx.ellipse(x + s * 0.38, y + s * 0.3, s * 0.15, s * 0.09, -0.6, 0, 6.283);
  canvasesState.ctx.fillStyle = "rgba(255,255,255,.6)";
  canvasesState.ctx.fill();
}

export function initializeKingdomBanner() {
  thIcons();
  drawBanner();

  IC.gear = ICN((g) => {
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      ln(g, 8 + Math.cos(a) * 4.5, 8 + Math.sin(a) * 4.5, 8 + Math.cos(a) * 7, 8 + Math.sin(a) * 7, "#f6e9d2", 2.6);
    }
    circ(g, 8, 8, 5, "#f6e9d2", "#2a303a", 0.8);
    circ(g, 8, 8, 2, "#2a303a", "#2a303a", 0.5);
  });
  IC.upgrade = ICN((g) => {
    poly(
      g,
      [
        [8, 1.5],
        [14, 8],
        [10, 8],
        [10, 14.5],
        [6, 14.5],
        [6, 8],
        [2, 8],
      ],
      "#ffd23c",
      "#7a5a00",
      0.9,
    );
  });
}
