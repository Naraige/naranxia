import { dragonSend } from "../multiplayer/commands.js";
import { drCounts, drLvl, drNodeState, drRank, DR_BYID, DR_FLAMES, DR_LOOKS, DR_RANKS } from "./dragon-skills.js";

/* ---- the rider's progress (Dragon role, #66) ----
   Kept on his own machine, between games (localStorage 'dk_dr_prog'): experience (the dragon's level), renown (his rank), the gold he
   earned burning the horde and the skills he bought. Nothing here is read by the simulation: what the simulation needs goes out in the
   command 'dk' (prSend). */
export const PR = { xp: 0, ren: 0, gold: 0, tree: {}, lk: 0, fc: 0 };
let loaded = false;

export function prLoad() {
  if (loaded) return PR;
  loaded = true;
  try {
    const o = JSON.parse(localStorage.getItem("dk_dr_prog") || "{}");
    PR.xp = Math.max(0, +o.xp || 0);
    PR.ren = Math.max(0, +o.ren || 0);
    PR.gold = Math.max(0, Math.floor(+o.gold || 0));
    PR.tree = {};
    if (o.tree && typeof o.tree === "object") for (const k in o.tree) if (DR_BYID[k] && o.tree[k]) PR.tree[k] = 1;
    PR.lk = Math.max(0, Math.min(DR_LOOKS.length - 1, o.lk | 0));
    PR.fc = Math.max(0, Math.min(DR_FLAMES.length - 1, o.fc | 0));
  } catch {
    /* a fresh dragon */
  }
  return PR;
}
function prSave() {
  try {
    localStorage.setItem("dk_dr_prog", JSON.stringify(PR));
  } catch {
    /* progress is kept for this session only */
  }
}
export const prLvl = () => drLvl(PR.xp);
export const prUp = () => drCounts(PR.tree);
export const prRank = () => drRank(PR.ren);
export const prNode = (id) => drNodeState(DR_BYID[id], PR.tree, prLvl());

/* tells both machines where the rider stands */
export function prSend() {
  prLoad();
  dragonSend({ lv: prLvl(), u: prUp(), lk: PR.lk, fc: PR.fc }, "dk");
}

/* returns what the news is: 0 nothing, 1 level up, 2 evolved, 3 promoted */
export function prGain(xp, ren, gold) {
  prLoad();
  const u = prUp(),
    l0 = prLvl(),
    r0 = prRank();
  PR.xp += xp * (1 + 0.1 * u[8]);
  PR.ren += ren;
  PR.gold += Math.round(gold * (1 + 0.15 * u[7]));
  prSave();
  const l1 = prLvl();
  if (l1 > l0) prSend();
  return l1 > l0 ? [l0, l1] : prRank() > r0 ? [-1, prRank()] : null;
}

export function prBuy(id) {
  prLoad();
  const n = DR_BYID[id];
  if (!n || prNode(id) !== 1 || PR.gold < n[4]) return false;
  PR.gold -= n[4];
  PR.tree[id] = 1;
  prSave();
  prSend();
  return true;
}
export function prLook(lk, fc) {
  prLoad();
  PR.lk = lk;
  PR.fc = fc;
  prSave();
  prSend();
}
export const prRankName = () => DR_RANKS[prRank()][1];

/* the rider's progress as a short code (#92), to carry it to another machine */
export function prCode() {
  prLoad();
  return (
    "NXD1." +
    btoa(
      JSON.stringify({
        xp: Math.floor(PR.xp),
        ren: Math.floor(PR.ren),
        gold: PR.gold,
        tree: Object.keys(PR.tree),
        lk: PR.lk,
        fc: PR.fc,
      }),
    )
  );
}
export function prFromCode(code) {
  try {
    const m = /^\s*NXD1\.([A-Za-z0-9+/=]+)\s*$/.exec(String(code));
    if (!m) return false;
    const o = JSON.parse(atob(m[1]));
    prLoad();
    PR.xp = Math.max(0, +o.xp || 0);
    PR.ren = Math.max(0, +o.ren || 0);
    PR.gold = Math.max(0, Math.floor(+o.gold || 0));
    PR.tree = {};
    for (const k of Array.isArray(o.tree) ? o.tree : []) if (DR_BYID[k]) PR.tree[k] = 1;
    PR.lk = Math.max(0, Math.min(DR_LOOKS.length - 1, o.lk | 0));
    PR.fc = Math.max(0, Math.min(DR_FLAMES.length - 1, o.fc | 0));
    prSave();
    prSend();
    return true;
  } catch {
    return false;
  }
}
