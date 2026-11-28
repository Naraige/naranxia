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
/* a third-person camera (the King, #102: "une vraie caméra TPS derrière le roi, plus proche"): close behind him, low, looking at his
   shoulders. The wheel goes from over his shoulder (KV_MIN) back to the old close view and beyond */
const KV_DIST = 7.5,
  KV_PITCH = 0.3,
  KV_MIN = 4,
  KV_MAX = 30,
  KV_LIFT = 2.6;
const KV_PMIN = 0.06;

/* the dragon rider has no King to walk (multiplayer/dragon role) */
const allowed = () =>
  sessionState.started &&
  !sessionState.over &&
  !sessionState.showMap &&
  !dragonMine() &&
  !sessionState.mode &&
  !buildMenuState.BCAT;

/* how far behind the King the camera may stand: it stops in front of a building instead of going inside it (a third-person camera with
   its back to a wall). Walked out from him along the view line; the heights are rough ones, in tiles */
const KV_BH = { castle: 11, tower: 7, keep: 8, wall: 3.5, gate: 4.5 };
function camRoom(k, want) {
  const kx = k.x / TS,
    kz = k.y / TS,
    cp = Math.cos(CAM.pitch),
    sp = Math.sin(CAM.pitch),
    dx = Math.sin(CAM.yaw) * cp,
    dz = Math.cos(CAM.yaw) * cp;
  let near = null;
  for (const s of sessionState.structs) {
    if (s.prog < 1 || Math.abs(s.x / TS - kx) > want + 14 || Math.abs(s.y / TS - kz) > want + 14) continue;
    (near || (near = [])).push(s);
  }
  if (!near) return want;
  for (let d = 1.5; d <= want; d += 0.5) {
    const x = kx + dx * d,
      z = kz + dz * d,
      y = KV_LIFT + sp * d;
    for (const s of near) {
      const h = (s.sz || 2) / 2 + 0.6;
      if (Math.abs(x - s.x / TS) < h && Math.abs(z - s.y / TS) < h && y < (KV_BH[s.type] || 5))
        return Math.max(2.4, d - 0.8);
    }
  }
  return want;
}

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
      CAM.lift = 0;
      CAM.pmin = 0;
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
  const want = Math.min(KV_MAX, Math.max(KV_MIN, s.kd || KV_DIST)),
    room = camRoom(k, want);
  /* it comes in quickly when a building is in its back, and goes back out gently */
  CAM.dist += (room - CAM.dist) * (room < CAM.dist ? Math.min(1, dt * 14) : a);
  CAM.lift = (CAM.lift || 0) + (KV_LIFT - (CAM.lift || 0)) * a;
  CAM.pmin = KV_PMIN; /* the tilt may go almost level here (input/desktop.js clamps the drag with it) */
  /* the view is the player's (2026-11-27, "let free cam direction"): the camera comes down to its angle when the view opens, then
     right-drag turns and tilts it as in the view from above, and the angle he leaves is the one he finds next time */
  if (s.ease > 0) {
    s.ease -= dt;
    CAM.pitch += ((s.kp || KV_PITCH) - CAM.pitch) * a;
  } else s.kp = CAM.pitch;
  CAM.x += (k.x / TS - CAM.x) * a;
  CAM.z += (k.y / TS - CAM.z) * a;
  CUTU.value.set(CAM.x, CAM.y, CAM.z, 2.4);
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
  s.kd = Math.max(KV_MIN, Math.min(KV_MAX, (s.kd || KV_DIST) * (d > 0 ? 1.15 : 1 / 1.15)));
  return true;
}
