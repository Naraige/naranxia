import { sessionState } from "./session.js";
import { BOSSN } from "../ai/wave-boss.js";

/* ================= NEXT WAVE PREVIEW (read only) =================
   Mirrors the conditions of waves.js (wave0 / wave) for wave n = waveN + 1. It never changes the simulation or any state:
   the HUD just calls wavePreview() to show what the next horde holds and which event comes with it. Keep in step with waves.js. */
export function wavePreview(n) {
  n = n || (sessionState.waveN | 0) + 1;
  const kinds = ["Husks", "Zombies"];
  if (n >= 3) kinds.push("Runners");
  if (n % 5 === 0 || n >= 12) kinds.push("Brutes");
  if (n >= 5) kinds.push("Bombers");
  if (n >= 10) kinds.push("Acid spitters");
  if (n >= 15) kinds.push("Miners");
  const ev = [];
  if (n % 5 === 3 && n >= 3) ev.push("Blood Moon");
  if (n >= 10 && n % 10 === 0) ev.push("Boss");
  if (n >= 7 && n % 9 === 7) ev.push("Wolf pack");
  if (n >= 8 && n % 11 === 8) ev.push("Eclipse");
  if (n % 4 === 2) ev.push("Caravan");
  if (n % 6 === 4) ev.push("Rebel envoys");
  else if (n % 7 === 5) ev.push("Meteor shower");
  return { n, kinds, ev, boss: n >= 10 && n % 10 === 0 ? BOSSN[(n / 10 - 1) % BOSSN.length] : null };
}
