import { LPL } from "./players.js";
import { TS } from "./rules.js";
import { sessionState } from "./session.js";
import { drBallDmg, drBallRad, drFire, drRad, drRoarT } from "./dragon-skills.js";
import { SW, swSlow, swSplash } from "./swarm.js";

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
  flight: 0.7 /* seconds a fireball flies before it bursts */,
  ballCool: 6,
  roarCool: 18,
  roarRad: TS * 36,
  roarSlow: 0.35 /* walking speed of the horde in the roar */,
  ballCap: 70,
};
const Z9 = [0, 0, 0, 0, 0, 0, 0, 0, 0];

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
    lv: 1 /* level, skill counts and look of the rider (command 'dk') */,
    u: Z9.slice(),
    lk: 0,
    fc: 0,
    cb: 0 /* seconds before the next fireball and the next roar */,
    cr: 0,
    rt: 0 /* seconds the roar still slows the horde, and where it was roared */,
    rx: 0,
    ry: 0,
    bl: [] /* fireballs in flight: [target x, target y, seconds flown, from x, from y, from height] */,
  };
}

/* the commands of the rider: 'dg' position and breath, 'dk' level / skills / look, 'db' a fireball, 'dr' a roar */
export function dragonSet0(c) {
  if (c.k === "dk") return dragonSkills0(c);
  if (c.k === "db") return dragonBall0(c);
  if (c.k === "dr") return dragonRoar0(c);
  return dragonPos0(c);
}

function dragonSkills0(c) {
  const d = sessionState.DRG;
  if (!d) return;
  d.lv = Math.max(1, Math.min(20, c.lv | 0));
  d.u = Z9.map((_, i) => Math.max(0, Math.min(9, (c.u && c.u[i]) | 0)));
  d.lk = Math.max(0, Math.min(5, c.lk | 0));
  d.fc = Math.max(0, Math.min(6, c.fc | 0));
}

function dragonBall0(c) {
  const d = sessionState.DRG;
  if (!d || !d.u || d.u[3] < 1 || d.cb > 0 || d.bl.length > 8) return;
  d.cb = DRAGON.ballCool;
  let ax = (c.ax | 0) - d.x,
    ay = (c.ay | 0) - d.y;
  const l = Math.hypot(ax, ay);
  if (l > DRAGON.reach * 1.6) {
    ax = Math.round((ax / l) * DRAGON.reach * 1.6);
    ay = Math.round((ay / l) * DRAGON.reach * 1.6);
  }
  d.bl.push([d.x + ax, d.y + ay, 0, d.x, d.y, d.a]);
}

function dragonRoar0() {
  const d = sessionState.DRG;
  if (!d || !d.u || d.u[4] < 1 || d.cr > 0) return;
  d.cr = DRAGON.roarCool;
  d.rt = drRoarT(d.u);
  d.rx = d.x;
  d.ry = d.y;
}

/* 'dg' command: whole numbers only. x, y world units; a height above sea in hundredths of a tile; w yaw, p pitch in thousandths of a
   radian; f breath on; fl in flight; ax, ay where the breath lands */
function dragonPos0(c) {
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

/* everything the burst of a fireball or the breath does to the bodies standing in a disc */
function burn(x, y, R, dm, cap, d) {
  if (SW.n) d.kills += swSplash(x, y, R, dm, cap);
  for (const z of sessionState.units)
    if (z.t === 1 && z.hp > 0) {
      const dx = z.x - x,
        dy = z.y - y,
        q = dx * dx + dy * dy;
      if (q < R * R) {
        z.hp -= dm * (1 - (Math.sqrt(q) / R) * 0.5);
        z.hurt = 0.25;
      }
    }
}

export function dragonTick(dt) {
  const d = sessionState.DRG;
  if (!d) return;
  const u = d.u || Z9,
    lv = d.lv || 1;
  d.cb = Math.max(0, (d.cb || 0) - dt);
  d.cr = Math.max(0, (d.cr || 0) - dt);
  /* the roar: the horde in its disc walks slower while it lasts */
  if (d.rt > 0) {
    d.rt = Math.max(0, d.rt - dt);
    swSlow(d.rx, d.ry, DRAGON.roarRad, DRAGON.roarSlow);
  } else swSlow(0, 0, 0, 1);
  if (sessionState.over) return;
  /* fireballs burst where they were thrown */
  if (d.bl && d.bl.length) {
    const wv = 1 + 0.03 * sessionState.waveN;
    for (let i = d.bl.length - 1; i >= 0; i--) {
      const b = d.bl[i];
      b[2] += dt;
      if (b[2] < DRAGON.flight) continue;
      d.bl.splice(i, 1);
      burn(b[0], b[1], TS * drBallRad(u), drBallDmg(u) * wv, DRAGON.ballCap, d);
    }
  }
  if (!d.f) return;
  const dm = DRAGON.dps * (1 + 0.03 * sessionState.waveN) * drFire(u, lv) * dt;
  burn(d.ax, d.ay, DRAGON.rad * drRad(u), dm, DRAGON.cap, d);
}
