import { snd } from "../audio/sound.js";
import { dist } from "../core/math.js";
import { ALERTS, royalOf } from "./economy.js";
import { mkU, spawnPos } from "./entities.js";
import { LPL } from "./players.js";
import { TS } from "./rules.js";
import { sel } from "./selection.js";
import { sessionState } from "./session.js";
import { puff } from "../rendering/effects.js";
import { hudDisplayState } from "../ui/hud-state.js";

const FRM_COLS = 5;

export function slotPos(C, j) {
  const f = [Math.sin(C.fm || 0), Math.cos(C.fm || 0)],
    p = [f[1], -f[0]];
  if (C.type === "king" && j >= 2) {
    /* the soldiers he called (kingRally): rows of five AHEAD of him, the way he looks. Behind him they stood between the player and his
       King in the third-person view */
    const q = j - 2,
      row = (q / FRM_COLS) | 0,
      col = (q % FRM_COLS) - 2,
      a = C.face || 0,
      fx = Math.sin(a),
      fy = Math.cos(a);
    return { x: C.x + fx * (95 + row * 44) + fy * col * 46, y: C.y + fy * (95 + row * 44) - fx * col * 46 };
  }
  if (C.type === "king") {
    const s = j ? 1 : -1;
    return { x: C.x + p[0] * s * 30 - f[0] * 8, y: C.y + p[1] * s * 30 - f[1] * 8 };
  }
  const row = j >= FRM_COLS ? 1 : 0,
    col = (j % FRM_COLS) - 2;
  return { x: C.x - f[0] * (34 + row * 30) + p[0] * col * 26, y: C.y - f[1] * (34 + row * 30) + p[1] * col * 26 };
}

/* the King's orders in the field (#116). on: the soldiers within 16 tiles who follow nobody (12 at most, the nearest first) fall in behind
   him and march with him, like a captain's squad. off: they stop where they stand and hold that ground. Inside the simulation (lockstep
   command 'ko'); the squad is on the units, so it is saved and survives a resync */
export const RALLY_N = 12;
export function kingRally(K, on) {
  if (!K || K.hp <= 0) return 0;
  K.sq = (K.sq || []).filter((u) => u.hp > 0);
  if (!on) {
    const out = K.sq.filter((u) => !u.rg);
    for (const u of out) {
      u.cap = null;
      u.o = null;
      u.stn = "hold";
    }
    K.sq = K.sq.filter((u) => u.rg);
    return out.length;
  }
  const have = K.sq.filter((u) => !u.rg).length,
    cand = sessionState.units
      .filter(
        (u) =>
          u.t === 0 &&
          (u.pl | 0) === (K.pl | 0) &&
          !u.cap &&
          !u.rg &&
          !u.gar &&
          u.hp > 0 &&
          u.type !== "peasant" &&
          u.type !== "captain" &&
          u.type !== "king" &&
          u.type !== "cannon" &&
          dist(u.x, u.y, K.x, K.y) < TS * 16,
      )
      .sort((a, b) => dist(a.x, a.y, K.x, K.y) - dist(b.x, b.y, K.x, K.y) || a.uid - b.uid);
  let n = 0;
  for (const u of cand) {
    if (have + n >= RALLY_N) break;
    K.sq.push(u);
    u.cap = K;
    u.o = null;
    u.stn = "agg";
    n++;
  }
  return n;
}

export function leaveSquad(u) {
  if (u.cap) {
    if (u.cap.sq) u.cap.sq = u.cap.sq.filter((f) => f !== u);
    u.cap = null;
  }
}

export function royalSpawn(nu, b, quiet) {
  const pl = nu.pl | 0;
  if (nu.type === "king") {
    nu.sq = [];
    nu.fm = Math.PI;
    for (const q of sessionState.units)
      if (q.t === 0 && q.type === "guard" && q.hp > 0 && (q.pl | 0) === pl && !q.cap && nu.sq.length < 2) {
        q.cap = nu;
        q.rg = 1;
        nu.sq.push(q);
      }
    while (nu.sq.length < 2) {
      const p = spawnPos(b),
        q = mkU(0, "guard", p.x, p.y);
      q.cap = nu;
      q.rg = 1;
      sessionState.units.push(q);
      nu.sq.push(q);
    }
    if (pl === LPL() && !quiet) {
      sessionState.bannerT = 4.5;
      sessionState.bannerS = "LONG LIVE KING NARAIGE";
      sessionState.bannerS2 = "King Naraige rides out with his royal guard";
      snd("fanfare");
    }
  } else {
    const K = royalOf(pl);
    nu.rg = 1;
    if (K) {
      if (!K.sq) K.sq = [];
      if (K.sq.length < 2) {
        nu.cap = K;
        K.sq.push(nu);
      }
    }
  }
}

export function kingFell(u) {
  if (u.kdead) return;
  u.kdead = 1;
  if (u.sq) {
    u.sq.forEach((f) => {
      f.cap = null;
    });
    u.sq = null;
  }
  if ((u.pl | 0) === LPL()) {
    sessionState.bannerT = 5;
    sessionState.bannerS = "KING NARAIGE HAS FALLEN";
    sessionState.bannerS2 = u.conv ? "...and he rises among the dead" : "His royal guard fights on";
    snd("horn");
    ALERTS.push({ x: u.x, y: u.y, t: 6 });
  }
}

function disband(C) {
  if (C.sq)
    C.sq.forEach((f) => {
      f.cap = null;
    });
  C.sq = null;
}

export let groupSel = function groupSel() {
  const S = sel(),
    C = S.find((u) => u.type === "captain");
  if (!C) {
    hudDisplayState.msgS = "Select a captain first";
    hudDisplayState.msgT = 3;
    return;
  }
  if (!C.sq) C.sq = [];
  const free = (u) =>
    u.t === 0 && !u.cap && u.type !== "peasant" && u.type !== "captain" && u.type !== "king" && !u.rg && u.hp > 0;
  let cand = S.filter(free);
  if (!cand.length)
    cand = sessionState.units
      .filter((u) => free(u) && dist(u.x, u.y, C.x, C.y) < TS * 16)
      .sort((a, b) => dist(a.x, a.y, C.x, C.y) - dist(b.x, b.y, C.x, C.y));
  for (const u of cand) {
    if (C.sq.length >= 10) break;
    C.sq.push(u);
    u.cap = C;
    u.o = null;
    u.sel = true;
  }
  hudDisplayState.msgS = "Squad: " + C.sq.length + " / 10 soldiers";
  hudDisplayState.msgT = 3;
  if (C.sq.length) puff(C.x, C.y, "#ffd23c", 8, 50);
};

export let ungroupSel = function ungroupSel() {
  let n = 0;
  for (const C of sel())
    if (C.type === "captain" && C.sq && C.sq.length) {
      n += C.sq.length;
      disband(C);
    }
  if (n) {
    hudDisplayState.msgS = "Squad disbanded";
    hudDisplayState.msgT = 3;
  }
};

/* the posts of the two royal guards: beside and a little behind the King. Since the bodies are 1.75 times larger (v101) the old posts (27
   and 20 units, two thirds of a tile) stood inside him and the guards blocked his way: now a tile and a half to the side, one tile back. */
const RGS = 62,
  RGF = -40;

export function royalPost(K, j, fa) {
  const f = [Math.sin(fa), Math.cos(fa)],
    p = [f[1], -f[0]],
    s = j ? 1 : -1;
  return { x: K.x + p[0] * s * RGS + f[0] * RGF, y: K.y + p[1] * s * RGS + f[1] * RGF };
}

export function setGroupSelHandler(handler) {
  groupSel = handler;
}

export function setUngroupSelHandler(handler) {
  ungroupSel = handler;
}
