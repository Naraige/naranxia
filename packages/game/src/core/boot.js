import { setPref } from './prefs.js';

/* Start-up: runs the initialisation steps in short slices so the launch cards (index.html, styles/boot.css) keep
   animating: the steps that need no WebGL run during the entrance of the first card, the rest (and one hidden title
   frame: shader compilation, army, menu) while that card stands still; then the second card plays and the curtain
   opens only when the title is really drawing.
   The card clock starts at the first painted frame (window.__nxIntro.t0, set by index.html), never at page load.
   Nothing here touches the simulation: wall-clock timers only.
   Under browser automation (navigator.webdriver: the headless tests and tools) everything runs in one go and the
   cards are skipped, as the test harnesses evaluate their scripts after a fixed wait. */
const I = window.__nxIntro || (window.__nxIntro = { t0: performance.now(), skip: false });
const el = document.getElementById('boot');
const AUTO = !!navigator.webdriver && !window.__nxBootReal;
let RM = false;
try { RM = matchMedia('(prefers-reduced-motion: reduce)').matches } catch { /* no matchMedia */ }
/* card 1: its entrance animation, its minimum time on screen, its fade; card 2: hold until its fade starts, full length (boot.css) */
const C1_ANIM = RM ? 450 : 1900, C1_MIN = RM ? 1000 : 2000, C1_OUT = 440, C2_HOLD = RM ? 780 : 2260, C2_LEN = RM ? 1000 : 2900;
const SLICE = 30;

const T = window.__nxBoot = { t: Math.round(performance.now()), steps: [], maxSlice: 0 };
let H = {};
let stage = 0, stageT = 0, loaded = false, looping = false, loopT = 0, frames = 0, fast = 0, timer = 0, dotT = 0, inited = false;

/* input reaches the game only once the splash is leaving: a click or a key during the cards skips them and nothing else */
const EVS = ['pointerdown', 'pointerup', 'pointermove', 'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu', 'wheel', 'keydown', 'keyup', 'keypress', 'touchstart', 'touchmove', 'touchend'];
const guard = e => { e.stopImmediatePropagation() };
function guardOn(on) { for (const n of EVS) try { if (on) addEventListener(n, guard, true); else removeEventListener(n, guard, true) } catch { /* old browser */ } }

const post = (() => {
  if (typeof MessageChannel === 'undefined') return f => setTimeout(f, 0);
  const ch = new MessageChannel(); let q = null;
  ch.port1.onmessage = () => { const f = q; q = null; if (f) f() };
  return f => { q = f; ch.port2.postMessage(0) };
})();

function dots(on) {
  if (!el) return;
  if (on) { if (!dotT) dotT = setTimeout(() => el.classList.add('ld'), 1000) }
  else { clearTimeout(dotT); dotT = 0; el.classList.remove('ld') }
}

function startLoop() { if (!looping) { looping = true; loopT = performance.now(); H.startFrameLoop() } }

/* the card sequence: called again by its own timer and whenever something changes (first paint, skip, loading done) */
function advance() {
  clearTimeout(timer);
  if (stage >= 5) return;
  const now = performance.now(), at = t => { timer = setTimeout(advance, Math.max(0, t - now) + 1) };
  if (I.skip || AUTO || !el) {
    if (stage < 4) { dots(true); if (!loaded) return; stage = 4; startLoop() }
    return;
  }
  if (!I.t0) return;
  if (stage === 0) {
    const t = I.t0 + C1_MIN; if (now < t) { at(t); return }
    if (!loaded) { dots(true); return }
    dots(false); stage = 1; stageT = now; el.classList.add('c1out');
  }
  if (stage === 1) {
    const t = stageT + C1_OUT; if (now < t) { at(t); return }
    stage = 2; stageT = now; el.classList.add('c2'); if (H.playClaude) H.playClaude();
  }
  if (stage === 2) {
    const t = stageT + C2_HOLD; if (now < t) { at(t); return }
    stage = 3; startLoop();
  }
  if (stage === 3) {
    const t = stageT + C2_LEN; if (now < t) { at(t); return }
    stage = 4; dots(true);
  }
}

/* every frame of the loop: the curtain opens after a few title frames, and only once they come quickly */
export function bootFrame(ms) {
  if (stage >= 5 || !looping) return;
  frames++; fast = ms < 60 ? fast + 1 : 0;
  if (stage < 4 || frames < 4) return;
  if (fast < 2 && frames < 12 && performance.now() - loopT < 3000) return;
  stage = 5; clearTimeout(timer); dots(false); guardOn(false); setPref('seen', true);
  try { removeEventListener('pointerdown', I.ev, true); removeEventListener('keydown', I.ev, true) } catch { /* none */ }
  T.title = Math.round(performance.now());
  if (el) { el.classList.add('done'); setTimeout(() => el.remove(), 1300) }
}

/* WebGL work (context, textures, shader compilation) can stall the browser's compositor, so everything from the
   scene set-up on waits until the first card has finished its entrance; the card then stays still while it loads */
let gateT = 0, gateF = null;
function gate(f) {
  clearTimeout(gateT); gateF = null;
  const now = performance.now();
  if (I.skip || !el || I.t0 && now >= I.t0 + C1_ANIM) return true;
  gateF = f; gateT = setTimeout(f, I.t0 ? I.t0 + C1_ANIM - now + 1 : 1e4);
  return false;
}
function regate() { const f = gateF; if (f) { clearTimeout(gateT); gateF = null; f() } }

/* the hidden title frame, in two tasks */
function warm() {
  if (loaded || !inited || !gate(warm)) return;
  inited = false;
  const a = performance.now();
  H.prepTitle();
  post(() => {
    H.warmFrame();
    T.warm = Math.round(performance.now() - a);
    /* two animation frames later the browser has presented again: the cards can move without a hitch */
    let d = false; const ok = () => { if (d) return; d = true; T.loaded = Math.round(performance.now()); loaded = true; advance() };
    requestAnimationFrame(() => requestAnimationFrame(ok)); setTimeout(ok, 400);
  });
}

export function runBoot(steps, hooks) {
  H = hooks;
  if (AUTO) {
    for (const f of steps) { const r = f(); if (r && typeof r.next === 'function') for (const _ of r); }
    loaded = true; I.skip = true; if (el) el.classList.add('skip');
    advance();
    return;
  }
  guardOn(true);
  I.onGo = () => { regate(); advance() }; I.onSkip = () => { regate(); advance() };
  const gl = steps.indexOf(hooks.firstGl);
  let i = 0, it = null;
  const slice = () => {
    const t0 = performance.now();
    for (;;) {
      if (it) { const a = performance.now(); if (it.next().done) it = null; const d = performance.now() - a; if (d >= 50) T.steps.push([i - 1, Math.round(d), 'part']) }
      else if (i < steps.length) {
        if (i === gl && !gate(slice)) { T.cpu = Math.round(performance.now()); return }
        const a = performance.now(), f = steps[i++], r = f();
        if (r && typeof r.next === 'function') it = r;
        else { const d = performance.now() - a; if (d >= 5) T.steps.push([i - 1, Math.round(d)]) }
      } else break;
      if (performance.now() - t0 > SLICE) { T.maxSlice = Math.max(T.maxSlice, Math.round(performance.now() - t0)); post(slice); return }
    }
    T.init = Math.round(performance.now()); inited = true;
    warm(); advance();
  };
  post(slice);
  advance();
}
