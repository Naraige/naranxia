import { snd } from "../audio/sound.js";
import { rmotion } from "../core/prefs.js";
import { GVER } from "../core/version.js";
import { L, T_, tw } from "../i18n/language.js";
import { inputState } from "../input/state.js";
import { canvasesState, cvs } from "./canvases.js";
import { focusRing } from "./drawing.js";
import { hudState, inR, U } from "./hud.js";
import { hudDisplayState } from "./hud-state.js";
import { NAV, navAdd } from "./menu-nav.js";
import { settingsState } from "./panel-state.js";
import { FFP } from "./typography.js";

/* ================= menu kit (revamp): the full-screen menu template and its parts =================
   kitScreen: very dark panel, faint pixel checker, dark red glow at the bottom, thin gold frame with ornate corners, a small version line over a
   big pixel title (gold to orange), a square close button. kitList: sections, full-width anthracite rows (label left, value right), thin scrollbar.
   bevelBtn: chunky bevelled buttons (green / gold / dark / red) that sink when pressed; kitTabs: the same as tabs, the active one taller.
   Everything here is drawn on the UI canvas from wall-clock time: nothing reads or writes the simulation. Reduce motion freezes the animations. */

const ctx = () => canvasesState.ctx;
export const wall = () => performance.now() / 1000;
export const KC = { bg: "#090a0f", gold: "#f0cd73", goldD: "#b8954c", txt: "#ece6d8", dim: "#948e80", sec: "#b9a676" };

const ovf = (t, w) => {
  const o = window.__ovf || (window.__ovf = []);
  if (o.length < 400) o.push(t + " @" + Math.round(w));
};

/* pixel-font text. o: al ('left' | 'center' | 'right'), max (fits by shrinking down to o.min or 7 px, reported to tools/fitcheck when it still spills),
   sh (hard shadow colour, '' = none), wt (weight), raw (already translated). Returns the drawn width. */
export function pxText(t, x, y, S, col, o) {
  o = o || {};
  const g = ctx(),
    s = o.raw ? String(t) : L(String(t)),
    wt = o.wt || 700,
    min = o.min || 7;
  S = Math.round(S);
  g.font = wt + " " + S + "px " + FFP;
  let w = g.measureText(s).width;
  if (o.max) {
    while (S > min && w > o.max) {
      S--;
      g.font = wt + " " + S + "px " + FFP;
      w = g.measureText(s).width;
    }
    if (w > o.max + 0.5) ovf(s, o.max);
  }
  g.textBaseline = "middle";
  g.textAlign = o.al || "left";
  if (o.sh !== "") {
    g.fillStyle = o.sh || "rgba(4,3,8,.8)";
    g.fillText(s, x + Math.max(1, S * 0.07), y + Math.max(1, S * 0.09));
  }
  g.fillStyle = col;
  g.fillText(s, x, y);
  g.textAlign = "left";
  return w;
}
export function pxW(t, S, wt) {
  const g = ctx();
  g.font = (wt || 700) + " " + Math.round(S) + "px " + FFP;
  return g.measureText(L(String(t))).width;
}

/* big title: yellow at the top, orange at the bottom, hard dark shadow */
export function goldTitle(t, x, y, S, al, max) {
  const g = ctx(),
    s = L(String(t));
  S = Math.round(S);
  g.font = "700 " + S + "px " + FFP;
  let w = g.measureText(s).width;
  if (max) {
    while (S > 10 && w > max) {
      S--;
      g.font = "700 " + S + "px " + FFP;
      w = g.measureText(s).width;
    }
    if (w > max + 0.5) ovf(s, max);
  }
  g.textBaseline = "top";
  g.textAlign = al || "left";
  const d = Math.max(1, Math.round(S * 0.09));
  g.fillStyle = "#1a0d05";
  g.fillText(s, x + d, y + d);
  const gr = g.createLinearGradient(0, y + S * 0.1, 0, y + S * 0.95);
  gr.addColorStop(0, "#fff0a0");
  gr.addColorStop(0.45, "#ffc93c");
  gr.addColorStop(1, "#f07a1c");
  g.fillStyle = gr;
  g.fillText(s, x, y);
  g.textAlign = "left";
  return { w, S };
}

/* --- stair-cut outline (pixel corners) --- */
export function stair(x, y, w, h, s) {
  const g = ctx(),
    t = s * 2;
  g.beginPath();
  g.moveTo(x + t, y);
  g.lineTo(x + w - t, y);
  g.lineTo(x + w - t, y + s);
  g.lineTo(x + w - s, y + s);
  g.lineTo(x + w - s, y + t);
  g.lineTo(x + w, y + t);
  g.lineTo(x + w, y + h - t);
  g.lineTo(x + w - s, y + h - t);
  g.lineTo(x + w - s, y + h - s);
  g.lineTo(x + w - t, y + h - s);
  g.lineTo(x + w - t, y + h);
  g.lineTo(x + t, y + h);
  g.lineTo(x + t, y + h - s);
  g.lineTo(x + s, y + h - s);
  g.lineTo(x + s, y + h - t);
  g.lineTo(x, y + h - t);
  g.lineTo(x, y + t);
  g.lineTo(x + s, y + t);
  g.lineTo(x + s, y + s);
  g.lineTo(x + t, y + s);
  g.closePath();
}

/* --- ornate corners: pixel patterns, B = bright gold, G = gold. Big = square volute (frames), small = notch (cards) --- */
const ORN9 = [
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
const ORN5 = ["BBBBB", "BGGG.", "BG.B.", "BG...", "B...."];
function orn(x, y, fx, fy, u, P) {
  const g = ctx(),
    n = P.length;
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const c = P[j][i];
      if (c === ".") continue;
      g.fillStyle = c === "B" ? KC.gold : KC.goldD;
      g.fillRect(x + (fx ? n - 1 - i : i) * u, y + (fy ? n - 1 - j : j) * u, u, u);
    }
}
/* thin gold frame with ornate corners. big: the 9 px volutes, else the 5 px notches */
export function kitFrame(x, y, w, h, big, alpha) {
  const g = ctx();
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);
  g.fillStyle = "rgba(184,149,76," + (alpha == null ? 0.7 : alpha) + ")";
  g.fillRect(x, y, w, 1);
  g.fillRect(x, y + h - 1, w, 1);
  g.fillRect(x, y, 1, h);
  g.fillRect(x + w - 1, y, 1, h);
  const P = big ? ORN9 : ORN5,
    n = P.length;
  orn(x - 1, y - 1, 0, 0, 1, P);
  orn(x + w - n + 1, y - 1, 1, 0, 1, P);
  orn(x - 1, y + h - n + 1, 0, 1, 1, P);
  orn(x + w - n + 1, y + h - n + 1, 1, 1, 1, P);
}
/* dark card inside a thin ornate frame (season card, detail panels) */
export function kitCard(x, y, w, h, a) {
  const g = ctx();
  g.fillStyle = "rgba(0,0,0,.3)";
  g.fillRect(x + 1, y + 3, w, h);
  g.fillStyle = "rgba(9,11,18," + (a == null ? 0.86 : a) + ")";
  g.fillRect(x, y, w, h);
  kitFrame(x, y, w, h, false, 0.8);
}

/* --- faint checker, cached as a pattern --- */
let CHK = null,
  CHKG = null;
function checker(UW, UH) {
  const g = ctx();
  if (!CHK || CHKG !== g) {
    const c = cvs(32, 32),
      q = c.getContext("2d");
    q.fillStyle = "rgba(255,255,255,.022)";
    q.fillRect(0, 0, 16, 16);
    q.fillRect(16, 16, 16, 16);
    CHK = g.createPattern(c, "repeat");
    CHKG = g;
  }
  g.fillStyle = CHK;
  g.fillRect(0, 0, UW, UH);
}

/* --- hover / press helpers --- */
const hov = (x, y, w, h) => inR(inputState.mouse, U(x, y, w, h));
const pressed = (hv) => hv && performance.now() - inputState.uiDown < 150;

/* ================= bevelled buttons ================= */
const BV = {
  go: { a: "#63c93e", b: "#3f9c28", hi: "#a6ee78", lo: "#1e5a14", ed: "#0a2208", tx: "#ffffff", ts: "#123a0c" },
  gold: {
    a: "#f6c644",
    b: "#d98e1e",
    hi: "#ffec9a",
    lo: "#7c4a0c",
    ed: "#2a1604",
    tx: "#2e1a04",
    ts: "rgba(255,240,170,.55)",
  },
  dark: { a: "#3b404d", b: "#2a2e39", hi: "#5a6072", lo: "#15171d", ed: "#06070a", tx: "#ece6d8", ts: "#0a0b10" },
  red: { a: "#c24a40", b: "#8e2c2a", hi: "#ee8a76", lo: "#4a1212", ed: "#1e0606", tx: "#ffffff", ts: "#3a0c0c" },
  off: { a: "#23262d", b: "#1c1e24", hi: "#30333c", lo: "#101114", ed: "#06070a", tx: "#767a86", ts: "#0a0b10" },
};
/* o: sc (label size factor), sel (keyboard focus), dis, nav (false = not in the keyboard order), key (key chip text), ic ((x,y,s)=>draw, left of the label),
   sub (small second line), al ('left'), raw (label already translated). Returns { hv, k }. */
export function bevelBtn(x, y, w, h, label, kind, fn, o) {
  o = o || {};
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);
  const g = ctx(),
    dis = !!o.dis,
    hv = !dis && !!fn && hov(x, y, w, h),
    k = fn && !dis && o.nav !== false ? navAdd(fn, hv) : -1,
    sel = k >= 0 && NAV.sel === k,
    c = BV[dis ? "off" : kind] || BV.dark,
    d = h >= 30 ? 4 : h >= 18 ? 3 : 2,
    pr = pressed(hv),
    off = pr ? d - 1 : 0,
    s = h >= 30 ? 2 : 1,
    bh = h - d;
  g.fillStyle = "rgba(0,0,0,.35)";
  stair(x - 1, y + 1, w + 2, h + 2, s);
  g.fill();
  g.fillStyle = c.ed;
  stair(x - 1, y - 1 + off, w + 2, h + 2 - off, s);
  g.fill();
  g.fillStyle = c.lo;
  stair(x, y + off, w, h - off, s);
  g.fill();
  const gr = g.createLinearGradient(0, y + off, 0, y + off + bh);
  gr.addColorStop(0, c.a);
  gr.addColorStop(1, c.b);
  g.fillStyle = gr;
  stair(x, y + off, w, bh, s);
  g.fill();
  g.fillStyle = c.hi;
  g.fillRect(x + s * 2, y + off + s, w - s * 4, Math.max(1, s));
  g.fillStyle = "rgba(0,0,0,.16)";
  g.fillRect(x + s * 2, y + off + bh - s - 1, w - s * 4, 1);
  if (hv || sel) {
    g.fillStyle = "rgba(255,255,255," + (pr ? 0.06 : 0.14) + ")";
    stair(x, y + off, w, bh, s);
    g.fill();
  }
  /* label */
  const cy = y + off + bh / 2 + 0.5,
    S = Math.max(8, Math.min(22, bh * 0.5 * (o.sc || 1))),
    kw = o.key && !inputState.touch ? keyW(o.key) + 5 : 0,
    iw = o.ic ? bh * 0.62 * (o.icw || 1) + 5 : 0,
    room = w - 12 - kw - iw;
  if (o.sub) {
    pxText(label, x + w / 2, cy - S * 0.28, S, c.tx, { al: "center", max: room, sh: c.ts, raw: o.raw });
    pxText(o.sub, x + w / 2, cy + S * 0.62, Math.max(7, S * 0.5), c.tx, {
      al: "center",
      max: room,
      sh: "",
      wt: 500,
      raw: true,
    });
  } else if (o.al === "left" || kw || iw) {
    let lx = x + 7;
    if (o.ic) {
      o.ic(lx, y + off + (bh - bh * 0.62) / 2, bh * 0.62);
      lx += iw;
    }
    pxText(label, lx, cy, S, c.tx, { max: room, sh: c.ts, raw: o.raw });
    if (kw) keyChip(x + w - kw - 1, cy - 6.5, o.key);
  } else pxText(label, x + w / 2, cy, S, c.tx, { al: "center", max: room, sh: c.ts, raw: o.raw });
  if (sel) focusRing(x - 1, y - 1, w + 2, h + 2);
  kitHit(x, y, w, h, dis ? null : fn);
  return { hv, k };
}

/* key chip (small cap) */
function keyW(t) {
  const g = ctx();
  g.font = "700 8px " + FFP;
  return Math.max(14, Math.ceil(g.measureText(t).width) + 8);
}
export function keyChip(x, y, t) {
  const g = ctx(),
    w = keyW(t),
    h = 13;
  g.fillStyle = "rgba(0,0,0,.4)";
  g.fillRect(x, y + 1.5, w, h);
  g.fillStyle = "#12141b";
  g.fillRect(x, y, w, h);
  g.fillStyle = "rgba(184,149,76,.85)";
  g.fillRect(x, y, w, 1);
  g.fillRect(x, y + h - 1, w, 1);
  g.fillRect(x, y, 1, h);
  g.fillRect(x + w - 1, y, 1, h);
  g.font = "700 8px " + FFP;
  g.textBaseline = "middle";
  g.textAlign = "center";
  g.fillStyle = "#f2e4c4";
  g.fillText(t, x + w / 2, y + h / 2 + 0.5);
  g.textAlign = "left";
  return w;
}

/* tabs: a row of bevelled buttons, the active one green and 3 px taller. tabs = [[label, fn], ...]; returns the row height */
export function kitTabs(x, y, w, tabs, sel, h, nav) {
  h = h || 20;
  const gap = 4,
    n = tabs.length,
    tw1 = Math.min(150, Math.floor((w - gap * (n - 1)) / n));
  tabs.forEach((t, i) => {
    const on = i === sel;
    bevelBtn(
      x + i * (tw1 + gap),
      y - (on ? 3 : 0),
      tw1,
      h + (on ? 3 : 0),
      t[0],
      on ? "go" : "dark",
      on
        ? t[1]
        : () => {
            snd("tab");
            t[1]();
          },
      { sc: on ? 0.95 : 0.9, nav },
    );
  });
  return h;
}

/* square close button (top right of a screen) */
export function closeBtn(x, y, s, fn) {
  const g = ctx(),
    hv = hov(x, y, s, s),
    pr = pressed(hv),
    o = pr ? 1 : 0;
  g.fillStyle = "#06070a";
  g.fillRect(x - 1, y - 1, s + 2, s + 3);
  g.fillStyle = hv ? "#4a2a2a" : "#2a2d37";
  g.fillRect(x, y + o, s, s - o);
  g.fillStyle = hv ? "#6a3a36" : "#3a3e4b";
  g.fillRect(x, y + o, s, 1);
  g.fillStyle = "#14161c";
  g.fillRect(x, y + s, s, 1);
  g.strokeStyle = hv ? "#ffd9b0" : "#d8d2c2";
  g.lineWidth = 2;
  g.lineCap = "butt";
  const p = Math.round(s * 0.3);
  g.beginPath();
  g.moveTo(x + p, y + p + o);
  g.lineTo(x + s - p, y + s - p + o);
  g.moveTo(x + s - p, y + p + o);
  g.lineTo(x + p, y + s - p + o);
  g.stroke();
  kitHit(x, y, s, s, fn);
}

/* ================= screen template ================= */
const SCR = { key: "", t0: 0, a: 1, open: false };
/* o: key (screen id: a new key replays the entry), title, close (fn), fh (footer height kept free), maxW (content width, default 520), tabs [[label, fn]...], tab (index),
   veil (background, default opaque). Returns the content box { x, y, w, h } under the header. */
export function kitScreen(UW, UH, o) {
  const g = ctx(),
    now = performance.now();
  if (o.key !== SCR.key) {
    SCR.key = o.key;
    SCR.t0 = now;
  }
  const a = rmotion() ? 1 : Math.min(1, (now - SCR.t0) / 150),
    e = 1 - (1 - a) * (1 - a);
  SCR.a = e;
  SCR.UW = UW;
  SCR.UH = UH;
  g.fillStyle = o.veil || KC.bg;
  g.fillRect(0, 0, UW, UH);
  checker(UW, UH);
  {
    const gr = g.createLinearGradient(0, UH * 0.5, 0, UH);
    gr.addColorStop(0, "rgba(120,20,24,0)");
    gr.addColorStop(1, "rgba(120,20,24,.36)");
    g.fillStyle = gr;
    g.fillRect(0, UH * 0.5, UW, UH * 0.5);
  }
  g.save();
  SCR.open = true;
  g.translate(0, Math.round((1 - e) * 8));
  const fh = o.fh || 0,
    nar = UW < 420,
    m = nar ? 4 : 10,
    H = UH - fh,
    low = H < 300;
  kitFrame(m, m, UW - 2 * m, H - 2 * m, !nar);
  const cw = Math.min(UW - 2 * m - (nar ? 12 : 28), o.maxW || 520),
    cx0 = Math.round((UW - cw) / 2),
    bs = low ? 15 : 18;
  let y = m + (low ? 5 : 9);
  pxText(GVER + "  ·  NARANXIA", cx0 + 1, y + 4, 8, KC.dim, { sh: "", wt: 500, raw: true });
  y += 9;
  const tt = goldTitle(o.title, cx0, y, low ? 17 : 24, "left", cw - bs - 10);
  if (o.close) closeBtn(UW - m - (nar ? 6 : 10) - bs, m + (nar ? 6 : 10), bs, o.close);
  y += tt.S + (low ? 4 : 8);
  if (o.tabs) {
    y += 3;
    y += kitTabs(cx0, y, cw, o.tabs, o.tab | 0, low ? 17 : 20) + (low ? 5 : 8);
  }
  g.fillStyle = "rgba(184,149,76,.32)";
  g.fillRect(cx0, y - (o.tabs ? (low ? 3 : 5) : 3), cw, 1);
  y += o.tabs ? 0 : 3;
  return { x: cx0, y, w: cw, h: H - m - 8 - y };
}
export function kitEnd() {
  const g = ctx();
  if (!SCR.open) return;
  SCR.open = false;
  g.restore();
  if (SCR.a < 1) {
    g.fillStyle = "rgba(9,10,15," + (1 - SCR.a).toFixed(3) + ")";
    g.fillRect(0, 0, SCR.UW, SCR.UH);
  }
}
/* replays the entry of the current screen (tab changes) */
export const kitReplay = () => {
  SCR.key = "";
};

/* ================= hits: clipped to the list being drawn ================= */
let LIST = null;
function kitHit(x, y, w, h, fn) {
  if (LIST) {
    const y0 = Math.max(y, LIST.y0),
      y1 = Math.min(y + h, LIST.y0 + LIST.h);
    if (y1 - y0 < 3) return;
    y = y0;
    h = y1 - y0;
  }
  hudState.uiHits.push({ ...U(x, y, w, h), fn: fn || null, tip: null });
}
export const kitHitAdd = kitHit;

/* ================= rows ================= */
/* full-width anthracite row. o: label, value (right, gold), vcol, fn, on (lit: selected item), dis, ic ((x,y,s)=>draw), sc, nav (false), tag ([text, colour]),
   opts ([[label, active, fn]...] chips on the right, each clickable), slider ({ val, set }), right ((x1,y,h,hv)=>custom drawing, returns the width used), raw.
   Returns { hv, k, sel }. */
export function kitRow(x, y, w, h, o) {
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  /* option chips that do not fit beside the label go on a second line */
  let stack = 0;
  if (o.opts && o.label != null) {
    let cs = 0;
    for (const p of o.opts) cs += Math.max(26, Math.ceil(tw(p[0], 0.78)) + 12) + 3;
    if (tw(o.label, 0.9) + cs + 30 > w) {
      stack = 15;
      h += stack;
    }
  }
  const g = ctx(),
    vis = !LIST || (y + h > LIST.y0 && y < LIST.y0 + LIST.h),
    dis = !!o.dis,
    inl =
      !LIST ||
      (inputState.mouse.y >= LIST.y0 * hudDisplayState.UIS &&
        inputState.mouse.y < (LIST.y0 + LIST.h) * hudDisplayState.UIS),
    hv = vis && inl && !dis && !!o.fn && hov(x, y, w, h),
    k = o.fn && !dis && o.nav !== false ? navAdd(o.fn, hv) : -1,
    sel = k >= 0 && NAV.sel === k;
  if (LIST && sel && NAV.kbT > LIST.s.kb) {
    const s = LIST.s;
    if (y < LIST.y0 + 2) s.to = Math.max(0, s.to - (LIST.y0 + 2 - y));
    else if (y + h > LIST.y0 + LIST.h - 2) s.to += y + h - (LIST.y0 + LIST.h - 2);
  }
  if (!vis) return { hv: false, k, sel, h };
  const pr = pressed(hv),
    lit = hv || sel || o.on,
    oy = pr ? 1 : 0;
  g.fillStyle = "rgba(0,0,0,.3)";
  g.fillRect(x, y + 1, w, h + 1);
  const gr = g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, dis ? "#1f2128" : lit ? "#3c404d" : "#2b2e38");
  gr.addColorStop(1, dis ? "#1b1d23" : lit ? "#30343f" : "#24272f");
  g.fillStyle = gr;
  g.fillRect(x, y + oy, w, h);
  g.fillStyle = "rgba(255,255,255," + (lit ? 0.13 : 0.07) + ")";
  g.fillRect(x, y + oy, w, 1);
  g.fillStyle = "rgba(0,0,0,.4)";
  g.fillRect(x, y + oy + h - 1, w, 1);
  if (lit && !dis) {
    g.fillStyle = o.danger ? "#e0605a" : o.on ? "#ffd86b" : KC.gold;
    g.fillRect(x, y + oy, 2, h);
  }
  /* right side */
  let rx = x + w - 8;
  const cy = y + oy + (stack ? h - 10 : h / 2),
    ly = stack ? y + oy + 9 : cy;
  if (o.opts) {
    const ch = Math.min(15, h - 5),
      S = 0.78;
    for (let i = o.opts.length - 1; i >= 0; i--) {
      const [lab, act, f] = o.opts[i],
        cw2 = Math.max(26, Math.ceil(tw(lab, S)) + 12),
        bx = rx - cw2,
        by = Math.round(cy - ch / 2),
        hv2 = vis && inl && hov(bx, by, cw2, ch);
      g.fillStyle = act ? "#e9b93c" : hv2 ? "#454a59" : "#191b22";
      g.fillRect(bx, by, cw2, ch);
      g.fillStyle = act ? "#fff0a8" : "rgba(255,255,255,.08)";
      g.fillRect(bx, by, cw2, 1);
      g.fillStyle = act ? "#8a5a10" : "rgba(0,0,0,.5)";
      g.fillRect(bx, by + ch - 1, cw2, 1);
      const lw = tw(lab, S);
      T0(lab, bx + (cw2 - lw) / 2, by + (ch - 9 * S) / 2 + 0.5, act ? "#2a1804" : hv2 ? "#ffe9a8" : "#c9c3b4", S, act);
      kitHit(bx, by, cw2, ch, f);
      rx = bx - 3;
    }
    if (stack) rx = x + w - 8;
  } else if (o.slider) {
    const sw = Math.max(50, Math.min(170, w * 0.42)),
      sx = rx - sw - 26,
      v = Math.max(0, Math.min(1, o.slider.val)),
      ty = Math.round(cy - 2);
    T_(Math.round(v * 100) + "", rx - tw(Math.round(v * 100) + "", 0.8), cy - 4, KC.gold, 0.8);
    g.fillStyle = "#0c0d12";
    g.fillRect(sx, ty, sw, 5);
    g.fillStyle = "#e9b93c";
    g.fillRect(sx, ty, Math.round(sw * v), 5);
    g.fillStyle = "rgba(255,255,255,.35)";
    g.fillRect(sx, ty, Math.round(sw * v), 1);
    const kx = Math.round(sx + sw * v) - 3;
    g.fillStyle = "#06070a";
    g.fillRect(kx - 1, ty - 5, 8, 15);
    g.fillStyle = hv ? "#fff0a8" : "#ece6d8";
    g.fillRect(kx, ty - 4, 6, 13);
    g.fillStyle = "rgba(0,0,0,.25)";
    g.fillRect(kx, ty + 7, 6, 2);
    const set = o.slider.set;
    kitHit(sx - 6, y, sw + 12, h, () => {
      settingsState.sliderDrag = { x: sx, w: sw, set };
      set(Math.max(0, Math.min(1, (inputState.mouse.x / hudDisplayState.UIS - sx) / sw)));
    });
    rx = sx - 8;
  } else if (o.right) rx -= o.right(rx, y + oy, h, hv || sel) || 0;
  else if (o.value != null && o.value !== "") {
    const S = o.vsc || 0.85,
      s = String(o.value),
      vw = tw(s, S);
    T_(s, rx - vw, cy - (9 * S) / 2, o.vcol || KC.gold, S);
    rx -= vw + 8;
  }
  /* left side: icon, tag, label */
  let lx = x + 9;
  if (o.ic) {
    const s = Math.min(h - 4, 16);
    o.ic(lx - 1, y + oy + (h - s) / 2, s);
    lx += s * (o.icw || 1) + 5;
  }
  if (o.tag) {
    g.font = "700 7px " + FFP;
    const t = L(o.tag[0]),
      w2 = Math.ceil(g.measureText(t).width) + 7;
    g.fillStyle = o.tag[1] || "#e9b93c";
    g.fillRect(lx, cy - 5, w2, 10);
    g.fillStyle = "#14100a";
    g.textBaseline = "middle";
    g.textAlign = "center";
    g.fillText(t, lx + w2 / 2, cy + 0.5);
    g.textAlign = "left";
    lx += w2 + 5;
  }
  if (o.label != null) {
    const room = rx - lx - 2;
    let S = o.sc || 0.9;
    const lab = o.raw ? String(o.label) : L(String(o.label));
    while (S > 0.6 && tw(lab, S) > room) S = Math.round((S - 0.03) * 100) / 100;
    if (tw(lab, S) > room + 0.5) ovf(lab, room);
    T_(
      lab,
      lx,
      ly - (9 * S) / 2 - (o.sub ? 5 : 0),
      dis ? "#7c7f8a" : o.danger ? "#ffb4a4" : lit ? "#ffffff" : KC.txt,
      S,
    );
    if (o.sub) {
      let s2 = 0.72;
      const sb = L(String(o.sub));
      while (s2 > 0.55 && tw(sb, s2) > room) s2 -= 0.03;
      T_(sb, lx, cy + 2, KC.dim, s2);
    }
  }
  if (sel) focusRing(x, y, w, h);
  if (o.fn || o.block) kitHit(x, y, w, h, dis ? null : o.fn);
  return { hv, k, sel, h };
}
/* body text in a chip: plain fill, no shadow on bright chips */
function T0(s, x, y, col, sc, flat) {
  if (!flat) {
    T_(s, x, y, col, sc);
    return;
  }
  const g = ctx();
  s = L(String(s));
  tw(s, sc);
  g.textBaseline = "top";
  g.textAlign = "left";
  g.fillStyle = col;
  g.fillText(s, x, y);
}

/* discreet section heading with a fading rule */
export function kitSection(x, y, w, label) {
  const g = ctx(),
    lw = pxText(L(String(label)).toUpperCase(), x + 1, y + 6, 8, KC.sec, { sh: "", wt: 500, raw: true });
  const gr = g.createLinearGradient(x + lw + 8, 0, x + w, 0);
  gr.addColorStop(0, "rgba(184,149,76,.4)");
  gr.addColorStop(1, "rgba(184,149,76,0)");
  g.fillStyle = gr;
  g.fillRect(x + lw + 8, y + 6, Math.max(0, w - lw - 8), 1);
  return 14;
}

/* ================= scrolling list ================= */
const SCL = new Map();
/* returns the list cursor: l.y is the next free line (already scrolled); add to it after drawing. l.section / l.row / l.gap / l.para advance it. */
export function listBegin(key, x, y, w, h) {
  let s = SCL.get(key);
  if (!s) {
    s = { off: 0, to: 0, max: 0, kb: 0, t: 0 };
    SCL.set(key, s);
  }
  const g = ctx(),
    now = performance.now(),
    dt = Math.min(0.1, (now - s.t) / 1000);
  if (now - s.t > 400) {
    s.off = s.to = 0;
    s.kb = NAV.kbT;
  }
  s.t = now;
  s.to = Math.max(0, Math.min(s.max, s.to));
  s.off = rmotion() || Math.abs(s.to - s.off) < 0.5 ? s.to : s.off + (s.to - s.off) * Math.min(1, dt * 20);
  s.x = x;
  s.y = y;
  s.w = w;
  s.h = h;
  g.save();
  g.beginPath();
  g.rect(x - 3, y, w + 6, h);
  g.clip();
  const l = (LIST = { s, x, w, y0: y, h, y: y - Math.round(s.off) });
  l.section = (t) => {
    if (l.y > y - Math.round(s.off)) l.y += 5;
    if (l.y + 14 > l.y0 && l.y < l.y0 + l.h) kitSection(x, l.y, w, t);
    l.y += 14;
  };
  l.row = (o, rh) => {
    rh = rh || 20;
    const r = kitRow(x, l.y, w, rh, o);
    l.y += (r.h || rh) + 3;
    return r;
  };
  l.gap = (n) => {
    l.y += n;
  };
  l.vis = (hh) => l.y + hh > l.y0 && l.y < l.y0 + l.h;
  /* wrapped paragraph (body font); bullet = gold diamond */
  l.para = (t, col, sc, bullet) => {
    sc = sc || 0.85;
    const ix = bullet ? 12 : 2,
      ls = wrapT(L(String(t)), w - ix - 4, sc),
      lh = Math.round((11 * sc) / 0.85 + 1);
    ls.forEach((ln, i) => {
      if (l.vis(lh)) {
        if (bullet && !i) {
          g.fillStyle = KC.gold;
          g.beginPath();
          g.moveTo(x + 5, l.y + 2);
          g.lineTo(x + 8, l.y + 5);
          g.lineTo(x + 5, l.y + 8);
          g.lineTo(x + 2, l.y + 5);
          g.closePath();
          g.fill();
        }
        T_(ln, x + ix, l.y, col || KC.txt, sc);
      }
      l.y += lh;
    });
    l.y += 5;
  };
  return l;
}
export function listEnd() {
  const l = LIST,
    g = ctx();
  if (!l) return;
  LIST = null;
  g.restore();
  const s = l.s,
    content = l.y + Math.round(s.off) - l.y0;
  s.max = Math.max(0, content - l.h);
  s.kb = NAV.kbT;
  if (s.to > s.max) s.to = s.max;
  if (s.max > 0) {
    const tx = l.x + l.w + 5,
      th = Math.max(14, (l.h * l.h) / content),
      ty = l.y0 + (l.h - th) * (s.off / s.max);
    g.fillStyle = "rgba(255,255,255,.07)";
    g.fillRect(tx, l.y0, 2, l.h);
    g.fillStyle = KC.goldD;
    g.fillRect(tx - 0.5, Math.round(ty), 3, Math.round(th));
    if (s.off < s.max - 1) {
      const gr = g.createLinearGradient(0, l.y0 + l.h - 12, 0, l.y0 + l.h);
      gr.addColorStop(0, "rgba(9,10,15,0)");
      gr.addColorStop(1, "rgba(9,10,15,.85)");
      g.fillStyle = gr;
      g.fillRect(l.x - 3, l.y0 + l.h - 12, l.w + 6, 12);
    }
    if (s.off > 1) {
      const gr = g.createLinearGradient(0, l.y0, 0, l.y0 + 10);
      gr.addColorStop(0, "rgba(9,10,15,.85)");
      gr.addColorStop(1, "rgba(9,10,15,0)");
      g.fillStyle = gr;
      g.fillRect(l.x - 3, l.y0, l.w + 6, 10);
    }
  }
}
const live = (s) => performance.now() - s.t < 200 && s.max > 0;
const under = (s, p) => {
  const k = hudDisplayState.UIS;
  return p.x >= (s.x - 6) * k && p.x < (s.x + s.w + 12) * k && p.y >= s.y * k && p.y < (s.y + s.h) * k;
};
/* mouse wheel over a list (input/desktop.js); true when a list took it */
export function kitWheel(dy, p) {
  for (const s of SCL.values())
    if (live(s) && under(s, p)) {
      s.to = Math.max(0, Math.min(s.max, s.to + (dy > 0 ? 1 : -1) * 46));
      return true;
    }
  return false;
}
/* touch: a finger that starts on a scrolling list drags it; a tap (no move) presses what is under it. Called by input/desktop.js. */
let TD = null;
export function kitTouchStart(p, hit) {
  for (const s of SCL.values())
    if (live(s) && under(s, p)) {
      TD = { s, y: p.y, m: 0, hit };
      return true;
    }
  return false;
}
export function kitTouchMove(p) {
  if (!TD) return false;
  const dy = (p.y - TD.y) / hudDisplayState.UIS;
  TD.m += Math.abs(dy);
  TD.y = p.y;
  TD.s.to = TD.s.off = Math.max(0, Math.min(TD.s.max, TD.s.off - dy));
  return true;
}
export const kitTouchCancel = () => {
  TD = null;
};
export function kitTouchEnd() {
  if (!TD) return false;
  const t = TD;
  TD = null;
  if (t.m < 5 && t.hit && t.hit.fn) {
    snd("click");
    inputState.uiDown = performance.now();
    t.hit.fn();
  }
  return true;
}

/* word wrap in the body font, cached per text / width / scale */
const WRC = new Map();
export function wrapT(s, maxW, sc) {
  const k = s + "\u0001" + Math.round(maxW) + "\u0001" + sc;
  let r = WRC.get(k);
  if (r) return r;
  r = [];
  let cur = "";
  for (const w of s.split(" ")) {
    const t = cur ? cur + " " + w : w;
    if (cur && tw(t, sc) > maxW) {
      r.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) r.push(cur);
  if (WRC.size > 600) WRC.clear();
  WRC.set(k, r);
  return r;
}

/* pulse 0..1 for NEW dots (steady under Reduce motion) */
export const pulse = (sp) => (rmotion() ? 1 : 0.5 + 0.5 * Math.sin(wall() * (sp || 4.2)));
/* NEW pill; returns its width */
export function newPill(x, cy, right) {
  const g = ctx(),
    t = L("NEW"),
    p = pulse();
  g.font = "700 7px " + FFP;
  const w = Math.ceil(g.measureText(t).width) + 7;
  if (right) x -= w;
  g.save();
  g.globalAlpha = 0.28 * p;
  g.fillStyle = "#ffc63c";
  g.fillRect(x - 2, cy - 7, w + 4, 14);
  g.globalAlpha = 1;
  g.fillStyle = "#0b0810";
  g.fillRect(x - 0.5, cy - 5.5, w + 1, 11);
  g.fillStyle = p > 0.5 ? "#ffd45c" : "#f2b830";
  g.fillRect(x, cy - 5, w, 10);
  g.fillStyle = "#3a2400";
  g.textBaseline = "middle";
  g.textAlign = "center";
  g.fillText(t, x + w / 2, cy + 0.5);
  g.restore();
  return w;
}
