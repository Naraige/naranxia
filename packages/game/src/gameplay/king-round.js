import { TS } from "./rules.js";
import { sessionState } from "./session.js";

/* the King's round (#87): peasants within 12 tiles of their own King work a quarter faster. The Kings are looked up once per tick. */
const KR = { t: -1, K: [] };
export function kingRound(u) {
  if (KR.t !== sessionState.time) {
    KR.t = sessionState.time;
    KR.K.length = 0;
    for (const k of sessionState.units) if (k.t === 0 && k.type === "king" && k.hp > 0 && !k.kdead) KR.K.push(k);
  }
  for (const k of KR.K)
    if ((k.pl | 0) === (u.pl | 0)) {
      const dx = k.x - u.x,
        dy = k.y - u.y;
      if (dx * dx + dy * dy < 12 * TS * (12 * TS)) return 1.25;
    }
  return 1;
}
