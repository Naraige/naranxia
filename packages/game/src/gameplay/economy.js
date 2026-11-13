import { snd } from "../audio/sound.js";
import { REALR } from "../core/random.js";
import { ach } from "./achievements.js";
import { build } from "./construction.js";
import { HOMEC, LPL, playersState, setTier } from "./players.js";
import {
  C,
  CSTONE,
  CWOOD,
  POPBASE,
  POPHOUSE,
  POPMAX,
  RN2,
  ROTT,
  RPRE,
  rxLock,
  rxPair,
  rxPre,
  RS,
  RS2,
  RT2,
  SH,
  T,
  TRAIN,
  TW,
  UPC,
} from "./rules.js";
import { curB, selectionState } from "./selection.js";
import { qNote } from "./quests.js";
import { sessionState } from "./session.js";
import { repairB } from "../multiplayer/commands.js";
import { MP } from "../multiplayer/session.js";
import { puff } from "../rendering/effects.js";
import { icoPart } from "../rendering/pixel-icons.js";
import { buildStructMesh, refreshNear } from "../rendering/structures.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { occ } from "../world/terrain-state.js";

export const economyState = {
  priceT: 0,
  alertT: 0,
  farmT: 0,
};

/* ================= MARKET: sell wood / stone for gold, buy them back; prices move with every trade and drift back ================= */
export const PBASE = { w: 1, s: 1.3, f: 0.8 },
  PRICE = { w: 1, s: 1.3, f: 0.8 },
  /* market fatigue: selling or bartering away the same resource in a row stacks (FAT 0..8), each step cuts the price harder and slows its recovery; FAT fades 0.1 per 5 s. In SAVA, absent in old saves = 0. */
  FAT = { w: 0, s: 0, f: 0 },
  FATMAX = 8,
  fatSell = (r) => Math.max(0.8, 0.95 - 0.012 * (FAT[r] || 0)),
  fatBarter = (r) => Math.max(0.85, 0.97 - 0.008 * (FAT[r] || 0)),
  fatUp = (r) => {
    FAT[r] = Math.min(FATMAX, (FAT[r] || 0) + 1);
  },
  TRADEK = new Set(["sellw", "sells", "buyw", "buys", "sellf", "buyf", "xws", "xwf", "xsw", "xsf", "xfw", "xfs"]);
/* barter: 50 of one resource for another straight at the price ratio (90 %), better than selling then buying back (64 %); both prices move */
export const barterGet = (a, b) => Math.max(1, Math.floor(((50 * PRICE[a]) / PRICE[b]) * 0.9));

export const tradeGain = (k) => Math.max(1, Math.round(50 * PRICE[k] * 0.8)),
  tradeCost = (k) => Math.max(1, Math.round(50 * PRICE[k] * 1.25));

export function syncTradeC() {
  C.sellw = { w: 50 };
  C.sells = { s: 50 };
  C.sellf = { f: 50 };
  C.buyw = { g: tradeCost("w") };
  C.buys = { g: tradeCost("s") };
  C.buyf = { g: tradeCost("f") };
  for (const k of TRADEK) if (k[0] === "x") C[k] = { [k[1]]: 50 };
}

function hasMarket(p) {
  p |= 0;
  for (const s of sessionState.structs)
    if (s.t === 0 && s.type === "market" && s.prog >= 1 && s.hp > 0 && (s.pl | 0) === p) return true;
  return false;
}

export let trade = function trade(k) {
  if (sessionState.over || !TRADEK.has(k)) return;
  if (!hasMarket(playersState.CURPL)) {
    hudDisplayState.msgS = "Build a Market to trade";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  const r = k[k.length - 1],
    nm = r === "w" ? "wood" : r === "f" ? "food" : "stone";
  if (k[0] === "x") {
    const a = k[1],
      b = k[2],
      na = a === "w" ? "wood" : a === "f" ? "food" : "stone",
      nb = b === "w" ? "wood" : b === "f" ? "food" : "stone";
    if (sessionState.res[a] < 50) {
      hudDisplayState.msgS = "You need 50 " + na + " to sell";
      hudDisplayState.msgT = 2.5;
      snd("err");
      return;
    }
    const n = barterGet(a, b);
    sessionState.res[a] -= 50;
    sessionState.res[b] += n;
    PRICE[a] = Math.max(0.3, PRICE[a] * fatBarter(a));
    fatUp(a);
    PRICE[b] = Math.min(4, PRICE[b] * 1.03);
    hudDisplayState.msgS = "Swapped 50 " + na + " for " + n + " " + nb;
    hudDisplayState.msgT = 2.5;
    snd("coin");
    syncTradeC();
    qNote("tr");
    return;
  }
  if (k[0] === "s") {
    if (sessionState.res[r] < 50) {
      hudDisplayState.msgS = "You need 50 " + nm + " to sell";
      hudDisplayState.msgT = 2.5;
      snd("err");
      return;
    }
    const g = tradeGain(r);
    sessionState.res[r] -= 50;
    sessionState.res.g += g;
    PRICE[r] = Math.max(0.3, PRICE[r] * fatSell(r));
    fatUp(r);
    hudDisplayState.msgS = "Sold 50 " + nm + " for " + g + " gold";
  } else {
    const c = tradeCost(r);
    if (sessionState.res.g < c) {
      hudDisplayState.msgS = "You need " + c + " gold to buy 50 " + nm;
      hudDisplayState.msgT = 2.5;
      snd("err");
      return;
    }
    sessionState.res.g -= c;
    sessionState.res[r] += 50;
    PRICE[r] = Math.min(4, PRICE[r] * 1.05);
    hudDisplayState.msgS = "Bought 50 " + nm + " for " + c + " gold";
  }
  hudDisplayState.msgT = 2.5;
  snd("coin");
  syncTradeC();
  qNote("tr");
};

export function priceTick(dt) {
  economyState.priceT -= dt;
  if (economyState.priceT > 0) return;
  economyState.priceT = 5;
  let ch = 0;
  for (const k in PBASE) {
    const d = PBASE[k] - PRICE[k],
      fa = FAT[k] || 0;
    if (Math.abs(d) > 0.002) {
      PRICE[k] += (d * 0.12) / (1 + 0.5 * fa);
      ch = 1;
    }
    if (fa > 0) FAT[k] = Math.max(0, fa - 0.1);
  }
  if (ch) syncTradeC();
}

export function hasAcademy(p) {
  p |= 0;
  for (const s of sessionState.structs)
    if (s.t === 0 && s.type === "academy" && s.prog >= 1 && s.hp > 0 && (s.pl | 0) === p) return true;
  return false;
}

export const popOf = (t) => (t === "cannon" ? 2 : t === "king" ? 3 : t === "guard" ? 0 : 1);

/* the king of player p (one at most) and what the castle offers: the king, or a guard to refill his escort */
export const royalOf = (p) => {
  p |= 0;
  for (const k of sessionState.units) if (k.t === 0 && k.type === "king" && k.hp > 0 && (k.pl | 0) === p) return k;
  return null;
};

export function royalBtns() {
  const p = playersState.CURPL | 0,
    K = royalOf(p);
  if (!K) return sessionState.queue.some((q) => q.type === "king" && (q.b.pl | 0) === p) ? [] : ["king"];
  const n =
    (K.sq ? K.sq.length : 0) + sessionState.queue.filter((q) => q.type === "guard" && (q.b.pl | 0) === p).length;
  return n < 2 ? ["guard"] : [];
}

export function popUsed(p) {
  p |= 0;
  let n = 0;
  for (const u of sessionState.units) if (u.t === 0 && u.hp > 0 && (u.pl | 0) === p) n += popOf(u.type);
  for (const q of sessionState.queue) if ((q.b.pl | 0) === p) n += popOf(q.type);
  return n;
}

export function popCap(p) {
  p |= 0;
  let n = 0;
  for (const s of sessionState.structs)
    if (s.t === 0 && s.prog >= 1 && s.hp > 0 && (s.pl | 0) === p) {
      if (s.type === "house") n += POPHOUSE;
      else if (s.type === "granary") n += 4;
    }
  return Math.min(POPMAX, POPBASE + n);
}

export let train = function train(type) {
  const b = curB();
  if (b.type === "academy" || b.type === "market" || b.type === "guild") return;
  if (type === "cannon" && !RS.done) {
    hudDisplayState.msgS = "The cannon needs Masonry";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  if (!sessionState.over && popUsed(playersState.CURPL) + popOf(type) > popCap(playersState.CURPL)) {
    hudDisplayState.msgS = "Population limit: build houses";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  if (type === "king" || type === "guard") {
    if (b.type !== "castle") {
      hudDisplayState.msgS = "The king is summoned at your castle";
      hudDisplayState.msgT = 3;
      snd("err");
      return;
    }
    const p = playersState.CURPL | 0,
      K = royalOf(p);
    if (type === "king" && (K || sessionState.queue.some((q) => q.type === "king" && (q.b.pl | 0) === p))) {
      hudDisplayState.msgS = "Your kingdom already has a king";
      hudDisplayState.msgT = 3;
      snd("err");
      return;
    }
    if (type === "guard") {
      if (!K) {
        hudDisplayState.msgS = "Royal guards serve King Naraige: summon him first";
        hudDisplayState.msgT = 3;
        snd("err");
        return;
      }
      if (
        (K.sq ? K.sq.length : 0) + sessionState.queue.filter((q) => q.type === "guard" && (q.b.pl | 0) === p).length >=
        2
      ) {
        hudDisplayState.msgS = "King Naraige already has his 2 royal guards";
        hudDisplayState.msgT = 3;
        snd("err");
        return;
      }
    }
  } else if (type !== "peasant" && b.type === "castle") {
    hudDisplayState.msgS = "Units are trained in a Barracks: build one, then click it";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  if (sessionState.over || sessionState.queue.filter((q) => q.b === b).length >= 6) return;
  if (!ok(C[type])) {
    if ((C[type].f || 0) > (sessionState.res.f || 0) && playersState.CURPL === LPL()) {
      hudDisplayState.msgS = "Not enough food: build farms and put a peasant on each";
      hudDisplayState.msgT = 3;
      snd("err");
    }
    return;
  }
  pay(C[type]);
  const tt = TRAIN[type] * (b.type === "castle" ? 1 : 0.65) * (RS2.done.drill ? 0.75 : 1);
  sessionState.queue.push({ type, left: tt, tot: tt, b });
};

/* does this player own a finished building of this type? cached per sim tick (and per structs array) */
let bhc = { tk: -1, arr: null, n: -1, h: [{}, {}] };
export function bastionHas(p, type) {
  const tk = sessionState.time,
    sa = sessionState.structs;
  if (bhc.tk !== tk || bhc.arr !== sa || bhc.n !== sa.length) {
    bhc = { tk, arr: sa, n: sa.length, h: [{}, {}] };
    for (const s of sa)
      if (s.t === 0 && s.prog >= 1 && s.hp > 0) (bhc.h[s.pl | 0] || (bhc.h[s.pl | 0] = {}))[s.type] = 1;
  }
  const o = bhc.h[p | 0];
  return !!(o && o[type]);
}
/* same answer without the cache: for code run from mpExec (player commands), where the cache of the previous tick may or may not have been refilled by the UI on this machine */
export function bastionHasNow(p, type) {
  for (const s of sessionState.structs)
    if (s.t === 0 && s.prog >= 1 && s.hp > 0 && (s.pl | 0) === (p | 0) && s.type === type) return true;
  return false;
}
/* cancel the i-th queued unit of building sid (this player's): full refund */
export function cancelTrain0(sid, i) {
  const b = sessionState.structs.find((s) => s.sid === sid && (s.pl | 0) === playersState.CURPL);
  if (!b) return;
  let n = -1,
    qi = -1;
  sessionState.queue.forEach((q, j) => {
    if (q.b === b && ++n === i) qi = j;
  });
  if (qi < 0) return;
  const q = sessionState.queue[qi];
  for (const [k, v] of Object.entries(C[q.type])) sessionState.res[k] += v;
  sessionState.queue.splice(qi, 1);
}
export const ok = (c) => Object.entries(c).every(([k, v]) => sessionState.res[k] >= v),
  pay = (c) => Object.entries(c).forEach(([k, v]) => (sessionState.res[k] -= v));
export const ALERTS = [];

export let startResearch2 = function startResearch2(k) {
  if (sessionState.over || RS2.done[k]) return;
  if (RS2.on) {
    hudDisplayState.msgS = "One research at a time: " + RN2[RS2.on] + " is in progress";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  if (!hasAcademy(playersState.CURPL)) {
    hudDisplayState.msgS = "Build an Academy to research";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  if (!rxPre(k)) {
    hudDisplayState.msgS = RN2[k] + " needs " + (RPRE[k] === "masonry" ? "Masonry" : RN2[RPRE[k]]);
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  const lk = rxLock(k);
  if (lk) {
    hudDisplayState.msgS = RN2[k] + " is closed: you chose " + RN2[lk];
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  if (!ok(C[k])) {
    hudDisplayState.msgS = RN2[k] + " is too expensive";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  pay(C[k]);
  RS2.on = k;
  RS2.t = 0;
  {
    const xi = rxPair(k);
    if (xi >= 0) {
      if (!RS2.ch) RS2.ch = {};
      RS2.ch[xi] = k;
    }
  }
  snd("build");
  hudDisplayState.msgS = "Researching " + RN2[k] + "...";
  hudDisplayState.msgT = 3;
};

export function extraSim(dt) {
  {
    for (const s of sessionState.structs)
      if (
        s.rally &&
        s.t === 0 &&
        (s.pl | 0) === LPL() &&
        (s.type !== "barracks" || s === selectionState.selB) &&
        REALR() < dt * 0.9
      )
        puff(s.rally.x, s.rally.y, "#7dffa0", 2, 26);
  }
  if (economyState.alertT > 0) economyState.alertT -= dt;
  for (let i = ALERTS.length - 1; i >= 0; i--) {
    ALERTS[i].t -= dt;
    if (ALERTS[i].t <= 0) ALERTS.splice(i, 1);
  }
  if (RS2.on) {
    RS2.t += dt;
    if (RS2.t >= RT2[RS2.on]) {
      const k = RS2.on;
      RS2.done[k] = true;
      if (k === "plate" || k === "mail")
        setTimeout(() => {
          try {
            icoPart("units");
          } catch {
            /* Icon refresh is optional; the research state is already committed. */
          }
        }, 0);
      ach("res");
      RS2.on = null;
      snd("fanfare");
      sessionState.bannerT = 4;
      sessionState.bannerS = RN2[k].toUpperCase();
      sessionState.bannerS2 = {
        iron: "Your soldiers hit 25% harder",
        plate: "Your side takes 22% less damage",
        drill: "Units train 25% faster",
        steel: "Your soldiers hit 20% harder again",
        mail: "Your side takes 15% less damage again",
        tools: "Peasants gather 33% faster",
        harvest: "Farms yield 50% more food",
        fletch: "Archers and towers hit 25-40% harder",
        fire: "Archers set zombies on fire",
        bastion: "Buildings have 40% more strength",
        oil: "Walls, gates and towers scald zombies next to them",
        era: "Iron age: your units hit 10% harder, buildings slowly mend",
      }[k];
    } else {
      hudDisplayState.msgS = "Researching " + RN2[RS2.on] + " " + Math.floor((RS2.t / RT2[RS2.on]) * 100) + "%";
      hudDisplayState.msgT = 1;
    }
  }
}

export let startResearch = function startResearch() {
  if (RS.done || RS.on || sessionState.over) return;
  if (!hasAcademy(playersState.CURPL)) {
    hudDisplayState.msgS = "Build an Academy to research";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  if (!ok(C.upgrade)) {
    hudDisplayState.msgS = "Masonry needs 200 stone and 100 wood";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  pay(C.upgrade);
  RS.on = true;
  RS.t = 0;
  snd("build");
  hudDisplayState.msgS = "Researching Masonry...";
  hudDisplayState.msgT = 3;
};

export function finishResearch() {
  ach("res");
  RS.done = true;
  RS.on = false;
  Object.assign(C, playersState.BTIER ? CSTONE : CWOOD);
  setTimeout(() => {
    try {
      icoPart("tier");
    } catch {
      /* Icon refresh is optional; the research state is already committed. */
    }
  }, 0);
  snd("horn");
  sessionState.bannerT = 5;
  sessionState.bannerS = "STONE AGE";
  sessionState.bannerS2 = "Select a building and press Upgrade, or use the Stone upgrade tool";
}

export function doUpgrade(tx, ty) {
  const o = occ.get(ty * TW + tx);
  if (!o || o.t !== 0 || o.tier !== 0 || o.prog < 1) return;
  if (!RS.done) {
    hudDisplayState.msgS = "Stone upgrades need Masonry (Academy)";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  const c = UPC[o.type];
  if (!c) return;
  if (!ok(c)) {
    hudDisplayState.msgS = "Not enough resources to upgrade";
    hudDisplayState.msgT = 2;
    snd("err");
    return;
  }
  pay(c);
  const r = o.hp / o.max;
  o.max = SH[o.type];
  o.hp = Math.round(o.max * r);
  o.tier = 1;
  buildStructMesh(o);
  refreshNear(o);
  puff(o.x, o.y, "#d9d9d9", 12, 80);
  snd("build", o.x, o.y);
}

export function buy(k) {
  if (sessionState.over) return;
  if (
    k === "demolish" &&
    selectionState.selB &&
    sessionState.structs.includes(selectionState.selB) &&
    selectionState.selB !== HOMEC() &&
    selectionState.selB.type !== "castle"
  ) {
    build("demolish", selectionState.selB.tx, selectionState.selB.ty);
    return;
  }
  if (k === "repair") {
    const s = selectionState.selB && sessionState.structs.includes(selectionState.selB) ? selectionState.selB : HOMEC();
    if (s) repairB(s.sid);
    return;
  }
  if (TRADEK.has(k)) {
    trade(k);
    return;
  }
  if (k === "rotate") {
    if (selectionState.selB && selectionState.selB.t === 0 && ROTT.has(selectionState.selB.type))
      build("rotate", selectionState.selB.tx, selectionState.selB.ty);
    return;
  }
  if (k === "tier") {
    if (!RS.done) {
      hudDisplayState.msgS = "Stone needs Masonry";
      hudDisplayState.msgT = 3;
      snd("err");
      return;
    }
    setTier(!playersState.BTIER);
    hudDisplayState.msgS = "New buildings: " + (playersState.BTIER ? "stone" : "wood");
    hudDisplayState.msgT = 2;
    snd("click");
    return;
  }
  if (k === "upgrade") {
    startResearch();
    return;
  }
  if (k in RT2) {
    startResearch2(k);
    return;
  }
  if ((k === "ballista" || k === "trebuchet") && !RS.done) {
    hudDisplayState.msgS = "Siege weapons need Masonry";
    hudDisplayState.msgT = 3;
    snd("err");
    return;
  }
  if (k in T) {
    sessionState.mode = null;
    snd("click");
    train(k);
  } else {
    sessionState.units.forEach((u) => (u.sel = false));
    sessionState.mode = sessionState.mode === k ? null : k;
  }
}

export function army() {
  sessionState.units.forEach(
    (u) => (u.sel = u.t === 0 && u.type !== "peasant" && (!MP.on || (u.pl | 0) === playersState.CURPL)),
  );
}

export function setTrainHandler(handler) {
  train = handler;
}

export function setStartResearchHandler(handler) {
  startResearch = handler;
}

export function setStartResearch2Handler(handler) {
  startResearch2 = handler;
}

export function setTradeHandler(handler) {
  trade = handler;
}

export function initializeEconomy() {
  syncTradeC();
}
