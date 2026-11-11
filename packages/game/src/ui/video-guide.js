import { REALR } from '../core/random.js';
import { T as UT } from '../gameplay/rules.js';
import { L, T_, tw } from '../i18n/language.js';
import { inputState } from '../input/state.js';
import { FOWU } from '../rendering/fog.js';
import { icoInit, ICR, ICT } from '../rendering/model-icons.js';
import { renderer, scene } from '../rendering/scene.js';
import { unitG } from '../rendering/terrain.js';
import { THREE } from '../rendering/three.js';
import { animUnit } from '../rendering/unit-animation.js';
import { canvasesState, cvs } from './canvases.js';
import { ICO_RT } from './drawing.js';
import { hudDisplayState } from './hud-state.js';
import { IC } from './icons.js';
import { THEME } from './kingdom-theme.js';
import { bevelBtn, goldTitle, KC, kitFrame, kitHitAdd, kitScreen, listBegin, listEnd, pxText, wrapT } from './menu-kit.js';
import { settingsState } from './settings.js';

/* ================= VIDEO GUIDE (title menu, Tutorial button) =================
   A player screen: chapters on the left, a "video" on the right with a caption, a progress bar, previous / play-pause / next, and auto-advance.
   The clips are not video files: each one is a small scripted 2D scene (320 x 180 virtual pixels) drawn on the menu canvas as a pure function
   of the clip time, so pausing and seeking are free. It uses the game's own pictures: the building icons (renders of the real models, IC / ICT)
   and unit sprites shot here from the real unit models and their real walk / attack poses (animUnit) into small canvases, once per opening.
   Nothing here reads or writes the simulation: the posed units are throw-away objects that never enter sessionState, no command is sent,
   time is the wall clock, and the few mesh builds run with Math.random swapped to REALR (like every other visual mesh build). */

export const guideState = { open: false };

const W = 320, H = 180, TC0 = 1.3, SY = 167;
let G = null, ch = 0, T = 0, lastT = 0, paused = false, inited = false;
const Q = [];
const cl = v => v < 0 ? 0 : v > 1 ? 1 : v, lin = (t, a, b) => cl((t - a) / (b - a)), sm = (t, a, b) => { const v = lin(t, a, b); return v * v * (3 - 2 * v) };
const hsh = (x, y) => { let h = (x * 374761393 + y * 668265263) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return ((h ^ (h >>> 16)) & 255) / 255 };
const num = (t, S) => { let v = 0; for (const [a, d] of S) v += d * lin(t, a, a + .5); return Math.round(v) };
const fmt = s => { s = Math.max(0, s | 0); return (s / 60 | 0) + ':' + String(s % 60).padStart(2, '0') };
/* keyframed position [[t, x, y], ...]: { x, y, mv (moving), dx (last horizontal direction) }; e = eased (cursor) */
function at(K, t, e) {
  let dx = 1; if (t <= K[0][0]) return { x: K[0][1], y: K[0][2], mv: false, dx };
  for (let i = 1; i < K.length; i++) {
    const a = K[i - 1], b = K[i]; if (b[1] !== a[1]) dx = b[1] < a[1] ? -1 : 1;
    if (t < b[0]) { let k = (t - a[0]) / (b[0] - a[0]); if (e) k = k * k * (3 - 2 * k); return { x: a[1] + (b[1] - a[1]) * k, y: a[2] + (b[2] - a[2]) * k, mv: b[1] !== a[1] || b[2] !== a[2], dx } }
  }
  const z = K[K.length - 1]; return { x: z[1], y: z[2], mv: false, dx };
}

/* ---------- unit sprites: the real models, posed by the real animation code, shot with a fixed camera (no size jitter between frames) ---------- */
const SP = {}, PX = 18, YAW = -.9, PIT = .5, SZ = 96;
const SETS = [['peasant', 0, { w: [6], c: [6], a: [4, 'w'], h: [4, 'r'], f: [4, 'f'] }], ['knight', 0, { w: [6], a: [4] }], ['archer', 0, { w: [4], a: [3] }], ['king', 0, { w: [6], a: [4] }],
  ['guard', 0, { w: [4], a: [3] }], ['zombie', 1, { w: [6], a: [3] }], ['brute', 1, { w: [4], a: [3] }], ['runner', 1, { w: [4], a: [3] }]];
let spSig = null, spDone = false, spTmp = null;
function shot(obj, c, r) {
  const R = ICR, cam = R.cam, d = r / Math.sin(cam.fov * Math.PI / 360);
  R.sc.add(obj); obj.updateMatrixWorld(true);
  cam.position.set(c.x + Math.sin(YAW) * Math.cos(PIT) * d, c.y + Math.sin(PIT) * d, c.z + Math.cos(YAW) * Math.cos(PIT) * d); cam.near = d * .05; cam.far = d * 4; cam.updateProjectionMatrix(); cam.lookAt(c);
  const oc = new THREE.Color(); renderer.getClearColor(oc); const oa = renderer.getClearAlpha(), fw0 = FOWU.fowP.value.w, fz0 = FOWU.fowP.value.z;
  FOWU.fowP.value.w = 0; FOWU.fowP.value.z = 0; renderer.setClearColor(0x000000, 0); renderer.setRenderTarget(R.rt); renderer.clear(); renderer.render(R.sc, cam);
  renderer.readRenderTargetPixels(R.rt, 0, 0, ICO_RT, ICO_RT, R.buf); renderer.setRenderTarget(null); renderer.setClearColor(oc, oa); FOWU.fowP.value.w = fw0; FOWU.fowP.value.z = fz0; R.sc.remove(obj);
  if (!spTmp) spTmp = cvs(ICO_RT, ICO_RT);
  const tg = spTmp.getContext('2d'), im = tg.createImageData(ICO_RT, ICO_RT); im.data.set(R.buf); tg.putImageData(im, 0, 0);
  const o = cvs(SZ, SZ), og = o.getContext('2d'); og.imageSmoothingEnabled = true; og.imageSmoothingQuality = 'high'; og.translate(0, SZ); og.scale(1, -1); og.drawImage(spTmp, 0, 0, SZ, SZ);
  return o;
}
function* spGen() {
  if (!ICR) icoInit();
  for (const [ty, t, sets] of SETS) {
    let g = null;
    try {
      /* a throw-away unit: the fields of mkU without its side effects (no UID, no seeded random), never added to sessionState.units */
      const u = { uid: 3, pl: 0, spj: 1, gar: null, buff: 1, t, type: ty, x: 0, y: 0, hp: UT[ty].hp, cd: 0, carry: false, cj: null, work: 0, job: null, cap: null, sq: null, hc: 0, tl: -1, sel: false, o: null, px: 0, py: 0, sT: .6, det: 0, dir: 1, mv: false, walk: 0, face: 0, fa: 0, atk: 0, ph0: 0, lane: -1, ph: 0, ttl: 1 };
      const pose = () => { animUnit(u, .07, false, 0); u.m.position.y = 0 };
      pose(); g = u.m; scene.remove(g); unitG.delete(u);
      { const rm = []; g.traverse(o => { if (o.material && o.material.transparent && o.material.type === 'MeshBasicMaterial') rm.push(o) }); rm.forEach(o => o.parent && o.parent.remove(o)) }
      g.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(g), c = bb.getCenter(new THREE.Vector3()), r = bb.getSize(new THREE.Vector3()).length() * .58;
      const S = { sz: r * 2 * PX, fy: .5 + .5 * (c.y - bb.min.y) * Math.cos(PIT) / (r * 1.03), i: null, w: [], c: [], a: [], h: [], f: [] };
      S.i = shot(g, c, r); yield;
      for (const k in sets) {
        const [n, job] = sets[k]; u.job = job || null; u.carry = k === 'c'; u.cj = k === 'c' ? 'w' : null;
        if (k === 'w' || k === 'c') { u.walk = 1; u.atk = 0; const a0 = u.ap; pose(); const inc = u.ap - a0; for (let i = 0; i < n; i++) { u.ap = i * 6.2832 / n - inc; pose(); S[k].push(shot(g, c, r)); yield } u.walk = 0 }
        else for (let i = 0; i < n; i++) { u.atk = .35 * (1 - (i + .5) / n) + .07; pose(); S[k].push(shot(g, c, r)); yield }
      }
      SP[ty] = S;
    } catch (e) { SP[ty] = null; console.error('guide sprite', ty, e) }
    if (g && g.userData.mat) g.userData.mat.dispose();
  }
}
function sprites() {
  const sig = THEME ? THEME.c + '|' + THEME.c2 : ''; if (spSig === sig) return; spSig = sig; spDone = false;
  const it = spGen(), step = () => {
    if (spSig !== sig) return; let d = true; const m = Math.random; Math.random = REALR;
    try { const t0 = performance.now(); do d = it.next().done; while (!d && performance.now() - t0 < 10) } catch (e) { d = true; console.error('guide', e) } finally { Math.random = m }
    if (d) spDone = true; else setTimeout(step, 0);
  };
  setTimeout(step, 0);
}

/* ---------- scene parts (virtual pixels). World things are queued with their ground y and drawn back to front; overlays use keys >= 900 ---------- */
const R4 = (c, x, y, w, h) => { G.fillStyle = c; G.fillRect(x, y, w, h) };
const GND = new Map();
function ground(road) {
  const k = road ? road.join() : ''; let c = GND.get(k); if (c) return c;
  c = cvs(W, H); const g = c.getContext('2d');
  const dist = (px, py) => { let m = 1e9; for (let i = 1; i < road.length; i++) { const [ax, ay] = road[i - 1], [bx, by] = road[i], vx = bx - ax, vy = by - ay, q = cl(((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)); m = Math.min(m, Math.hypot(px - ax - vx * q, py - ay - vy * q)) } return m };
  for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) {
    const h = hsh(x, y), b = hsh(x >> 4, (y >> 4) + 99) * .5 + h * .5, d = road && dist(x + 2, y + 2) < 7 + h * 2;
    g.fillStyle = d ? 'rgb(' + (146 + b * 22 | 0) + ',' + (110 + b * 16 | 0) + ',' + (68 + b * 12 | 0) + ')' : 'rgb(' + (80 + b * 20 | 0) + ',' + (142 + b * 30 | 0) + ',' + (56 + b * 12 | 0) + ')'; g.fillRect(x, y, 4, 4);
    if (!d && h > .93) { g.fillStyle = 'rgba(190,230,110,.55)'; g.fillRect(x + 1, y, 1, 3) }
  }
  GND.set(k, c); return c;
}
function tree(x, y, sh) { Q.push([y, () => { const g = G, o = sh || 0; g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(x, y, 10, 3.5, 0, 0, 6.283); g.fill();
  R4('#6b4a2a', x - 2, y - 11, 4, 11); R4('#4f3a22', x + 1, y - 11, 1, 11);
  R4('#2f7a34', x - 10 + o, y - 22, 20, 12); R4('#3f9a44', x - 10 + o, y - 22, 20, 3); R4('#24642b', x + 6 + o, y - 19, 4, 9);
  R4('#2f7a34', x - 7 + o, y - 30, 14, 8); R4('#4aac4e', x - 7 + o, y - 30, 14, 3); R4('#24642b', x + 4 + o, y - 27, 3, 5);
  R4('#3f9a44', x - 3 + o, y - 34, 7, 4); R4('#58bc5a', x - 3 + o, y - 34, 7, 1); R4('#58bc5a', x - 7 + o, y - 17, 2, 2); R4('#58bc5a', x + 1 + o, y - 26, 2, 2) }]) }
function rock(x, y, au) { Q.push([y, () => { R4('rgba(0,0,0,.2)', x - 8, y - 1, 17, 3); R4('#8a8d94', x - 8, y - 8, 16, 8); R4('#a9acb4', x - 8, y - 8, 16, 2); R4('#6c6f76', x + 4, y - 6, 4, 6); R4('#8a8d94', x - 4, y - 13, 9, 5); R4('#a9acb4', x - 4, y - 13, 9, 2);
  if (au) { R4('#ffd23c', x - 5, y - 6, 2, 2); R4('#ffe680', x + 1, y - 11, 2, 2); R4('#ffd23c', x + 2, y - 4, 2, 2); R4('#ffe680', x - 2, y - 3, 1, 1) } }]) }
const bar = (x, y, w, p, col) => { R4('#0b0c12', x - w / 2 - 1, y - 1, w + 2, 4); R4(col || '#6adf5a', x - w / 2, y, w * cl(p), 2) };
/* building: an icon of the real model, bottom-anchored. o: pr (0..1 under construction), a (alpha: placement ghost), ic (another icon canvas), flip */
function B(k, x, y, sz, o) { o = o || {}; Q.push([y, () => { const ic = o.ic || IC[k]; if (!ic) return; const g = G, pr = o.pr == null ? 1 : o.pr, x0 = x - sz / 2, y0 = y - sz * .76;
  g.save(); if (o.flip) { g.translate(2 * x, 0); g.scale(-1, 1) } if (o.a != null) g.globalAlpha = o.a;
  if (pr < 1) { g.globalAlpha = .32; g.drawImage(ic, x0, y0, sz, sz); g.globalAlpha = 1; g.beginPath(); g.rect(x0, y0 + sz * (1 - pr), sz, sz * pr); g.clip() }
  g.drawImage(ic, x0, y0, sz, sz); g.restore(); if (pr > 0 && pr < 1) bar(x, y0 - 2, sz * .5, pr) }]) }
/* unit. o: atk (0..1 phase, -1 none), k (attack set: a / h / f), carry, ring (colour), a (alpha), fall (0..1), dx (forced facing), ph (walk phase offset) */
function unit(ty, p, o) { o = o || {}; Q.push([p.y, () => { const g = G, S = SP[ty], sz = S ? S.sz : 20, dx = o.dx || p.dx;
  g.save(); if (o.a != null) g.globalAlpha = o.a;
  g.fillStyle = 'rgba(0,0,0,.26)'; g.beginPath(); g.ellipse(p.x, p.y, sz * .2, sz * .08, 0, 0, 6.283); g.fill();
  if (o.ring) { g.strokeStyle = o.ring; g.lineWidth = 1; g.beginPath(); g.ellipse(p.x, p.y, sz * .27, sz * .11, 0, 0, 6.283); g.stroke() }
  if (!S) { const ic = IC[ty === 'zombie' ? 'skull' : ty] || IC.skull; if (ic) g.drawImage(ic, p.x - 7, p.y - 15, 14, 14); g.restore(); return }
  const A = S[o.k || 'a'], wk = o.carry && S.c.length ? S.c : S.w,
    f = o.atk >= 0 && A && A.length ? A[Math.min(A.length - 1, o.atk * A.length | 0)] : p.mv ? wk[((T * wk.length / .55 + (o.ph || 0)) | 0) % wk.length] : o.carry && S.c.length ? S.c[0] : S.i;
  g.translate(p.x, p.y); if (dx < 0) g.scale(-1, 1); if (o.fall) g.rotate(-o.fall * 1.35);
  g.drawImage(f, -sz / 2, -sz * S.fy, sz, sz); g.restore() }]) }
/* a zombie that walks its path, attacks from ta and falls at td */
function zed(t, ty, K, ta, td, o) { if (t < K[0][0] || t > td + .7) return; const p = at(K, t), k = lin(t, td, td + .7); unit(ty, p, Object.assign({ atk: !p.mv && t >= ta && t < td ? (t * 1.6 + K[0][2] * .13) % 1 : -1, a: 1 - k, fall: k, ph: K[0][2] }, o)) }
function hud(items) { Q.push([1000, () => { const g = G; R4('rgba(8,10,16,.84)', 0, 0, W, 13); R4('rgba(184,149,76,.7)', 0, 13, W, 1); let x = 5;
  for (const [ic, v, col, ax] of items) { if (ax) x = ax; if (IC[ic]) g.drawImage(IC[ic], x, 1.5, 10, 10); x += 12; x += pxText(String(v), x, 7, 7, col || '#f4efe2', { raw: true, sh: '' }) + 9 } }]) }
const sx = (i, n) => W / 2 - n * 12 + i * 24 + 12;
/* bottom bar of slots (build menu, train bar, research): hi = lit slot, open 0..1 slides in */
function panel(keys, hi, open) { if (open <= 0) return; Q.push([1001, () => { const g = G, n = keys.length, x0 = W / 2 - n * 12 - 3, y0 = H - 27 + (1 - open) * 30; R4('rgba(8,10,16,.9)', x0, y0, n * 24 + 6, 27); R4('rgba(184,149,76,.8)', x0, y0, n * 24 + 6, 1);
  keys.forEach((k, i) => { const x = x0 + 3 + i * 24; R4(i === hi ? '#4a5166' : '#2b2e38', x + 1, y0 + 3, 22, 22); if (i === hi) { g.strokeStyle = KC.gold; g.lineWidth = 1; g.strokeRect(x + 1.5, y0 + 3.5, 21, 21) } const ic = IC[k]; if (ic) g.drawImage(ic, x + 3, y0 + 5, 18, 18) }) }]) }
const slot = (k, x, y, lit) => Q.push([1001, () => { R4('rgba(8,10,16,.9)', x - 12, y - 12, 24, 24); R4(lit ? '#4a5166' : '#2b2e38', x - 10, y - 10, 20, 20); if (IC[k]) G.drawImage(IC[k], x - 8, y - 8, 16, 16) }]);
function fl(t, t0, x, y, s, col) { const k = (t - t0) / 1.1; if (k < 0 || k >= 1) return; Q.push([950, () => { G.globalAlpha = 1 - k * k; pxText(s, x, y - k * 12, 7, col || '#ffe08a', { raw: true, al: 'center' }); G.globalAlpha = 1 }]) }
function arrow(t, t0, x0, y0, x1, y1) { const k = (t - t0) / .3; if (k < 0 || k >= 1) return; Q.push([940, () => { const g = G, x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k - Math.sin(k * 3.14) * 6, l = Math.hypot(x1 - x0, y1 - y0) || 1; g.strokeStyle = '#f6e9bd'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - (x1 - x0) / l * 6, y - (y1 - y0) / l * 6); g.lineTo(x, y); g.stroke() }]) }
function ringFx(t, t0, x, y, r, col, d) { const k = (t - t0) / (d || .8); if (k < 0 || k >= 1) return; Q.push([945, () => { const g = G; g.globalAlpha = 1 - k; g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, r * k, r * k * .5, 0, 0, 6.283); g.stroke(); g.globalAlpha = 1 }]) }
function night(n, lights) { if (n <= 0) return; Q.push([900, () => { const g = G; R4('rgba(8,12,52,' + (n * .6).toFixed(3) + ')', 0, 0, W, H); g.globalCompositeOperation = 'lighter';
  for (const [x, y, r] of lights) { const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(255,170,70,' + (n * .45).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r) } g.globalCompositeOperation = 'source-over' }]) }
function route(t, P) { Q.push([1, () => { const g = G; g.strokeStyle = 'rgba(235,70,60,.8)'; g.lineWidth = 1.5; g.setLineDash([5, 4]); g.lineDashOffset = -t * 10; g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0 }]) }
function box(x0, y0, x1, y1) { Q.push([1500, () => { const g = G; R4('rgba(110,255,120,.13)', x0, y0, x1 - x0, y1 - y0); g.strokeStyle = '#7dff8a'; g.lineWidth = 1; g.strokeRect(x0 + .5, y0 + .5, x1 - x0, y1 - y0) }]) }
/* the drawn mouse pointer; clicks = [[time, right button]]: a ring at each click, the pointer dips */
const CURP = [[0, 0], [0, 11], [3, 8.5], [5.2, 13], [7, 12.2], [4.8, 7.8], [8.5, 7.8]];
function cur(c, t, clicks, col, tag) { Q.push([2000, () => { const g = G; let dn = 0;
  for (const [ct, r] of clicks) { const k = (t - ct) / .45; if (k >= 0 && k < 1) { g.strokeStyle = (r ? 'rgba(110,255,120,' : 'rgba(255,255,255,') + (1 - k).toFixed(2) + ')'; g.lineWidth = 1.3; g.beginPath(); g.arc(c.x, c.y, 2 + k * 9, 0, 6.283); g.stroke(); if (k < .3) dn = 1 } }
  const poly = () => { g.beginPath(); CURP.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill() };
  g.save(); g.translate(c.x, c.y + dn); g.fillStyle = '#10131c'; g.translate(-1, -1.4); g.scale(1.25, 1.25); poly(); g.restore();
  g.save(); g.translate(c.x, c.y + dn); g.fillStyle = col || '#ffffff'; poly(); g.restore();
  if (tag) pxText(tag, c.x + 10, c.y + 14, 6, col || '#ffffff', { raw: true }) }]) }

/* ---------- the nine clips: (scene time) => queued drawing ---------- */
const RES = (w, s, g, f, pop, pc) => [['wood', w], ['stone', s], ['coin', g], ['food', f], ['peasant', pop, pc]];
const TREES = [[222, 68], [246, 94], [230, 126], [268, 58], [288, 112]];
function cGather(t) {
  hud(RES(50 + num(t, [[11.7, 10], [12.2, 10], [12.7, 10]]), 20, 100, 60, '3/5'));
  B('castle', 56, 106, 86); rock(150, 156); rock(296, 156, 1);
  TREES.forEach(([x, y], i) => tree(x, y, i < 3 && ((t > 6.4 + i * .25 && t < 9.5 + i * .25) || t > 14.4 + i * .25) ? Math.sin(t * 17 + i) * .8 : 0));
  [[98, 114], [112, 126], [96, 136]].forEach(([x, y], i) => {
    const tx = TREES[i][0] - 13, ty = TREES[i][1] + 3, d = i * .25, p = at([[4 + d, x, y], [6.3 + d, tx, ty], [9.5 + d, tx, ty], [11.6 + d * 2, 86, 116 + i * 4], [11.9 + d * 2, 86, 116 + i * 4], [14.3 + d, tx, ty]], t),
      chop = !p.mv && ((t > 6.3 + d && t < 9.5 + d) || t > 14.3 + d), ph = (t * 1.3 + i * .3) % 1;
    unit('peasant', p, { ring: t > 2.2 ? '#7dff8a' : 0, atk: chop ? ph : -1, carry: t > 9.5 + d && t < 11.6 + d * 2, dx: chop ? 1 : 0, ph: i * 2 });
    if (chop) fl(t, t - ((t * 1.3 + i * .3) % 2) / 1.3, tx + 12, ty - 30, '+1', '#e9c98a');
    fl(t, 11.6 + d * 2, 60, 62 - i * 2, '+10', '#ffd9a0');
  });
  const c = at([[0, 150, 60], [1, 84, 100], [1.1, 84, 100], [2.2, 124, 144], [2.6, 124, 144], [3.6, 240, 96]], t, 1);
  if (t > 1.1 && t < 2.35) box(84, 100, c.x, c.y);
  cur(c, t, [[3.7, 1]]);
}
function cBuild(t) {
  hud(RES(120 - num(t, [[4.2, 30], [13.5, 20]]), 40, 150 - num(t, [[4.2, 20]]), 60, '4/5'));
  B('castle', 56, 106, 86); tree(282, 62); tree(300, 88); tree(22, 168); tree(262, 44);
  if (t > 4.2) B('house', 196, 114, 44, { pr: lin(t, 6.5, 11) });
  if (t > 13.5) B('farm', 246, 152, 46, { pr: lin(t, 15.2, 21) });
  [[98, 116], [108, 130]].forEach((q, i) => {
    const hx = 174 + i * 44, hy = 118 + i * 3, p = at([[4.5, q[0], q[1]], [6.5, hx, hy], [13.8, hx, hy], [15.2, 222 + i * 48, 156]], t), wk = !p.mv && ((t > 6.5 && t < 11) || t > 15.2);
    unit('peasant', p, { atk: wk ? (t * 1.5 + i * .4) % 1 : -1, k: 'h', dx: wk ? (i ? -1 : 1) : 0, ph: i * 3 });
  });
  ringFx(t, 11, 196, 108, 30, '#ffe08a');
  const o = sm(t, 1, 1.3) * (1 - sm(t, 4.2, 4.5)) + sm(t, 11.6, 11.9) * (1 - sm(t, 13.5, 13.8)),
    c = at([[0, 200, 70], [1, 14, 166], [1.4, 14, 166], [2.2, sx(0, 4), SY], [2.5, sx(0, 4), SY], [4, 196, 108], [11, 196, 108], [11.5, 14, 166], [11.8, 14, 166], [12.4, sx(1, 4), SY], [12.7, sx(1, 4), SY], [13.4, 246, 146]], t, 1);
  if (t > 2.4 && t < 4.2) B('house', c.x, c.y + 6, 44, { a: .55 }); if (t > 12.6 && t < 13.5) B('farm', c.x, c.y + 6, 46, { a: .55 });
  slot('hammer', 14, 166, o > 0); panel(['house', 'farm', 'barracks', 'tower'], t > 2.1 && t < 4.2 ? 0 : t > 12.3 && t < 13.5 ? 1 : -1, o);
  cur(c, t, [[1, 0], [2.3, 0], [4.2, 0], [11.5, 0], [12.5, 0], [13.5, 0]]);
}
function cPop(t) {
  const cap = t > 4 ? 15 : 10, pop = 10 + (t > 10.2 ? 1 : 0) + (t > 13.2 ? 1 : 0), fs = [6.5, 8, 9.5, 11, 12.5, 14, 15.5];
  hud(RES(80, 40, 120 - num(t, [[9.9, 60], [12.9, 60]]), 30 + num(t, fs.map(a => [a, 6])) - num(t, [[9.9, 25], [12.9, 25]]), pop + '/' + cap, pop >= cap && t % .6 < .3 ? '#ff6a5a' : t > 4 && t < 5.2 ? '#7dff8a' : 0));
  B('castle', 56, 106, 86); B('house', 150, 70, 42); B('house', 196, 62, 42); B('house', 242, 76, 42, { pr: lin(t, 0, 4) }); B('farm', 232, 150, 50); tree(300, 110); tree(20, 166);
  ringFx(t, 4, 242, 70, 30, '#7dff8a');
  const p = at([[4.5, 222, 84], [6.4, 214, 154]], t), wk = !p.mv; unit('peasant', p, { atk: wk ? (t * 1.4) % 1 : -1, k: t < 4.5 ? 'h' : 'f', dx: 1 });
  for (const a of fs) fl(t, a, 232, 126, '+6', '#ffe08a');
  unit('peasant', at([[0, 112, 132]], t)); unit('peasant', at([[0, 128, 118]], t), { dx: -1 });
  [[10.2, 150, 150], [13.2, 124, 146]].forEach(([a, x, y], i) => { if (t < a) return; ringFx(t, a, 84, 118, 14, '#ffe08a', .6); unit('peasant', at([[a, 84, 118], [a + 2.2, x, y]], t), { ph: i }) });
  const o = sm(t, 8.6, 8.9) * (1 - sm(t, 13.6, 13.9)), c = at([[0, 250, 40], [1.2, 250, 56], [8.2, 250, 56], [9.4, sx(0, 3), SY], [13.6, sx(0, 3), SY], [14.6, 240, 120]], t, 1);
  panel(['peasant', 'knight', 'archer'], t > 9.2 && t < 13.7 ? 0 : -1, o); cur(c, t, [[9.9, 0], [12.9, 0]]);
}
function cArmy(t) {
  const out = [5, 7, 9, 11.5, 13], st = [2.4, 5, 7, 9.4, 11.5], ty = ['knight', 'knight', 'knight', 'archer', 'archer'], dst = [[216, 104], [228, 118], [240, 132], [196, 112], [208, 128]], n = out.filter(a => t >= a).length;
  hud(RES(140, 90, 700 - num(t, [[2.4, 150], [2.8, 150], [3.2, 150], [9, 120], [9.4, 120]]), 220 - num(t, [[2.4, 40], [2.8, 40], [3.2, 40], [9, 30], [9.4, 30]]), (8 + n) + '/20'));
  B('castle', 56, 106, 86); B('barracks', 150, 88, 56); B('house', 112, 52, 40); tree(296, 60); tree(280, 162);
  if (n < 5 && t > st[n]) Q.push([930, () => { bar(150, 40, 30, lin(t, st[n], out[n]), '#ffd25a'); if (IC[ty[n]]) G.drawImage(IC[ty[n]], 128, 34, 10, 10) }]);
  out.forEach((a, i) => { if (t < a) return; const d = dst[i], p = at([[a, 160, 100], [a + 1.6, d[0], d[1]], [16.2 + i * .1, d[0], d[1]], [19, d[0] + 110, d[1] - 6]], t); unit(ty[i], p, { ring: t > 15.2 ? '#7dff8a' : 0, ph: i * 2 }) });
  const c = at([[0, 220, 60], [1.6, sx(1, 3), SY], [8, sx(1, 3), SY], [8.8, sx(2, 3), SY], [13.6, sx(2, 3), SY], [14.2, 182, 92], [14.3, 182, 92], [15.2, 252, 142], [15.5, 252, 142], [16, 294, 112]], t, 1);
  if (t > 14.3 && t < 15.3) box(182, 92, c.x, c.y);
  panel(['peasant', 'knight', 'archer'], t > 1.5 && t < 8.4 ? 1 : t >= 8.4 && t < 13.7 ? 2 : -1, 1 - sm(t, 13.6, 14));
  cur(c, t, [[2.4, 0], [2.8, 0], [3.2, 0], [9, 0], [9.4, 0], [16.1, 1]]);
}
const ROAD = [[330, 96], [230, 96], [150, 100], [84, 110]], WY = [40, 52, 64, 76, 112, 124, 136, 148, 160], WX = 206;
function cWalls(t) {
  hud(RES(300 - num(t, WY.map((y, i) => [2 + (y - 36) / 120 * 3.2, 10])), 200 - num(t, [[10.5, 80]]), 250 - num(t, [[7.5, 40]]), 90, '12/20'));
  route(t, ROAD); B('castle', 50, 106, 82); tree(120, 40); tree(290, 40); tree(300, 160); tree(110, 168);
  WY.forEach(y => { const a = 2 + (y - 36) / 120 * 3.2; if (t > a) B('wall', WX, y, 22, { pr: lin(t, a, a + 1.2) }) });
  if (t > 7.5) B('gate', WX, 96, 32, { pr: lin(t, 7.5, 8.6) }); if (t > 10.5) B('tower', 184, 70, 46, { pr: lin(t, 10.5, 11.6) });
  unit('knight', at([[0, 186, 104]], t)); unit('knight', at([[0, 184, 116]], t));
  const td = [15.4, 16.2, 17, 17.6];
  td.forEach((d, i) => { const y = 92 + i * 4, a = 11.6 + i * .5; zed(t, 'zombie', [[a, 332, y], [a + 3.2, 222 + (i % 2) * 6, y]], a + 3.2, d);
    for (let s = 13 + i * .15; s < d; s += .7) if (s > (i ? td[i - 1] : 0)) arrow(t, s, 184, 42, at([[a, 332, y], [a + 3.2, 222, y]], s + .3).x, y - 8) });
  const c = at([[0, 120, 60], [1, sx(0, 4), SY], [1.3, sx(0, 4), SY], [2, WX, 36], [5.2, WX, 156], [5.6, sx(1, 4), SY], [6, sx(1, 4), SY], [7.4, WX, 90], [8, WX, 90], [8.6, sx(2, 4), SY], [9, sx(2, 4), SY], [10.4, 184, 62], [11, 184, 62], [12, 120, 150]], t, 1);
  if (t > 9 && t < 10.5) B('tower', c.x, c.y + 8, 46, { a: .55 }); if (t > 6 && t < 7.5) B('gate', c.x, c.y + 6, 32, { a: .55 });
  panel(['wall', 'gate', 'tower', 'torch'], t < 5.4 ? 0 : t < 8.3 ? 1 : t < 10.6 ? 2 : -1, 1);
  cur(c, t, [[1.2, 0], [2, 0], [5.2, 0], [5.8, 0], [7.5, 0], [8.8, 0], [10.5, 0]]);
}
function cNight(t) {
  const n = sm(t, 2, 5) * (1 - sm(t, 16, 19)), Z = [];
  for (let i = 0; i < 12; i++) { const y = 62 + hsh(i, 7) * 78, a = 4 + i * .55, ya = 98 + (y - 98) * .45; Z.push([i % 5 === 4 ? 'brute' : i % 4 === 1 ? 'runner' : 'zombie', [[a, 334, y], [a + 3.6, 232 + (i % 3) * 8, ya]], a + 3.6, Math.min(16.4, a + 5.2 + (i % 4) * .8)]) }
  const alive = Z.filter(z => t >= z[1][0][0] && t < z[3]).length;
  hud(RES(210, 160, 320, 140, '17/20').concat([['skull', t < 4 ? fmt(Math.ceil(4 - t)) : 'x' + alive, t < 4 && t % .5 < .25 ? '#ff6a5a' : 0, 268]]));
  route(t, ROAD); B('castle', 50, 106, 82); tree(120, 40); tree(290, 40); tree(300, 160); tree(110, 168);
  WY.forEach(y => B('wall', WX, y, 22)); B('gate', WX, 96, 32); B('tower', 184, 70, 46); B('torch', 218, 62, 18); B('torch', 218, 140, 18);
  const fight = t > 7.6 && t < 16.5;
  [[226, 90], [230, 100], [226, 110]].forEach(([x, y], i) => unit('knight', at([[0, x, y]], t), { atk: fight ? (t * 1.5 + i * .37) % 1 : -1 }));
  [[190, 86], [190, 118]].forEach(([x, y], i) => { unit('archer', at([[0, x, y]], t), { atk: fight ? (t * 1.1 + i * .5) % 1 : -1 }); if (fight) arrow(t, t - (t + i * .45) % .9, x + 6, y - 14, 240, 98 + i * 6) });
  Z.forEach((z, i) => { zed(t, z[0], z[1], z[2], z[3]); if (t > z[2] && t < z[3] && i % 2 === 0) arrow(t, t - (t + i * .2) % .8, 184, 42, z[1][1][1], z[1][1][2] - 8) });
  night(n, [[218, 52, 34], [218, 130, 34], [184, 50, 26], [50, 90, 40]]);
  if (t > 16) Q.push([901, () => R4('rgba(255,196,110,' + (.22 * Math.sin(lin(t, 16, 19) * 3.14)).toFixed(3) + ')', 0, 0, W, H)]);
}
function cRes(t) {
  hud(RES(180, 220 - num(t, [[3, 100]]), 500 - num(t, [[3, 150], [11.5, 200]]), 120, '14/20'));
  B('castle', 56, 106, 86); B('academy', 150, 90, 54); tree(20, 166); tree(300, 30);
  [46, 58, 70, 82, 94, 106, 118, 130, 142, 154].forEach((y, i) => { const a = 9 + i * .2; B('wall', 264, y, 22, { ic: ICT[t > a ? 1 : 0].wall }); ringFx(t, a, 264, y - 6, 12, '#ffffff', .5) });
  [[228, 98], [234, 114]].forEach(([x, y], i) => { unit('knight', at([[0, x, y]], t), { ring: t > 15 && t < 15.8 ? '#ffe08a' : 0 }); ringFx(t, 15, x, y - 8, 16, '#ffe08a') });
  const r1 = t > 3 && t < 9, r2 = t > 11.5 && t < 15;
  if (r1 || r2) Q.push([930, () => { bar(150, 38, 34, r1 ? lin(t, 3, 9) : lin(t, 11.5, 15), '#7ec8ff'); const ic = IC[r1 ? 'upgrade' : 'steel']; if (ic) G.drawImage(ic, 124, 32, 10, 10) }]);
  ringFx(t, 9, 150, 80, 34, '#7ec8ff'); ringFx(t, 15, 150, 80, 34, '#7ec8ff');
  const o = sm(t, 1.2, 1.5) * (1 - sm(t, 15.4, 15.8)), c = at([[0, 230, 60], [1, 150, 80], [2, 150, 80], [2.8, sx(0, 3), SY], [10.6, sx(0, 3), SY], [11.3, sx(1, 3), SY], [15.4, sx(1, 3), SY], [16.4, 230, 130]], t, 1);
  panel(['upgrade', 'steel', 'mail'], t > 2.6 && t < 10.9 ? 0 : t >= 10.9 && t < 15.6 ? 1 : -1, o); cur(c, t, [[1.2, 0], [3, 0], [11.5, 0]]);
}
function cKing(t) {
  hud(RES(200, 180, 900 - num(t, [[3, 450]]), 160, '16/20'));
  B('castle', 56, 106, 86); tree(296, 46); tree(280, 160); tree(130, 44); rock(36, 164);
  if (t > 3.5) {
    const K = [[4, 88, 118], [8, 190, 104]], k = at(K, t), fight = t > 9 && t < 14.4;
    ringFx(t, 3.5, 88, 112, 36, '#ffd23c', 1);
    Q.push([k.y - .1, () => { const g = G; g.fillStyle = 'rgba(255,210,60,.1)'; g.strokeStyle = 'rgba(255,210,60,.5)'; g.lineWidth = 1; g.beginPath(); g.ellipse(k.x, k.y, 34, 15, 0, 0, 6.283); g.fill(); g.stroke() }]);
    unit('king', k, { atk: fight ? (t * 1.3) % 1 : -1, dx: 1 });
    [[-13, -11], [-13, 11]].forEach(([ox, oy], i) => unit('guard', at(K.map(q => [q[0] + .3, q[1] + ox, q[2] + oy]), t), { atk: fight ? (t * 1.2 + .4 + i * .3) % 1 : -1, dx: 1, ph: 2 + i }));
    if (t > 9.5) Q.push([930, () => { bar(k.x, k.y - 46, 22, lin(t, 9.5, 13.6), '#b48cff'); if (IC.crown) G.drawImage(IC.crown, k.x - 22, k.y - 51, 9, 9) }]);
    fl(t, 13.6, k.x, k.y - 50, '+1', '#d9c2ff'); ringFx(t, 13.6, k.x, k.y - 6, 26, '#b48cff');
    ringFx(t, 11.6, k.x, k.y, 78, '#ffd23c', .9); ringFx(t, 11.75, k.x, k.y, 60, '#fff0a0', .8);
  }
  for (let i = 0; i < 7; i++) { const y = 78 + hsh(i, 3) * 54, a = 6 + i * .4, ax = 208 + (i % 3) * 9, kb = i > 2 ? sm(t, 11.6, 12.1) * 26 : 0; zed(t, i === 6 ? 'brute' : 'zombie', [[a, 334, y], [a + 3, ax + kb, 104 + (y - 104) * .5]], a + 3, i > 2 ? 11.7 : 10.2 + i * .5, { dx: -1 }) }
  const o = sm(t, 1.2, 1.5) * (1 - sm(t, 3.2, 3.6)), c = at([[0, 220, 60], [1, 60, 96], [1.8, 60, 96], [2.6, sx(0, 3), SY], [3.4, sx(0, 3), SY], [5, 250, 150], [10.6, 250, 150], [11.4, 160, SY], [12.4, 160, SY], [13.4, 250, 150]], t, 1);
  panel(['king', 'guard', 'knight'], t > 2.4 && t < 3.5 ? 0 : -1, o);
  if (t > 8) { slot('agg', 160, SY, t > 11.2 && t < 12.4); if (t > 11.6) Q.push([1002, () => R4('rgba(8,10,16,.7)', 150, SY - 10, 20, 20 * (1 - lin(t, 11.6, 19)))]) }
  cur(c, t, [[1.2, 0], [3, 0], [11.6, 0]]);
}
function cCoop(t) {
  const A = '#6cb4ff', O = '#ffb04a';
  hud(RES(240, 150, 400 - num(t, [[13.6, 100]]), 180 - num(t, [[13.6, 50]]), '15/20'));
  B('castle', 48, 106, 78); B('castle', 274, 106, 78, { flip: 1 }); tree(160, 172); tree(20, 40); tree(300, 40);
  Q.push([20, () => { R4('#6b4a2a', 47, 44, 1, 14); R4(A, 48, 44, 9, 6); R4('#6b4a2a', 275, 44, 1, 14); R4(O, 266, 44, 9, 6) }]);
  const fight = t > 8 && t < 13.2;
  for (let i = 0; i < 3; i++) {
    unit('knight', at([[4, 84, 100 + i * 10], [7.5, 138, 92 + i * 12]], t), { ring: A, atk: fight ? (t * 1.5 + i * .3) % 1 : -1, ph: i });
    unit(i === 1 ? 'knight' : 'archer', at([[4.4, 240, 100 + i * 10], [7.8, 184 + (i !== 1) * 10, 92 + i * 12]], t), { ring: O, atk: fight ? (t * 1.3 + i * .4) % 1 : -1, ph: i + 1, dx: -1 });
  }
  for (let i = 0; i < 8; i++) { const top = i % 2 === 0, x = 132 + hsh(i, 5) * 56, a = 4.5 + i * .4; zed(t, i === 7 ? 'brute' : i === 3 ? 'runner' : 'zombie', [[a, x, top ? -8 : 190], [a + 3.4, 150 + (i % 4) * 7, top ? 94 + i : 122 - i]], a + 3.4, 9.4 + i * .5, { dx: i % 4 < 2 ? -1 : 1 }) }
  if (t > 13.6 && t < 18) { const p = at([[13.8, 84, 132], [17.6, 240, 132]], t); Q.push([p.y, () => { G.fillStyle = 'rgba(0,0,0,.25)'; G.beginPath(); G.ellipse(p.x, p.y, 9, 3, 0, 0, 6.283); G.fill(); if (IC.convoy) G.drawImage(IC.convoy, p.x - 11, p.y - 19 + Math.abs(Math.sin(t * 9)), 22, 22) }]) }
  fl(t, 17.6, 274, 60, '+100', '#ffd25a'); fl(t, 17.8, 274, 60, '+50', '#ffe08a'); ringFx(t, 17.6, 274, 96, 30, O);
  cur(at([[0, 100, 60], [2, 96, 108], [3, 96, 108], [3.8, 150, 104], [12.6, 150, 112], [13.4, 60, 100], [14.4, 110, 150]], t, 1), t, [[3.9, 1], [13.6, 0]], A, 'P1');
  cur(at([[0, 230, 150], [2.4, 236, 112], [3.4, 236, 112], [4.3, 176, 108], [9, 190, 124], [12, 176, 100], [15, 262, 84]], t, 1), t, [[4.4, 1]], O, 'P2');
}

/* chapter: [title, duration (s, title card included), captions [[scene time, text], ...], clip, road of the ground] */
const CH = [
  ['Gather', 17.5, [[0, 'Drag a box around your peasants to select them'], [2.6, 'Right-click a tree, a rock or gold: your peasants gather it'], [9.5, 'They carry everything back to the castle: your stock grows']], cGather],
  ['Build', 18, [[0, 'Open the build menu and choose a building'], [2.4, 'Click the ground to place it'], [6.5, 'Your peasants build it: every building has a cost']], cBuild],
  ['Population and food', 18, [[0, 'Population limit reached: build houses in the Town menu'], [4.5, 'Farms give food: put a peasant on each farm'], [9.4, 'Every new unit costs food']], cPop],
  ['Train an army', 20.5, [[0, 'Build barracks, then train soldiers in the Train bar'], [5, 'Knights fight up close, archers shoot from behind'], [14, 'Select your soldiers and right-click to send them']], cArmy],
  ['Walls and towers', 20, [[0, 'Zombies follow the red lines: block them with walls'], [5.5, 'Add a gate so your own units can pass'], [8.4, 'Towers shoot every zombie in range']], cWalls, ROAD],
  ['The night and the horde', 21.5, [[0, 'The top bar counts down to the next wave'], [4, 'At night the horde comes: keep your soldiers near the walls'], [15.5, 'Hold until dawn: every wave is stronger than the last']], cNight, ROAD],
  ['Research', 18, [[0, 'Build an Academy to research'], [3, 'Each research takes time and makes your kingdom stronger'], [9, 'Stonemasonry lets you build in stone']], cRes],
  ['The King', 18, [[0, 'Summon King Naraige at the castle: he arrives with 2 royal guards'], [6, 'He fights the horde and gains levels'], [11, 'His skills can turn a fight: use them at the right time']], cKing],
  ['Co-op', 20, [[0, 'Co-op: host a game and share the room code with a friend'], [4.5, 'Two kingdoms, one horde: defend together'], [13.4, 'Send a convoy to share resources with your partner']], cCoop],
];
const capAt = (C, t) => { let s = C[2][0][1]; for (const [a, x] of C[2]) if (t >= a) s = x; return s };
/* caption wrapped on at most `lines` lines, shrinking the text first; still too long = reported like every other overflow (tools/fitcheck) */
function capFit(s, w, lines) {
  let ls, sc = .9; for (; sc > .61; sc -= .04) { ls = wrapT(L(s), w, sc); if (ls.length <= lines) return { ls, sc } }
  const o = window.__ovf || (window.__ovf = []); if (o.length < 400) o.push(L(s) + ' @cap' + Math.round(w)); return { ls: ls.slice(0, lines), sc: .62, over: true };
}

const setCh = i => { ch = (i + CH.length) % CH.length; T = 0; paused = false };
const toggle = () => { paused = !paused };
const playTut = () => { guideState.open = false; try { localStorage.removeItem('dk_tut') } catch (e) { } settingsState.setupOpen = true };
export function openGuide() { guideState.open = true; ch = 0; T = 0; paused = false; lastT = performance.now() }

function init() {
  if (inited) return; inited = true;
  /* Left / Right change the chapter, Space pauses (the menu navigation keeps Up / Down / Enter / Esc) */
  addEventListener('keydown', e => {
    if (!guideState.open || e.ctrlKey || e.altKey || e.metaKey) return;
    const f = e.key === 'ArrowRight' ? () => setCh(ch + 1) : e.key === 'ArrowLeft' ? () => setCh(ch - 1) : e.key === ' ' ? toggle : null;
    if (f) { e.preventDefault(); e.stopImmediatePropagation(); f() }
  }, true);
  /* tools and tests: __guide.at(chapter, seconds, paused), __guide.fit(width, lines) */
  guideState.at = (c, t, p) => { ch = c; T = t; paused = !!p };
  guideState.fit = (w, n) => { const r = []; for (const C of CH) for (const q of C[2]) { const f = capFit(q[1], w, n); if (f.over) r.push(L(q[1])); } return r };
  guideState.ready = () => spDone;
  window.__guide = guideState;
}

const glyph = k => (x, y, s) => { const g = canvasesState.ctx, tri = (a, b) => { g.beginPath(); g.moveTo(a, y); g.lineTo(a, y + s); g.lineTo(b, y + s / 2); g.closePath(); g.fill() }; g.fillStyle = '#ece6d8';
  if (k === 0) { g.fillRect(x, y, s * .22, s); tri(x + s, x + s * .3) } else if (k === 1) tri(x + s * .12, x + s * .95); else if (k === 2) { g.fillRect(x + s * .08, y, s * .3, s); g.fillRect(x + s * .6, y, s * .3, s) } else { tri(x, x + s * .7); g.fillRect(x + s * .78, y, s * .22, s) } };

function video(x, y, w, h) {
  const g = G = canvasesState.ctx, C = CH[ch], s = w / W, st = Math.max(0, T - TC0);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.translate(x, y); g.scale(s, s);
  g.imageSmoothingEnabled = false; g.drawImage(ground(C[4]), 0, 0); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  Q.length = 0; C[3](st); Q.sort((a, b) => a[0] - b[0]); for (const q of Q) q[1]();
  const f = Math.max(1 - lin(T, 0, .35), lin(T, C[1] - .35, C[1])); if (f > 0) R4('rgba(0,0,0,' + f.toFixed(3) + ')', 0, 0, W, H);
  const k = 1 - sm(T, TC0 - .45, TC0);
  if (k > 0) { R4('rgba(6,7,12,' + (.74 * k).toFixed(3) + ')', 0, 0, W, H); g.globalAlpha = k; pxText((ch + 1) + ' / ' + CH.length, W / 2, 66, 8, KC.sec, { al: 'center', raw: true, wt: 500 }); goldTitle(C[0], W / 2, 76, 22, 'center', W - 30); g.globalAlpha = 1 }
  if (paused) { R4('rgba(6,7,12,.35)', 0, 0, W, H); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.moveTo(148, 72); g.lineTo(148, 108); g.lineTo(178, 90); g.closePath(); g.fill() }
  g.restore(); kitFrame(x - 1, y - 1, w + 2, h + 2, false, .8);
}

export function drawGuide(UW, UH, fh, back) {
  init(); sprites();
  { const now = performance.now(), dt = Math.min(.1, Math.max(0, (now - lastT) / 1000)); lastT = now; if (!paused && spDone) { T += dt; if (T >= CH[ch][1]) setCh(ch + 1) } }
  const b = kitScreen(UW, UH, { key: 'gui', title: 'Video guide', close: back, fh, maxW: 640 }), g = canvasesState.ctx, n = CH.length, C = CH[ch];
  const nar = b.w < 380, low = b.h < 170, lw = nar ? 0 : Math.min(160, Math.round(b.w * .29)), gp = nar ? 0 : 12, cx = b.x + lw + gp, cwd = b.w - lw - gp,
    capL = low ? 1 : 2, capH = capL * 11 + 2, ctl = low ? 17 : 20, th = low ? 18 : 22, tut = nar ? th + 5 : 0, hd = nar ? 13 : 0;
  let vh = Math.round(Math.max(36, Math.min(b.h - hd - capH - 13 - ctl - tut - 2, cwd * 9 / 16))), y = b.y + 1; const vw = Math.round(vh * 16 / 9), vx = Math.round(cx + (cwd - vw) / 2);
  if (!nar) {
    const l = listBegin('gui', b.x, b.y, lw, b.h - th - 6);
    CH.forEach((c, i) => l.row({ label: (i + 1) + '. ' + L(c[0]), raw: true, on: i === ch, fn: () => setCh(i) }, low ? 15 : 18)); listEnd();
    bevelBtn(b.x, b.y + b.h - th, lw, th, 'Play the tutorial game', 'go', playTut, { sc: .8 });
  } else { pxText((ch + 1) + '/' + n + '  ' + L(C[0]), b.x + b.w / 2, y + 5, 9, KC.gold, { raw: true, al: 'center', max: b.w }); y += hd }
  video(vx, y, vw, vh); kitHitAdd(vx, y, vw, vh, toggle); y += vh + 4;
  { const f = capFit(capAt(C, T - TC0), cwd, capL), y0 = y + (capH - f.ls.length * 11) / 2 + 1; f.ls.forEach((s, i) => T_(s, Math.round(cx + cwd / 2 - tw(s, f.sc) / 2), y0 + i * 11, KC.txt, f.sc)); y += capH + 2 }
  { g.fillStyle = '#05060a'; g.fillRect(vx, y, vw, 4); g.fillStyle = KC.gold; g.fillRect(vx, y, Math.round(vw * cl(T / C[1])), 4); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(vx, y, Math.round(vw * cl(T / C[1])), 1);
    g.fillStyle = 'rgba(255,255,255,.55)'; for (const q of C[2]) if (q[0]) g.fillRect(vx + Math.round(vw * (q[0] + TC0) / C[1]), y, 1, 4);
    kitHitAdd(vx, y - 3, vw, 10, () => { T = cl((inputState.mouse.x / hudDisplayState.UIS - vx) / vw) * C[1] * .999 }); y += 9 }
  bevelBtn(vx, y, 30, ctl, '', 'dark', () => setCh(ch - 1), { ic: glyph(0) }); bevelBtn(vx + 34, y, 30, ctl, '', paused ? 'go' : 'dark', toggle, { ic: glyph(paused ? 1 : 2) }); bevelBtn(vx + 68, y, 30, ctl, '', 'dark', () => setCh(ch + 1), { ic: glyph(3) });
  pxText(fmt(T) + ' / ' + fmt(C[1]), vx + 106, y + ctl / 2, 8, KC.dim, { raw: true, wt: 500, sh: '' });
  if (!nar) pxText((ch + 1) + ' / ' + n, vx + vw, y + ctl / 2, 8, KC.dim, { raw: true, wt: 500, sh: '', al: 'right' });
  else bevelBtn(b.x, y + ctl + 5, b.w, th, 'Play the tutorial game', 'go', playTut, { sc: .85 });
}
