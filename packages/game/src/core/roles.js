import { dragonMine, dragonSet0, dragonTick, mkDragon } from "../gameplay/dragon.js";
import { mkU, spawnPos } from "../gameplay/entities.js";
import { roleHooks } from "../gameplay/role-hooks.js";
import { sessionState } from "../gameplay/session.js";
import { royalSpawn } from "../gameplay/squads.js";
import { kingViewFrame, kingViewToggle, kingViewZoom } from "../input/king-view.js";
import { dragonPanelDraw, dragonPanelKey } from "../ui/dragon-panel.js";
import { dragonBar, dragonFrame, dragonMouse, dragonZoom } from "../rendering/dragon-rider.js";

/* wires the King view and the Dragon role into the game (gameplay/role-hooks.js says why) */
export function initializeRoles() {
  roleHooks.frame = (dt, keys) => dragonFrame(dt, keys) || kingViewFrame(dt, keys);
  roleHooks.zoom = (d) => dragonZoom(d) || kingViewZoom(d);
  roleHooks.mouse = dragonMouse;
  roleHooks.rider = dragonMine;
  roleHooks.viewToggle = kingViewToggle;
  roleHooks.bar = dragonBar;
  roleHooks.key = dragonPanelKey;
  roleHooks.panel = dragonPanelDraw;
  roleHooks.tick = dragonTick;
  roleHooks.dragonSet = dragonSet0;
  roleHooks.mkDragon = mkDragon;
  /* every kingdom starts with its King and his two guards at the castle door: the player walks him from the first second */
  roleHooks.startKing = (c) => {
    const p = spawnPos(c),
      k = mkU(0, "king", p.x, p.y);
    sessionState.units.push(k);
    royalSpawn(k, c, true);
  };
}
