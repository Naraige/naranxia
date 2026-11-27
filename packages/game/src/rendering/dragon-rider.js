import { snd } from "../audio/sound.js";
import { DRAGON, dragonMaxHp, dragonMine } from "../gameplay/dragon.js";
import { PR, prGain, prLoad, prLvl, prRankName, prSend, prUp } from "../gameplay/dragon-prog.js";
import { DR_EVS, DR_FLAMES, DR_LOOKS, DR_STAGES, drEv, drLvlXp } from "../gameplay/dragon-skills.js";
import { TH, TS, TW } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { L, T_ } from "../i18n/language.js";
import { inputState } from "../input/state.js";
import { dragonSend } from "../multiplayer/commands.js";
import { canvasesState, cv } from "../ui/canvases.js";
import { KB } from "../ui/settings.js";
import { LAND } from "../world/terrain-state.js";
import { gh } from "../world/terrain-queries.js";
import { puff, shake, vflash } from "./effects.js";
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
  key: "" /* what the dragon on screen was built from (look, flame, stage, size) */,
  balls: new Map() /* fireball in the simulation -> its mesh */,
  rt: 0,
  k0: -1 /* kills and wave already paid to the rider */,
  w0: -1,
  eK: false,
  rK: false,
  told2: false,
  down: false,
  panel: false /* the skill window is open: the dragon hangs still */,
};
const keyOf = (d) => [d.lk | 0, d.fc | 0, drEv(d.lv || 1), d.u ? d.u[5] : 0].join();
let ballGeo = null,
  ballMat = null;
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
  for (const m of V.balls.values()) scene.remove(m);
  V.balls.clear();
  V.holder = V.rig = V.d = V.P = V.sm = null;
  V.key = "";
  CAM.fly = null;
  CUTU.value.w = 0;
}

function make(d) {
  const K = dragonKit(),
    ev = drEv(d.lv || 1),
    fl = DR_FLAMES[d.fc | 0],
    look = Object.assign({}, K.look, DR_LOOKS[d.lk | 0][1], fl ? { flame: fl } : {}, { ev });
  V.key = keyOf(d);
  V.rig = K.buildDragon(look);
  V.S = look.size * DRK * DR_EVS[ev] * (1 + 0.06 * (d.u ? d.u[5] : 0));
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
export function dragonPanelOpen(on) {
  V.panel = !!on;
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
  const U = prUp(),
    ag = 1 + 0.08 * U[2] /* the wings */,
    up = keys[KB.up] || keys.arrowup,
    dn = keys[KB.down] || keys.arrowdown,
    sp = keys[" "] || keys.space,
    g = gh(P.x, P.z);
  if (P.fly) {
    const boost = up && V.sta > 0;
    V.sta = boost ? Math.max(0, V.sta - (26 * dt) / ag) : Math.min(100, V.sta + 16 * dt);
    P.turn = damp(P.turn, -mx * 1.5 * ag, 5, dt);
    P.yaw += P.turn * dt;
    P.pit = damp(P.pit, clamp(-my * 0.75 + (sp ? 0.35 : 0), -0.8, 0.65), 3.5, dt);
    P.spd = damp(P.spd, ((boost ? 25 : dn ? 8 : 15) - Math.sin(P.pit) * 9) * ag, 1.4, dt);
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
    V.heat = Math.min(100, V.heat + (34 * dt) / (1 + 0.18 * U[1]));
    if (V.heat >= 100) V.over = true;
  } else {
    V.heat = Math.max(0, V.heat - (V.over ? 18 : 30) * (1 + 0.2 * U[1]) * dt);
    if (V.over && V.heat <= 30) V.over = false;
  }
  /* the breath lands on the ground ahead: further when the dragon flies higher */
  const r = clamp((P.y - g) * 1.4 + 5, 5, 16),
    ax = P.x + Math.sin(P.yaw) * r,
    az = P.z + Math.cos(P.yaw) * r;
  /* E throws a fireball where the breath would land, R roars (the simulation checks the skill and the cooldown) */
  const e = !!keys.e,
    rr = !!keys.r,
    d0 = V.d;
  if (e && !V.eK && U[3] > 0 && d0.cb <= 0)
    dragonSend(
      {
        ax: Math.round((P.x + Math.sin(P.yaw) * r * 1.4) * TS),
        ay: Math.round((P.z + Math.cos(P.yaw) * r * 1.4) * TS),
      },
      "db",
    );
  if (rr && !V.rK && U[4] > 0 && d0.cr <= 0) dragonSend({}, "dr");
  V.eK = e;
  V.rK = rr;
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
      g: Math.max(0, Math.round((P.y - gh(P.x, P.z) - (P.fly ? 0 : V.rig.cy * V.S)) * 100)),
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
  CUTU.value.set(
    P.x,
    P.y - 1,
    P.z,
    4.6,
  ); /* a wide window: the cone starts at the camera (materials.js), so this is its size at the dragon */
  return firing;
}

/* the rider's machine: tells both machines his level and skills once, pays him xp, renown and gold for the horde burnt and the waves held */
function rider(d) {
  prLoad();
  if (!V.told2) {
    V.told2 = true;
    prSend();
  }
  const w = sessionState.waveN | 0;
  if (V.k0 < 0 || d.kills < V.k0) V.k0 = d.kills;
  if (V.w0 < 0) V.w0 = w;
  const k = d.kills - V.k0,
    wn = Math.max(0, w - V.w0);
  V.k0 = d.kills;
  V.w0 = w;
  if (!k && !wn) return;
  const news = prGain(k * 2 + wn * (10 + w * 5), k * 0.4 + wn * w * 2, k + wn * (20 + w * 10));
  if (!news) return;
  sessionState.bannerT = 4;
  if (news[0] < 0) {
    sessionState.bannerS = "PROMOTED";
    sessionState.bannerS2 = L(prRankName());
  } else if (drEv(news[1]) > drEv(news[0])) {
    sessionState.bannerS = "EVOLVED";
    sessionState.bannerS2 = L(DR_STAGES[drEv(news[1])]);
  } else {
    sessionState.bannerS = "LEVEL UP";
    sessionState.bannerS2 = L("Level") + " " + news[1] + "  -  " + L("New skills may be open: press U");
  }
  snd("dragonlevel");
}

/* what the dragon's state sounds and looks like on both machines (#95): the beat of its wings, the gusts of its breath, a growl and sparks
   when it is hurt, dark smoke when it is badly wounded or down, dust when it takes off and lands */
function life(d, S, dt, live) {
  if (!live) return;
  const wx = S.x * TS,
    wy = S.z * TS,
    up = S.y - gh(S.x, S.z);
  if (S.fly && !(d.dn > 0)) {
    V.wingT = (V.wingT || 0) - dt;
    if (V.wingT <= 0) {
      V.wingT = S.spd > 19 * 1 ? 0.55 : 0.85;
      snd("dragonwing", wx, wy);
    }
  }
  if (d.f && !(d.dn > 0)) {
    V.brT = (V.brT || 0) - dt;
    if (V.brT <= 0) {
      V.brT = 0.26;
      snd("dragonbreath", wx, wy);
    }
  }
  const hp = d.hp === undefined ? 1e9 : d.hp;
  if (V.hp0 !== undefined && hp < V.hp0 - 0.01) {
    V.hurtT = (V.hurtT || 0) - dt;
    if (V.hurtT <= 0) {
      V.hurtT = 0.5;
      snd("dragonhurt", wx, wy);
      for (let i = 0; i < 5; i++)
        puff(wx, wy, i & 1 ? "#c8402e" : "#ffb23c", 1, 70, { T: 0.5, z: up + 0.8, vz: 1.2, g: -3, s: 0.16 });
    }
  }
  V.hp0 = hp;
  if (d.dn > 0 || hp < dragonMaxHp(d) * 0.3) {
    V.smT = (V.smT || 0) - dt;
    if (V.smT <= 0) {
      V.smT = 0.18;
      puff(wx, wy, "#3a3438", 1, 12, { soft: 1, T: 1.8, s: 0.8, z: up + 0.8, vz: 1.2, g: -0.2 });
    }
  }
  if (V.wasFly !== undefined && V.wasFly !== S.fly) {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * 6.283;
      puff(wx + Math.cos(a) * TS * 1.5, wy + Math.sin(a) * TS * 1.5, "#c8b890", 1, 90, {
        soft: 1,
        T: 0.9,
        s: 0.6,
        z: 0.3,
        vz: 0.5,
        g: 0,
      });
    }
    snd("dragonwing", wx, wy);
  }
  V.wasFly = S.fly;
}

/* what the simulation holds, drawn on both machines: fireballs in flight and bursting, the roar */
function effects(d, dt, live) {
  if (!live) return;
  if (!ballGeo) {
    ballGeo = new THREE.SphereGeometry(0.55, 10, 8);
    ballMat = new THREE.MeshBasicMaterial({ color: 0xffa030 });
  }
  const seen = new Set();
  for (const b of d.bl || []) {
    seen.add(b);
    let m = V.balls.get(b);
    if (!m) {
      m = new THREE.Mesh(ballGeo, ballMat);
      scene.add(m);
      V.balls.set(b, m);
      snd("dragonball", b[3], b[4]);
    }
    const q = Math.min(1, b[2] / DRAGON.flight),
      x = (b[3] + (b[0] - b[3]) * q) / TS,
      z = (b[4] + (b[1] - b[4]) * q) / TS,
      y0 = b[5] / 100,
      y1 = gh(b[0] / TS, b[1] / TS) + 0.6;
    m.position.set(x, y0 + (y1 - y0) * q + Math.sin(q * Math.PI) * 1.2, z);
    m.scale.setScalar(1 + 0.25 * Math.sin(V.t * 30));
    if (V.t - (m.userData.f || 0) > 0.03) {
      m.userData.f = V.t;
      puff(x * TS, z * TS, "#ff8a1f", 1, 25, { T: 0.4, z: m.position.y - gh(x, z), vz: 0, g: 0, s: 0.3 });
    }
  }
  for (const [b, m] of V.balls)
    if (!seen.has(b)) {
      /* it burst: flames and a boom where it landed */
      const x = b[0],
        y = b[1];
      for (let i = 0; i < 14; i++)
        puff(x, y, i & 1 ? "#ffb23c" : "#ff6a1a", 2, 140, { T: 0.7, z: 0.5, vz: 2.5, g: -3, s: 0.5 });
      /* a blast worth the name (#96): flash and ring of light, debris that bounces, a column of smoke, the ground shakes */
      vflash(x, y, gh(x / TS, y / TS) + 0.8, 4.6, [1, 0.6, 0.22], 0.65, 1);
      puff(x, y, "#8a7058", 18, 130, { T: 0.9, z: 0.3, vz: 4.4, g: 10, s: 0.16 });
      puff(x, y, "#3e3a38", 8, 55, { soft: 1, T: 2.6, s: 0.9, z: 0.8, vz: 1.9, g: -0.25 });
      shake(0.3);
      snd("boom", x, y);
      scene.remove(m);
      V.balls.delete(b);
    }
  if (d.rt > V.rt + 0.5) {
    snd("dragonroar", d.rx, d.ry);
    vflash(d.rx, d.ry, gh(d.rx / TS, d.ry / TS) + 1.5, 7, [0.9, 0.9, 1], 0.7, 1);
    shake(0.2);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * 6.283;
      puff(d.rx + Math.cos(a) * TS * 5, d.ry + Math.sin(a) * TS * 5, "#e8e0c8", 1, 90, {
        T: 0.9,
        z: 1.5,
        vz: 0.2,
        g: 0,
        s: 0.45,
      });
    }
  }
  V.rt = d.rt || 0;
  /* the King's mark (#80): a ring of gold sparks where the fire burns harder */
  if (d.mt > (V.mt0 || 0) + 0.5 && d.mk)
    vflash(d.mk[0], d.mk[1], gh(d.mk[0] / TS, d.mk[1] / TS) + 0.5, 5, [1, 0.82, 0.3], 0.6, 1);
  V.mt0 = d.mt || 0;
  if (d.mt > 0 && d.mk && V.t - (V.mkT || 0) > 0.12) {
    V.mkT = V.t;
    const a = V.t * 2.2;
    for (let i = 0; i < 3; i++)
      puff(d.mk[0] + Math.cos(a + i * 2.094) * TS * 9, d.mk[1] + Math.sin(a + i * 2.094) * TS * 9, "#ffd24a", 1, 12, {
        T: 0.9,
        z: 0.4,
        vz: 1.6,
        g: 0,
        s: 0.22,
      });
  }
}

/* every frame, before the camera keys are read; true when the keys were the rider's */
export function dragonFrame(dt, keys) {
  const d = sessionState.started && sessionState.inGame ? sessionState.DRG : null;
  if (!d) {
    if (V.holder) drop();
    return false;
  }
  if (d !== V.d || V.key !== keyOf(d)) {
    /* the same dragon grown, evolved or re-coloured: rebuilt where it stands */
    const keep = d === V.d && V.P ? { P: V.P, sm: V.sm, sta: V.sta, heat: V.heat } : null;
    if (V.holder) drop();
    make(d);
    if (keep) {
      V.P = keep.P;
      V.sm = keep.sm;
      V.sta = keep.sta;
      V.heat = keep.heat;
    }
  }
  const mine = dragonMine(),
    live = !sessionState.paused && !sessionState.over && !sessionState.showMap && !V.panel;
  if (V.panel) V.fire = false;
  if (mine) rider(d);
  effects(d, dt, live);
  V.t += dt;
  let firing = !!d.f,
    S;
  if (mine) {
    /* down (#72): the simulation carried it back before its castle; it lies there until it can fly again */
    if (d.dn > 0) {
      if (!V.down) {
        V.down = true;
        const x = d.x / TS,
          z = d.y / TS;
        Object.assign(V.P, { x, z, y: gh(x, z) + V.rig.cy * V.S, pit: 0, roll: 0, spd: 0, fly: false, turn: 0, vy: 0 });
        V.fire = false;
        V.heat = 0;
        sessionState.bannerS = "DRAGON DOWN";
        sessionState.bannerS2 = L("It was carried back to the castle and will fly again soon");
        sessionState.bannerT = 4;
        snd("dragonroar", d.x, d.y);
        shake(0.35);
      }
      firing = false;
      CAM.x = V.P.x;
      CAM.z = V.P.z;
    } else {
      V.down = false;
      if (live) firing = fly(dt, keys);
    }
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
  /* down (#72): it lies on its side before the castle; it rolls over and gets up as the wait runs out (#95) */
  V.lie = damp(V.lie || 0, d.dn > 1.2 ? 1 : 0, 3, dt);
  V.holder.position.set(S.x, S.y - V.lie * V.rig.cy * V.S * 0.45, S.z);
  V.holder.rotation.set(-S.pit, S.yaw, S.roll + V.lie * 1.25);
  life(d, S, dt, live);
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
    bar = (x, v, lab, c1, c2, yy) => {
      yy = yy === undefined ? y : yy;
      c.fillStyle = "rgba(8,8,12,.82)";
      c.fillRect(x - 1, yy - 1, w + 2, 13);
      c.fillStyle = "#23262e";
      c.fillRect(x, yy, w, 11);
      c.fillStyle = c1;
      c.fillRect(x, yy, Math.round((w * v) / 100), 11);
      c.fillStyle = c2;
      c.fillRect(x, yy, Math.round((w * v) / 100), 2);
      T_(lab, x + 4, yy + 2, "#fff6dc", 0.78);
    };
  bar(Math.round(UW / 2 - w - 3), V.sta, "Stamina", "#2f86b0", "#7fc8e8");
  bar(Math.round(UW / 2 + 3), V.heat, V.over ? "Overheated" : "Breath heat", V.over ? "#c8402e" : "#e08a1e", "#ffd27a");
  /* second row: level with its experience, then the two keys of the skills */
  const l = prLvl(),
    a = drLvlXp(l),
    b = drLvlXp(l + 1),
    U = prUp(),
    d = V.d,
    y2 = y + 15,
    cd = (c, n, k) => (!n ? L(k) + " (U)" : c > 0 ? Math.ceil(c) + " s" : L("ready")),
    x1 = Math.round(UW / 2 - w - 3);
  bar(
    x1,
    l >= 20 ? 100 : ((PR.xp - a) / (b - a)) * 100,
    L("Level") + " " + l + " " + L(DR_STAGES[drEv(l)]),
    "#7a4fb0",
    "#c77dff",
    y2,
  );
  c.fillStyle = "rgba(8,8,12,.82)";
  c.fillRect(x1 + w + 5, y2 - 1, w + 2, 25);
  T_(
    "E " + L("Fireball") + " " + cd(d ? d.cb : 0, U[3], "locked"),
    x1 + w + 9,
    y2 + 2,
    U[3] ? "#ffd27a" : "#8a8a92",
    0.7,
  );
  T_("R " + L("Roar") + " " + cd(d ? d.cr : 0, U[4], "locked"), x1 + w + 9, y2 + 13, U[4] ? "#e8e0c8" : "#8a8a92", 0.7);
  /* third row: its life (#72), or the wait when it is down */
  if (d) {
    const mx = dragonMaxHp(d),
      y3 = y2 + 28,
      hp = d.hp === undefined ? mx : d.hp,
      w3 = w * 2 + 6,
      v = d.dn > 0 ? 1 - d.dn / DRAGON.down : hp / mx;
    c.fillStyle = "rgba(8,8,12,.82)";
    c.fillRect(x1 - 1, y3 - 1, w3 + 2, 13);
    c.fillStyle = "#23262e";
    c.fillRect(x1, y3, w3, 11);
    c.fillStyle = d.dn > 0 ? "#6a6a72" : v < 0.3 ? "#c8402e" : "#3f9c28";
    c.fillRect(x1, y3, Math.round(w3 * v), 11);
    T_(
      d.dn > 0 ? L("Dragon down") + "  " + Math.ceil(d.dn) + " s" : L("Dragon") + "  " + Math.ceil(hp) + " / " + mx,
      x1 + 4,
      y3 + 2,
      "#fff6dc",
      0.78,
    );
  }
  return 58;
}
