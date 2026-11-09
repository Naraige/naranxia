import { pref } from '../core/prefs.js';
import { L } from '../i18n/language.js';
import { sessionState } from '../gameplay/session.js';
import { SEAS } from '../rendering/weather.js';
import { canvasesState } from './canvases.js';
import { lastRun } from './title-weather.js';
import { FFP } from './typography.js';

/* ================= title screen dressing (lot B): blurred dark backdrop, golden frame with ornate corners, pixel title on the top filet,
   floating embers, near-invisible checker, version / season badge on the bottom filet. Visual only: nothing here reads or writes the simulation. ================= */

/* --- backdrop: the 3D canvas gets a light blur + 22 % darker (CSS filter, off in game and in the site picker); vignette drawn on the UI canvas --- */
let blurOn = null, g3 = null;
export function titleBlur(on) {
  if (on === blurOn) return;
  blurOn = on;
  try {
    g3 = g3 || document.getElementById('g3');
    if (!g3) return;
    g3.style.filter = on ? 'blur(2.2px) brightness(.78)' : '';
    g3.style.transform = on ? 'scale(1.025)' : '';
  } catch (e) { }
}

export function titleVignette(UW, UH) {
  const g = canvasesState.ctx, r = Math.hypot(UW, UH) / 2;
  const rg = g.createRadialGradient(UW / 2, UH / 2, r * .45, UW / 2, UH / 2, r * 1.02);
  rg.addColorStop(0, 'rgba(2,3,8,0)'); rg.addColorStop(1, 'rgba(2,3,8,.62)');
  g.fillStyle = rg; g.fillRect(0, 0, UW, UH);
}

/* barely visible checker (a hint of the pixel world) */
export function titleChecker(UW, UH) {
  const g = canvasesState.ctx, s = 16;
  g.fillStyle = 'rgba(255,255,255,.028)'; g.beginPath();
  for (let y = 0; y * s < UH; y++) for (let x = (y & 1); x * s < UW; x += 2) g.rect(x * s, y * s, s, s);
  g.fill();
}

/* --- embers: golden squares rising from the bottom, drifting and twinkling. Positions come from an integer hash of the ember index and a wall-clock
   phase, never from Math.random() or the game clock (Reduce motion freezes them) --- */
const hs = n => { n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15; return (n >>> 0) / 4294967296 };
const EMC = ['#ffce6e', '#ffaa46', '#ffe296', '#f08232'];
export function titleEmbers(UW, UH) {
  const g = canvasesState.ctx, n = UW < 420 ? 26 : 54, t = pref('rm', false) ? 0 : performance.now() / 1000;
  g.save();
  for (let i = 0; i < n; i++) {
    const sp = .012 + hs(i * 7 + 1) * .028, ph = hs(i * 7 + 2), x0 = (.04 + hs(i * 7 + 3) * .92) * UW, s = hs(i * 7 + 4) < .5 ? 1.5 : hs(i * 7 + 4) < .85 ? 2.2 : 3,
      k = (ph + t * sp) % 1, y = UH * (1.03 - k * 1.08), x = x0 + Math.sin(t * .6 + i * 1.7) * 7 * (1 + hs(i * 7 + 5)),
      fade = Math.min(1, k * 6, (1 - k) * 3), tw2 = .6 + .4 * Math.sin(t * (1.5 + hs(i * 7 + 6) * 2) + i), a = Math.max(0, fade * tw2 * (.45 + hs(i * 7 + 6) * .5));
    if (a < .02) continue;
    const c = EMC[(hs(i * 7 + 7) * 4) | 0];
    g.globalAlpha = a * .22; g.fillStyle = c; g.fillRect(x - s, y - s, s * 3, s * 3);
    g.globalAlpha = a; g.fillRect(Math.round(x), Math.round(y), s, s);
  }
  g.restore();
}

/* --- logo: pixel font, gold gradient, dark outline; fitted into maxW x maxH centred on (cx, cy). Returns the text width. --- */
export function titleLogoW(txt, maxW, maxH) {
  const g = canvasesState.ctx; g.save(); g.font = '700 100px ' + FFP;
  const w100 = g.measureText(txt).width || 1, S = Math.min(maxW / w100 * 100, maxH / .8); g.restore();
  return w100 * S / 100;
}
export function badgeW(text) {
  const g = canvasesState.ctx; g.save(); g.font = '700 9px ' + FFP; const w = Math.ceil(g.measureText(text).width) + 22; g.restore(); return w;
}
export function titleLogo(txt, cx, cy, maxW, maxH) {
  const g = canvasesState.ctx;
  g.save(); g.textBaseline = 'middle'; g.textAlign = 'center'; g.lineJoin = 'round';
  let S = 100; g.font = '700 ' + S + 'px ' + FFP; const w100 = g.measureText(txt).width || 1;
  S = Math.min(maxW / w100 * 100, maxH / .8); g.font = '700 ' + Math.round(S) + 'px ' + FFP;
  const w = g.measureText(txt).width, y = cy + S * .04;
  g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = S * .12; g.shadowOffsetY = S * .08; g.fillStyle = '#1d1006'; g.fillText(txt, cx, y);
  g.shadowBlur = 0; g.shadowColor = 'transparent'; g.shadowOffsetY = 0;
  g.lineWidth = Math.max(2, S * .14); g.strokeStyle = '#2a1606'; g.strokeText(txt, cx, y);
  const gr = g.createLinearGradient(0, cy - S * .4, 0, cy + S * .4); gr.addColorStop(0, '#ffe39a'); gr.addColorStop(.5, '#ffb844'); gr.addColorStop(1, '#e88a1e');
  g.fillStyle = gr; g.fillText(txt, cx, y);
  if (!pref('rm', false)) {
    const sw = ((sessionState.clockT * .16) % 1.7) - .3;
    if (sw > -.25 && sw < 1.25) {
      const lw = w, x0 = cx - lw / 2, bx = x0 + sw * lw, w2 = S * .12;
      g.save(); g.beginPath(); g.moveTo(bx - w2 + S * .15, cy - S); g.lineTo(bx + w2 + S * .15, cy - S); g.lineTo(bx + w2 - S * .15, cy + S); g.lineTo(bx - w2 - S * .15, cy + S); g.closePath(); g.clip();
      g.globalAlpha = .55; g.fillStyle = '#fffbea'; g.fillText(txt, cx, y); g.restore();
    }
  }
  g.restore();
  return w;
}

/* --- ornate corner: square volutes (9x9 pixel pattern), B = bright gold, G = gold --- */
const VOL = ['BBBBBBBBB', 'BGGGGGGGG', 'BG.......', 'BG.BBBBB.', 'BG.BGGGG.', 'BG.BG....', 'BG.BG.BB.', 'BG.BG.BG.', 'BG.......'];
function corner(x, y, fx, fy, u) {
  const g = canvasesState.ctx;
  for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) {
    const c = VOL[j][i]; if (c === '.') continue;
    g.fillStyle = c === 'B' ? '#f0cd73' : '#b8954c';
    g.fillRect(x + (fx ? (8 - i) : i) * u, y + (fy ? (8 - j) : j) * u, u, u);
  }
}
function dia(cx, cy, r, c) { const g = canvasesState.ctx; g.beginPath(); g.moveTo(cx, cy - r); g.lineTo(cx + r, cy); g.lineTo(cx, cy + r); g.lineTo(cx - r, cy); g.closePath(); g.fillStyle = c; g.fill() }

/* gold ornament line: fades out to both sides, diamond in the middle and two small ones */
export function ornLine(cx, y, w) {
  const g = canvasesState.ctx;
  for (const sd of [-1, 1]) {
    const x0 = cx + sd * 7, gr = g.createLinearGradient(x0, 0, x0 + sd * w / 2, 0); gr.addColorStop(0, 'rgba(184,149,76,.95)'); gr.addColorStop(1, 'rgba(184,149,76,0)');
    g.fillStyle = gr; g.fillRect(Math.min(x0, x0 + sd * w / 2), Math.round(y), w / 2, 1);
  }
  dia(cx, y + .5, 3, '#f0cd73'); dia(cx - 10, y + .5, 1.6, '#b8954c'); dia(cx + 10, y + .5, 1.6, '#b8954c');
}

/* the frame: outer filet + inner filet, ornate corners, gaps in the top filet for the title and in the bottom filet for the badge.
   Returns {x0,y0,x1,y1} of the outer filet. */
export function titleFrame(UW, UH, cx, top, gapT, bottom, gapB) {
  const g = canvasesState.ctx, m = UW < 420 ? 5 : 14, x0 = m, x1 = UW - m, y0 = top, y1 = UH - m - (bottom || 0), u = UW < 420 ? 1 : 1.5;
  g.save(); g.lineWidth = 1;
  const seg = (xa, xb, y, col) => { g.fillStyle = col; g.fillRect(Math.round(xa), Math.round(y), Math.round(xb - xa), 1) };
  const vseg = (x, ya, yb, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(ya), 1, Math.round(yb - ya)) };
  const O = 'rgba(184,149,76,.92)', I = 'rgba(184,149,76,.38)', ins = 4;
  g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 4;
  seg(x0, cx - gapT / 2, y0, O); seg(cx + gapT / 2, x1, y0, O); seg(x0, cx - gapB / 2, y1, O); seg(cx + gapB / 2, x1, y1, O); vseg(x0, y0, y1, O); vseg(x1, y0, y1 + 1, O);
  g.shadowBlur = 0;
  seg(x0 + ins, cx - gapT / 2 - 8, y0 + ins, I); seg(cx + gapT / 2 + 8, x1 - ins, y0 + ins, I); seg(x0 + ins, cx - gapB / 2 - 8, y1 - ins, I); seg(cx + gapB / 2 + 8, x1 - ins, y1 - ins, I);
  vseg(x0 + ins, y0 + ins, y1 - ins, I); vseg(x1 - ins, y0 + ins, y1 - ins, I);
  const n = 9 * u;
  corner(x0 - u, y0 - u, 0, 0, u); corner(x1 - n + u + 1, y0 - u, 1, 0, u); corner(x0 - u, y1 - n + u + 1, 0, 1, u); corner(x1 - n + u + 1, y1 - n + u + 1, 1, 1, u);
  g.restore();
  return { x0, y0, x1, y1 };
}

/* version / season badge: gold plaque on ribbon tails, centred on the bottom filet. Returns its width. */
export function titleBadge(cx, cy, text, maxW) {
  const g = canvasesState.ctx;
  g.save(); g.font = '700 9px ' + FFP; g.textBaseline = 'middle'; g.textAlign = 'center';
  let w = Math.ceil(g.measureText(text).width) + 22; if (maxW && w > maxW) w = maxW;
  const h = 15, x = Math.round(cx - w / 2), y = Math.round(cy - h / 2), tail = 20;
  for (const sd of [-1, 1]) {
    const xe = sd < 0 ? x : x + w, xo = xe + sd * tail;
    g.beginPath(); g.moveTo(xe, y + 2); g.lineTo(xo, y + 2); g.lineTo(xo - sd * 6, cy + 1); g.lineTo(xo, y + h); g.lineTo(xe, y + h); g.closePath();
    g.fillStyle = '#8f6f2c'; g.fill(); g.lineWidth = 1; g.strokeStyle = '#d9b45c'; g.stroke();
  }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, y + 2, w, h);
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#f2d27a'); gr.addColorStop(1, '#c89f45'); g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.strokeStyle = '#5b4216'; g.lineWidth = 1; g.strokeRect(x + .5, y + .5, w - 1, h - 1); g.strokeStyle = 'rgba(255,236,170,.7)'; g.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  g.fillStyle = '#3a2808'; g.fillText(text, cx, cy + .6); g.restore();
  return w + tail * 2;
}

export function seasonName() {
  const r = lastRun();
  return r ? L(SEAS[((r.w / 4) | 0) % 4]).toUpperCase() : '';
}
