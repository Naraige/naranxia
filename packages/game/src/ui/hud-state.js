export const hudDisplayState = {
  UIS: 2,
  msgT: 0,
  msgS: '',
  /* quest panel box of this frame [x, y, w, h] (null when not drawn) and height of the centre bars of the last frame */
  qbox: null,
  barsH: 0,
  /* band of the centre bars of the last frame [x, y, w, h] or null; what the quest marker drew this frame (see ui/quest-marker.js) */
  cbar: null,
  qm: null,
  /* boxes [x, y, w, h] of what was drawn under the top bar since the toasts were last drawn (message line, event and hint bars):
     the achievement toasts go under those that reach them (ui/hud.js drawToasts) */
  tbox: [],
  /* for the tests: toasts drawn by the last frame {t: their boxes at rest, b: the boxes they had to clear}, y of the wave banner */
  tq: null,
  bny: 0,
};

/* left edge of a centre bar (w x h at height y): centred, or moved right of the quest panel when the two would overlap and there is room */
export function barX(UW, w, y, h) {
  const b = hudDisplayState.qbox;
  let x = Math.round((UW - w) / 2);
  if (b && y < b[1] + b[3] + 2 && y + h > b[1] - 2) { const lx = b[0] + b[2] + 3; if (x < lx && lx + w <= UW - 3) x = lx }
  topBox(x, y, w, h);
  return x;
}

export function topBox(x, y, w, h) { const t = hudDisplayState.tbox; if (t.length < 12) t.push([x, y, w, h]) }
