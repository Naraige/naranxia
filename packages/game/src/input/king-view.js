import { dragonMine } from "../gameplay/dragon.js";
import { kingOf } from "../gameplay/king-skills.js";
import { LPL } from "../gameplay/players.js";
import { TS } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { kingDrive, kingStrike } from "../multiplayer/commands.js";
import { pickGround } from "../rendering/camera.js";
import { inputState } from "./state.js";
import { CUTU } from "../rendering/materials.js";
import { CAM } from "../rendering/scene.js";
import { buildMenuState } from "../ui/build-menu.js";
import { hudDisplayState } from "../ui/hud-state.js";
import { KB } from "../ui/settings.js";

/* ---- King view (v101) ----
   The player starts the game beside his King: the camera sits close behind him and the camera keys walk him (a 'kd' lockstep command a few
   times a second, an ordinary move order for the King alone, so his guards march with him). Building needs the map: opening a category of the
   build menu or holding a placement tool lifts the camera to the old view from above, and it comes back down when the tool is put away.
   V switches by hand. Visual and input only: the simulation sees move orders. */
export const kingViewState = {
  want: true /* the player's choice (V) */,
  on: false /* the close view is what is shown now */,
  top: null /* distance and pitch of the view from above, kept while the close view is on */,
  sendT: 0,
  moving: false,
  told: false,
  kd: 0,
  kp: 0 /* the tilt the player left the King view at */,
  ease: 0,
  dx: 0,
  dy: 0,
};
const KV_DIST = 15,
  KV_PITCH = 0.62;

/* the dragon rider has no King to walk (multiplayer/dragon role) */
const allowed = () =>
  sessionState.started &&
  !sessionState.over &&
  !sessionState.showMap &&
  !dragonMine() &&
  !sessionState.mode &&
  !buildMenuState.BCAT;

export function kingViewToggle() {
  kingViewState.want = !kingViewState.want;
  hudDisplayState.msgS = kingViewState.want ? "King view: the camera keys walk the King" : "View from above";
  hudDisplayState.msgT = 2.5;
}

function stop() {
  const s = kingViewState;
  if (s.moving) {
    s.moving = false;
    const k = kingOf(LPL());
    if (k) kingDrive({ x: k.x, y: k.y });
  }
}

/* called every frame before the camera keys are read; returns true when it used them (the camera must not pan) */
export function kingViewFrame(dt, keys) {
  const s = kingViewState,
    k = s.want && allowed() ? kingOf(LPL()) : null;
  if (!k) {
    if (s.on) {
      CUTU.value.w = 0;
      stop();
      s.on = false;
      if (s.top) {
        CAM.dist = s.top.dist;
        CAM.pitch = s.top.pitch;
        s.top = null;
      }
    }
    return false;
  }
  if (!s.on) {
    s.on = true;
    s.top = { dist: CAM.dist, pitch: CAM.pitch };
    s.sendT = 0;
    s.ease = 0.6;
    if (!s.told) {
      s.told = true;
      hudDisplayState.msgS =
        "Keys walk the King, left click strikes, right-drag turns the view. Build menu: view from above";
      hudDisplayState.msgT = 7;
    }
  }
  const a = Math.min(1, dt * 6);
  CAM.dist += (Math.min(KV_DIST * 2, Math.max(7, s.kd || KV_DIST)) - CAM.dist) * a;
  /* the view is the player's (2026-11-27, "let free cam direction"): the camera comes down to its angle when the view opens, then
     right-drag turns and tilts it as in the view from above, and the angle he leaves is the one he finds next time */
  if (s.ease > 0) {
    s.ease -= dt;
    CAM.pitch += ((s.kp || KV_PITCH) - CAM.pitch) * a;
  } else s.kp = CAM.pitch;
  CAM.x += (k.x / TS - CAM.x) * a;
  CAM.z += (k.y / TS - CAM.z) * a;
  CUTU.value.set(CAM.x, CAM.y, CAM.z, 3);
  let fx = 0,
    fz = 0;
  if (keys[KB.up] || keys.arrowup) fz -= 1;
  if (keys[KB.down] || keys.arrowdown) fz += 1;
  if (keys[KB.left] || keys.arrowleft) fx -= 1;
  if (keys[KB.right] || keys.arrowright) fx += 1;
  if (keys[KB.rotL]) CAM.yaw -= dt * 1.8;
  if (keys[KB.rotR]) CAM.yaw += dt * 1.8;
  if (sessionState.paused) return true;
  if (fx || fz) {
    const sn = Math.sin(CAM.yaw),
      cs = Math.cos(CAM.yaw),
      l = Math.hypot(fx, fz),
      dx = (fx * cs + fz * sn) / l,
      dy = (-fx * sn + fz * cs) / l;
    s.sendT -= dt;
    if (s.sendT <= 0 || Math.abs(dx - s.dx) + Math.abs(dy - s.dy) > 0.3) {
      s.sendT = 0.2;
      s.dx = dx;
      s.dy = dy;
      s.moving = true;
      kingDrive({ x: k.x + dx * TS * 3.5, y: k.y + dy * TS * 3.5 });
    }
  } else stop();
  return true;
}

/* left click in the King view: he strikes towards the point under the cursor (#97). The click is the King's: selecting is done from above. */
export function kingViewMouse(e, down) {
  if (!kingViewState.on || e.button !== 0) return false;
  if (down && !sessionState.paused) {
    const k = kingOf(LPL()),
      g = pickGround(inputState.mouse.x, inputState.mouse.y);
    if (k)
      kingStrike(
        g ? { x: g.x * TS, y: g.z * TS } : { x: k.x - Math.sin(CAM.yaw) * TS * 2, y: k.y - Math.cos(CAM.yaw) * TS * 2 },
      );
  }
  return true;
}

/* the wheel still zooms the close view, within reason */
export function kingViewZoom(d) {
  const s = kingViewState;
  if (!s.on) return false;
  s.kd = Math.max(7, Math.min(KV_DIST * 2, (s.kd || KV_DIST) * (d > 0 ? 1.15 : 1 / 1.15)));
  return true;
}
