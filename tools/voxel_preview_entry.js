/* global window, document */
import { voxelGeo } from "../packages/game/src/rendering/voxel-model.js";
import { VOXB, BPT } from "../packages/game/src/rendering/models/voxel-buildings.js";
import { gate, keep, torch, tower1, tower2, wall } from "../packages/game/src/rendering/models/builds/walls.js";
const THREE = globalThis.THREE;
/* a little fortress to look at the fortifications together: [piece, tile x, tile z] (1-tile pieces and gates by their middle, 2-tile pieces by their corner) */
const FORT = (t) => [
  [tower1(t, false), 0.5, 0.5],
  [wall(t, 10), 1.5, 0.5],
  [wall(t, 10), 2.5, 0.5],
  [gate(t, 2), 4, 0.5],
  [wall(t, 10), 5.5, 0.5],
  [wall(t, 10 | 4), 6.5, 0.5],
  [wall(t, 5), 6.5, 1.5],
  [wall(t, 1 | 8), 6.5, 2.5],
  [wall(t, 2), 5.5, 2.5],
  [tower1(t, true), 7.5, 0.5],
  [wall(t, 8 | 16), 8.5, 0.5],
  [wall(t, 0), 9.5, 1.5],
  [tower2(t, false), 11, 0],
  [tower2(t, true), 11, 3],
  [keep(t), 1, 2.5],
  [torch(), 4.5, 2.5],
  [gate(t, 3), 5, 5.5],
  [wall(t, 2), 3, 5.5],
  [wall(t, 8), 7, 5.5],
];
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
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: "#6a9a48" }),
  );
  g.position.y = -0.02;
  sc.add(g);
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  let i = 0,
    mx = 0,
    mz = 0;
  const CW = window.__cw || 8;
  if (names[0] === "fort") {
    for (const [B, x, z] of FORT(tier)) {
      const m = new THREE.Mesh(voxelGeo(B.M, { ox: B.o, oz: B.oz === undefined ? B.o : B.oz, k: 1 / BPT }), mat);
      m.position.set(x, 0, z);
      sc.add(m);
    }
    names = [];
    mx = 13;
    mz = 6;
  }
  for (const full of names) {
    /* "house:2@1" = house, look 2, turned one quarter */
    const m0 = /^([a-z_]+)(?::(\d+))?(?:@(\d))?(?:!(\d))?$/.exec(full),
      n = m0[1];
    const B = VOXB[n],
      M = B.make(m0[4] !== undefined ? +m0[4] : tier, +(m0[2] || 0));
    if (M.unk && M.unk.length) console.log("UNKNOWN", n, M.unk.join(" "));
    const m = new THREE.Mesh(
      voxelGeo(M, { ox: (B.ox || 0) - (B.sz * BPT) / 2, oz: (B.oz || 0) - (B.sz * BPT) / 2, k: 1 / BPT }),
      mat,
    );
    const cx = (i % cols) * CW,
      cz = Math.floor(i / cols) * CW;
    m.position.set(cx + B.sz / 2, 0, cz + B.sz / 2);
    m.rotation.y = (+(m0[3] || 0) * Math.PI) / 2;
    sc.add(m);
    mx = Math.max(mx, cx + B.sz);
    mz = Math.max(mz, cz + B.sz);
    i++;
  }
  const cam = new THREE.PerspectiveCamera(35, 1280 / 720, 0.5, 800),
    cx = mx / 2,
    cz = mz / 2;
  cam.position.set(cx + Math.sin(yaw) * dist, dist * Math.sin(pitch), cz + Math.cos(yaw) * dist);
  cam.lookAt(cx, window.__ly || 1.6, cz);
  r.render(sc, cam);
  return true;
};
