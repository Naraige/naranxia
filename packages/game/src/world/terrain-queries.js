import { TH, TW } from "../gameplay/rules.js";
import { HT, stairs } from "./terrain-state.js";

export function gh(x, z) {
  const tx = Math.max(0, Math.min(TW - 1, x | 0));
  const ty = Math.max(0, Math.min(TH - 1, z | 0));
  const i = ty * TW + tx;
  if (stairs.size) {
    const s = stairs.get(i);
    if (s) {
      const f = s.ax ? z - ty : x - tx;
      const t = s.sg > 0 ? f : 1 - f;
      return s.lo + (s.hi - s.lo) * Math.max(0, Math.min(1, t));
    }
  }
  return HT[i];
}
