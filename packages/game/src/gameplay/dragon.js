import { LPL } from "./players.js";
import { TS } from "./rules.js";
import { sessionState } from "./session.js";
import { drBallDmg, drBallRad, drFire, drRad, drRoarT } from "./dragon-skills.js";
import { SW, swNear, swSlow, swSplash } from "./swarm.js";

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
  /* the dragon can be hurt (#72): the horde claws it when it flies or stands low over them, spitters reach it higher up */
  hp: 220 /* at level 1; +25 a level, +10 % per Growth skill */,
  low: 600 /* under this height over the ground (hundredths of a tile) claws reach it */,
  claw: 14 /* life lost per second with the horde under it, +3 % a wave */,
  clawR: TS * 4.5,
  spitH: 1500,
  spitR: TS * 11,
  spit: 7 /* per spitter in reach, three at most */,
  calm: 4 /* seconds without a wound before it mends */,
  mend: 5 /* life per second, three times that landed by its castle */,
  down: 20 /* seconds out of the fight when it falls */,
  roost: 12 /* ... with a sanctuary standing (#79): the dragon's roost, where it also mends as fast as by its castle */,
  markT: 12 /* seconds the King's mark lasts (#80), its radius, what the fire gains inside it, the wait before the next */,
  markR: TS * 9,
  markK: 1.5,
  markCool: 30,
};
/* a finished sanctuary within 25 tiles (or any, with r = 0) */
function roost(x, y, r) {
  for (const s of sessionState.structs)
    if (s.t === 0 && s.type === "sanctuary" && s.hp > 0 && s.prog >= 1) {
      if (!r) return true;
      if ((s.x - x) * (s.x - x) + (s.y - y) * (s.y - y) < r * r) return true;
    }
  return false;
}
export const dragonMaxHp = (d) => Math.round((DRAGON.hp + 25 * ((d.lv || 1) - 1)) * (1 + 0.1 * (d.u ? d.u[5] : 0)));
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
    g: 0 /* height over the ground under it, hundredths of a tile (sent by the rider) */,
    hp: DRAGON.hp,
    ht: 0 /* seconds since the last wound */,
    dn: 0 /* seconds it still lies out of the fight */,
    hx: Math.round(c.x) /* its castle: where it mends fastest and where it comes back */,
    hy: Math.round(c.y + c.rad + TS * 9),
    falls: 0,
    mk: null /* the King's mark: [x, y], seconds left, seconds before the next */,
    mt: 0,
    mc: 0,
  };
}

/* the commands of the rider: 'dg' position and breath, 'dk' level / skills / look, 'db' a fireball, 'dr' a roar */
export function dragonSet0(c) {
  if (c.k === "dk") return dragonSkills0(c);
  if (c.k === "db") return dragonBall0(c);
  if (c.k === "dr") return dragonRoar0(c);
  if (c.k === "km") return kingMark0(c);
  return dragonPos0(c);
}

function dragonSkills0(c) {
  const d = sessionState.DRG;
  if (!d) return;
  const m0 = dragonMaxHp(d);
  d.lv = Math.max(1, Math.min(20, c.lv | 0));
  d.u = Z9.map((_, i) => Math.max(0, Math.min(9, (c.u && c.u[i]) | 0)));
  d.lk = Math.max(0, Math.min(5, c.lk | 0));
  d.fc = Math.max(0, Math.min(6, c.fc | 0));
  /* a level or a Growth skill raises its life by what the maximum gained */
  if (d.hp !== undefined) d.hp = Math.min(dragonMaxHp(d), d.hp + Math.max(0, dragonMaxHp(d) - m0));
}

function dragonBall0(c) {
  const d = sessionState.DRG;
  if (!d || !d.u || d.u[3] < 1 || d.cb > 0 || d.bl.length > 8 || d.dn > 0) return;
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

/* the King marks the ground where he stands (#80): for a while the dragon's breath and fireballs burn half again as hard there */
function kingMark0(c) {
  const d = sessionState.DRG;
  if (!d || d.mc > 0) return;
  d.mk = [c.x | 0, c.y | 0];
  d.mt = DRAGON.markT;
  d.mc = DRAGON.markCool;
}

function dragonRoar0() {
  const d = sessionState.DRG;
  if (!d || !d.u || d.u[4] < 1 || d.cr > 0 || d.dn > 0) return;
  d.cr = DRAGON.roarCool;
  d.rt = drRoarT(d.u);
  d.rx = d.x;
  d.ry = d.y;
}

/* 'dg' command: whole numbers only. x, y world units; a height above sea in hundredths of a tile; w yaw, p pitch in thousandths of a
   radian; f breath on; fl in flight; ax, ay where the breath lands */
function dragonPos0(c) {
  const d = sessionState.DRG;
  if (!d || d.dn > 0) return; /* down: it lies where the simulation laid it */
  d.x = c.x | 0;
  d.y = c.y | 0;
  d.a = c.a | 0;
  d.g = Math.max(0, c.g | 0);
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
  if (d.mt > 0 && d.mk && (x - d.mk[0]) * (x - d.mk[0]) + (y - d.mk[1]) * (y - d.mk[1]) < DRAGON.markR * DRAGON.markR)
    dm *= DRAGON.markK;
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

/* what hurts the dragon, how it mends, and its fall (#72). Old saves have no life yet: it starts whole. */
function wounds(d, dt) {
  const max = dragonMaxHp(d);
  if (d.hp === undefined) {
    d.hp = max;
    d.ht = d.dn = d.g = d.falls = 0;
    d.hx = d.x;
    d.hy = d.y;
  }
  if (d.dn > 0) {
    d.dn = Math.max(0, d.dn - dt);
    if (d.dn === 0) d.hp = Math.round(max * 0.6);
    return;
  }
  let hit = 0;
  if (d.g < DRAGON.low) {
    let foe = SW.n > 0 && swNear(d.x, d.y, DRAGON.clawR) >= 0;
    if (!foe)
      for (const z of sessionState.units)
        if (
          z.t === 1 &&
          z.hp > 0 &&
          (z.x - d.x) * (z.x - d.x) + (z.y - d.y) * (z.y - d.y) < DRAGON.clawR * DRAGON.clawR
        ) {
          foe = true;
          break;
        }
    if (foe) hit += DRAGON.claw * (1 + 0.03 * sessionState.waveN);
  }
  if (d.g < DRAGON.spitH) {
    let n = 0;
    for (const z of sessionState.units)
      if (z.t === 1 && z.hp > 0 && z.type === "acid" && n < 3) {
        const dx = z.x - d.x,
          dy = z.y - d.y;
        if (dx * dx + dy * dy < DRAGON.spitR * DRAGON.spitR) n++;
      }
    hit += n * DRAGON.spit;
  }
  if (hit > 0) {
    d.hp -= hit * dt;
    d.ht = 0;
    if (d.hp <= 0) {
      /* it falls: carried back before its castle, out of the fight for a while */
      d.hp = 0;
      d.dn = roost(0, 0, 0) ? DRAGON.roost : DRAGON.down;
      d.falls = (d.falls | 0) + 1;
      d.f = d.fl = 0;
      d.x = d.hx;
      d.y = d.hy;
      d.a = d.g = 0;
      d.bl.length = 0;
    }
    return;
  }
  d.ht += dt;
  if (d.ht > DRAGON.calm && d.hp < max) {
    const home =
      !d.fl &&
      ((d.x - d.hx) * (d.x - d.hx) + (d.y - d.hy) * (d.y - d.hy) < TS * 25 * (TS * 25) || roost(d.x, d.y, TS * 25));
    d.hp = Math.min(max, d.hp + DRAGON.mend * (home ? 3 : 1) * dt);
  }
}

export function dragonTick(dt) {
  const d = sessionState.DRG;
  if (!d) return;
  const u = d.u || Z9,
    lv = d.lv || 1;
  d.mt = Math.max(0, (d.mt || 0) - dt);
  d.mc = Math.max(0, (d.mc || 0) - dt);
  d.cb = Math.max(0, (d.cb || 0) - dt);
  d.cr = Math.max(0, (d.cr || 0) - dt);
  /* the roar: the horde in its disc walks slower while it lasts */
  if (d.rt > 0) {
    d.rt = Math.max(0, d.rt - dt);
    swSlow(d.rx, d.ry, DRAGON.roarRad, DRAGON.roarSlow);
    /* the big ones (bosses, brutes: units, not swarm bodies) are slowed too: marked for a moment, movement.js reads the mark */
    const R2 = DRAGON.roarRad * DRAGON.roarRad;
    for (const z of sessionState.units)
      if (z.t === 1 && z.hp > 0 && (z.x - d.rx) * (z.x - d.rx) + (z.y - d.ry) * (z.y - d.ry) < R2)
        z.rsl = sessionState.time + 0.3;
  } else swSlow(0, 0, 0, 1);
  if (sessionState.over) return;
  wounds(d, dt);
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
  if (!d.f || d.dn > 0) return;
  const dm = DRAGON.dps * (1 + 0.03 * sessionState.waveN) * drFire(u, lv) * dt;
  burn(d.ax, d.ay, DRAGON.rad * drRad(u), dm, DRAGON.cap, d);
}
