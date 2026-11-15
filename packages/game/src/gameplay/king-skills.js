import { snd } from "../audio/sound.js";
import { dist } from "../core/math.js";
import { LPL, playersState } from "./players.js";
import { rulesState, T, TS } from "./rules.js";
import { sessionState } from "./session.js";
import { puff, ring, shake } from "../rendering/effects.js";
import { BTN, BTNH, GRN, GRNH } from "../ui/drawing.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { qmReg } from "../ui/quest-marker.js";
import { pill } from "../ui/minimap.js";
import { KB, kdisp } from "../ui/settings.js";

/* ================= KING SKILLS (#8) =================
   War cry [<]: every unit of yours within 10 tiles hits 35% harder for 8 s (45 s cooldown).
   Royal charge [>]: the King runs 2.2x faster and hits 1.8x harder for 4 s and throws every zombie within 3 tiles for damage (35 s cooldown).
   In co-op the key sends a command (kingSkill wrapper + case 'ks' in mpExec); timers use sim time and live on the King (units are saved whole). */
const KSK = { cry: { cd: 45, name: "War cry", key: "cry" }, charge: { cd: 35, name: "Royal charge", key: "charge" } };

/* ================= KING XP AND TALENTS =================
   The King earns XP (kxp, on the King unit so saves and co-op resyncs carry it): a zombie dying within 10 tiles of him (1, brute 3, acid/bomber 2),
   every wave survived (+3), a boss slain (+12, wherever he stands). Levels 1 to 5 at KXL xp; each level above 1 gives one talent point.
   Talents are a bitmask kt on the King, two branches of 4 learned in order (a point buys the next one of the branch). Absent fields = level 1, no talent.
   The choice is a lockstep command ('kt' in mpExec, kingTalent wrapper). Nothing here uses random numbers. */
export const KXL = [0, 25, 70, 140, 240];
export const KTAL = [
  ["Long cry +4s", "Wide cry +5", "Fierce cry +15%", "Warlord: cd -11s"],
  ["Heavy charge", "Royal plate -20%", "Long charge +2s", "Boss breaker"],
];
export const kxLevel = (k) => {
  const x = k.kxp | 0;
  let l = 1;
  for (let i = 1; i < KXL.length; i++) if (x >= KXL[i]) l = i + 1;
  return l;
};
export const kHas = (k, i) => (((k.kt | 0) >> i) & 1) === 1;
const kCount = (k) => {
  let n = 0;
  for (let i = 0; i < 8; i++) if (kHas(k, i)) n++;
  return n;
};
export const kPoints = (k) => Math.max(0, kxLevel(k) - 1 - kCount(k));
export const kNext = (k, b) => {
  for (let i = 0; i < 4; i++) if (!kHas(k, b * 4 + i)) return b * 4 + i;
  return -1;
};
function kNote(k) {
  const G = rulesState.GST;
  if (!G) return;
  G.kl = Math.max(G.kl | 0, kxLevel(k));
  G.kn = Math.max(G.kn | 0, kCount(k));
}
export function kingXp(k, a) {
  if (!k || !(a > 0)) return;
  const l0 = kxLevel(k);
  k.kxp = Math.min(99999, (k.kxp | 0) + a);
  const l1 = kxLevel(k);
  kNote(k);
  if (l1 > l0) {
    const mh = T.king.hp;
    k.hp = Math.min(mh, k.hp + mh * 0.25);
    ring(k.x, k.y, "#ffe066", 26, 260);
    puff(k.x, k.y, "#ffe066", 10, 60);
    snd("horn", k.x, k.y);
    if ((k.pl | 0) === LPL()) {
      hudDisplayState.msgS = "King level " + l1 + "!";
      hudDisplayState.msgT = 3;
    }
  }
}
export function kingKillXp(z) {
  const w = z.boss ? 12 : z.type === "brute" ? 3 : z.type === "acid" || z.type === "bomber" ? 2 : 1;
  for (const k of sessionState.units)
    if (k.t === 0 && k.type === "king" && k.hp > 0 && !k.kdead && (z.boss || dist(k.x, k.y, z.x, z.y) < TS * 10))
      kingXp(k, w);
}
export function kingWaveXp() {
  for (const k of sessionState.units) if (k.t === 0 && k.type === "king" && k.hp > 0 && !k.kdead) kingXp(k, 3);
}
export function kingTalent0(b) {
  const k = kingOf(playersState.CURPL | 0);
  if (!k || (b !== 0 && b !== 1) || kPoints(k) < 1) return;
  const i = kNext(k, b);
  if (i < 0) return;
  k.kt = k.kt | 0 | (1 << i);
  kNote(k);
  ring(k.x, k.y, "#9ad8ff", 22, 240);
  snd("click", k.x, k.y);
  hudDisplayState.msgS = "Talent: " + KTAL[b][i % 4];
  hudDisplayState.msgT = 2.5;
}

export function kingOf(p) {
  for (const u of sessionState.units)
    if (u.t === 0 && u.type === "king" && u.hp > 0 && !u.kdead && (u.pl | 0) === p) return u;
  return null;
}

export const kskLeft = (k, n) => Math.max(0, (k["sk_" + n] || 0) - sessionState.time);

export function kingSkill0(n) {
  const k = kingOf(playersState.CURPL | 0);
  if (!k || !KSK[n] || kskLeft(k, n) > 0) return;
  if (n === "cry") {
    k["sk_" + n] = sessionState.time + KSK[n].cd - (kHas(k, 3) ? 11 : 0);
    const dur = 8 + (kHas(k, 0) ? 4 : 0),
      R = TS * (10 + (kHas(k, 1) ? 5 : 0)),
      mult = kHas(k, 2) ? 1.5 : 1.35,
      ward = kHas(k, 3) ? 0.5 : 1;
    for (const a of sessionState.units)
      if (a.t === 0 && a.hp > 0 && (a.pl | 0) === (k.pl | 0) && dist(a.x, a.y, k.x, k.y) < R) {
        a.wcT = sessionState.time + dur;
        a.wcM = mult;
        a.wcP = ward;
      }
    ring(k.x, k.y, "#ffd23c", 34, 340);
    ring(k.x, k.y, "#fff3c0", 20, 200);
    snd("horn", k.x, k.y);
    shake(0.15);
    hudDisplayState.msgS = "War cry!";
    hudDisplayState.msgT = 2;
  } else {
    k["sk_" + n] = sessionState.time + KSK[n].cd - (kHas(k, 6) ? 7 : 0);
    k.chT = sessionState.time + 4 + (kHas(k, 6) ? 2 : 0);
    const hv = kHas(k, 4),
      br = kHas(k, 7);
    for (const e of sessionState.units)
      if (e.t === 1 && e.hp > 0 && dist(e.x, e.y, k.x, k.y) < TS * (hv ? 4 : 3)) {
        e.hp -= (60 + sessionState.waveN * 2) * (hv ? 1.5 : 1) * (br && e.boss ? 2 : 1);
        e.hurt = 0.25;
        if (br && e.boss && e.bs !== undefined) e.bs += 6;
        else if (br && e.boss) e.bs = 14;
      }
    puff(k.x, k.y, "#e8d8a8", 14, 120, { T: 0.6, z: 0.2, vz: 1.2, g: -0.3, s: 0.2 });
    snd("boom", k.x, k.y);
    shake(0.2);
    hudDisplayState.msgS = "Royal charge!";
    hudDisplayState.msgT = 2;
  }
}

export function kingTick(dt) {
  for (const u of sessionState.units)
    if (u.t === 0 && u.type === "king") {
      u.spdK = u.chT > sessionState.time ? 2.2 : 1;
      u.kdr = kHas(u, 5) ? 0.8 : 1;
      if (kHas(u, 5) && u.hp > 0 && u.hp < T.king.hp) u.hp = Math.min(T.king.hp, u.hp + (dt || 0) * 0.8);
    }
}

export function kingBar(UW, y) {
  const k = sessionState.started && !sessionState.over ? kingOf(playersState.CURPL | 0) : null;
  if (!k) return 0;
  const w = Math.min(112, (UW - 24) / 2),
    x0 = Math.round(UW / 2 - w - 3);
  [
    ["cry", "War cry", "<"],
    ["charge", "Royal charge", ">"],
  ].forEach(([n, lab, def], i) => {
    const l = kskLeft(k, n),
      ky = kdisp(KB[n] || def),
      act = (n === "cry" ? k.wcT : k.chT) > sessionState.time;
    qmReg("sk:" + n, x0 + i * (w + 6), y, w, 15);
    pill(
      x0 + i * (w + 6),
      y,
      w,
      15,
      l > 0 ? lab + " [" + ky + "] " + Math.ceil(l) + "s" : lab + " [" + ky + "]",
      act ? GRN : BTN,
      act ? GRNH : BTNH,
      () => kingSkill(n),
      null,
      0.68,
      act,
      l > 0,
    );
  });
  /* second row: level and xp, and while a talent point is free one button per branch (next talent of the branch) */
  const lv = kxLevel(k),
    pt = kPoints(k),
    y2 = y + 17,
    lab = lv >= KXL.length ? "King Lv " + lv + "  MAX" : "King Lv " + lv + "  XP " + (k.kxp | 0) + "/" + KXL[lv];
  if (pt > 0)
    [0, 1].forEach((b) => {
      const i = kNext(k, b),
        nm = i < 0 ? KTAL[b][3] : KTAL[b][i % 4];
      pill(x0 + b * (w + 6), y2, w, 15, nm, GRN, GRNH, () => kingTalent(b), null, 0.68, true, i < 0);
    });
  else {
    const n = kCount(k);
    pill(x0, y2, w * 2 + 6, 15, n ? lab + "  Talents " + n : lab, BTN, BTNH, () => {}, null, 0.68, false, false);
  }
  return 36;
}

export let kingSkill = function kingSkill(n) {
  kingSkill0(n);
};
export let kingTalent = function kingTalent(b) {
  kingTalent0(b);
};
export function setKingTalentHandler(handler) {
  kingTalent = handler;
}
/* Multiplayer installs a command handler during startup. */

export function setKingSkillHandler(handler) {
  kingSkill = handler;
}
