import { rmotion } from "../core/prefs.js";
import { lightingState } from "../gameplay/light-state.js";
import { TH, TS, TW } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { wavesState } from "../gameplay/waves.js";
import { snd } from "../audio/sound.js";
import { nightK } from "./lighting.js";
import { CAM, scene } from "./scene.js";
import { THREE } from "./three.js";
import { gh } from "../world/terrain-queries.js";

/* ---- the dark veil stands up (the King, v101, #110: "faire un voile violet en 3D plus imposant") ----
   The veil was a purple wash painted on the unlit ground (rendering/fog.js). Now it also rises: around every light of the deep night a
   wall of slow purple columns stands at the edge of the lit ground, tall where the light ends and lower further out, so the kingdom sits
   in a bowl of light with the veil towering around it. Drawing only (additive, no depth written), from the lights the simulation already
   keeps (lightingState.LITL) and the real clock; with reduced motion the columns stand still. */
const CAP = 900,
  STEP = 3 /* tiles between two columns */,
  BAND = 12 /* how far beyond the light they stand */,
  CREEP = 3;
let mesh = null,
  amt = 0,
  creep = 0,
  told = false;
const o = new THREE.Object3D(),
  col = new THREE.Color();

function init() {
  const g = new THREE.CylinderGeometry(1.5, 2.7, 1, 7, 4, true);
  g.translate(0, 0.5, 0);
  const p = g.attributes.position,
    c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    /* bright at the foot, gone at the top: with additive blending black is nothing */
    const k = Math.pow(1 - p.getY(i), 1.6);
    c[i * 3] = 0.3 * k;
    c[i * 3 + 1] = 0.09 * k;
    c[i * 3 + 2] = 0.52 * k;
  }
  g.setAttribute("color", new THREE.BufferAttribute(c, 3));
  mesh = new THREE.InstancedMesh(
    g,
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    }),
    CAP,
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  mesh.count = 0;
  mesh.setColorAt(0, col.set(0xffffff));
  scene.add(mesh);
}
const hash = (x, z) => {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export function veil3D(dt) {
  const L = lightingState.LITL,
    on = sessionState.started && !sessionState.over && !sessionState.showMap && L.length > 0 && nightK > 0.4;
  amt += ((on ? 1 : 0) - amt) * Math.min(1, dt * 1.5);
  /* while the horde fights in the night the veil leans in over the edge of the light, up to CREEP tiles, and draws back when the wave is
     beaten (#118). Drawing only: the lit ground of the rules does not move */
  const push = on && wavesState.hordeOn && !sessionState.paused;
  creep += ((push ? CREEP : 0) - creep) * Math.min(1, dt * (push ? 0.05 : 0.5));
  if (push && !told) snd("veil");
  told = push;
  if (amt < 0.02) {
    if (mesh) mesh.count = 0;
    return;
  }
  if (!mesh) init();
  const T = rmotion() ? 0 : sessionState.clockT,
    R = Math.min(64, CAM.dist * 1.5 + 26),
    x0 = Math.floor((CAM.x - R) / STEP) * STEP,
    z0 = Math.floor((CAM.z - R) / STEP) * STEP;
  let n = 0;
  for (let z = z0; z <= CAM.z + R && n < CAP; z += STEP)
    for (let x = x0; x <= CAM.x + R && n < CAP; x += STEP) {
      if (x < 2 || z < 2 || x > TW - 3 || z > TH - 3) continue;
      const h1 = hash(x, z),
        h2 = hash(z + 9, x - 4),
        px = x + (h1 - 0.5) * STEP,
        pz = z + (h2 - 0.5) * STEP;
      /* how far outside the nearest light, in tiles (negative: lit) */
      let d = 1e9;
      for (let i = 0; i < L.length; i++) {
        const e = (Math.hypot(px * TS - L[i][0], pz * TS - L[i][1]) - L[i][2]) / TS;
        if (e < d) d = e;
        if (d < 0) break;
      }
      if (d < 0.5 - creep || d > BAND) continue;
      const k = 1 - Math.max(0, d) / BAND,
        w = Math.sin(T * 0.5 + h1 * 6.28) * 0.5 + 0.5,
        ht = (5 + 9 * k) * (0.8 + 0.4 * w) * amt;
      o.position.set(
        px + Math.sin(T * 0.3 + h2 * 6.28) * 0.5,
        gh(px, pz) - 0.2,
        pz + Math.cos(T * 0.27 + h1 * 6.28) * 0.5,
      );
      o.rotation.set(0, h1 * 6.28 + T * 0.12 * (h2 > 0.5 ? 1 : -1), 0);
      o.scale.set(1 + h2 * 0.8, ht, 1 + h1 * 0.8);
      o.updateMatrix();
      mesh.setMatrixAt(n, o.matrix);
      const a = amt * (0.35 + 0.65 * k) * (0.7 + 0.3 * w);
      mesh.setColorAt(n, col.setRGB(a, a, a));
      n++;
    }
  mesh.count = n;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}
