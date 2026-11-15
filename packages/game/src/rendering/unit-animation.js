import { rmotion } from "../core/prefs.js";
import { snd } from "../audio/sound.js";
import { HEAL_R } from "../gameplay/construction.js";
import { T, TS } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { puff } from "./effects.js";
import { bxc, newG, toGeo } from "./geometry.js";
import { shdPose } from "./models/heraldry.js";
import { GEO } from "./models/structures.js";
import { zKeyOf } from "./models/swarm.js";
import { pxCannon } from "./models/unit-accessories.js";
import { gearSig } from "./models/gear-style.js";
import { alv, PXON } from "./models/units.js";
import { scene, SHADOWS } from "./scene.js";
import { gh } from "../world/terrain-queries.js";
import { unitG } from "./terrain.js";
import { THREE } from "./three.js";
import { buildUnitGroup, CARRYG, uiUMW, UL } from "./unit-instances.js";

/* units are drawn at 76% so a man stands about a quarter of a house high (the title screen keeps its own framing) */
export const UNITK = 0.76;

const T_C = (_u) => T.cannon.cdt;

export function cannonG() {
  if (PXON) return pxCannon();
  const G = newG(),
    WD = "#5e4026",
    WL = "#7a5532",
    IR = "#9a7438",
    IR2 = "#c09048",
    BR = "#2c2e33";
  for (const sx of [-1, 1]) {
    const x = sx * 0.27;
    bxc(G, x, 0.02, 0.36, 0.07, 0.4, 0.16, WD);
    bxc(G, x, 0.14, 0.36, 0.07, 0.16, 0.4, WD);
    bxc(G, x, 0.07, 0.36, 0.07, 0.3, 0.3, WL);
    bxc(G, x + sx * 0.04, 0.17, 0.36, 0.05, 0.1, 0.1, IR);
  }
  bxc(G, 0, 0.17, 0.36, 0.6, 0.06, 0.06, IR);
  bxc(G, 0, 0.2, 0.2, 0.36, 0.1, 0.5, WD);
  bxc(G, 0, 0.12, -0.1, 0.16, 0.08, 0.36, WD);
  bxc(G, 0, 0.08, -0.27, 0.2, 0.06, 0.08, IR);
  bxc(G, 0, 0.29, 0.3, 0.17, 0.17, 0.62, IR);
  bxc(G, 0, 0.27, 0.04, 0.22, 0.21, 0.14, IR2);
  bxc(G, 0, 0.31, -0.05, 0.08, 0.08, 0.06, IR);
  bxc(G, 0, 0.28, 0.62, 0.21, 0.21, 0.07, IR2);
  bxc(G, 0, 0.33, 0.66, 0.08, 0.08, 0.01, BR);
  for (const [x, z] of [
    [0.13, -0.06],
    [0.2, -0.02],
    [0.16, 0.04],
  ])
    bxc(G, x - 0.4, 0.01, z + 0.1, 0.07, 0.07, 0.07, BR);
  return toGeo(G);
}

/* visual only: gold sleeve stripes (0..3) from the promotion rank, soldiers of the player team */
const rkOf = (u) =>
  u.t === 0 && (u.type === "knight" || u.type === "archer") ? Math.min(3, ((u.xp || 0) / 4) | 0) : 0;
export function mkUnit(u) {
  const g = buildUnitGroup(
      u.type === "cannon" ? "gunner" : u.type,
      u.t === 2 ? 20 + (u.ci || 0) : u.t,
      zKeyOf(u) ||
        (u.type === "peasant" && u.t !== 1 ? { v: (((u.uid | 0) * 2654435761) >>> 0) % 6, hint: "p" } : null),
      rkOf(u),
    ),
    mdl = g.userData.mdl,
    mat = g.userData.mat;
  if (u.type === "cannon") {
    const s0 = (mdl.sc || 1.35) * UNITK,
      cn = new THREE.Mesh(GEO["cannonU" + gearSig()] || (GEO["cannonU" + gearSig()] = cannonG()), mat);
    cn.castShadow = SHADOWS;
    cn.scale.setScalar(0.8 / s0);
    cn.position.z = 0.26 / s0;
    g.add(cn);
    g.userData.cn = cn;
    g.userData.cnz = 0.26 / s0;
    const c2 = buildUnitGroup("gunner2", u.t, null),
      e2 = c2.userData;
    c2.remove(e2.ring);
    c2.traverse((o) => {
      if (o.isMesh) o.material = mat;
    });
    c2.position.set(0.36 / s0, 0, 0.34 / s0);
    c2.rotation.y = -0.35;
    g.add(c2);
    g.userData.c2 = c2;
  }
  if (u.type === "bannerman") {
    const au = new THREE.Mesh(
      GEO.auB || (GEO.auB = new THREE.RingGeometry(HEAL_R / TS / 1.35 / UNITK - 0.12, HEAL_R / TS / 1.35 / UNITK, 64)),
      new THREE.MeshBasicMaterial({
        color: 0x7dffa0,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    au.rotation.x = -Math.PI / 2;
    au.position.y = 0.22;
    au.renderOrder = 1;
    g.add(au);
    const fill = new THREE.Mesh(
      GEO.auBf || (GEO.auBf = new THREE.CircleGeometry(HEAL_R / TS / 1.35 / UNITK, 48)),
      new THREE.MeshBasicMaterial({ color: 0x7dffa0, transparent: true, opacity: 0.09, depthWrite: false }),
    );
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.2;
    g.add(fill);
    g.userData.aura = au;
  }
  if (u.type === "king") {
    const R = 10 / 1.72 / UNITK,
      au = new THREE.Mesh(
        GEO.auK || (GEO.auK = new THREE.RingGeometry(R - 0.14, R, 72)),
        new THREE.MeshBasicMaterial({
          color: 0xffd23c,
          transparent: true,
          opacity: 0.38,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
    au.rotation.x = -Math.PI / 2;
    au.position.y = 0.22;
    au.renderOrder = 1;
    g.add(au);
    const fill = new THREE.Mesh(
      GEO.auKf || (GEO.auKf = new THREE.CircleGeometry(R, 56)),
      new THREE.MeshBasicMaterial({ color: 0xffd23c, transparent: true, opacity: 0.06, depthWrite: false }),
    );
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.2;
    g.add(fill);
    g.userData.aura = au;
  }
  if (u.type === "captain") {
    const R = 8 / 1.35 / UNITK,
      au = new THREE.Mesh(
        GEO.auC || (GEO.auC = new THREE.RingGeometry(R - 0.14, R, 64)),
        new THREE.MeshBasicMaterial({
          color: 0xffd23c,
          transparent: true,
          opacity: 0.38,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
    au.rotation.x = -Math.PI / 2;
    au.position.y = 0.22;
    au.renderOrder = 1;
    g.add(au);
    const fill = new THREE.Mesh(
      GEO.auCf || (GEO.auCf = new THREE.CircleGeometry(R, 48)),
      new THREE.MeshBasicMaterial({ color: 0xffd23c, transparent: true, opacity: 0.07, depthWrite: false }),
    );
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.2;
    g.add(fill);
    g.userData.aura = au;
  }
  u.sv = u.sv || 0.95 + Math.random() * 0.1;
  const v = 0.93 + Math.random() * 0.12;
  mat.color.setRGB(v, v, v);
  {
    const s0 = (mdl.sc || 1.35) * u.sv * (u.ttl ? 1 : UNITK);
    g.scale.set(-s0, s0, s0);
    g.userData.sc = s0;
  }
  if (!u.ttl) {
    const ip = [];
    g.traverse((o) => {
      if (o.isMesh && o.material === mat) {
        o.layers.set(UL);
        ip.push(o);
      }
    });
    g.userData.ip = ip;
    g.updateMatrixWorld = uiUMW;
  }
  u.m = g;
  u.mt = u.t;
  u.mal = u.t === 0 ? alv() : 0;
  u.mrk = rkOf(u);
  u.dy = gh(u.x / TS, u.y / TS);
  u.ap = Math.random() * 6;
  u.fa = u.face || 0;
  u.lph = 0;
  scene.add(g);
  unitG.set(u, g);
  return g;
}

export const angd = (a, b) => {
  let d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
};

const ATKT = 0.35;

export const sat = (t) => Math.max(0, Math.min(1, t));
export const easeO = (t) => 1 - (1 - t) * (1 - t);
const CHOPC = { t: "#9d7a50", w: "#8b5a2b", s: "#cfd6e2", g: "#ffd23c", f: "#8a6a3a", p: "#6a5a3a" };

export function animUnit(u, dt, anyDmg, frame) {
  let g = u.m;
  if (g && !u.ttl && (u.mt !== u.t || (u.t === 0 && u.mal !== alv()) || u.mrk !== rkOf(u))) {
    scene.remove(g);
    if (g.userData.mat) g.userData.mat.dispose();
    unitG.delete(u);
    g = null;
  }
  if (!g) g = mkUnit(u);
  const d = g.userData,
    ty = u.type,
    z = u.t === 1,
    wl = u.walk > 0,
    T = sessionState.clockT + u.ph0;
  d.frame = frame;
  if (u.atk > 0) u.atk -= dt;
  if (u.hurt > 0) u.hurt -= dt;
  const fast = ty === "runner",
    heavy = ty === "brute" || ty === "bomber",
    armored = ty === "knight" || ty === "captain" || ty === "king" || ty === "guard";
  if (u.rg && u.cap && wl && u.cap.walk > 0 && u.cap.m) u.ap = u.cap.ap;
  u.ap +=
    dt *
    (wl ? (z ? (fast ? 14 : heavy ? 4.6 : 6.4) : armored ? 7.6 : 9.5) : 0) *
    (u.ttl ? 1 : 1.25) *
    (0.94 + (u.uid % 7) * 0.02);
  u.dy += ((u.gar || u.onF ? u.gz : gh(u.x / TS, u.y / TS)) - u.dy) * Math.min(1, dt * (u.gar ? 6 : 12));
  u.fa += angd(u.fa, u.face || 0) * Math.min(1, dt * 12);
  const k = Math.min(1, dt * 16),
    sw = wl ? Math.sin(u.ap) * (z ? (fast ? 0.95 : 0.55) : armored ? 0.65 : 0.85) : 0,
    ab = wl ? Math.abs(Math.sin(u.ap)) : 0;
  /* attack / work phases */
  const atk = u.atk > 0 ? 1 - u.atk / ATKT : -1,
    work =
      ty === "peasant" &&
      (!u.t || u.t === 2) &&
      !wl &&
      !u.carry &&
      (u.job === "r" ? anyDmg && !u.o : u.work > 0 && !u.o);
  let ar, al, lean, headX, headZ;
  let twist = 0,
    lunge = 0,
    headY = 0,
    sway = 0,
    wr = 0;
  if (wl) {
    ar = sw * 0.85;
    al = -sw * 0.85;
    sway = Math.sin(u.ap) * (z ? 0.1 : 0.045);
    lean = z ? 0.2 : fast ? 0.26 : heavy ? 0.12 : 0.06;
    twist = Math.sin(u.ap) * 0.1;
    headX = z ? 0.3 : 0.02;
    headZ = z ? Math.sin(u.ap * 0.5) * 0.2 + 0.18 : 0;
  } else {
    ar = Math.sin(T * 1.3) * 0.05;
    al = -Math.sin(T * 1.3) * 0.05;
    lean = z ? 0.18 : 0;
    headY = Math.sin(T * 0.6) * 0.3 * (atk < 0 ? 1 : 0);
    headX = z ? 0.34 + Math.sin(T * 1.7) * 0.05 : Math.sin(T * 0.9) * 0.03;
    headZ = z ? 0.22 : 0;
  }
  if (z) {
    ar = -1.45 + (wl ? Math.sin(u.ap * 0.9) * 0.18 : Math.sin(T * 1.8) * 0.1);
    al = -1.35 - (wl ? Math.sin(u.ap * 0.9 + 1) * 0.18 : Math.sin(T * 1.6) * 0.1);
    const zr = (u.uid * 2654435761) >>> 0;
    ar += ((zr & 15) / 15 - 0.5) * 0.36;
    al += (((zr >> 4) & 15) / 15 - 0.5) * 0.36;
    if ((zr >> 8) % 9 === 0) al = -0.28 + Math.sin(T * 1.6) * 0.06;
    else if ((zr >> 12) % 11 === 0) ar = -0.24 + Math.sin(T * 1.4) * 0.06;
    headZ += (((zr >> 16) & 15) / 15 - 0.5) * 0.34;
  }
  if (ty === "brute") {
    if (wl) {
      const s2 = Math.sin(u.ap);
      ar = -0.42 - s2 * 0.62;
      al = -0.42 + s2 * 0.62;
      lean = 0.58 + Math.abs(Math.cos(u.ap)) * 0.06;
      sway = s2 * 0.07;
      headX = -0.42;
      headZ = 0;
    } else {
      ar = -0.3 + Math.sin(T * 1.6) * 0.05;
      al = -0.3 - Math.sin(T * 1.5) * 0.05;
      lean = 0.5;
      headX = -0.36 + Math.sin(T * 1.7) * 0.04;
      headZ = 0;
    }
  }
  if (ty === "archer") {
    al = -1.28;
    ar = wl ? -sw * 0.6 - 0.2 : -0.45;
    lean = 0;
  }
  if (armored || ty === "bannerman") {
    al = d.shd
      ? -0.3 + (wl ? -sw * 0.14 : Math.sin(T * 1.3) * 0.02)
      : wl
        ? -sw * (armored ? 0.25 : 0.7)
        : -Math.sin(T * 1.3) * 0.03;
  }
  if (armored && u.atk <= 0) ar = -0.75 + (wl ? Math.sin(u.ap * 0.9) * 0.07 : Math.sin(T * 1.3) * 0.04);
  if (atk >= 0) {
    const p = atk;
    if (ty === "archer") {
      const dr = p < 0.55 ? easeO(p / 0.55) : 1 - ((p - 0.55) / 0.45) * 0.6;
      ar = -1.35 - 0.1 * dr;
      al = -1.46;
      twist = 0.5 * dr;
      lean = -0.05 * dr;
      if (p > 0.55 && p < 0.7) lean = -0.12;
      headY = -0.35 * dr;
    } else if (z) {
      const t = p < 0.25 ? easeO(p / 0.25) : p < 0.55 ? 1 - ((p - 0.25) / 0.3) * 1.6 : -0.6 * (1 - (p - 0.55) / 0.45);
      ar = -1.45 - 0.55 * Math.max(0, t) + Math.max(0, -t) * 1.3;
      al = ar + 0.1;
      lean = 0.18 + 0.25 * (p > 0.25 && p < 0.6 ? 1 : 0);
      lunge = p > 0.25 && p < 0.6 ? 0.1 : 0;
      headX = 0.5;
    } else {
      const wu = p < 0.25,
        st = p >= 0.25 && p < 0.5,
        t = wu ? easeO(p / 0.25) : st ? (p - 0.25) / 0.25 : 1 - (p - 0.5) / 0.5;
      ar = wu ? -0.2 - 2.3 * t : st ? -2.5 + 3.0 * t : 0.5 * (1 - (p - 0.5) / 0.5) * 1;
      al = wu ? -0.5 * t : st ? -0.5 + 0.7 * t : 0;
      wr = wu ? 0.55 * t : st ? 0.55 - 1.05 * t : -0.5 * (1 - (p - 0.5) / 0.5);
      twist = wu ? 0.35 * t : st ? 0.35 - 0.8 * t : -0.45 * (1 - (p - 0.5) / 0.5);
      lean = wu ? -0.12 * t : st ? -0.12 + 0.5 * t : 0.38 * (1 - (p - 0.5) / 0.5);
      lunge = st ? 0.14 * t : p >= 0.5 ? 0.14 * (1 - (p - 0.5) / 0.5) : 0;
      headX = st ? 0.2 : 0;
    }
  }
  if (ty === "cannon") {
    ar = -1.15 + (wl ? Math.sin(u.ap) * 0.05 : 0);
    al = ar;
    lean = wl ? 0.28 : 0.1;
    twist = 0;
    lunge = 0;
    headX = 0;
  }
  if (ty === "guard" || ty === "spearman") {
    if (wl) d.wasW = 1;
    else if (d.wasW) {
      d.wasW = 0;
      d.pst = sessionState.clockT;
    }
    if (atk < 0) {
      if (wl) {
        ar = -0.3 + Math.sin(u.ap * 0.9) * 0.05;
        u.gwr = ty === "guard" ? -1.12 : -1.58;
      } else {
        ar = -0.14 + Math.sin(T * 1.2) * 0.01;
        u.gwr = -1.43;
        headX = -0.03;
        headY = 0;
        lean = -0.02;
        const pk = sessionState.clockT - (d.pst || -9);
        if (pk < 0.55) {
          const e = Math.sin(Math.min(1, pk / 0.55) * Math.PI);
          ar -= 0.26 * e;
          u.gwr -= 0.06 * e;
        }
      }
    } else {
      const p = atk,
        wu = p < 0.3,
        th = p >= 0.3 && p < 0.55,
        t = wu ? easeO(p / 0.3) : th ? (p - 0.3) / 0.25 : 1 - (p - 0.55) / 0.45;
      if (wu) {
        ar = -0.36 - 0.24 * t;
        u.gwr = -1.28 + 1.53 * t;
        lunge = 0;
        lean = 0;
      } else if (th) {
        ar = -0.6 - 0.95 * t;
        u.gwr = 0.25 + 1.25 * t;
        lunge = 0.16 * t;
        lean = 0.14 * t;
      } else {
        ar = -0.36 - 1.19 * t;
        u.gwr = -1.28 + 2.78 * t;
        lunge = 0.16 * t;
        lean = 0.14 * t;
      }
      twist = 0;
    }
  }
  let arz = 0,
    alz = 0,
    wy = 0;
  if (ty === "king") {
    if (atk >= 0) d.kcb = sessionState.clockT;
    const rest = !wl && atk < 0 && sessionState.clockT - (d.kcb || -99) > 2.2;
    if (rest) {
      const b = Math.sin(T * 1.1) * 0.015;
      ar = -0.5 + b;
      al = -0.5 + b;
      arz = -0.52;
      alz = 0.52;
      wy = 0.451;
      u.kwr = 2.133 - b;
      lean = -0.03;
      headX = -0.06 + Math.sin(T * 0.5) * 0.02;
      headY = Math.sin(T * 0.37) * 0.16;
    } else if (atk < 0) {
      ar = -0.8 + (wl ? Math.sin(u.ap * 0.9) * 0.05 : Math.sin(T * 1.3) * 0.03);
      u.kwr = -1.4;
      al = wl ? -sw * 0.3 : -0.1;
    } else u.kwr = null;
  }
  let sr = 0;
  if (d.shd && atk >= 0 && !z) {
    sr = atk < 0.25 ? easeO(atk / 0.25) : atk < 0.6 ? 1 : 1 - (atk - 0.6) / 0.4;
    al = -0.3 - 0.55 * sr;
  }
  /* peasant work cycle */
  let tool = null;
  if (ty === "peasant" && (!u.t || u.t === 2)) {
    const jb = u.job;
    tool =
      jb === "w"
        ? "axe"
        : jb === "s" || jb === "g" || jb === "t"
          ? "pick"
          : jb === "r"
            ? "hammer"
            : jb === "f" || jb === "p"
              ? "hoe"
              : null;
    if (u.carry) tool = null;
    if (work) {
      const ph = (T * (jb === "r" ? 1.7 : 1.15)) % 1,
        pr = u.lph;
      const wu = ph < 0.55,
        st = ph >= 0.55 && ph < 0.72,
        t = wu ? easeO(ph / 0.55) : st ? (ph - 0.55) / 0.17 : 1 - (ph - 0.72) / 0.28;
      if (jb === "r") {
        const hs = Math.sin(ph * Math.PI * 2) ** 2;
        ar = -0.9 - 0.8 * hs;
        wr = 0.5 * hs - 0.2;
        lean = 0.12;
        al = -0.5;
      } else {
        wr = wu ? 0.6 * t : st ? 0.6 - 1.1 * t : -0.5 * (1 - (ph - 0.72) / 0.28);
        ar = wu ? -0.4 - 2.0 * t : st ? -2.4 + 3.0 * t : 0.6 * (1 - (ph - 0.72) / 0.28);
        al = ar * 0.6;
        lean = wu ? -0.1 * t : st ? -0.1 + 0.4 * t : 0.3 * (1 - (ph - 0.72) / 0.28);
        twist = wu ? 0.2 * t : st ? 0.2 - 0.4 * t : -0.2 * (1 - (ph - 0.72) / 0.28);
      }
      headX = 0.15;
      if (pr < 0.62 && ph >= 0.62) {
        const tx2 = Math.sin(u.fa) * 18,
          ty2 = Math.cos(u.fa) * 18;
        puff(u.x + tx2, u.y + ty2, jb === "r" ? "#d9c9a0" : CHOPC[jb] || "#ccc", 3, 34);
        snd(
          jb === "w" ? "chop" : jb === "r" ? "build" : jb === "t" || jb === "f" || jb === "p" ? "dirt" : "mine",
          u.x,
          u.y,
        );
      }
      u.lph = ph;
    } else u.lph = 0;
  }
  /* hurt flash */
  const hp_ = u.hurt > 0 ? Math.min(1, u.hurt / 0.2) : 0,
    hf = hp_ * 0.75,
    hrm = rmotion();
  if (hp_ > 0.7 && !hrm) d.mat.emissive.setRGB(0.8, 0.7, 0.7);
  else d.mat.emissive.setRGB(hf, hf * 0.25, hf * 0.25);
  /* impact: short recoil opposite to facing + squash (visual only, in the group matrix, never u.x/u.y) */
  let rc_ = 0;
  if (hp_ > 0 && !hrm && !u.ttl) {
    rc_ = Math.sin((1 - hp_) * Math.PI * 0.9 + 0.2) * (heavy || u.bn != null ? 0.4 : 1);
  }
  const sq_ = rc_ > 0 ? rc_ : 0;
  if (sq_ > 0 || d.sqz) {
    const s0 = d.sc || g.scale.y,
      q = sq_ * 0.07;
    g.scale.set(-s0 * (1 + q * 0.6), s0 * (1 - q), s0 * (1 + q * 0.6));
    d.sqz = sq_ > 0;
  }
  /* apply pose */
  g.position.set(
    u.x / TS + Math.sin(u.fa) * (lunge - rc_ * 0.05),
    u.dy,
    u.y / TS + Math.cos(u.fa) * (lunge - rc_ * 0.05),
  );
  g.rotation.y = u.fa;
  d.lL.rotation.x += (sw - d.lL.rotation.x) * k;
  d.lR.rotation.x += (-sw - d.lR.rotation.x) * k;
  const br = Math.sin(T * 2.1) * 0.006;
  d.body.position.y = d.mdl.hip + (wl ? ab * 0.03 * (heavy ? 1.8 : 1) : br);
  d.body.rotation.x += (lean - d.body.rotation.x) * k;
  d.body.rotation.y += (twist - d.body.rotation.y) * k;
  d.body.rotation.z += (sway - d.body.rotation.z) * k;
  d.head.rotation.x += (headX - d.head.rotation.x) * k;
  d.head.rotation.y += (headY - d.head.rotation.y) * Math.min(1, dt * 6);
  d.head.rotation.z += (headZ - d.head.rotation.z) * k;
  const ka = Math.min(1, dt * (ty === "king" && atk < 0 ? 7 : 22));
  d.arm.rotation.x += (ar - d.arm.rotation.x) * ka;
  if (d.armL) d.armL.rotation.x += (al - d.armL.rotation.x) * ka;
  if (d.shd) {
    u.sr = (u.sr || 0) + (sr - (u.sr || 0)) * Math.min(1, dt * 14);
    d.armL.rotation.z += (0.2 * u.sr - d.armL.rotation.z) * ka;
    shdPose(d, u.sr);
  }
  if (ty === "king") {
    const kz = Math.min(1, dt * 7);
    d.arm.rotation.z += (arz - d.arm.rotation.z) * kz;
    if (d.armL) d.armL.rotation.z += (alz - d.armL.rotation.z) * kz;
    if (d.weap) d.weap.rotation.y += (wy - d.weap.rotation.y) * kz;
  } else if (d.arm.rotation.z !== 0) d.arm.rotation.z *= 0.8;
  d.ring.visible = !!u.sel;
  for (const kk in d.tools) d.tools[kk].visible = tool === kk;
  if (ty === "archer" && atk >= 0) wr = 0;
  else if (ty === "guard" || ty === "spearman") wr = u.gwr;
  else if (ty === "king" && u.kwr != null) wr = u.kwr;
  else if (armored && atk < 0) wr = 0.18 + (wl ? Math.sin(u.ap * 0.9) * 0.06 : 0);
  d.wr += (wr - d.wr) * Math.min(1, dt * (ty === "king" && atk < 0 ? 7 : 20));
  if (tool && d.tools[tool]) d.tools[tool].rotation.x = d.wr;
  if (d.weap && ty !== "archer") d.weap.rotation.x = d.wr;
  if (u.carry && u.cj) {
    d.carry.visible = true;
    if (d.carry.geometry !== CARRYG[u.cj]) d.carry.geometry = CARRYG[u.cj];
  } else d.carry.visible = false;
  const X = d.ex;
  if (X.cape)
    X.cape.rotation.x =
      0.1 + (wl ? 0.22 + 0.22 * Math.abs(Math.sin(u.ap)) : 0) + Math.sin(T * 1.5) * 0.04 + (atk >= 0 ? 0.35 : 0);
  if (X.cape2)
    X.cape2.rotation.x =
      -0.07 +
      (wl ? 0.12 + 0.16 * Math.abs(Math.sin(u.ap + 0.7)) : 0) +
      Math.sin(T * 1.5 - 0.9) * 0.05 +
      (atk >= 0 ? 0.2 : 0);
  if (X.plume) {
    X.plume.rotation.x = -0.15 - (wl ? 0.4 : 0) + Math.sin(T * 3) * 0.07;
    X.plume.rotation.z = Math.sin(T * 2.2) * 0.08 + (wl ? Math.sin(u.ap) * 0.12 : 0);
  }
  if (X.pen) {
    X.pen.rotation.y = Math.sin(T * 4.2) * 0.3 - 0.1;
    X.pen.rotation.z = Math.sin(T * 3) * 0.06;
    if (X.tip) X.tip.rotation.y = Math.sin(T * 4.2 - 1.3) * 0.55;
  }
  if (X.ban) {
    X.ban.rotation.x = 0.05 + Math.sin(T * 2.4) * 0.05 + (wl ? 0.12 : 0);
    X.ban.rotation.z = Math.sin(T * 1.8) * 0.05;
    if (X.ban2) {
      X.ban2.rotation.x = 0.07 + Math.sin(T * 2.4 - 1.1) * 0.07 + (wl ? 0.07 : 0);
      X.ban2.rotation.y = Math.sin(T * 1.7 - 0.6) * 0.06;
    }
    if (X.ban3) {
      X.ban3.rotation.x = 0.1 + Math.sin(T * 2.4 - 2.2) * 0.1 + (wl ? 0.09 : 0);
      X.ban3.rotation.y = Math.sin(T * 1.7 - 1.3) * 0.1;
    }
  }
  if (d.aura) d.aura.material.opacity = 0.32 + 0.1 * Math.sin(sessionState.clockT * 3);
  if (ty === "cannon") {
    const rc = atk >= 0 ? Math.max(0, 1 - atk * 2.2) : 0;
    d.cn.position.z = d.cnz - (rc * 0.14) / (d.sc || 1);
    d.cn.rotation.x = -rc * 0.06;
    const e2 = d.c2.userData;
    e2.lL.rotation.x = d.lR.rotation.x;
    e2.lR.rotation.x = d.lL.rotation.x;
    const rl = !wl && atk < 0 && u.cd > 0.6,
      a2 = wl ? -1.0 : atk >= 0 ? -1.6 + atk : rl ? -1.3 + Math.sin(T * 6.5) * 0.42 : -0.35 + Math.sin(T * 1.4) * 0.05;
    e2.arm.rotation.x += (a2 - e2.arm.rotation.x) * ka;
    if (e2.armL) e2.armL.rotation.x += ((wl ? -1.0 : -0.2) - e2.armL.rotation.x) * ka;
    e2.body.rotation.x = wl ? 0.2 : atk >= 0 ? -0.08 : rl ? 0.18 + Math.sin(T * 6.5) * 0.06 : 0;
    if (rl && u.cd > T_C(u) * 0.75 && Math.random() < 0.08)
      puff(u.x + Math.sin(u.fa) * 16, u.y + Math.cos(u.fa) * 16, "#bbb4aa", 1, 10, {
        soft: 1,
        T: 1.2,
        s: 0.25,
        z: 0.45,
        vz: 0.4,
        g: -0.1,
      });
    e2.head.rotation.y = Math.sin(T * 0.5) * 0.3;
  }
}

/* ---- Minecraft death: tip over sideways, turn red, then poof ---- */
export const CORPSES = [];

export let mcCorpse = function mcCorpse(u) {
  const g = u.m;
  if (!g) return false;
  unitG.delete(u);
  u.m = null;
  if (!g.visible) {
    g.visible = true;
    g.position.set(u.x / TS, gh(u.x / TS, u.y / TS), u.y / TS);
  }
  g.rotation.order = "YXZ";
  const d = g.userData;
  if (d.ring) d.ring.visible = false;
  if (d.aura) d.aura.visible = false;
  CORPSES.push({ g, t: 0, dir: Math.random() < 0.5 ? 1 : -1, x: u.x, y: u.y, z: u.t === 1, big: u.type === "brute" });
  while (CORPSES.length > 48) {
    const o = CORPSES.shift();
    scene.remove(o.g);
    if (o.g.userData.mat) o.g.userData.mat.dispose();
  }
  return true;
};

export function animCorpses(dt) {
  for (let i = CORPSES.length - 1; i >= 0; i--) {
    const c = CORPSES[i];
    c.t += dt;
    const p = Math.min(1, c.t / 0.5),
      e = p * p * (3 - 2 * p);
    c.g.rotation.z = c.dir * 1.5708 * e;
    const m = c.g.userData.mat;
    if (m && m.emissive) m.emissive.setRGB(0.6, 0, 0);
    if (c.t > 1.0) {
      const n = c.big ? 16 : 9;
      puff(c.x, c.y, "#efefef", n, c.big ? 44 : 30, { T: 0.85, z: 0.35, vz: 1.5, g: -0.7, s: c.big ? 0.2 : 0.13 });
      puff(c.x, c.y, "#bdbdbd", n >> 1, 24, { T: 0.7, z: 0.25, vz: 1.0, g: -0.5, s: 0.1 });
      if (c.z) {
        puff(c.x, c.y, "#b8f040", 2, 22, { T: 1.4, z: 0.3, vz: 2.4, g: 3.4, s: 0.08 });
        puff(c.x, c.y, "#f0ff60", 1, 18, { T: 1.4, z: 0.3, vz: 2.6, g: 3.4, s: 0.07 });
      }
      scene.remove(c.g);
      if (m) m.dispose();
      CORPSES.splice(i, 1);
    }
  }
}
/* ---- death animation (legacy, unused) ---- */

export function setMcCorpseHandler(handler) {
  mcCorpse = handler;
}
