import { diagnosticsState } from "../debug/diagnostics.js";
import { sessionState } from "../gameplay/session.js";
import { popCap, popUsed } from "../gameplay/economy.js";
import { LPL } from "../gameplay/players.js";
import { wavesState } from "../gameplay/waves.js";
import { T_, tw } from "../i18n/language.js";
import { MP } from "../multiplayer/session.js";
import { BTN, BTNH, CHAT, frame } from "./drawing.js";
import { barX } from "./hud-state.js";
import { pill } from "./minimap.js";

/* ===== contextual first-game hints: one line under the top bar, never blocking, each shown once ever (dk_hint_<id>).
   They only READ game state and use real time (performance.now), so the simulation is untouched. ===== */
const HINTS = {
  pop: [
    "Population limit reached: build houses in the Town menu",
    () => {
      const p = LPL();
      return popUsed(p) >= popCap(p);
    },
  ],
  idle: ["Idle peasants? Press [.] to select them, then right-click a resource", () => idleFor >= 20],
  wave: [
    "A wave is about to start: gather your troops near the castle and walls",
    () => !wavesState.waveOn && sessionState.waveT <= 20 && sessionState.waveN <= 1,
  ],
};
const hintSeen = (id) => {
  try {
    return localStorage.getItem("dk_hint_" + id) === "1";
  } catch {
    return false;
  }
};
const hintMark = (id) => {
  try {
    localStorage.setItem("dk_hint_" + id, "1");
  } catch {
    /* If storage is unavailable, the hint may appear again next launch. */
  }
};
let hintCur = null,
  hintT0 = 0,
  idleFor = 0,
  idleAt = 0;

export function hintBar(UW, y) {
  if (sessionState.over || MP.on || diagnosticsState.DEVU || !sessionState.inGame || !sessionState.started) return 0;
  const now = performance.now();
  {
    const st = sessionState.time;
    if (Math.abs(st - idleAt) > 5) idleFor = 0;
    const dt = Math.max(0, Math.min(1, st - idleAt));
    idleAt = st;
    let idle = false;
    for (const u of sessionState.units)
      if (
        u.t === 0 &&
        u.type === "peasant" &&
        u.hp > 0 &&
        !u.shel &&
        !u.job &&
        !u.o &&
        !u.carry &&
        (u.pl | 0) === LPL()
      ) {
        idle = true;
        break;
      }
    idleFor = idle ? idleFor + dt : 0;
  }
  if (hintCur && now - hintT0 > 9000) {
    hintMark(hintCur);
    hintCur = null;
  }
  if (!hintCur) {
    for (const id in HINTS)
      if (!hintSeen(id) && HINTS[id][1]()) {
        hintCur = id;
        hintT0 = now;
        break;
      }
  }
  if (!hintCur) return 0;
  const txt = HINTS[hintCur][0],
    sw = 52,
    w = Math.min(UW - 12, tw(txt, 0.85) + sw + 26),
    x = barX(UW, w, y, 20);
  frame(x, y, w, 20, CHAT, 8);
  T_(txt, x + 9, y + 6, "#ffffff", 0.85);
  pill(
    x + w - sw - 6,
    y + 2,
    sw,
    16,
    "Got it",
    BTN,
    BTNH,
    () => {
      hintMark(hintCur);
      hintCur = null;
    },
    null,
    0.75,
  );
  return 24;
}
