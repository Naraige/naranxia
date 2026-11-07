import { snd } from '../audio/sound.js';
import { sessionState } from '../gameplay/session.js';
import { inputState } from '../input/state.js';

/* ================= TITLE MENU: keyboard and gamepad navigation, hover feedback =================
   The menu registers its buttons in drawing order every frame (navBegin / navAdd). Up / Down (or the pad's d-pad / left stick) move the
   selection, Enter / Space / pad A press it, Esc (pad B) runs the current "back" action. The mouse takes over when it moves. */
export const NAV = { sel: -1, fns: [], active: false, onEsc: null, mx: -1, my: -1, pad: { up: 0, dn: 0, ok: 0, bk: 0 } };

export function navBegin(on) {
  NAV.fns = [];
  NAV.active = !!on;
  if (!on) NAV.sel = -1;
}

/* register a button: returns its index; hover moves the selection (and ticks) only when the mouse really moved */
export function navAdd(fn, hovered) {
  const i = NAV.fns.length;
  NAV.fns.push(fn);
  const m = inputState.mouse, moved = m && (m.x !== NAV.mx || m.y !== NAV.my);
  if (hovered && moved && NAV.sel !== i) { NAV.sel = i; snd('hover') }
  return i;
}

export function navEnd() {
  const m = inputState.mouse;
  if (m) { NAV.mx = m.x; NAV.my = m.y }
  if (NAV.sel >= NAV.fns.length) NAV.sel = NAV.fns.length - 1;
}

function move(d) {
  const n = NAV.fns.length;
  if (!n) return;
  NAV.sel = NAV.sel < 0 ? (d > 0 ? 0 : n - 1) : (NAV.sel + d + n) % n;
  snd('hover');
}

function press() {
  if (!NAV.fns.length) return;
  const f = NAV.fns[NAV.sel < 0 ? 0 : NAV.sel];
  snd('click');
  f();
}

const typing = e => { const t = e.target && e.target.tagName; return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || t === 'BUTTON' };
const modalOpen = () => { const m = document.getElementById('mpClose'); return !!(m && m.offsetParent) };

export function initializeMenuNav() {
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.altKey || e.metaKey || typing(e)) return;
    if (e.key === 'Escape' && NAV.onEsc && !modalOpen()) { e.preventDefault(); NAV.onEsc(); return }
    if (!NAV.active || modalOpen()) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
    else if (e.key === 'Enter' || (e.key === ' ' && !sessionState.inGame)) { e.preventDefault(); press() }
  });
}

export function padOn() {
  try { const l = navigator.getGamepads ? navigator.getGamepads() : []; for (const p of l) if (p && p.connected) return true } catch (e) { }
  return false;
}

/* gamepad: called once per drawn frame while the menu is shown */
export function navPoll() {
  let g = null;
  try { const l = navigator.getGamepads ? navigator.getGamepads() : []; for (const p of l) if (p && p.connected) { g = p; break } } catch (e) { return }
  if (!g) return;
  const b = i => !!(g.buttons[i] && g.buttons[i].pressed), ax = g.axes[1] || 0, P = NAV.pad;
  const up = b(12) || ax < -.6, dn = b(13) || ax > .6, ok = b(0), bk = b(1);
  if (NAV.active && up && !P.up) move(-1);
  if (NAV.active && dn && !P.dn) move(1);
  if (NAV.active && ok && !P.ok) press();
  if (bk && !P.bk && NAV.onEsc) NAV.onEsc();
  P.up = up ? 1 : 0; P.dn = dn ? 1 : 0; P.ok = ok ? 1 : 0; P.bk = bk ? 1 : 0;
}
