import { rmotion } from "../core/prefs.js";
import { L } from "../i18n/language.js";
import "../gameplay/session.js";
import { SEAS } from "../rendering/weather.js";
import { canvasesState, cvs } from "./canvases.js";
import { hudDisplayState } from "./hud-state.js";
import { lastRun } from "./title-weather.js";
import { FFP } from "./typography.js";

/* ================= title screen dressing (lot B): blurred dark backdrop, golden frame with ornate corners, pixel title on the top filet,
   floating embers, near-invisible checker, version / season badge on the bottom filet. Visual only: nothing here reads or writes the simulation. ================= */

/* --- backdrop: the 3D canvas gets a light blur + 22 % darker (CSS filter, off in game and in the site picker); vignette drawn on the UI canvas --- */
let blurOn = null,
  g3 = null;
export function titleBlur(on) {
  if (on === blurOn) return;
  blurOn = on;
  try {
    g3 = g3 || document.getElementById("g3");
    if (!g3) return;
    g3.style.filter = on ? "blur(1.2px) brightness(.86)" : "";
    g3.style.transform = on ? "scale(1.025)" : "";
  } catch {
    /* The title screen remains usable without this optional transform. */
  }
}

export function titleVignette(UW, UH) {
  const g = canvasesState.ctx,
    r = Math.hypot(UW, UH) / 2;
  const rg = g.createRadialGradient(UW / 2, UH / 2, r * 0.45, UW / 2, UH / 2, r * 1.02);
  rg.addColorStop(0, "rgba(2,3,8,0)");
  rg.addColorStop(1, "rgba(2,3,8,.62)");
  g.fillStyle = rg;
  g.fillRect(0, 0, UW, UH);
}

/* barely visible checker (a hint of the pixel world) */
export function titleChecker(UW, UH) {
  const g = canvasesState.ctx,
    s = 16;
  g.fillStyle = "rgba(255,255,255,.028)";
  g.beginPath();
  for (let y = 0; y * s < UH; y++) for (let x = y & 1; x * s < UW; x += 2) g.rect(x * s, y * s, s, s);
  g.fill();
}

/* --- embers: golden squares rising from the bottom, drifting and twinkling. Positions come from an integer hash of the ember index and a wall-clock
   phase, never from Math.random() or the game clock (Reduce motion freezes them) --- */
const hs = (n) => {
  n = n ^ 61 ^ (n >>> 16);
  n = (n + (n << 3)) | 0;
  n ^= n >>> 4;
  n = Math.imul(n, 0x27d4eb2d);
  n ^= n >>> 15;
  return (n >>> 0) / 4294967296;
};
const EMC = ["#ffce6e", "#ffaa46", "#ffe296", "#f08232"];
export function titleEmbers(UW, UH) {
  const g = canvasesState.ctx,
    n = UW < 420 ? 26 : 60,
    t = rmotion() ? 0 : performance.now() / 1000;
  g.save();
  for (let i = 0; i < n; i++) {
    const sp = 0.012 + hs(i * 7 + 1) * 0.028,
      ph = hs(i * 7 + 2),
      x0 = (i % 3 ? 0.04 + hs(i * 7 + 3) * 0.92 : 0.03 + hs(i * 7 + 3) * 0.4) * UW,
      s = hs(i * 7 + 4) < 0.5 ? 1.5 : hs(i * 7 + 4) < 0.85 ? 2.2 : 3,
      k = (ph + t * sp) % 1,
      y = UH * (1.03 - k * 1.08),
      x = x0 + Math.sin(t * 0.6 + i * 1.7) * 7 * (1 + hs(i * 7 + 5)),
      fade = Math.min(1, k * 6, (1 - k) * 3),
      tw2 = 0.6 + 0.4 * Math.sin(t * (1.5 + hs(i * 7 + 6) * 2) + i),
      a = Math.max(0, fade * tw2 * (0.45 + hs(i * 7 + 6) * 0.5));
    if (a < 0.02) continue;
    const c = EMC[(hs(i * 7 + 7) * 4) | 0];
    g.globalAlpha = a * 0.22;
    g.fillStyle = c;
    g.fillRect(x - s, y - s, s * 3, s * 3);
    g.globalAlpha = a;
    g.fillRect(Math.round(x), Math.round(y), s, s);
  }
  g.restore();
}

/* --- logo: block letters drawn in code (6 x 7 cells each, two-cell stems), gold at the top to orange at the bottom, hard drop shadow, light relief on every block.
   Rendered once per size into an offscreen canvas (plus a white copy for the slow sheen), then blitted: no per-frame text or path work. --- */
const LGF = {
  N: ["XX..XX", "XXX.XX", "XXX.XX", "XXXXXX", "XX.XXX", "XX.XXX", "XX..XX"],
  A: [".XXXX.", "XX..XX", "XX..XX", "XXXXXX", "XX..XX", "XX..XX", "XX..XX"],
  R: ["XXXXX.", "XX..XX", "XX..XX", "XXXXX.", "XX.XX.", "XX..XX", "XX..XX"],
  X: ["XX..XX", "XX..XX", ".XXXX.", "..XX..", ".XXXX.", "XX..XX", "XX..XX"],
  I: ["XXXXXX", "..XX..", "..XX..", "..XX..", "..XX..", "..XX..", "XXXXXX"],
};
const LGW = 6;
const LGROW = ["#fff3ac", "#ffe27a", "#ffd04e", "#ffbb38", "#fba42c", "#f58c22", "#ec741a"];
const logoCells = (txt) => txt.length * LGW + (txt.length - 1);
const logoU = (txt, maxW, maxH) => {
  const k = hudDisplayState.UIS || 1;
  return Math.max(1 / k, Math.floor(Math.min(maxW / (logoCells(txt) + 1), maxH / 7.9) * k) / k);
};
export function titleLogoW(txt, maxW, maxH) {
  return logoCells(txt) * logoU(txt, maxW, maxH);
}
export function badgeW(text) {
  const g = canvasesState.ctx;
  g.save();
  g.font = "700 9px " + FFP;
  const w = Math.ceil(g.measureText(text).width) + 22;
  g.restore();
  return w;
}
let LGC = null;
function logoCanvas(txt, u) {
  const k = hudDisplayState.UIS || 1,
    p = Math.round(u * k),
    key = txt + "|" + p;
  if (LGC && LGC.key === key) return LGC;
  const nc = logoCells(txt),
    sh = Math.max(1, Math.round(p * 0.55)),
    ol = Math.max(1, Math.round(p * 0.22)),
    pad = ol,
    w = nc * p + pad * 2 + sh,
    h = 7 * p + pad * 2 + sh,
    c = cvs(w, h),
    g = c.getContext("2d"),
    m = cvs(w, h),
    gm = m.getContext("2d"),
    cells = [];
  const at = (i, j) => {
    if (j < 0 || j > 6 || i < 0) return false;
    const li = Math.floor(i / (LGW + 1)),
      ci = i % (LGW + 1);
    if (ci === LGW || li >= txt.length) return false;
    return LGF[txt[li]][j][ci] === "X";
  };
  for (let j = 0; j < 7; j++) for (let i = 0; i < nc; i++) if (at(i, j)) cells.push([i, j]);
  /* hard drop shadow, then the dark keyline */
  g.fillStyle = "rgba(8,4,2,.78)";
  for (const [i, j] of cells) g.fillRect(pad + i * p + sh - ol, pad + j * p + sh - ol, p + ol * 2, p + ol * 2);
  g.fillStyle = "#2a1606";
  for (const [i, j] of cells) g.fillRect(pad + i * p - ol, pad + j * p - ol, p + ol * 2, p + ol * 2);
  const e = Math.max(1, Math.round(p * 0.2));
  for (const [i, j] of cells) {
    const x = pad + i * p,
      y = pad + j * p;
    g.fillStyle = LGROW[j];
    g.fillRect(x, y, p, p);
    /* relief: lit top / left edges where the block is exposed, shaded bottom / right edges */
    if (!at(i, j - 1)) {
      g.fillStyle = "rgba(255,255,255,.6)";
      g.fillRect(x, y, p, e);
    }
    if (!at(i - 1, j)) {
      g.fillStyle = "rgba(255,255,255,.28)";
      g.fillRect(x, y, e, p);
    }
    if (!at(i, j + 1)) {
      g.fillStyle = "rgba(130,48,0,.6)";
      g.fillRect(x, y + p - e, p, e);
    }
    if (!at(i + 1, j)) {
      g.fillStyle = "rgba(130,48,0,.34)";
      g.fillRect(x + p - e, y, e, p);
    }
    if (p >= 6) {
      g.fillStyle = "rgba(120,56,0,.13)";
      g.fillRect(x + p - 1, y, 1, p);
      g.fillRect(x, y + p - 1, p, 1);
    }
    gm.fillStyle = "#fffbea";
    gm.fillRect(x, y, p, p);
  }
  return (LGC = { key, c, m, w: w / k, h: h / k, pad: pad / k, lw: (nc * p) / k, lh: (7 * p) / k });
}
/* fitted into maxW x maxH, centred on (cx, cy); returns the logo width */
export function titleLogo(txt, cx, cy, maxW, maxH) {
  const g = canvasesState.ctx,
    u = logoU(txt, maxW, maxH),
    L0 = logoCanvas(txt, u),
    x = Math.round(cx - L0.lw / 2) - L0.pad,
    y = Math.round(cy - L0.lh / 2) - L0.pad;
  g.save();
  g.imageSmoothingEnabled = false;
  g.drawImage(L0.c, x, y, L0.w, L0.h);
  if (!rmotion()) {
    /* slow sheen: a slanted band of the white copy crosses the letters every 9 s */
    const sw = ((performance.now() / 9000) % 1) * 2.4 - 0.5;
    if (sw > -0.2 && sw < 1.2) {
      const bx = x + sw * L0.w,
        w2 = L0.lh * 0.5,
        sl = L0.lh * 0.35;
      g.beginPath();
      g.moveTo(bx - w2 + sl, y);
      g.lineTo(bx + w2 + sl, y);
      g.lineTo(bx + w2 - sl, y + L0.h);
      g.lineTo(bx - w2 - sl, y + L0.h);
      g.closePath();
      g.clip();
      g.globalAlpha *= 0.5;
      g.drawImage(L0.m, x, y, L0.w, L0.h);
    }
  }
  g.restore();
  return L0.lw;
}

/* --- ornate corner: square volutes (9x9 pixel pattern), B = bright gold, G = gold --- */
const VOL = [
  "BBBBBBBBB",
  "BGGGGGGGG",
  "BG.......",
  "BG.BBBBB.",
  "BG.BGGGG.",
  "BG.BG....",
  "BG.BG.BB.",
  "BG.BG.BG.",
  "BG.......",
];
function corner(x, y, fx, fy, u) {
  const g = canvasesState.ctx;
  for (let j = 0; j < 9; j++)
    for (let i = 0; i < 9; i++) {
      const c = VOL[j][i];
      if (c === ".") continue;
      g.fillStyle = c === "B" ? "#f0cd73" : "#b8954c";
      g.fillRect(x + (fx ? 8 - i : i) * u, y + (fy ? 8 - j : j) * u, u, u);
    }
}
function dia(cx, cy, r, c) {
  const g = canvasesState.ctx;
  g.beginPath();
  g.moveTo(cx, cy - r);
  g.lineTo(cx + r, cy);
  g.lineTo(cx, cy + r);
  g.lineTo(cx - r, cy);
  g.closePath();
  g.fillStyle = c;
  g.fill();
}

/* gold ornament line: fades out to both sides, diamond in the middle and two small ones */
export function ornLine(cx, y, w) {
  const g = canvasesState.ctx;
  for (const sd of [-1, 1]) {
    const x0 = cx + sd * 7,
      gr = g.createLinearGradient(x0, 0, x0 + (sd * w) / 2, 0);
    gr.addColorStop(0, "rgba(184,149,76,.95)");
    gr.addColorStop(1, "rgba(184,149,76,0)");
    g.fillStyle = gr;
    g.fillRect(Math.min(x0, x0 + (sd * w) / 2), Math.round(y), w / 2, 1);
  }
  dia(cx, y + 0.5, 3, "#f0cd73");
  dia(cx - 10, y + 0.5, 1.6, "#b8954c");
  dia(cx + 10, y + 0.5, 1.6, "#b8954c");
}

/* the frame: outer filet + inner filet, ornate corners, gaps in the top filet for the title and in the bottom filet for the badge.
   Returns {x0,y0,x1,y1} of the outer filet. */
export function titleFrame(UW, UH, cx, top, gapT, bottom, gapB) {
  const g = canvasesState.ctx,
    m = UW < 420 ? 5 : 14,
    x0 = m,
    x1 = UW - m,
    y0 = top,
    y1 = UH - m - (bottom || 0),
    u = UW < 420 ? 1 : 1.5;
  g.save();
  g.lineWidth = 1;
  const seg = (xa, xb, y, col) => {
    g.fillStyle = col;
    g.fillRect(Math.round(xa), Math.round(y), Math.round(xb - xa), 1);
  };
  const vseg = (x, ya, yb, col) => {
    g.fillStyle = col;
    g.fillRect(Math.round(x), Math.round(ya), 1, Math.round(yb - ya));
  };
  const O = "rgba(184,149,76,.92)",
    I = "rgba(184,149,76,.38)",
    ins = 4;
  g.shadowColor = "rgba(0,0,0,.5)";
  g.shadowBlur = 4;
  seg(x0, cx - gapT / 2, y0, O);
  seg(cx + gapT / 2, x1, y0, O);
  seg(x0, cx - gapB / 2, y1, O);
  seg(cx + gapB / 2, x1, y1, O);
  vseg(x0, y0, y1, O);
  vseg(x1, y0, y1 + 1, O);
  g.shadowBlur = 0;
  seg(x0 + ins, cx - gapT / 2 - 8, y0 + ins, I);
  seg(cx + gapT / 2 + 8, x1 - ins, y0 + ins, I);
  seg(x0 + ins, cx - gapB / 2 - 8, y1 - ins, I);
  seg(cx + gapB / 2 + 8, x1 - ins, y1 - ins, I);
  vseg(x0 + ins, y0 + ins, y1 - ins, I);
  vseg(x1 - ins, y0 + ins, y1 - ins, I);
  const n = 9 * u;
  corner(x0 - u, y0 - u, 0, 0, u);
  corner(x1 - n + u + 1, y0 - u, 1, 0, u);
  corner(x0 - u, y1 - n + u + 1, 0, 1, u);
  corner(x1 - n + u + 1, y1 - n + u + 1, 1, 1, u);
  g.restore();
  return { x0, y0, x1, y1 };
}

/* version / season badge: gold plaque on ribbon tails, centred on the bottom filet. Returns its width. */
export function titleBadge(cx, cy, text, maxW) {
  const g = canvasesState.ctx;
  g.save();
  g.font = "700 9px " + FFP;
  g.textBaseline = "middle";
  g.textAlign = "center";
  let w = Math.ceil(g.measureText(text).width) + 22;
  if (maxW && w > maxW) w = maxW;
  const h = 15,
    x = Math.round(cx - w / 2),
    y = Math.round(cy - h / 2),
    tail = 20;
  for (const sd of [-1, 1]) {
    const xe = sd < 0 ? x : x + w,
      xo = xe + sd * tail;
    g.beginPath();
    g.moveTo(xe, y + 2);
    g.lineTo(xo, y + 2);
    g.lineTo(xo - sd * 6, cy + 1);
    g.lineTo(xo, y + h);
    g.lineTo(xe, y + h);
    g.closePath();
    g.fillStyle = "#8f6f2c";
    g.fill();
    g.lineWidth = 1;
    g.strokeStyle = "#d9b45c";
    g.stroke();
  }
  g.fillStyle = "rgba(0,0,0,.35)";
  g.fillRect(x, y + 2, w, h);
  const gr = g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, "#f2d27a");
  gr.addColorStop(1, "#c89f45");
  g.fillStyle = gr;
  g.fillRect(x, y, w, h);
  g.strokeStyle = "#5b4216";
  g.lineWidth = 1;
  g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  g.strokeStyle = "rgba(255,236,170,.7)";
  g.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  g.fillStyle = "#3a2808";
  g.fillText(text, cx, cy + 0.6);
  g.restore();
  return w + tail * 2;
}

export function seasonName() {
  const r = lastRun();
  return r ? L(SEAS[((r.w / 4) | 0) % 4]).toUpperCase() : "";
}

/* ================= lobby dressing (revamp): tip banner, hexagon counters, pixel glyphs. Original art, drawn in code. ================= */
const GLY = {
  crown: ["X..X..X", "X..X..X", "XX.X.XX", "XXXXXXX", "XXXXXXX", ".......", "XXXXXXX"],
  skull: [".XXXXX.", "XXXXXXX", "X..X..X", "X..X..X", "XXXXXXX", ".XXXXX.", ".X.X.X."],
  glass: ["XXXXXXX", ".X...X.", "..X.X..", "...X...", "..X.X..", ".X...X.", "XXXXXXX"],
  bulb: ["..XXX..", ".X...X.", ".X.X.X.", ".X.X.X.", "..XXX..", "..XXX..", "...X..."],
};
export function glyph(name, x, y, u, col) {
  const g = canvasesState.ctx,
    P = GLY[name];
  g.fillStyle = col;
  for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) if (P[j][i] === "X") g.fillRect(x + i * u, y + j * u, u, u);
}
/* flat-top hexagon badge with a glyph */
export function hexBadge(cx, cy, r, name) {
  const g = canvasesState.ctx,
    P = (rr, dy) => {
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        g.lineTo(cx + Math.cos(a) * rr, cy + (dy || 0) + Math.sin(a) * rr);
      }
      g.closePath();
    };
  g.fillStyle = "rgba(0,0,0,.45)";
  P(r + 1, 2);
  g.fill();
  const gr = g.createLinearGradient(0, cy - r, 0, cy + r);
  gr.addColorStop(0, "#2c3a5e");
  gr.addColorStop(1, "#141b30");
  g.fillStyle = gr;
  P(r);
  g.fill();
  g.lineWidth = 1.5;
  g.strokeStyle = "#f0cd73";
  g.stroke();
  g.lineWidth = 1;
  g.strokeStyle = "rgba(10,8,4,.7)";
  P(r + 1.2);
  g.stroke();
  const u = Math.max(1, Math.round(r / 6));
  glyph(name, Math.round(cx - 3.5 * u), Math.round(cy - 3.5 * u), u, "#ffe39a");
}
/* tip banner: dark strip, gold hairline, bulb icon; the text shrinks, then ends with an ellipsis. Returns its height. */
export function tipBanner(UW, y, m, text, T_, tw) {
  const g = canvasesState.ctx,
    h = 16,
    maxW = UW - 2 * m;
  let sc = 0.82,
    t = L(text);
  while (sc > 0.64 && tw(t, sc) + 34 > maxW) sc -= 0.03;
  if (tw(t, sc) + 34 > maxW) {
    while (t.length > 4 && tw(t + "\u2026", sc) + 34 > maxW) t = t.slice(0, -1);
    t += "\u2026";
  }
  const w = Math.ceil(tw(t, sc)) + 34,
    x = Math.round(UW / 2 - w / 2);
  g.fillStyle = "rgba(0,0,0,.35)";
  g.fillRect(x + 1, y + 2, w, h);
  g.fillStyle = "rgba(8,10,18,.82)";
  g.fillRect(x, y, w, h);
  g.fillStyle = "rgba(184,149,76,.75)";
  g.fillRect(x, y, w, 1);
  g.fillRect(x, y + h - 1, w, 1);
  g.fillStyle = "#f0cd73";
  g.fillRect(x, y, 2, h);
  g.fillRect(x + w - 2, y, 2, h);
  glyph("bulb", x + 9, y + 4.5, 1, "#ffd86b");
  T_(t, x + 23, y + (h - 9 * sc) / 2, "#e9e4d6", sc);
  return h;
}
