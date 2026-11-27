import { snd } from "../audio/sound.js";
import {
  PR,
  prBuy,
  prCode,
  prFromCode,
  prLoad,
  prLook,
  prLvl,
  prNode,
  prRank,
  prRankName,
} from "../gameplay/dragon-prog.js";
import {
  DR_BRANCH,
  DR_BYID,
  DR_FLAMES,
  DR_LOOKS,
  DR_RANKS,
  DR_STAGES,
  DR_TREE,
  drEv,
  drLvlXp,
} from "../gameplay/dragon-skills.js";
import { sessionState } from "../gameplay/session.js";
import { L, T_, TC, TTL, tw } from "../i18n/language.js";
import { dragonMine } from "../gameplay/dragon.js";
import { dragonPanelOpen } from "../rendering/dragon-rider.js";
import { canvasesState } from "./canvases.js";
import { BTN, BTNH, frame, GRN, GRNH, PAN, RDB } from "./drawing.js";
import { hudState, U } from "./hud.js";
import { kitFrame } from "./menu-kit.js";
import { pill } from "./minimap.js";
import { btnReset } from "./typography.js";

/* ---- the dragon rider's window (Dragon role, #66): skill tree and look ----
   Drawn over the game, which goes on (co-op cannot pause): the dragon hangs still while it is open. Opens with U (the rider's key), closes
   with U or Esc. Reads and writes only the rider's own progress (gameplay/dragon-prog.js), never the simulation. */
const P = { open: false, tab: 0, sel: "f1", note: "" };
/* the clipboard may be refused (an embedded page, an old browser): the note under the buttons says what happened */
function codeOut() {
  try {
    navigator.clipboard.writeText(prCode()).then(
      () => (P.note = "Code copied: paste it on the other machine"),
      () => (P.note = "Could not reach the clipboard"),
    );
  } catch {
    P.note = "Could not reach the clipboard";
  }
}
function codeIn() {
  try {
    navigator.clipboard.readText().then(
      (t) => (P.note = prFromCode(t) ? "Progress loaded" : "No dragon code in the clipboard"),
      () => (P.note = "Could not reach the clipboard"),
    );
  } catch {
    P.note = "Could not reach the clipboard";
  }
}
export const dragonPanelState = P;

function set(on) {
  P.open = on;
  dragonPanelOpen(on);
  snd(on ? "open" : "close");
}

/* the rider's keys: true when the key was taken */
export function dragonPanelKey(k) {
  if (!dragonMine() || sessionState.over) return false;
  if (k === "u") {
    set(!P.open);
    return true;
  }
  if (k === "escape" && P.open) {
    set(false);
    return true;
  }
  return false;
}

export function dragonPanelDraw(UW, UH) {
  if (!dragonMine() || sessionState.over) {
    if (P.open) set(false);
    return;
  }
  if (!P.open) {
    hudState.dragonBtn = null;
    return;
  }
  prLoad();
  const g = canvasesState.ctx;
  g.fillStyle = "rgba(5,8,16,.78)";
  g.fillRect(0, 0, UW, UH);
  hudState.uiHits = [];
  hudState.uiRects = [U(0, 0, UW, UH)];
  btnReset();
  const w = Math.min(UW - 12, 640),
    h = Math.min(UH - 12, 292),
    x = Math.round((UW - w) / 2),
    y = Math.max(6, Math.round((UH - h) / 2)),
    lv = prLvl(),
    a = drLvlXp(lv),
    b = drLvlXp(lv + 1);
  frame(x, y, w, h, PAN, 6);
  kitFrame(x + 2, y + 2, w - 4, h - 4, false, 0.5);
  TTL(P.tab ? "Dragon" : "Skill tree", x + w / 2, y + 8, 1.25, "center");
  pill(x + w - 20, y + 6, 14, 12, "x", BTN, BTNH, () => set(false), null, 0.7);
  /* gold, level, rank */
  const gold = PR.gold + " " + L("gold"),
    xp = lv >= 20 ? L("max") : Math.floor(PR.xp - a) + " / " + (b - a);
  T_(gold, x + 10, y + 8, "#f2d48a", 0.85);
  T_(L("Level") + " " + lv + "  " + L(DR_STAGES[drEv(lv)]) + "  " + xp + " xp", x + 10, y + 20, "#c8b8f0", 0.72);
  T_(
    L("Rank") + ": " + L(prRankName()),
    x + w - 24 - tw(L("Rank") + ": " + L(prRankName()), 0.72),
    y + 20,
    "#f2d48a",
    0.72,
  );
  [
    ["Skills", 0],
    ["Dragon", 1],
  ].forEach(([t, i], k) => {
    const tw2 = Math.max(48, tw(t, 0.8) + 14);
    pill(
      x + 10 + k * (tw2 + 4),
      y + 32,
      tw2,
      14,
      t,
      P.tab === i ? GRN : BTN,
      P.tab === i ? GRNH : BTNH,
      () => {
        P.tab = i;
        snd("tab");
      },
      null,
      0.8,
    );
  });
  if (P.tab) drawLook(x, y + 52, w, h - 52);
  else drawTree(x, y + 50, w);
}

function drawTree(x, y, w) {
  const g = canvasesState.ctx,
    cw = Math.floor((w - 20) / 6),
    nw = cw - 4,
    nh = 20,
    rp = 25,
    x0 = x + 10,
    y0 = y + 12;
  DR_BRANCH.forEach((t, i) => TC(t, x0 + i * 2 * cw + cw - 2, y, "#f2d48a", 0.72));
  g.lineWidth = 1;
  for (const n of DR_TREE) {
    const nx = x0 + n[7] * cw,
      ny = y0 + n[8] * rp;
    if (n[6]) {
      const p = DR_BYID[n[6]];
      g.strokeStyle = PR.tree[n[0]] ? "#f0cd73" : PR.tree[p[0]] ? "#8a8576" : "#3a3d48";
      g.beginPath();
      g.moveTo(x0 + p[7] * cw + nw / 2, y0 + p[8] * rp + nh);
      g.lineTo(x0 + p[7] * cw + nw / 2, ny - 3);
      g.lineTo(nx + nw / 2, ny - 3);
      g.lineTo(nx + nw / 2, ny);
      g.stroke();
    }
  }
  for (const n of DR_TREE) {
    const st = prNode(n[0]),
      nx = x0 + n[7] * cw,
      ny = y0 + n[8] * rp;
    pill(
      nx,
      ny,
      nw,
      nh,
      n[2],
      st === 2 ? GRN : st === 1 ? BTNH : BTN,
      st === 2 ? GRNH : BTNH,
      () => {
        P.sel = n[0];
        snd("click");
      },
      null,
      0.58,
      P.sel === n[0],
      st === 0,
    );
    if (P.sel === n[0]) {
      g.strokeStyle = "#ffffff";
      g.strokeRect(nx - 0.5, ny - 0.5, nw + 1, nh + 1);
    }
  }
  /* the chosen skill */
  const n = DR_BYID[P.sel] || DR_TREE[0],
    st = prNode(n[0]),
    lv = prLvl(),
    iy = y0 + 6 * rp + 2,
    why =
      st === 2
        ? "Owned"
        : lv < n[5]
          ? L("Needs dragon level") + " " + n[5]
          : st === 0
            ? L("Needs") + " " + L(DR_BYID[n[6]][2])
            : PR.gold < n[4]
              ? L("Not enough gold")
              : "Ready to buy";
  T_(n[2], x0, iy, "#f2d48a", 0.85);
  T_(n[3], x0, iy + 11, "#ffffff", 0.72);
  T_(why, x0, iy + 22, st === 1 && PR.gold >= n[4] ? "#a6ee78" : "#a0a0a0", 0.68);
  const bw = 110;
  pill(
    x + w - 10 - bw,
    iy + 4,
    bw,
    18,
    st === 2 ? "Owned" : L("Buy") + "  " + n[4] + " " + L("gold"),
    st === 1 && PR.gold >= n[4] ? GRN : BTN,
    st === 1 && PR.gold >= n[4] ? GRNH : BTNH,
    () => {
      if (prBuy(n[0])) snd("dragonbuy");
    },
    null,
    0.78,
    false,
    st !== 1 || PR.gold < n[4],
  );
}

function drawLook(x, y, w, h) {
  const g = canvasesState.ctx,
    x0 = x + 10,
    cw = Math.floor((w - 20) / 3);
  T_("Look", x0, y + 2, "#f2d48a", 0.85);
  DR_LOOKS.forEach((l, i) => {
    const bx = x0 + (i % 3) * cw,
      by = y + 16 + Math.floor(i / 3) * 22;
    pill(
      bx,
      by,
      cw - 6,
      18,
      l[0],
      PR.lk === i ? GRN : BTN,
      PR.lk === i ? GRNH : BTNH,
      () => {
        prLook(i, PR.fc);
        snd("click");
      },
      null,
      0.85,
    );
  });
  T_("Flame", x0, y + 66, "#f2d48a", 0.85);
  DR_FLAMES.forEach((c, i) => {
    const bx = x0 + i * 26;
    pill(bx, y + 80, 22, 18, "", PR.fc === i ? GRN : BTN, PR.fc === i ? GRNH : BTNH, () => {
      prLook(PR.lk, i);
      snd("click");
    });
    g.fillStyle = c || DR_LOOKS[PR.lk][1].flame || "#ff8a1f";
    g.fillRect(bx + 4, y + 84, 14, 10);
    if (!c) T_("auto", bx + 2, y + 86, "#000000", 0.5);
  });
  const lv = prLvl(),
    e = drEv(lv),
    nx = DR_RANKS[prRank() + 1];
  T_(
    L("Stage") +
      ": " +
      L(DR_STAGES[e]) +
      (e < 5 ? "  (" + L("evolves at level") + " " + [1, 4, 8, 12, 16, 20][e + 1] + ")" : ""),
    x0,
    y + 108,
    "#c8b8f0",
    0.78,
  );
  T_(
    L("Rank") + ": " + L(prRankName()) + "  " + L("renown") + " " + Math.floor(PR.ren) + (nx ? " / " + nx[0] : ""),
    x0,
    y + 120,
    "#f2d48a",
    0.78,
  );
  /* carry the progress to another machine (#92) */
  pill(x0, y + 138, 150, 16, "Copy progress code", BTN, BTNH, codeOut, null, 0.75);
  pill(x0 + 156, y + 138, 150, 16, "Paste progress code", BTN, BTNH, codeIn, null, 0.75);
  if (P.note) T_(P.note, x0, y + 158, "#a6ee78", 0.7);
  T_("The dragon grows and changes shape as it levels up.", x0, y + h - 22, "#a0a0a0", 0.68);
  void RDB;
}
