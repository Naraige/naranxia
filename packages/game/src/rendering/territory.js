import { aiR, BASES, rebuildOwn } from "../ai/kingdoms.js";
import { hyp } from "../core/math.js";
import { sessionState } from "../gameplay/session.js";
import { CAM, scene } from "./scene.js";
import { gh } from "../world/terrain-queries.js";
import { THREE } from "./three.js";
import { PAL } from "../ui/kingdom-theme.js";
import { gOK } from "../world/routes.js";
import { LAND } from "../world/terrain-state.js";

/* territory borders drawn on the ground */
let terrM = null,
  terrT = -9;

export function updateTerr() {
  if (sessionState.clockT - terrT < 0.9) return;
  terrT = sessionState.clockT;
  if (terrM) {
    scene.remove(terrM);
    terrM.geometry.dispose();
    terrM = null;
  }
  if (sessionState.inGame) rebuildOwn();
  const P = [],
    C = [],
    col = new THREE.Color(),
    cx = CAM.x,
    cz = CAM.z,
    R = 150,
    s3 = (x0, y0, z0, x1, y1, z1) => {
      P.push(x0, y0, z0, x1, y1, z1);
      C.push(col.r, col.g, col.b, col.r, col.g, col.b);
    },
    hA = (i, j) => (gOK(i, j) ? gh(i + 0.5, j + 0.5) : LAND),
    ex = (x, z, n) => {
      let ph = null;
      for (let t = x; t < x + n; t++) {
        const h = Math.max(hA(t, z - 1), hA(t, z)) + 0.1;
        if (ph !== null && ph !== h) s3(t, ph, z, t, h, z);
        s3(t, h, z, t + 1, h, z);
        ph = h;
      }
    },
    ez = (x, z, n) => {
      let ph = null;
      for (let t = z; t < z + n; t++) {
        const h = Math.max(hA(x - 1, t), hA(x, t)) + 0.1;
        if (ph !== null && ph !== h) s3(x, ph, t, x, h, t);
        s3(x, h, t, x, h, t + 1);
        ph = h;
      }
    };

  for (const b of BASES) {
    if (!b.alive || hyp(b.tx - cx, b.ty - cz) > R + 60) continue;
    col.set(PAL[b.ci][1]);
    const r = aiR(b),
      x0 = b.tx - r,
      x1 = b.tx + r,
      z0 = b.ty - r,
      z1 = b.ty + r;
    for (let t = x0; t < x1; t += 2) {
      ex(t, z0, 2);
      ex(t, z1, 2);
    }
    for (let t = z0; t < z1; t += 2) {
      ez(x0, t, 2);
      ez(x1, t, 2);
    }
  }
  if (!P.length) return;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
  terrM = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1 }));
  terrM.frustumCulled = false;
  scene.add(terrM);
}
