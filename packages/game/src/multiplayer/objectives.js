import { snd } from "../audio/sound.js";
import { playersState } from "../gameplay/players.js";
import { sessionState } from "../gameplay/session.js";
import { statisticsState } from "../gameplay/statistics.js";
import { TC } from "../i18n/language.js";
import { MP } from "./session.js";
import { hudDisplayState } from "../ui/hud-state.js";

export const objectivesState = {
  SPKV: 0,
};

export const SPK = new Map();
/* ================= CO-OP SHARED GOALS (#11) =================
   Two goals run at the same time in a co-op game: reach wave 5, 10, 15... and slay 150, 375... zombies together. Reaching one pays BOTH players.
   Pure simulation (checked once per update from waveN and kills, which are equal on both machines), the progress is OBJ, saved with the game. */
export function objReset() {
  statisticsState.OBJ = { w: 1, k: 1 };
}

const objWave = () => statisticsState.OBJ.w * 5,
  objKills = () => Math.round(150 * statisticsState.OBJ.k * (1 + 0.25 * statisticsState.OBJ.k));

export function objTick() {
  if (!MP.on || sessionState.over || !sessionState.inGame) return;
  if (sessionState.waveN >= objWave()) {
    const k = statisticsState.OBJ.w,
      g = 150 * k,
      w = 100 * k,
      s = 100 * k;
    statisticsState.OBJ.w++;
    for (const R of playersState.RESP) {
      R.g += g;
      R.w += w;
      R.s += s;
    }
    hudDisplayState.msgS =
      "Co-op goal: wave " + k * 5 + " reached! Both players get +" + g + " gold, +" + w + " wood, +" + s + " stone";
    hudDisplayState.msgT = 8;
    if (typeof snd === "function") snd("click");
  }
  if (sessionState.kills >= objKills()) {
    const k = statisticsState.OBJ.k,
      g = 120 * k,
      f = 50 * k;
    statisticsState.OBJ.k++;
    for (const R of playersState.RESP) {
      R.g += g;
      R.f = (R.f || 0) + f;
    }
    hudDisplayState.msgS = "Co-op goal: zombies slain together! Both players get +" + g + " gold, +" + f + " food";
    hudDisplayState.msgT = 8;
  }
}

export function objBar(UW, y) {
  if (!MP.on || sessionState.over || !sessionState.inGame) return 0;
  const a = "Co-op goals: wave " + objWave() + " (now " + sessionState.waveN + ")",
    b = "  /  zombies slain " + objKills() + " (now " + sessionState.kills + ")";
  TC(a + b, UW / 2, y + 1, "#9fe3ff", 0.72);
  return 13;
}
