/* global window, document */
import { voxelGeo } from "../packages/game/src/rendering/voxel-model.js";
import { VOXB, BPT } from "../packages/game/src/rendering/models/voxel-buildings.js";
const THREE = globalThis.THREE;
/* window.__go(names, tier, yaw, pitch, dist, cols): lay the named buildings out in a grid (tile scale) and photograph them */
window.__go = (names, tier, yaw, pitch, dist, cols) => {
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setSize(1280, 720);
  document.body.appendChild(r.domElement);
  const sc = new THREE.Scene();
  sc.background = new THREE.Color("#9ec8e8");
  sc.add(new THREE.HemisphereLight("#ffffff", "#7a8a5a", 0.8));
  const sun = new THREE.DirectionalLight("#fff4d8", 0.7);
  sun.position.set(-30, 60, 20);
  sc.add(sun);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: "#6a9a48" }));
  g.position.y = -0.02;
  sc.add(g);
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  let i = 0, mx = 0, mz = 0;
  const CW = 8;
  for (const n of names) {
    const B = VOXB[n], M = B.make(tier);
    if (M.unk && M.unk.length) console.log("UNKNOWN", n, M.unk.join(" "));
    const m = new THREE.Mesh(voxelGeo(M, { ox: B.ox || 0, oz: B.oz || 0, k: 1 / BPT }), mat);
    const cx = (i % cols) * CW, cz = Math.floor(i / cols) * CW;
    m.position.set(cx, 0, cz);
    sc.add(m);
    mx = Math.max(mx, cx + B.sz);
    mz = Math.max(mz, cz + B.sz);
    i++;
  }
  const cam = new THREE.PerspectiveCamera(35, 1280 / 720, 0.5, 800), cx = mx / 2, cz = mz / 2;
  cam.position.set(cx + Math.sin(yaw) * dist, dist * Math.sin(pitch), cz + Math.cos(yaw) * dist);
  cam.lookAt(cx, 2, cz);
  r.render(sc, cam);
  return true;
};
