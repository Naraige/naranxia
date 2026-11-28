import { snd } from "../audio/sound.js";
import { rnd } from "../core/math.js";
import { LPL } from "./players.js";
import { lampWall, T, TS } from "./rules.js";
import { sessionState } from "./session.js";
import { lightingState, lightShade, litAt } from "./light-state.js";
import { hordeDist, smst, wavesState } from "./waves.js";
import { puff } from "../rendering/effects.js";
import { hudDisplayState } from "../ui/hud-state.js";

export { lightingState, litAt };

export function nightTick(dt) {
  wavesState.nightCk -= dt;
  if (wavesState.nightCk > 0) return;
  wavesState.nightCk = 0.5;
  const n0 = wavesState.nightLv;
  if (wavesState.hordeOn) {
    wavesState.hordeD = hordeDist();
    wavesState.nightLv = Math.max(wavesState.nightLv, 1 - smst(60, 260, wavesState.hordeD));
  } else {
    wavesState.hordeD = 1e9;
    if (sessionState.time - wavesState.hordeT > 25) wavesState.nightLv = 0;
  }
  if (n0 < 0.3 && wavesState.nightLv >= 0.3) {
    hudDisplayState.msgS =
      "Night falls - the horde is coming. The villagers shelter in the castle; keep your soldiers in the light!";
    hudDisplayState.msgT = 6;
    snd("night");
  }
}

export function nightSim() {
  if (!sessionState.inGame) return 0;
  return wavesState.hordeOn
    ? wavesState.nightLv
    : wavesState.nightLv * (1 - smst(0, 25, sessionState.time - wavesState.hordeT));
}

const LIGHTR = {
  castle: 16,
  keep: 12,
  tower: 10,
  gate: 5,
  barracks: 5,
  academy: 5,
  market: 5,
  storage: 5,
  house: 4,
  torch: 7,
  forester: 4,
  guild: 5,
  observatory: 6,
  granary: 4,
  bell: 5,
  sanctuary: 7,
  beacon: 12,
  orchard: 3,
  forge: 6,
  embassy: 4,
  warroom: 5,
  sappers: 4,
};

export function lightSources() {
  const L = [],
    /* the Knight of Darkness dims the lights around him, the castle and the keep excepted */
    shade = lightShade();
  for (const s of sessionState.structs) {
    if (s.prog < 1 || s.hp <= 0) continue;
    /* every building is lit (#106), a wall only where it carries a lamp. The reach is counted from the walls of the building, not from its
       middle (a house is 12 tiles wide: 4 tiles from its middle lit nothing but its own floor), and half as far again as before */
    let r = s.type === "wall" ? (lampWall(s) ? 4 : 0) : LIGHTR[s.type] || 4;
    if (s.type === "castle" && s.tier) r = 18;
    if (r) r = r * 1.5 + (s.type === "wall" ? 0 : (s.sz || 2) / 2);
    if (r) L.push([s.x, s.y, r * TS * (shade && s.type !== "castle" && s.type !== "keep" ? shade(s.x, s.y) : 1)]);
  }
  for (const u of sessionState.units)
    if (u.hp > 0 && u.t !== 1 && !u.gar && (u.type === "bannerman" || u.type === "captain"))
      L.push([u.x, u.y, (u.type === "bannerman" ? 5.5 : 4.5) * TS * (shade ? shade(u.x, u.y) : 1)]);
  return L;
}
let darkMsg = -1e9,
  veilMsg = -1e9;

export function darkTick(dt) {
  lightingState.darkT -= dt;
  if (lightingState.darkT > 0) return;
  lightingState.darkT = 0.5;
  if (nightSim() < 0.55) {
    if (lightingState.LITL.length) {
      lightingState.LITL = [];
      for (const u of sessionState.units) u.dk = false;
    }
    return;
  }
  lightingState.LITL = lightSources();
  let hurt = 0,
    held = 0;
  for (const u of sessionState.units) {
    if (u.t !== 0 || u.hp <= 0 || u.gar) {
      u.dk = false;
      continue;
    }
    u.dk = !litAt(u.x, u.y);
    if (u.vbT > sessionState.time - 0.6 && (u.pl | 0) === LPL()) held++;
    if (u.dk) {
      u.hp -= Math.max(0.3, T[u.type].hp * 0.01);
      u.hurt = 0.1;
      hurt++;
      if (Math.random() < 0.35) puff(u.x, u.y, "#4a2a6a", 2, 18, { T: 0.9, z: 0.7, vz: 0.9, g: -0.4, s: 0.1 });
    }
  }
  for (const s of sessionState.structs) {
    if (s.t !== 0 || s.prog < 1 || s.hp <= 0 || LIGHTR[s.type] || lampWall(s)) continue;
    if (!litAt(s.x, s.y) && s.hp > s.max * 0.25) {
      s.hp = Math.max(s.max * 0.25, s.hp - Math.max(0.4, s.max * 0.0015));
      if (Math.random() < 0.2)
        puff(s.x + rnd(-14, 14), s.y + rnd(-14, 14), "#2e1e40", 2, 22, { T: 1.1, z: 1, vz: 0.6, g: -0.3, s: 0.13 });
    }
  }
  if (held && !hurt && sessionState.time - veilMsg > 40) {
    veilMsg = sessionState.time;
    hudDisplayState.msgS = "The dark veil bars the way - only a bannerman or a captain carries light through the night";
    hudDisplayState.msgT = 5;
  }
  if (hurt && sessionState.time - darkMsg > 45) {
    darkMsg = sessionState.time;
    hudDisplayState.msgS = "The darkness hurts! Stay near the castle, towers, torches or a bannerman";
    hudDisplayState.msgT = 5;
  }
}
