export const hudDisplayState = {
  UIS: 2,
  msgT: 0,
  msgS: '',
  /* quest panel box of this frame [x, y, w, h] (null when not drawn) and height of the centre bars of the last frame */
  qbox: null,
  barsH: 0,
};

/* left edge of a centre bar (w x h at height y): centred, or moved right of the quest panel when the two would overlap and there is room */
export function barX(UW, w, y, h) {
  const b = hudDisplayState.qbox, x = Math.round((UW - w) / 2);
  if (!b || y >= b[1] + b[3] + 2 || y + h <= b[1] - 2) return x;
  const lx = b[0] + b[2] + 3;
  return x < lx && lx + w <= UW - 3 ? lx : x;
}
