import { rmotion } from "../core/prefs.js";
import { canvasesState } from "./canvases.js";

/* ================= interface animations (revamp lot 4), visual only =================
   Everything runs on the wall clock (performance.now), never on the game clock or Math.random, and is switched off by Reduce motion.
   Costs: one gradient per frame for the fire glow, a few fillRects for the title-to-game curtain. */

/* --- campfire glow on the title: a warm light breathing at the bottom of the screen (behind the Play button) --- */
export function fireGlow(UW, UH) {
  const g = canvasesState.ctx,
    t = rmotion() ? 0 : performance.now() / 1000,
    fl =
      0.24 + (rmotion() ? 0 : 0.045 * Math.sin(t * 7.3) + 0.03 * Math.sin(t * 12.7 + 1.3) + 0.02 * Math.sin(t * 3.1)),
    cx = UW * 0.22,
    cy = UH * 1.04,
    r = Math.max(UW * 0.5, UH * 0.75);
  const rg = g.createRadialGradient(cx, cy, 4, cx, cy, r);
  rg.addColorStop(0, "rgba(255,170,60," + (fl * 1.5).toFixed(3) + ")");
  rg.addColorStop(0.3, "rgba(240,110,30," + (fl * 0.7).toFixed(3) + ")");
  rg.addColorStop(1, "rgba(200,60,20,0)");
  g.fillStyle = rg;
  g.fillRect(0, Math.max(0, cy - r), Math.min(UW, cx + r), UH);
}

/* --- title to game: a dark curtain that lifts in 450 ms, two gold rules sliding apart --- */
const FX = { seen: -1e9, t0: -1e9 };
/* called by the title / setup / site picker screens every frame they are shown */
export const fxTitleSeen = () => {
  FX.seen = performance.now();
};
/* called at the end of the in-game UI: starts when the game view follows a title screen within 300 ms */
export function fxGameIn(UW, UH) {
  const now = performance.now();
  if (now - FX.seen < 300 && now - FX.t0 > 1000) {
    FX.t0 = now;
    FX.seen = -1e9;
  }
  const a = (now - FX.t0) / 450;
  if (a >= 1 || rmotion()) return;
  const g = canvasesState.ctx,
    e = 1 - (1 - a) * (1 - a),
    half = UH / 2,
    open = e * half;
  g.fillStyle = "rgba(6,7,11," + (1 - e).toFixed(3) + ")";
  g.fillRect(0, 0, UW, UH);
  g.fillStyle = "rgba(6,7,11," + (0.9 * (1 - e)).toFixed(3) + ")";
  g.fillRect(0, 0, UW, half - open);
  g.fillRect(0, half + open, UW, half - open);
  g.fillStyle = "rgba(240,205,115," + (1 - e).toFixed(3) + ")";
  g.fillRect(0, Math.round(half - open) - 1, UW, 1);
  g.fillRect(0, Math.round(half + open), UW, 1);
}
