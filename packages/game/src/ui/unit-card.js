import { C, CSTONE, CWOOD, T, TRAIN, BT, GCAP, GRNG } from "../gameplay/rules.js";
import { sel, selectionState } from "../gameplay/selection.js";
import { sessionState } from "../gameplay/session.js";
import { L, T_, TTL, tw } from "../i18n/language.js";
import { costParts, drawCost } from "./build-menu.js";
import { NAMES } from "./build-catalog.js";
import { canvasesState } from "./canvases.js";
import { menuPanel } from "./drawing.js";
import { hudState, U } from "./hud.js";
import { dIc, IC } from "./icons.js";
import { FF, FFP } from "./typography.js";
import { ornLine } from "./title-frame.js";

/* ================= detail card of the selected unit type or building (lot D, visual only) =================
   Same template for both: pixel title, role tag, icon rows with the REAL numbers (rules.js: T, TRAIN, C, BT, GCAP, GRNG, struct hp), one line of flavour.
   Read-only: it never writes game state. */
const ROLE = {
  knight: "Front line",
  spearman: "Line holder",
  archer: "Ranged",
  peasant: "Worker",
  bannerman: "Support",
  captain: "Commander",
  cannon: "Siege",
  king: "Royal",
  guard: "Royal guard",
  castle: "Stronghold",
  barracks: "Troops",
  tower: "Defense",
  wall: "Defense",
  gate: "Defense",
  house: "Housing",
  farm: "Food",
  storage: "Supplies",
  market: "Trade",
  academy: "Research",
  guild: "Workers",
  forester: "Wood",
};
const FLAV = {
  knight: "He holds the wall so the others do not have to.",
  spearman: "A long spear and good neighbours: the big ones stop here.",
  archer: "Patient eyes and a steady hand: the horde never reaches the wall twice.",
  peasant: "Without his axe and his plough the bastion would starve before dawn.",
  bannerman: "Where his banner stands, the line remembers it is not alone.",
  captain: "Soldiers fight harder when someone is shouting orders.",
  cannon: "Slow and loud. The horde hears it coming too late.",
  king: "The last light of Naranxia walks at the front.",
  guard: "A halberd, a vow, and no plans to retreat.",
  castle: "The last light of humanity. If it falls, the night wins.",
  barracks: "The drills never stop here, day or night.",
  tower: "It sees the horde long before the horde sees it.",
  wall: "Cheap, ugly, and it works.",
  gate: "A door that only opens for the living.",
  house: "Every new roof is six more reasons to hold.",
  farm: "Bread is a weapon too.",
  storage: "Full barrels hold better than empty hopes.",
  market: "Everything has a price, even at the end of the world.",
  academy: "Scholars who still believe in tomorrow.",
  guild: "Hands for every task nobody else wants.",
  forester: "He plants for a dawn he may not see.",
};

function glyph(kind, x, y, s) {
  const g = canvasesState.ctx,
    c = x + s / 2,
    m = y + s / 2;
  if (kind === "heart") return dIc(IC.heart, x, y, s);
  if (kind === "clock") return dIc(IC.clock, x, y, s);
  if (kind === "hammer") return dIc(IC.hammer, x, y, s);
  if (kind === "archer") return dIc(IC.archer, x, y, s);
  if (kind === "coin") return dIc(IC.coin, x, y, s);
  g.save();
  g.strokeStyle = "#f0cd73";
  g.lineWidth = 1.3;
  g.lineCap = "round";
  g.lineJoin = "round";
  if (kind === "range") {
    for (const r of [s * 0.42, s * 0.24]) {
      g.beginPath();
      g.arc(c, m, r, 0, 6.2832);
      g.stroke();
    }
    g.fillStyle = "#f0cd73";
    g.beginPath();
    g.arc(c, m, 1.1, 0, 6.2832);
    g.fill();
  } else if (kind === "sword") {
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(x + s * 0.18, y + s * 0.82);
    g.lineTo(x + s * 0.82, y + s * 0.18);
    g.stroke();
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(x + s * 0.22, y + s * 0.58);
    g.lineTo(x + s * 0.42, y + s * 0.78);
    g.stroke();
  } else if (kind === "speed") {
    for (const o of [0, s * 0.32]) {
      g.beginPath();
      g.moveTo(x + s * 0.2 + o, y + s * 0.2);
      g.lineTo(x + s * 0.5 + o, m);
      g.lineTo(x + s * 0.2 + o, y + s * 0.8);
      g.stroke();
    }
  }
  g.restore();
}

/* {label, icon, value text or {cost}} rows for the selection, or null */
function content() {
  const S = sel(),
    b = selectionState.selB;
  if (S.length) {
    const t = S[0].type;
    if (S.some((u) => u.type !== t) || !T[t]) return null;
    const d = T[t],
      rows = [["heart", "Health", String(d.hp)]];
    if (d.dmg) rows.push(["sword", "Damage", d.dmg + " (every " + d.cdt + " s)"]);
    if (d.rng) rows.push(["range", "Range", d.rng + (d.rng <= 40 ? " (melee)" : " (ranged)")]);
    rows.push(["speed", "Speed", String(d.spd)]);
    if (TRAIN[t]) rows.push(["clock", "Training", TRAIN[t] + " s"]);
    else if (C[t] && Object.keys(C[t]).length) rows.push(["coin", "Cost", { cost: C[t] }]);
    return { id: t, name: NAMES[t] || t, role: ROLE[t], n: S.length, rows, flav: FLAV[t] };
  }
  if (b && sessionState.structs.includes(b) && b.hp > 0 && (b.t | 0) === 0) {
    const t = b.type,
      rows = [["heart", "Health", Math.ceil(b.hp) + " / " + Math.round(b.max || b.hp)]];
    if (GCAP[t]) rows.push(["archer", "Garrison", GCAP[t] + " archers"]);
    if (GRNG[t]) rows.push(["range", "Range", GRNG[t] + " tiles"]);
    if (BT[t]) rows.push(["hammer", "Build time", BT[t] + " s"]);
    const c = (b.tier ? CSTONE : CWOOD)[t] || C[t];
    if (c && Object.keys(c).length) rows.push(["coin", "Cost", { cost: c }]);
    return {
      id: t,
      name: NAMES[t] || t.charAt(0).toUpperCase() + t.slice(1),
      role: ROLE[t],
      n: 1,
      rows,
      flav: FLAV[t],
    };
  }
  return null;
}

function wrap(s, sc, maxW) {
  const out = [];
  let cur = "";
  for (const w of L(s).split(" ")) {
    const t = cur ? cur + " " + w : w;
    if (cur && tw(t, sc) > maxW) {
      out.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}

/* topY: first free y under the top bars; botY: top of the minimap button stack. Returns true when drawn. */
export function drawUnitCard(UW, UH, topY, botY) {
  if (UW < 400 || sessionState.over || sessionState.mode || sessionState.showMap) return false;
  const c = content();
  if (!c) return false;
  const g = canvasesState.ctx,
    cw = Math.min(210, Math.round(UW * 0.34)),
    x = UW - cw - 8,
    y = topY,
    availH = botY - y;
  let rh = 14,
    fl = c.flav ? wrap(c.flav, 0.8, cw - 28) : [];
  const need = () => 22 + (c.role ? 16 : 4) + 9 + c.rows.length * rh + (fl.length ? 8 + fl.length * 11 : 0) + 10;
  if (need() > availH) fl = [];
  if (need() > availH) rh = 12;
  if (need() > availH) return false;
  const h = need();
  menuPanel(x, y, cw, h);
  hudState.uiRects.push(U(x, y, cw, h));
  let yy = y + 8;
  TTL(c.name, x + 12, yy, 1.35);
  yy += 18;
  if (c.n > 1) {
    const s = "×" + c.n;
    g.save();
    g.font = "700 10px " + FFP;
    g.textAlign = "right";
    g.textBaseline = "top";
    g.fillStyle = "#ffe08a";
    g.fillText(s, x + cw - 12, y + 10);
    g.restore();
  }
  if (c.role) {
    g.save();
    g.font = "600 7.5px " + FFP;
    const rt = L(c.role).toUpperCase(),
      rw = Math.ceil(g.measureText(rt).width) + 12;
    g.strokeStyle = "rgba(240,205,115,.85)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x + 12 + 2, yy);
    g.lineTo(x + 12 + rw - 2, yy);
    g.lineTo(x + 12 + rw, yy + 2);
    g.lineTo(x + 12 + rw, yy + 10);
    g.lineTo(x + 12 + rw - 2, yy + 12);
    g.lineTo(x + 12 + 2, yy + 12);
    g.lineTo(x + 12, yy + 10);
    g.lineTo(x + 12, yy + 2);
    g.closePath();
    g.stroke();
    g.fillStyle = "#f0cd73";
    g.textBaseline = "middle";
    g.fillText(rt, x + 18, yy + 6.5);
    g.restore();
    yy += 16;
  } else yy += 4;
  ornLine(x + cw / 2, yy + 1, cw - 28);
  yy += 7;
  c.rows.forEach((r, i) => {
    const ry = yy + i * rh;
    if (i % 2 === 0) {
      g.fillStyle = "rgba(255,255,255,.04)";
      g.fillRect(x + 6, ry, cw - 12, rh);
    }
    glyph(r[0], x + 10, ry + (rh - 11) / 2, 11);
    T_(r[1], x + 26, ry + (rh - 8) / 2, "#c9bfa8", 0.8);
    if (typeof r[2] === "object") {
      const cp = costParts("", r[2].cost);
      drawCost(cp, x + cw * 0.42, ry + (rh - 6) / 2, cw * 0.58 - 8, 0.72, 8);
    } else {
      const v = L(r[2]);
      let sc = 0.85;
      while (sc > 0.55 && tw(v, sc) > cw * 0.6 - 12) sc -= 0.04;
      T_(v, x + cw - 12 - tw(v, sc), ry + (rh - 9 * sc) / 2 + 0.3, "#fff1c8", sc);
    }
  });
  yy += c.rows.length * rh;
  if (fl.length) {
    yy += 8;
    g.save();
    g.font = "italic 500 " + Math.round(9 * 0.8 * 1.25 * 0.88 + 0) + "px " + FF;
    g.textBaseline = "top";
    g.fillStyle = "#d8cfb8";
    for (const ln of fl) {
      g.fillText(ln, x + 14, yy);
      yy += 11;
    }
    g.restore();
  }
  return true;
}
