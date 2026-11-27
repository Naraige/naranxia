import { dragonMine } from "../gameplay/dragon.js";
import { TH, TS, TW } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { T_ } from "../i18n/language.js";
import { inputState } from "../input/state.js";
import { dragonSend } from "../multiplayer/commands.js";
import { canvasesState, cv } from "../ui/canvases.js";
import { KB } from "../ui/settings.js";
import { LAND } from "../world/terrain-state.js";
import { gh } from "../world/terrain-queries.js";
import { puff } from "./effects.js";
import { CUTU } from "./materials.js";
import { dragonKit } from "./models/dragon.js";
import { CAM, scene } from "./scene.js";
import { THREE } from "./three.js";
import { UNITK } from "./unit-animation.js";

/* ---- the dragon on screen and in the hands (co-op Dragon role, v101) ----
   The rider's machine flies the dragon here, every frame, from the mouse and the keys: the mouse steers (left / right turns, up / down
   climbs and dives), the camera keys push and brake, Space takes off and climbs, the left button breathes fire. Ten times a second it
   sends where the dragon is ('dg', gameplay/dragon.js). The partner's machine draws the dragon from what the simulation holds, smoothed.
   Nothing here is read by the simulation. */
const DRK = UNITK / 1.5; /* tiles per metre of the model: the rider is a unit of the game at its true size */
const V = {
  d: null /* the simulation dragon this view was built for */,
  rig: null,
  holder: null,
  S: 1,
  P: null,
  sm: null,
  fire: false,
  heat: 0,
  over: false,
  sta: 100,
  sendT: 0,
  t: 0,
  dist: 21,
  told: false,
  fxT: 0,
};
export const dragonViewState = V;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)),
  damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt)),
  angd = (a, b) => {
    let d = (b - a) % 6.283185307;
    if (d > Math.PI) d -= 6.283185307;
    if (d < -Math.PI) d += 6.283185307;
    return d;
  };
const _v = new THREE.Vector3();

function drop() {
  if (V.holder) {
    scene.remove(V.holder);
    dragonKit().disposeOwn(V.rig.root);
  }
  V.holder = V.rig = V.d = V.P = V.sm = null;
  CAM.fly = null;
  CUTU.value.w = 0;
}

function make(d) {
  const K = dragonKit(),
    look = Object.assign({}, K.look, { ev: 2 });
  V.rig = K.buildDragon(look);
  V.S = look.size * DRK;
  V.rig.root.scale.setScalar(V.S);
  V.rig.root.position.y = -V.rig.cy * V.S;
  V.holder = new THREE.Group();
  V.holder.rotation.order = "YXZ";
  V.holder.add(V.rig.root);
  scene.add(V.holder);
  V.d = d;
  const x = d.x / TS,
    z = d.y / TS,
    g = gh(x, z);
  V.P = {
    x,
    z,
    y: d.fl ? d.a / 100 : g + V.rig.cy * V.S,
    yaw: d.w / 1000,
    pit: 0,
    roll: 0,
    spd: 0,
    fly: !!d.fl,
    turn: 0,
    vy: 0,
  };
  V.sm = { x, z, y: V.P.y, yaw: V.P.yaw, pit: 0, spd: 0 };
  V.heat = 0;
  V.over = false;
  V.sta = 100;
  V.fire = false;
}

/* the left button breathes fire; returns true when the click was the rider's (nothing else must take it) */
export function dragonMouse(e, down) {
  if (!dragonMine()) return false;
  if (e.button === 0) V.fire = down;
  return true;
}
export function dragonZoom(d) {
  if (!dragonMine()) return false;
  V.dist = clamp(V.dist * (d > 0 ? 1.12 : 1 / 1.12), 11, 40);
  return true;
}

function fly(dt, keys) {
  const P = V.P,
    m = inputState.mouse,
    foot = V.rig.cy * V.S;
  let mx = m && m.x >= 0 ? (m.x / cv.width) * 2 - 1 : 0,
    my = m && m.x >= 0 ? (m.y / cv.height) * 2 - 1 : 0;
  mx = Math.abs(mx) < 0.07 ? 0 : (mx - Math.sign(mx) * 0.07) / 0.93;
  my = Math.abs(my) < 0.07 ? 0 : (my - Math.sign(my) * 0.07) / 0.93;
  const up = keys[KB.up] || keys.arrowup,
    dn = keys[KB.down] || keys.arrowdown,
    sp = keys[" "] || keys.space,
    g = gh(P.x, P.z);
  if (P.fly) {
    const boost = up && V.sta > 0;
    V.sta = boost ? Math.max(0, V.sta - 26 * dt) : Math.min(100, V.sta + 16 * dt);
    P.turn = damp(P.turn, -mx * 1.5, 5, dt);
    P.yaw += P.turn * dt;
    P.pit = damp(P.pit, clamp(-my * 0.75 + (sp ? 0.35 : 0), -0.8, 0.65), 3.5, dt);
    P.spd = damp(P.spd, (boost ? 25 : dn ? 8 : 15) - Math.sin(P.pit) * 9, 1.4, dt);
    P.roll = damp(P.roll, clamp(-P.turn * 0.55, -0.7, 0.7), 4, dt);
    const ch = Math.cos(P.pit) * P.spd;
    P.vy = Math.sin(P.pit) * P.spd;
    P.x += Math.sin(P.yaw) * ch * dt;
    P.z += Math.cos(P.yaw) * ch * dt;
    P.y = Math.min(LAND + 70, P.y + P.vy * dt);
    if (P.y < g + foot + 0.4) {
      P.y = g + foot + 0.4;
      if (dn || P.pit < -0.25) {
        P.fly = false;
        P.spd = 0;
      } else P.pit = Math.max(P.pit, 0.05);
    }
  } else {
    V.sta = Math.min(100, V.sta + 16 * dt);
    P.turn = damp(P.turn, -mx * 1.2, 5, dt);
    P.yaw += P.turn * dt;
    P.pit = damp(P.pit, 0, 5, dt);
    P.roll = damp(P.roll, 0, 5, dt);
    P.spd = damp(P.spd, up ? 4.5 : 0, 4, dt);
    P.x += Math.sin(P.yaw) * P.spd * dt;
    P.z += Math.cos(P.yaw) * P.spd * dt;
    P.y = damp(P.y, gh(P.x, P.z) + foot, 10, dt);
    P.vy = 0;
    if (sp) {
      P.fly = true;
      P.spd = 9;
      P.pit = 0.4;
      P.y += 0.6;
    }
  }
  P.x = clamp(P.x, 6, TW - 6);
  P.z = clamp(P.z, 6, TH - 6);
  const firing = V.fire && !V.over;
  if (firing) {
    V.heat = Math.min(100, V.heat + 34 * dt);
    if (V.heat >= 100) V.over = true;
  } else {
    V.heat = Math.max(0, V.heat - (V.over ? 18 : 30) * dt);
    if (V.over && V.heat <= 30) V.over = false;
  }
  /* the breath lands on the ground ahead: further when the dragon flies higher */
  const r = clamp((P.y - g) * 1.4 + 5, 5, 16),
    ax = P.x + Math.sin(P.yaw) * r,
    az = P.z + Math.cos(P.yaw) * r;
  V.sendT -= dt;
  if (V.sendT <= 0 || firing !== V.sentF) {
    V.sendT = 0.1;
    V.sentF = firing;
    dragonSend({
      x: Math.round(P.x * TS),
      y: Math.round(P.z * TS),
      a: Math.round(P.y * 100),
      w: Math.round(P.yaw * 1000),
      p: Math.round(P.pit * 1000),
      f: firing ? 1 : 0,
      fl: P.fly ? 1 : 0,
      ax: Math.round(ax * TS),
      ay: Math.round(az * TS),
    });
  }
  /* camera: behind and above, turning with the dragon */
  const a = Math.min(1, dt * 5);
  CAM.x = P.x;
  CAM.z = P.z;
  CAM.fly = P.y + 1;
  CAM.y = CAM.fly;
  CAM.yaw += angd(CAM.yaw, P.yaw + Math.PI) * a;
  CAM.pitch += (clamp(0.3 - P.pit * 0.45, 0.1, 0.9) - CAM.pitch) * a;
  CAM.dist += (V.dist - CAM.dist) * a;
  CUTU.value.set(P.x, P.y - 1, P.z, 2.4);
  return firing;
}

/* every frame, before the camera keys are read; true when the keys were the rider's */
export function dragonFrame(dt, keys) {
  const d = sessionState.started && sessionState.inGame ? sessionState.DRG : null;
  if (!d) {
    if (V.holder) drop();
    return false;
  }
  if (d !== V.d) {
    if (V.holder) drop();
    make(d);
  }
  const mine = dragonMine(),
    live = !sessionState.paused && !sessionState.over && !sessionState.showMap;
  V.t += dt;
  let firing = !!d.f,
    S;
  if (mine) {
    if (live) firing = fly(dt, keys);
    const P = V.P;
    S = {
      x: P.x,
      y: P.y,
      z: P.z,
      yaw: P.yaw,
      pit: P.pit,
      roll: P.roll,
      spd: P.spd,
      fly: P.fly,
      vy: P.vy,
      turn: P.turn,
    };
    if (!V.told) {
      V.told = true;
      sessionState.bannerT = 6;
      sessionState.bannerS = "DRAGON RIDER";
      sessionState.bannerS2 = "Space takes off, the mouse steers, hold the left button to breathe fire";
    }
  } else {
    const m = V.sm,
      tx = d.x / TS,
      tz = d.y / TS,
      k = 1 - Math.exp(-9 * dt),
      ox = m.x,
      oz = m.z,
      oy = m.y,
      oyaw = m.yaw;
    m.x += (tx - m.x) * k;
    m.z += (tz - m.z) * k;
    m.y += ((d.fl ? d.a / 100 : gh(tx, tz) + V.rig.cy * V.S) - m.y) * k;
    m.yaw += angd(m.yaw, d.w / 1000) * k;
    m.pit += (d.p / 1000 - m.pit) * k;
    const sp = dt > 0 ? Math.hypot(m.x - ox, m.z - oz) / dt : 0;
    m.spd += (sp - m.spd) * Math.min(1, dt * 4);
    const turn = dt > 0 ? angd(oyaw, m.yaw) / dt : 0;
    S = {
      x: m.x,
      y: m.y,
      z: m.z,
      yaw: m.yaw,
      pit: m.pit,
      roll: clamp(-turn * 0.5, -0.6, 0.6),
      spd: m.spd,
      fly: !!d.fl,
      vy: dt > 0 ? (m.y - oy) / dt : 0,
      turn,
    };
  }
  V.holder.position.set(S.x, S.y, S.z);
  V.holder.rotation.set(-S.pit, S.yaw, S.roll);
  dragonKit().animRig(V.rig, {
    t: V.t,
    dt,
    flying: S.fly,
    speed: S.spd / DRK,
    boost: mine && S.spd > 19,
    vy: S.vy / DRK,
    firing,
    aimPitch: 0,
    aimYaw: 0,
    turn: S.turn,
    thrust: 0,
    alt: (S.y - gh(S.x, S.z)) / DRK,
    heat: mine ? V.heat : firing ? 70 : 0,
    show: 0,
  });
  /* the breath: flames from the mouth down to where the simulation burns */
  if (firing && live) {
    V.fxT -= dt;
    if (V.fxT <= 0) {
      V.fxT = 0.045;
      V.holder.updateMatrixWorld(true);
      V.rig.mouth.getWorldPosition(_v);
      const ax = d.ax / TS,
        az = d.ay / TS;
      for (let i = 1; i <= 4; i++) {
        const q = i / 4,
          x = _v.x + (ax - _v.x) * q,
          z = _v.z + (az - _v.z) * q,
          h = Math.max(0.3, _v.y + (gh(ax, az) - _v.y) * q - gh(x, z));
        puff(x * TS, z * TS, i & 1 ? "#ffb23c" : "#ff6a1a", i === 4 ? 3 : 1, i === 4 ? 70 : 30, {
          T: 0.45,
          z: h,
          vz: 0.6,
          g: -0.5,
          s: 0.16 + q * 0.2,
        });
      }
    }
  }
  return mine;
}

/* the rider's two gauges, under the top bar */
export function dragonBar(UW, y) {
  if (!dragonMine() || sessionState.over) return 0;
  const c = canvasesState.ctx,
    w = Math.min(120, (UW - 30) / 2),
    bar = (x, v, lab, c1, c2) => {
      c.fillStyle = "rgba(8,8,12,.82)";
      c.fillRect(x - 1, y - 1, w + 2, 13);
      c.fillStyle = "#23262e";
      c.fillRect(x, y, w, 11);
      c.fillStyle = c1;
      c.fillRect(x, y, Math.round((w * v) / 100), 11);
      c.fillStyle = c2;
      c.fillRect(x, y, Math.round((w * v) / 100), 2);
      T_(lab, x + 4, y + 2, "#fff6dc", 0.78);
    };
  bar(Math.round(UW / 2 - w - 3), V.sta, "Stamina", "#2f86b0", "#7fc8e8");
  bar(Math.round(UW / 2 + 3), V.heat, V.over ? "Overheated" : "Breath heat", V.over ? "#c8402e" : "#e08a1e", "#ffd27a");
  return 16;
}
