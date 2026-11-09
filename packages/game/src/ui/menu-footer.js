import { inputState } from '../input/state.js';
import { L, T_, tw } from '../i18n/language.js';
import { BTN, BTNH } from './drawing.js';
import { canvasesState } from './canvases.js';
import { padOn } from './menu-nav.js';
import { pill } from './minimap.js';
import { FFP } from './typography.js';

/* ================= key-hint footer shared by every menu screen (visual only) =================
   Desktop: key caps "Back [Esc]  Select [Enter]". Gamepad: round B / A caps. Touch: a real tappable button, no key caps. */
export const footH = UH => UH >= 210 ? 20 : 0;

const CAPH = 13;
const PADK = { Esc: 'B', Enter: 'A' };

function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath() }

function capBox(x, y, w, round) {
  const g = canvasesState.ctx, r = round ? CAPH / 2 : 2.5;
  g.fillStyle = 'rgba(0,0,0,.35)'; rrect(g, x, y + 1.5, w, CAPH, r); g.fill();
  const gr = g.createLinearGradient(0, y, 0, y + CAPH); gr.addColorStop(0, '#46526e'); gr.addColorStop(1, '#262e44');
  g.fillStyle = gr; rrect(g, x, y, w, CAPH, r); g.fill();
  g.lineWidth = 1; g.strokeStyle = '#c9a24f'; rrect(g, x + .5, y + .5, w - 1, CAPH - 1, r); g.stroke();
}

/* one key cap (label '^v' = the move arrows); returns its width, draws only when !measure */
function cap(x, y, label, round, measure) {
  const g = canvasesState.ctx;
  if (label === '^v') {
    const w = 15;
    if (!measure) {
      capBox(x, y, w, false); g.fillStyle = '#f2e4c4';
      const cx = x + w / 2, cy = y + CAPH / 2;
      g.beginPath(); g.moveTo(cx, cy - 4); g.lineTo(cx + 2.6, cy - 1); g.lineTo(cx - 2.6, cy - 1); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(cx, cy + 4); g.lineTo(cx + 2.6, cy + 1); g.lineTo(cx - 2.6, cy + 1); g.closePath(); g.fill();
    }
    return w;
  }
  g.font = '700 8px ' + FFP;
  const w = Math.max(round ? CAPH : 15, Math.ceil(g.measureText(label).width) + 9);
  if (!measure) { capBox(x, y, w, round); g.fillStyle = '#f2e4c4'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(label, x + w / 2, y + CAPH / 2 + .5); g.textAlign = 'left' }
  return w;
}

/* items: [[key, text, tapFn?], ...] with key 'Esc' | 'Enter' | '^v'. Touch layouts draw the first item that has a tapFn as a button.
   o.cy: centre line (default: the footer band); o.band=false: no dark band (the title screen draws inside its frame). */
export function menuFooter(UW, UH, items, o) {
  o = o || {};
  const g = canvasesState.ctx, h = footH(UH), cy = o.cy != null ? o.cy : UH - h / 2 - 1;
  if (!h && o.cy == null) return;
  if (o.band !== false && h) {
    const y0 = UH - h, gr = g.createLinearGradient(0, y0, 0, UH); gr.addColorStop(0, 'rgba(4,6,12,.55)'); gr.addColorStop(1, 'rgba(4,6,12,.85)');
    g.fillStyle = gr; g.fillRect(0, y0, UW, h); g.fillStyle = 'rgba(184,149,76,.5)'; g.fillRect(0, y0, UW, 1);
  }
  if (inputState.touch) {
    const b = items.find(i => i[2]);
    if (b) { const w = Math.max(64, Math.ceil(tw(b[1], .85)) + 28); pill(Math.round(UW / 2 - w / 2), Math.round(cy - 8), w, 16, b[1], BTN, BTNH, b[2], null, .85) }
    return;
  }
  const pad = padOn(), sc = .85, gap = 12;
  const its = items.map(i => { const k = i[0], round = pad && !!PADK[k], c = k === '^v' ? (pad ? 'D-pad' : '^v') : pad && PADK[k] ? PADK[k] : L(k); return { c, t: i[1], round } });
  const ws = its.map(i => cap(0, 0, i.c, i.round, true) + 5 + tw(i.t, sc));
  let x = Math.round(UW / 2 - (ws.reduce((a, b) => a + b, 0) + gap * (its.length - 1)) / 2);
  its.forEach((i, k) => { const w = cap(x, cy - CAPH / 2, i.c, i.round); T_(i.t, x + w + 5, cy - 4.5, '#eef2fa', sc); x += ws[k] + gap });
}
