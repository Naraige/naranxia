import { wkOf } from "../ai/workplaces.js";
import { snd } from "../audio/sound.js";
import { exposed, reach } from "../gameplay/combat.js";
import { order } from "../gameplay/formations.js";
import { playersState } from "../gameplay/players.js";
import { TS, TW } from "../gameplay/rules.js";
import { sel } from "../gameplay/selection.js";
import { sessionState } from "../gameplay/session.js";
import { MP } from "../multiplayer/session.js";
import { hudDisplayState } from "./hud-state.js";
import { reachLong } from "../world/connectivity.js";
import { gOK } from "../world/routes.js";
import { amt, ter } from "../world/terrain-state.js";

/* ---- tasks for the selected peasants: the nearest target of that kind, then an ordinary order (a command in co-op) ---- */
export const JOBK = new Set(["jw", "js", "jg", "jf", "jr"]),
  JOBI = { jw: "wood", js: "stone", jg: "coin", jf: "farm", jr: "repair" },
  JOBL = { jw: "Wood", js: "Stone", jg: "Gold", jf: "Farm", jr: "Build" };

export function assignJob(c) {
  const P = sel().filter((u) => u.type === "peasant");
  if (!P.length) return;
  let cx = 0,
    cy = 0;
  for (const u of P) {
    cx += u.x;
    cy += u.y;
  }
  const ux = Math.floor(cx / P.length / TS),
    uy = Math.floor(cy / P.length / TS);
  let best = null;
  if (c === "w" || c === "s" || c === "g") {
    const code = { w: 2, s: 3, g: 4 }[c];
    for (let r = 1; r <= 60 && !best; r++)
      for (let j = -r; j <= r && !best; j++)
        for (let i = -r; i <= r; i++) {
          if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue;
          const x = ux + i,
            y = uy + j;
          if (!gOK(x, y)) continue;
          const k = y * TW + x;
          if (ter[k] !== code || !(amt[k] > 0) || !exposed(x, y)) continue;
          if (reach(x, y) || reachLong(x, y)) {
            best = [x, y];
            break;
          }
        }
  } else {
    let bd = 1e18;
    for (const q of sessionState.structs) {
      if (q.t !== 0 || q.hp <= 0 || (MP.on && (q.pl | 0) !== playersState.CURPL)) continue;
      const ok =
        c === "f" ? q.type === "farm" && q.prog >= 1 && !wkOf(q) : q.prog < 1 || (q.hp < q.max && q.type !== "castle");
      if (!ok) continue;
      const d = (q.x / TS - ux) ** 2 + (q.y / TS - uy) ** 2 + (c === "r" && q.prog >= 1 ? 400 : 0);
      if (d < bd) {
        bd = d;
        best = [q.tx, q.ty];
      }
    }
  }
  if (!best) {
    hudDisplayState.msgS = {
      w: "No trees within reach",
      s: "No rocks within reach",
      g: "No gold within reach",
      f: "No free farm: build one",
      r: "Nothing to build or repair",
    }[c];
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  order({ x: (best[0] + 0.5) * TS, y: (best[1] + 0.5) * TS });
  snd("click");
}
