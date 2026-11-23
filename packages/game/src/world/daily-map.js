import { rngf } from "../core/random.js";
import { mpWorldSync } from "../multiplayer/lobby.js";
import { terrainState } from "./terrain-state.js";

/* ---- daily map ---- */
export function dailyMap() {
  const d = Math.floor(Date.now() / 864e5),
    R = rngf((d * 2654435761) % 4294967296);
  terrainState.SEED = R() * 500;
  terrainState.GPR = {
    fq: 0.009 + R() * 0.007,
    wl: 0.26 + R() * 0.05,
    mt: 0.58 + R() * 0.06,
    rv: 0.008 + R() * 0.006,
    rg: 0.93 + R() * 0.03,
    am: 0.6 + R() * 0.4,
    tr: 0.5 + R() * 0.2,
    gd: 0.8 + R() * 0.5,
    tc: 0.003 + R() * 0.01,
  };
  if (typeof mpWorldSync === "function") mpWorldSync();
}
