import { LPL } from "../gameplay/players.js";
import { MP } from "../multiplayer/session.js";
import { PAL, THEME } from "../ui/kingdom-theme.js";

/* ================= WHOSE COLOURS A THING IS DRAWN IN =================
   Everything of a kingdom wears its colours: the roofs of its buildings, its banners, the cloth of its men. In co-op each player keeps
   his own on both machines: the partner sends his colours and pattern with his name (MP.pth, the "hello" message). If both chose the same
   colour the partner is shown here in his second colour, or in the next one, so the two kingdoms never look alike. A rebel camp wears
   its camp colour. Returns the theme to draw o (a unit or a structure) in, or null for the kingdom of this player.
   Visual only: never read by the simulation. */
export function partnerTheme() {
  const t = MP.pth || { c: 1, c2: 11, p: 1 };
  let c = Math.abs(t.c | 0) % PAL.length;
  const c2 = Math.abs(t.c2 | 0) % PAL.length;
  if (c === THEME.c) c = c2 !== THEME.c ? c2 : (c + 1) % PAL.length;
  return { c, c2: c2 === c ? Math.abs(t.c | 0) % PAL.length : c2, p: t.p | 0 };
}
export function ownerTheme(o) {
  if (o.t === 2) return o.ci === undefined ? null : { c: o.ci | 0, c2: (o.ci | 0) === 7 ? 11 : 7, p: 7 };
  if (o.t !== 0 || !MP.on || (o.pl | 0) === LPL()) return null;
  return partnerTheme();
}
/* the name of the kingdom a structure or a unit of the player side belongs to */
export const ownerName = (o) => (!MP.on || (o.pl | 0) === LPL() ? THEME.n : MP.pname || "Partner");

/* the partner sent the colours of his kingdom (MP.pthNew, set by the "hello" message): the frame asks here once a frame, and everything is
   drawn again in them by the function rendering/structures.js registered */
let redraw = null;
export const setPartnerRedraw = (fn) => {
  redraw = fn;
};
export function partnerRefresh() {
  if (!MP.pthNew) return;
  MP.pthNew = false;
  if (redraw) redraw();
}
