import { rmotion } from "../core/prefs.js";
import { REALR } from "../core/random.js";
import { TH, TS, TW } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { glow, puff } from "./effects.js";
import { nightK } from "./lighting.js";
import { CAM, scene } from "./scene.js";
import { THREE } from "./three.js";
import { seasonIdx } from "./weather.js";
import { gh } from "../world/terrain-queries.js";
import { LAND, ter } from "../world/terrain-state.js";

/* ---- the land lives (the King, 2026-11-27: "environmental animations to make it all more alive") ----
   Drawing only, around the camera, from the real clock: butterflies over the meadows by day, small flocks of birds crossing the sky, leaves
   (petals in spring) drifting down from the woods, glints on the water and now and then a fish that jumps. Fireflies, clouds, weather and
   chimney smoke were already there (effects.js, weather.js). Nothing here is read by the simulation; reduced motion turns it off. */
const NB = 26 /* butterflies */,
  NF = 3 /* flocks */,
  FB = 5 /* birds in a flock */,
  CAP = NB * 2 + NF * FB * 3;
let mesh = null;
const o = new THREE.Object3D(),
  col = new THREE.Color(),
  BF = [],
  FL = [],
  GL = [];
const BCOL = ["#f4f0e0", "#f2c23a", "#e8782a", "#7fb4f0", "#f09ac0", "#c8a0f0"],
  LEAF = [["#f4b6d0", "#fbe6ee", "#f09ac0"], ["#6fae4c", "#86c25a"], ["#e08a2a", "#c8402e", "#e8c040", "#a8641e"], []];

function init() {
  const g = new THREE.BoxGeometry(0.2, 0.02, 0.26);
  g.translate(0.1, 0, 0); /* a wing turns about its inner edge */
  mesh = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), CAP);
  mesh.frustumCulled = false;
  /* the colour of each one: the attribute must exist before the first frame draws the mesh, or everything comes out black */
  mesh.setColorAt(0, col.set("#ffffff"));
  mesh.count = 0;
  scene.add(mesh);
}

const near = (R, r) => [CAM.x + (R() - 0.5) * 2 * r, CAM.z + (R() - 0.5) * 2 * r];

function put(n, x, y, z, yaw, roll, sx, sy, sz, c) {
  o.position.set(x, y, z);
  o.rotation.set(0, yaw, roll, "YXZ");
  o.scale.set(sx, sy, sz);
  o.updateMatrix();
  mesh.setMatrixAt(n, o.matrix);
  mesh.setColorAt(n, col.set(c));
}

export function ambientLife(dt) {
  /* called from the role hook of every frame (core/roles.js), so the frame module does not import this one */
  if (!sessionState.started || sessionState.over || sessionState.showMap || rmotion()) {
    if (mesh) mesh.count = 0;
    return;
  }
  if (!mesh) init();
  if (sessionState.paused) return;
  const R = REALR,
    day = nightK < 0.3,
    sea = seasonIdx();
  let n = 0;
  /* butterflies: none at night, none in winter */
  const want = day && sea !== 3 ? NB : 0;
  while (BF.length < want) {
    const p = near(R, 24);
    BF.push({
      x: p[0],
      z: p[1],
      h: 0.5 + R() * 1.2,
      a: R() * 6.28,
      ph: R() * 6.28,
      c: BCOL[(R() * BCOL.length) | 0],
      t: 0,
    });
  }
  if (BF.length > want) BF.length = want;
  for (const b of BF) {
    b.ph += dt * 16;
    b.t -= dt;
    if (b.t <= 0) {
      b.t = 0.4 + R() * 1.2;
      b.da = (R() - 0.5) * 3;
    }
    b.a += b.da * dt;
    b.x += Math.sin(b.a) * dt * 1.3;
    b.z += Math.cos(b.a) * dt * 1.3;
    if (Math.abs(b.x - CAM.x) > 26 || Math.abs(b.z - CAM.z) > 26) {
      const p = near(R, 24);
      b.x = p[0];
      b.z = p[1];
    }
    const tx = b.x | 0,
      tz = b.z | 0;
    if (tx < 1 || tz < 1 || tx >= TW - 1 || tz >= TH - 1 || ter[tz * TW + tx] === 1) continue; /* not over water */
    const y = gh(b.x, b.z) + b.h + Math.sin(b.ph * 0.21) * 0.25,
      f = 0.25 + 0.95 * Math.abs(Math.sin(b.ph));
    put(n++, b.x, y, b.z, b.a, f, 1, 1, 1, b.c);
    put(n++, b.x, y, b.z, b.a, Math.PI - f, 1, 1, 1, b.c);
  }
  /* birds: a few flocks that cross high over the camera in a loose wedge, by day */
  const wantF = day ? NF : 0;
  while (FL.length < wantF) {
    const a = R() * 6.28;
    FL.push({
      x: CAM.x - Math.sin(a) * 70,
      z: CAM.z - Math.cos(a) * 70,
      a,
      sp: 6 + R() * 3,
      h: 15 + R() * 6,
      ph: R() * 6,
    });
  }
  if (FL.length > wantF) FL.length = wantF;
  for (const f of FL) {
    f.x += Math.sin(f.a) * f.sp * dt;
    f.z += Math.cos(f.a) * f.sp * dt;
    f.ph += dt * 7;
    if (Math.hypot(f.x - CAM.x, f.z - CAM.z) > 85) {
      /* gone: it comes back later from another side */
      f.a = R() * 6.28;
      f.x = CAM.x - Math.sin(f.a) * 80;
      f.z = CAM.z - Math.cos(f.a) * 80;
      f.h = 15 + R() * 6;
    }
    const gy = gh(Math.max(1, Math.min(TW - 2, f.x)), Math.max(1, Math.min(TH - 2, f.z))) || LAND,
      sx = Math.cos(f.a),
      sz = -Math.sin(f.a);
    for (let i = 0; i < FB; i++) {
      const row = (i + 1) >> 1,
        side = i & 1 ? 1 : -1,
        bx = f.x - Math.sin(f.a) * row * 1.6 + sx * side * row * 1.3,
        bz = f.z - Math.cos(f.a) * row * 1.6 + sz * side * row * 1.3,
        by = Math.max(gy, LAND) + f.h + Math.sin(f.ph * 0.3 + i) * 0.3,
        fl = Math.sin(f.ph + i * 0.9) * 0.6;
      put(n++, bx, by, bz, f.a, fl, 3.2, 2, 1.3, "#2a2c34");
      put(n++, bx, by, bz, f.a, Math.PI - fl, 3.2, 2, 1.3, "#2a2c34");
      put(n++, bx - 0.14, by, bz, f.a, 0, 1.4, 5, 3.2, "#3a3c46");
    }
  }
  mesh.count = n;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  /* leaves and petals drift down from the trees near the camera; glints and fish on the water */
  const LC = LEAF[sea] || [];
  for (let k = 0; k < 3; k++) {
    if (R() > dt * 14) continue;
    const p = near(R, 24),
      tx = p[0] | 0,
      tz = p[1] | 0;
    if (tx < 1 || tz < 1 || tx >= TW - 1 || tz >= TH - 1) continue;
    const v = ter[tz * TW + tx];
    if (v === 2 && LC.length)
      puff((tx + 0.5) * TS, (tz + 0.5) * TS, LC[(R() * LC.length) | 0], 1, 14, {
        T: 3.2,
        z: 2.6 + R() * 2,
        vz: -0.5,
        g: 0.12,
        s: 0.07,
        soft: 0,
      });
    else if (v === 1 && day) {
      if (GL.length < 40) GL.push({ x: tx + R(), z: tz + R(), t: 0, T: 0.5 + R() * 0.7 });
      if (R() < 0.02)
        puff((tx + 0.5) * TS, (tz + 0.5) * TS, "#cfeaff", 6, 36, { T: 0.55, z: 0.1, vz: 2.4, g: 7, s: 0.07 });
    }
  }
  for (let i = GL.length - 1; i >= 0; i--) {
    const g = GL[i];
    g.t += dt;
    if (g.t >= g.T) {
      GL.splice(i, 1);
      continue;
    }
    const a = Math.sin((g.t / g.T) * Math.PI);
    glow(g.x, LAND - 0.02, g.z, 0.28 + 0.2 * a, 1, 1, 0.92, 0.55 * a);
  }
}
