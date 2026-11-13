import { tilesFor, valid } from "../gameplay/construction.js";
import { playersState } from "../gameplay/players.js";
import { TW } from "../gameplay/rules.js";
import { CONNT } from "./models/structures.js";
import { gOK } from "../world/routes.js";
import { occ } from "../world/terrain-state.js";

/* houses / farms snap onto a neighbour's grid so they line up and merge */
export function snapM(type, tx, ty) {
  if (type !== "house" && type !== "farm" && !CONNT.has(type)) return [tx, ty];
  const fits = (x, y) => tilesFor(type, x, y, 2).every(([a, b]) => gOK(a, b) && valid(a, b));
  let best = null,
    bd = 9;
  for (let j = ty - 3; j <= ty + 3; j++)
    for (let i = tx - 3; i <= tx + 3; i++) {
      const o = occ.get(j * TW + i);
      if (!o || o.type !== type || o.t !== 0 || (o.pl | 0) !== playersState.CURPL || o.tx !== i || o.ty !== j) continue;
      if (Math.max(o.tx - (tx + 2), tx - (o.tx + 2)) > 0 || Math.max(o.ty - (ty + 2), ty - (o.ty + 2)) > 0) continue;
      for (const [cx, cy] of [
        [o.tx + 2, o.ty],
        [o.tx - 2, o.ty],
        [o.tx, o.ty + 2],
        [o.tx, o.ty - 2],
      ]) {
        const d = Math.abs(cx - tx) + Math.abs(cy - ty);
        if (d === 0) return [tx, ty];
        if (Math.abs(cx - tx) <= 1 && Math.abs(cy - ty) <= 1 && d < bd && fits(cx, cy)) {
          bd = d;
          best = [cx, cy];
        }
      }
    }
  return best || [tx, ty];
}
