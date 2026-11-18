import { voxelGeo } from "../packages/game/src/rendering/voxel-model.js";
const THREE = globalThis.THREE;
window.__go = async (files, yaw, pitch) => {
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setSize(1280, 720);
  document.body.appendChild(r.domElement);
  const sc = new THREE.Scene();
  sc.background = new THREE.Color("#9ec8e8");
  sc.add(new THREE.HemisphereLight("#ffffff", "#7a8a5a", 0.75));
  const sun = new THREE.DirectionalLight("#fff4d8", 0.7);
  sun.position.set(-30, 60, 20);
  sc.add(sun);
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: "#6a9a48" }),
  );
  g.position.y = -0.02;
  sc.add(g);
  let x = 0;
  for (const f of files) {
    const M = await (await fetch(f)).json();
    const m = new THREE.Mesh(voxelGeo(M), new THREE.MeshLambertMaterial({ vertexColors: true }));
    m.position.x = x + M.w / 2;
    sc.add(m);
    x += M.w + 6;
  }
  const cam = new THREE.PerspectiveCamera(35, 1280 / 720, 0.5, 800),
    cx = (x - 6) / 2,
    d = window.__d || Math.max(60, (x - 6) * 1.25);
  cam.position.set(cx + Math.sin(yaw) * d, d * Math.sin(pitch), 16 + Math.cos(yaw) * d);
  cam.lookAt(cx, 8, 16);
  r.render(sc, cam);
  return true;
};
