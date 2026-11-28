import { roleHooks } from "./role-hooks.js";
import { snd } from "../audio/sound.js";
import { LPL, playersState } from "./players.js";
import { selectionState } from "./selection.js";
import { sessionState } from "./session.js";
import { puff, ring } from "../rendering/effects.js";
import { BTN, BTNH, GRN, GRNH } from "../ui/drawing.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { pill } from "../ui/minimap.js";

/* ================= TOWER UPGRADES (#119) =================
   A finished tower of the build menu (no engine on it) takes ONE upgrade, chosen for good: further reach, faster volleys or fire arrows.
   `up` on the structure (saved whole) says which: 1 reach (+8 tiles, ai/kingdoms.js towerReach), 2 rate (a volley every 1.1 s instead of
   1.7), 3 fire (half as much damage again). Paid and applied inside the simulation (lockstep command 'tu'); the buttons are a row under
   the King's while such a tower is selected. */
export const TUP = ["", "Reach +8", "Faster volleys", "Fire arrows"],
  TUP_G = 80,
  TUP_W = 60;
const mine = (s) =>
  s && s.type === "tower" && s.t === 0 && s.prog >= 1 && s.hp > 0 && !s.weapon && sessionState.structs.includes(s);

export function towerUp0(c) {
  const s = sessionState.structs.find((q) => q.type === "tower" && q.tx === c.x && q.ty === c.y),
    u = c.u | 0,
    R = sessionState.res;
  if (!mine(s) || (s.pl | 0) !== (playersState.CURPL | 0) || s.up || u < 1 || u > 3) return;
  if (R.g < TUP_G || R.w < TUP_W) {
    if ((playersState.CURPL | 0) === LPL()) {
      hudDisplayState.msgS = "Not enough resources";
      hudDisplayState.msgT = 3;
      snd("err");
    }
    return;
  }
  R.g -= TUP_G;
  R.w -= TUP_W;
  s.up = u;
  ring(s.x, s.y, u === 3 ? "#ff8a1f" : "#ffd23c", 22, 240);
  puff(s.x, s.y, u === 3 ? "#ff8a1f" : "#ffe9a0", 14, 90, { z: 3, vz: 2 });
  snd("build", s.x, s.y);
}

export function towerBar(UW, y) {
  const s = selectionState.selB;
  if (!sessionState.started || sessionState.over || !mine(s) || (s.pl | 0) !== LPL()) return 0;
  const w = Math.min(74, (UW - 30) / 3),
    x0 = Math.round(UW / 2 - (w * 3 + 12) / 2);
  if (s.up) {
    pill(x0, y, w * 3 + 12, 15, TUP[s.up], GRN, GRNH, () => {}, null, 0.68, true, false);
    return 17;
  }
  const poor = sessionState.res.g < TUP_G || sessionState.res.w < TUP_W;
  pill(x0, y, w * 3 + 12, 15, "Tower upgrade: 80 gold, 60 wood", BTN, BTNH, () => {}, null, 0.68, false, false);
  for (let u = 1; u <= 3; u++)
    pill(
      x0 + (u - 1) * (w + 6),
      y + 17,
      w,
      15,
      TUP[u],
      BTN,
      BTNH,
      () => roleHooks.towerUp(s, u),
      null,
      0.66,
      false,
      poor,
    );
  return 34;
}
