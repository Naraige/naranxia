import { HT, stairs, TFL } from "./terrain-state.js";

function stairOK(s, d, h) {
  const ax = Math.abs(d) === 1 ? 0 : 1;
  return ax === s.ax && (h === s.hi || h === s.lo);
}

function rampStep(a, b, ha, hb) {
  if (!stairs.size) return false;
  const d = b - a;
  let s = stairs.get(a);
  if (s && stairOK(s, d, hb)) return true;
  s = stairs.get(b);
  return !!(s && stairOK(s, -d, ha));
}

export function canStep(a, b) {
  const ha = HT[a],
    hb = HT[b];
  if (ha === hb) return true;
  if ((TFL[a] === 1 || TFL[b] === 1) && Math.abs(ha - hb) <= 1) return true;
  return rampStep(a, b, ha, hb);
}

export function canStepZ(a, b) {
  const ha = HT[a],
    hb = HT[b];
  if (ha === hb) return true;
  const fa = TFL[a],
    fb = TFL[b];
  if (((fa && fa < 3) || (fb && fb < 3)) && Math.abs(ha - hb) <= 1) return true;
  return rampStep(a, b, ha, hb);
}
