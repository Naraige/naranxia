import { LPL } from "./players.js";
import { TS } from "./rules.js";
import { sessionState } from "./session.js";
import { SW, swSplash } from "./swarm.js";

/* ---- the Dragon role (co-op, v101) ----
   Before a co-op game each player chooses Castle or Dragon. The dragon rider founds nothing: he is player 2 without a castle and flies a
   dragon over his partner's kingdom. His own machine flies it (no delay in the hands) and sends where it is and where its breath lands a
   few times a second as a lockstep command ('dg'): both machines store the same whole numbers at the same tick, so the simulation stays
   the same on both. The simulation only burns what stands in the breath (dragonTick). `sessionState.DRG` is saved (SAVA) and so
   survives a resync. The horde does not attack the dragon. */
export const DRAGON = {
  dps: 85 /* damage a second to everything in the breath */,
  rad: TS * 2.6,
  reach: TS * 18 /* the breath cannot land further than this from the dragon */,
  cap: 18 /* swarm bodies burnt per tick at most */,
};

/* is the local player the dragon rider? (player 2 of a game with a dragon; DRGDEV lets a test fly it alone) */
export const dragonMine = () => !!sessionState.DRG && (LPL() === 1 || !!sessionState.DRGDEV);

/* the dragon starts on the ground in front of the castle door side */
export function mkDragon(c) {
  return {
    x: Math.round(c.x),
    y: Math.round(c.y + c.rad + TS * 9),
    a: 0,
    w: 0,
    p: 0,
    f: 0,
    fl: 0,
    ax: 0,
    ay: 0,
    kills: 0,
  };
}

/* 'dg' command: whole numbers only. x, y world units; a height above sea in hundredths of a tile; w yaw, p pitch in thousandths of a
   radian; f breath on; fl in flight; ax, ay where the breath lands */
export function dragonSet0(c) {
  const d = sessionState.DRG;
  if (!d) return;
  d.x = c.x | 0;
  d.y = c.y | 0;
  d.a = c.a | 0;
  d.w = c.w | 0;
  d.p = c.p | 0;
  d.fl = c.fl ? 1 : 0;
  d.f = c.f ? 1 : 0;
  let ax = (c.ax | 0) - d.x,
    ay = (c.ay | 0) - d.y;
  const l = Math.hypot(ax, ay);
  if (l > DRAGON.reach) {
    ax = Math.round((ax / l) * DRAGON.reach);
    ay = Math.round((ay / l) * DRAGON.reach);
  }
  d.ax = d.x + ax;
  d.ay = d.y + ay;
}

export function dragonTick(dt) {
  const d = sessionState.DRG;
  if (!d || !d.f || sessionState.over) return;
  const dm = DRAGON.dps * (1 + 0.03 * sessionState.waveN) * dt,
    R = DRAGON.rad;
  if (SW.n) d.kills += swSplash(d.ax, d.ay, R, dm, DRAGON.cap);
  for (const z of sessionState.units)
    if (z.t === 1 && z.hp > 0) {
      const dx = z.x - d.ax,
        dy = z.y - d.ay,
        q = dx * dx + dy * dy;
      if (q < R * R) {
        z.hp -= dm * (1 - (Math.sqrt(q) / R) * 0.5);
        z.hurt = 0.25;
      }
    }
}
