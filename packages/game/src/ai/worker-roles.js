import { farmOff } from "./workplaces.js";
import { snd } from "../audio/sound.js";
import { dist } from "../core/math.js";
import { stepF } from "../gameplay/movement.js";
import { LPL, playersState } from "../gameplay/players.js";
import { TS, TW } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { shelOut } from "../gameplay/shelter.js";
import { simulationState } from "../gameplay/simulation.js";
import { leaveSquad } from "../gameplay/squads.js";
import { NAMES } from "../ui/build-catalog.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { gField } from "../world/pathfinding.js";

export const workerRolesState = {
  roleT: 0,
};

/* roles (b builder, r repairer, t terraformer), wanted per player and kept filled while a guild stands:
   role peasants only do that work and wait at the guild when there is none; the others stop doing it on their own.
   Repairers stay out at night to keep the walls up (only lit buildings are repaired in the dark). */
export const ROLE = [
  { b: 0, r: 0, t: 0 },
  { b: 0, r: 0, t: 0 },
];
export const RHAS = [
  { b: 0, r: 0, t: 0 },
  { b: 0, r: 0, t: 0 },
];
const ROLEN = { b: "builder", r: "repairer", t: "terraformer" };

const guildOf = (p, x, y) => {
  let b = null,
    bd = 1e18;
  for (const s of sessionState.structs)
    if (s.t === 0 && s.type === "guild" && s.prog >= 1 && s.hp > 0 && (s.pl | 0) === p) {
      const d = (s.x - x) ** 2 + (s.y - y) ** 2;
      if (d < bd) {
        bd = d;
        b = s;
      }
    }
  return b;
};

function roleOn(u, r) {
  if (u.onF) farmOff(u);
  u.role = r;
  u.job = r === "t" ? "t" : "r";
  u.rk = r === "r" ? 1 : 0;
  u.tl = -1;
  u.o = null;
  u.rb = null;
  u.work = 0;
  u.wk = null;
  leaveSquad(u);
}

function roleOff(u) {
  u.role = null;
  u.job = null;
  u.tl = -1;
  u.rb = null;
  u.rk = 0;
  u.work = 0;
}

export function roleTick(dt) {
  workerRolesState.roleT += dt;
  if (workerRolesState.roleT < 1) return;
  workerRolesState.roleT = 0;
  for (let p = 0; p < (sessionState.CS2 ? 2 : 1); p++) {
    const c0 = p === 1 && sessionState.CS2 ? sessionState.CS2 : sessionState.CS,
      G = guildOf(p, c0.x, c0.y);
    for (const r of ["b", "r", "t"]) {
      const W = G ? ROLE[p][r] : 0,
        cur = sessionState.units.filter((u) => u.t === 0 && u.hp > 0 && (u.pl | 0) === p && u.role === r);
      if (cur.length > W) for (const u of cur.slice(W)) roleOff(u);
      else if (cur.length < W) {
        const C2 = sessionState.units.filter(
          (u) =>
            u.t === 0 &&
            u.type === "peasant" &&
            u.hp > 0 &&
            (u.pl | 0) === p &&
            !u.role &&
            !u.shel &&
            !u.gar &&
            !u.cv &&
            u.job !== "f" &&
            u.job !== "p",
        );
        C2.sort(
          (a, b) =>
            !!a.job - !!b.job ||
            (a.x - G.x) ** 2 + (a.y - G.y) ** 2 - ((b.x - G.x) ** 2 + (b.y - G.y) ** 2) ||
            a.uid - b.uid,
        );
        for (const u of C2.slice(0, W - cur.length)) {
          roleOn(u, r);
          cur.push(u);
        }
      }
      RHAS[p][r] = cur.length;
    }
  }
}

export function guildWait(u, dt) {
  u.gwT = sessionState.time;
  u.work = 0;
  const G = guildOf(u.pl | 0, u.x, u.y);
  if (!G) return;
  if (dist(u.x, u.y, G.x, G.y) > TS * 2.4) stepF(u, gField("s" + G.ty * TW + G.tx, G.tx, G.ty, G.sz), G.x, G.y, dt);
}

export function roleAdj0(r, d) {
  if (!(r in ROLE[0])) return;
  const R0 = ROLE[playersState.CURPL | 0],
    n = Math.max(0, Math.min(30, R0[r] + d));
  R0[r] = n;
  const me = playersState.CURPL === LPL();
  if (me) {
    if (!guildOf(playersState.CURPL | 0, sessionState.CS.x, sessionState.CS.y)) {
      hudDisplayState.msgS = "Build a guild first";
      hudDisplayState.msgT = 3;
      snd("err");
      return;
    }
    hudDisplayState.msgS = n + " " + ROLEN[r] + (n === 1 ? "" : "s") + " wanted";
    hudDisplayState.msgT = 2.5;
    snd("click");
  }
}

/* repairing a finished building costs part of what it was built with (half its price for a full repair) */
const RPF = 0.5,
  RNM = { g: "gold", w: "wood", s: "stone" };

function repCost(b) {
  return b.cost && Object.keys(b.cost).some((k) => b.cost[k] > 0) ? b.cost : { w: 150, s: 100 };
}

export function repTick(b, dt) {
  const add = Math.min(b.max - b.hp, Math.max(20, b.max * 0.03) * dt);
  if (add <= 0) return true;
  const c = repCost(b),
    Rr = playersState.RESP[b.pl | 0];
  b.rpa = b.rpa || {};
  for (const k in c) {
    if (!(c[k] > 0)) continue;
    if ((b.rpa[k] || 0) + (c[k] * RPF * add) / b.max >= 1 && Rr[k] < 1) {
      b.noRep = sessionState.time + 6;
      if ((b.pl | 0) === LPL() && !(b.rpm > sessionState.time)) {
        b.rpm = sessionState.time + 4;
        hudDisplayState.msgS = "Not enough " + RNM[k] + " to repair the " + (NAMES[b.type] || b.type);
        hudDisplayState.msgT = 3;
      }
      return false;
    }
  }
  for (const k in c) {
    if (!(c[k] > 0)) continue;
    b.rpa[k] = (b.rpa[k] || 0) + (c[k] * RPF * add) / b.max;
    if (b.rpa[k] >= 1) {
      const n = Math.floor(b.rpa[k]);
      Rr[k] -= n;
      b.rpa[k] -= n;
    }
  }
  b.hp = Math.min(b.max, b.hp + add);
  return true;
}

export function repair0(sid) {
  const s = sessionState.structs.find((q) => q.sid === sid && q.t === 0 && (q.pl | 0) === (playersState.CURPL | 0));
  if (!s) return;
  const me = playersState.CURPL === LPL();
  if (s.hp >= s.max && s.prog >= 1) {
    if (me) {
      hudDisplayState.msgS = (NAMES[s.type] || "It") + " is not damaged";
      hudDisplayState.msgT = 2;
    }
    return;
  }
  const P = sessionState.units
      .filter(
        (u) =>
          u.t === 0 &&
          u.type === "peasant" &&
          u.hp > 0 &&
          (!u.gar || u.shel) &&
          (u.pl | 0) === (playersState.CURPL | 0),
      )
      .sort((a, b) => (b.rb === s) - (a.rb === s) || dist(a.x, a.y, s.x, s.y) - dist(b.x, b.y, s.x, s.y)),
    n = Math.min(P.length, s.sz >= 2 ? 4 : 2);
  for (let i = 0; i < n; i++) {
    const u = P[i];
    if (u.shel) shelOut(u, u.shel, false);
    u.job = "r";
    u.rb = s;
    u.rk = 1;
    u.o = null;
    u.tl = -1;
    if (simulationState.shelOn) u.nso = 1;
  }
  s.noRep = 0;
  if (me) {
    hudDisplayState.msgS = n
      ? n +
        " peasant" +
        (n > 1 ? "s" : "") +
        " sent to repair the " +
        (NAMES[s.type] || "building") +
        " (uses resources)"
      : "No peasants available";
    hudDisplayState.msgT = 3;
  }
  snd("order");
}
