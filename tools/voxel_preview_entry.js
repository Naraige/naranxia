/* global window, document */
import { voxelGeo } from "../packages/game/src/rendering/voxel-model.js";
import { VOXB, BPT } from "../packages/game/src/rendering/models/voxel-buildings.js";
import { gate, keep, torch, tower1, tower2, wall } from "../packages/game/src/rendering/models/builds/walls.js";
import { initializeMaterials, matV, LMU } from "../packages/game/src/rendering/materials.js";
import { BLKV, BK, matOfKind } from "../packages/game/src/rendering/blocks.js";
import { turnedLogs } from "../packages/game/src/rendering/models/structures.js";
import { treeShape } from "../packages/game/src/rendering/terrain-props-blocks.js";
import { VB } from "../packages/game/src/rendering/voxel-build.js";
const THREE = globalThis.THREE;
/* a little fortress to look at the fortifications together: [piece, tile x, tile z] (1-tile pieces and gates by their middle, 2-tile pieces by their corner) */
const FORT = (t) => [
  [tower1(t, false), 0.5, 0.5],
  ...[1, 2, 3, 4].map((x) => [wall(t, x & 1), x + 0.5, 0.5]),
  [gate(t, 2), 6, 0.5],
  ...[7, 8, 9].map((x) => [wall(t, x & 1), x + 0.5, 0.5]),
  [tower1(t, true), 10.5, 0.5],
  ...[11, 12].map((x) => [wall(t, x & 1), x + 0.5, 0.5]),
  [gate(t, 3), 14.5, 0.5],
  [wall(t, 0), 16.5, 0.5],
  [tower2(t, false), 17, 0],
  [tower2(t, true), 17, 4],
  [keep(t), 2, 4],
  [torch(), 8.5, 4.5],
];
let R = null,
  sc = null,
  sun = null,
  objs = [];
/* the game's own building material and daylight, on a lawn of grass blocks: what a design looks like in the game, in a second */
function stage(W, H) {
  if (R) {
    R.setSize(W, H);
    return;
  }
  R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  R.setSize(W, H);
  R.toneMapping = THREE.ACESFilmicToneMapping;
  R.toneMappingExposure = 0.97;
  R.shadowMap.enabled = true;
  R.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.style.margin = "0";
  document.body.appendChild(R.domElement);
  sc = new THREE.Scene();
  sc.background = new THREE.Color("#9ec8e8");
  const hemi = new THREE.HemisphereLight(0xdcecff, 0x77704f, 0.62 * 1.06);
  sun = new THREE.DirectionalLight(0xfff1d2, 0.78 * 1.19);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.03;
  sc.add(hemi, sun, sun.target);
  LMU.value = hemi.intensity + sun.intensity;
  BLKV.value = 1;
  initializeMaterials();
  /* the quality uniform belongs to the game scene, which is not started here */
  const hook = matV.onBeforeCompile;
  matV.onBeforeCompile = (sh) => {
    hook(sh);
    sh.uniforms.uHQ = { value: 1 };
  };
  /* the lawn: one quad per tile so the grass texture and its tints repeat as in the game */
  const N = 160,
    g = new THREE.PlaneGeometry(N, N, 1, 1).rotateX(-Math.PI / 2),
    n = g.attributes.position.count,
    col = new Float32Array(n * 3),
    mt = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    col[i * 3] = 0.42;
    col[i * 3 + 1] = 0.62;
    col[i * 3 + 2] = 0.26;
    mt[i] = matOfKind(BK.grass);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setAttribute("mat", new THREE.BufferAttribute(mt, 1));
  const lawn = new THREE.Mesh(g, matV);
  lawn.receiveShadow = true;
  lawn.position.set(N / 4, 0, N / 4);
  sc.add(lawn);
}
function clear() {
  for (const o of objs) {
    sc.remove(o);
    o.geometry.dispose();
  }
  objs = [];
}
function put(geo, x, z, rot) {
  const m = new THREE.Mesh(geo, matV);
  m.position.set(x, 0, z);
  m.rotation.y = (rot * Math.PI) / 2;
  m.castShadow = m.receiveShadow = true;
  sc.add(m);
  objs.push(m);
}
/* window.__go(names, tier, yaw, pitch, dist, cols, opts): lay the named buildings out in a grid (tile scale) and photograph them.
   names: "house:2@1!0" = house, look 2, turned one quarter, tier 0; "fort"; "trees" (a strip of the world's trees) */
window.__go = (names, tier, yaw, pitch, dist, cols, o = {}) => {
  stage(o.W || 1280, o.H || 720);
  clear();
  let i = 0,
    mx = 0,
    mz = 0;
  const CW = o.cw || 8,
    info = [];
  if (names[0] === "fort") {
    for (const [B, x, z] of FORT(tier))
      put(voxelGeo(B.M, { ox: B.o, oz: B.oz === undefined ? B.o : B.oz, k: 1 / BPT }), x, z, 0);
    names = [];
    mx = 19;
    mz = 6;
  }
  if (names[0] === "trees") {
    /* the trees of the world, from the same shapes: three rows (broadleaf, birch, conifer), then a small wood where they touch */
    const vb = new VB(40, 12, 34),
      NAMES = [
        ["oak_leaves", "oak_log"],
        ["birch_leaves", "birch_log"],
        ["spruce_leaves", "spruce_log"],
      ],
      coin = (x, z) => (a, c, b, t) => {
        let h = ((x + a) * 73856093) ^ ((z + c) * 19349663) ^ (b * 83492791);
        h = (h ^ (h >>> 13)) * 1274126177;
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296 < t;
      },
      tree = (sp, v, x, z) => {
        for (const [a, b, c, leaf] of treeShape(sp, v, coin(x, z))) vb.add(x + a, b, z + c, NAMES[sp][leaf ? 0 : 1]);
      };
    for (let sp = 0; sp < 3; sp++) for (let v = 0; v < 6; v++) tree(sp, v, 3 + v * 6, 3 + sp * 6);
    for (let x = 4; x < 22; x++)
      for (let z = 22; z < 31; z++)
        if ((x * 7 + z * 3) % 11 < 8) tree(((x >> 3) + (z >> 3)) % 3, (x * 5 + z * 11) % 6, x, z);
    put(voxelGeo(vb.model(), { ox: 0, oz: 0, k: 1 }), 0, 0, 0);
    names = [];
    mx = 40;
    mz = 34;
  }
  if (names[0] === "swatch") {
    /* rows of blocks (a cube, a stair, a slab of each when the family has them) to judge colours and textures: o.list = names separated by spaces */
    const L = (window.__swatch || "stone_bricks cobblestone").split(/\s+/),
      per = 12,
      vb = new VB(per * 3, 3, Math.ceil(L.length / per) * 3);
    L.forEach((n, q) => {
      const x = (q % per) * 3,
        z = ((q / per) | 0) * 3;
      vb.set(x, 0, z, n)
        .set(x + 1, 0, z, n)
        .set(x, 1, z, n)
        .set(x, 0, z + 1, n);
    });
    const M = vb.model();
    if (M.unk.length) info.push("UNKNOWN " + M.unk.join(" "));
    put(voxelGeo(M, { ox: 0, oz: 0, k: 1 }), 0, 0, 0);
    names = [];
    mx = per * 3;
    mz = Math.ceil(L.length / per) * 3;
  }
  for (const full of names) {
    const m0 = /^([a-z_0-9]+)(?::(\d+))?(?:@(\d))?(?:!(\d))?$/.exec(full),
      n = m0[1];
    const B = VOXB[n],
      M = B.make(m0[4] !== undefined ? +m0[4] : tier, +(m0[2] || 0));
    if (M.unk && M.unk.length) info.push("UNKNOWN " + n + " " + M.unk.join(" "));
    let geo = voxelGeo(M, { ox: (B.ox || 0) - (B.sz * BPT) / 2, oz: (B.oz || 0) - (B.sz * BPT) / 2, k: 1 / BPT });
    const rot = +(m0[3] || 0);
    if (rot & 1) geo = turnedLogs(geo);
    info.push(n + " " + M.w + "x" + M.h + "x" + M.l + " tris " + (geo.index ? geo.index.count / 3 : 0));
    const cx = (i % cols) * CW,
      cz = Math.floor(i / cols) * CW;
    put(geo, cx + B.sz / 2, cz + B.sz / 2, rot);
    mx = Math.max(mx, cx + B.sz);
    mz = Math.max(mz, cz + B.sz);
    i++;
  }
  const W = o.W || 1280,
    H = o.H || 720,
    cam = new THREE.PerspectiveCamera(o.fov || 42, W / H, 0.5, 900),
    cx = o.cx === undefined ? mx / 2 : o.cx,
    cz = o.cz === undefined ? mz / 2 : o.cz,
    ly = o.ly === undefined ? 4 : o.ly;
  /* the game's camera: yaw around the target, pitch above the horizon */
  cam.position.set(
    cx + Math.sin(yaw) * Math.cos(pitch) * dist,
    ly + Math.sin(pitch) * dist,
    cz + Math.cos(yaw) * Math.cos(pitch) * dist,
  );
  cam.lookAt(cx, ly, cz);
  sun.target.position.set(cx, 0, cz);
  sun.position.set(cx - 24, 44, cz + 18);
  const s = sun.shadow.camera,
    e = Math.max(mx, mz) * 0.75 + 12;
  s.left = -e;
  s.right = e;
  s.top = e;
  s.bottom = -e;
  s.near = 1;
  s.far = 220;
  s.updateProjectionMatrix();
  sun.target.updateMatrixWorld();
  R.shadowMap.needsUpdate = true;
  R.render(sc, cam);
  return info.join("\n");
};
