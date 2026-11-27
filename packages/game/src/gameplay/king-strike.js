import { snd } from "../audio/sound.js";
import { T, TS } from "./rules.js";
import { sessionState } from "./session.js";
import { SW, swSplash } from "./swarm.js";
import { puff, vflash } from "../rendering/effects.js";
import { gh } from "../world/terrain-queries.js";

/* wired through gameplay/role-hooks.js (core/roles.js), like the dragon, so the command module does not import the swarm */
/* ---- the King's own blow (#97) ----
   In the King view the player strikes himself: the King turns to the point given and sweeps what stands within a tile and a half in front
   of him, the horde's bodies (four at most) and the big ones alike, for a quarter more than his usual blow. His ordinary cooldown rules it, so
   clicking faster gains nothing; when he is left alone he still fights by himself as before. */
export function kingStrikeSim(k, x, y) {
  if (!k || k.hp <= 0 || k.kdead || k.cd > 0) return false;
  const d = T.king,
    fa = Math.atan2(x - k.x, y - k.y),
    px = k.x + Math.sin(fa) * TS * 1.3,
    py = k.y + Math.cos(fa) * TS * 1.3,
    R = TS * 1.7,
    dm = d.dmg * 1.25;
  k.face = fa;
  k.atk = 0.25;
  k.cd = d.cdt;
  let n = SW.n ? swSplash(px, py, R, dm, 4) : 0;
  for (const z of sessionState.units)
    if (z.t === 1 && z.hp > 0 && (z.x - px) * (z.x - px) + (z.y - py) * (z.y - py) < R * R) {
      z.hp -= dm;
      z.hurt = 0.25;
      n++;
    }
  snd("sword", k.x, k.y);
  puff(px, py, "#ffe9a0", 6, 110, { T: 0.22, z: 0.9, vz: 0.6, g: 0, s: 0.09 });
  if (n) vflash(px, py, gh(px / TS, py / TS) + 0.9, 1.4, [1, 0.92, 0.7], 0.14);
  return true;
}
