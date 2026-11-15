async () => {
  /* seeded town for the blocks board; rendering stubbed during the setup */
  window.requestAnimationFrame = () => 0;
  await new Promise((r) => setTimeout(r, 400));
  let s = 7;
  const RR = Math.random;
  Math.random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const o = renderer.render;
  window.__RR = o;
  renderer.render = function () {};
  rollWorld();
  randomSite();
  pickPos = { tx: pickPos.tx, ty: pickPos.ty, ok: true };
  confirmPick();
  waveT = 1e9;
  for (const R of RESP) {
    R.g = 999999;
    R.w = 999999;
    R.s = 999999;
    R.f = 9999;
  }
  const cx = CS.tx + 2,
    cy = CS.ty + 2;
  window.__C = [cx, cy];
  const put = (t, dx, dy, tier) => {
    for (let a = 0; a < 6; a++) {
      const n0 = structs.length,
        f = a ? freeTile(cx + dx + (a % 3) - 1, cy + dy + (a > 2 ? 1 : 0)) : [cx + dx, cy + dy];
      if (!f) continue;
      build(t, f[0], f[1]);
      if (structs.length > n0) {
        const m = structs[structs.length - 1];
        m.prog = 1;
        m.tier = tier === 0 ? 0 : 1;
        m.hp = m.max;
        return m;
      }
    }
    return null;
  };
  const L = [
    ["house", -9, 7],
    ["house", -7, 7],
    ["house", -5, 7],
    ["house", -9, 10],
    ["farm", -13, 7],
    ["farm", -13, 9],
    ["storage", -2, 7],
    ["market", 1, 7],
    ["barracks", 4, 7],
    ["academy", 9, 7],
    ["guild", 12, 7],
    ["forester", -13, 12],
    ["granary", -7, 13],
    ["bell", -4, 13],
    ["sanctuary", -1, 13],
    ["forge", 8, 13],
    ["tower", -8, 2],
    ["tower", 8, 2],
    ["torch", -3, 10],
    ["torch", 3, 10],
    ["house", -9, 17, 0],
    ["house", -7, 17, 0],
    ["storage", -4, 17, 0],
    ["barracks", -1, 17, 0],
  ];
  for (const [t, dx, dy, tier] of L) put(t, dx, dy, tier);
  for (let x = -12; x <= 12; x++) if (Math.abs(x) > 1) put("wall", x, 20, 1);
  CS.tier = 1;
  for (const q of structs) if (q.o3) buildStructMesh(q);
  for (let x = -1; x <= 1; x++)
    for (let y = 6; y <= 19; y++) {
      const i = (cy + y) * TW + cx + x;
      if (ter[i] === 0 && !occ.has(i)) pth[i] = y < 12 ? 2 : 1;
    }
  for (const [t, a, b] of [
    ["knight", -2, 4.6],
    ["knight", 0, 4.6],
    ["archer", 2, 4.6],
    ["peasant", -6, 9],
    ["peasant", 3, 10],
    ["guard", 0, 10],
    ["king", 0, 5.4],
    ["peasant", 9, 10],
    ["peasant", -8, 8.6],
    ["knight", -6.2, 8.7],
    ["peasant", -2.6, 9.8],
    ["knight", -1.7, 9.9],
  ]) {
    units.push(mkU(0, t, (cx + a) * TS, (cy + b) * TS));
  }
  update(0.05);
  CAM.x = cx + 0.5;
  CAM.z = cy + 9;
  CAM.dist = 30;
  CAM.pitch = 0.86;
  CAM.yaw = 0;
  for (let i = 0; i < 8; i++) render3D(0.05);
  Math.random = RR;
  for (const c of document.querySelectorAll("canvas")) if (c !== renderer.domElement) c.style.visibility = "hidden";
  renderer.setPixelRatio(1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const near = (f) => {
    let best = null,
      bd = 1e9;
    for (let dy = -70; dy <= 70; dy++)
      for (let dx = -70; dx <= 70; dx++) {
        const x = cx + dx,
          y = cy + dy,
          i = y * TW + x,
          d = dx * dx + dy * dy;
        if (d < bd && d > 150 && f(i, x, y)) {
          bd = d;
          best = [dx, dy];
        }
      }
    return best;
  };
  const cnt = (i, v, r) => {
    let n = 0;
    for (let b = -r; b <= r; b++) for (let a = -r; a <= r; a++) if (ter[i + b * TW + a] === v) n++;
    return n;
  };
  window.__F = {
    water: near((i) => ter[i] === 0 && cnt(i, 1, 3) > 12 && cnt(i, 1, 3) < 30),
    cliff: near((i) => ter[i] === 0 && HT[i] >= HT[cy * TW + cx] + 3 && HT[i + 3 * TW] <= HT[i] - 3),
    forest: near((i) => ter[i] === 0 && cnt(i, 2, 4) > 25 && cnt(i, 2, 4) < 55),
    rock: near((i) => ter[i] === 0 && cnt(i, 3, 2) >= 4),
    gold: near((i) => ter[i] === 0 && cnt(i, 4, 2) >= 2),
    mount: near((i) => ter[i] === 5),
  };
  return JSON.stringify({
    F: window.__F,
    structs: structs.length,
    chunks: typeof blkChunks !== "undefined" ? blkChunks.CHK.size : -1,
    c: [cx, cy],
    land: HT[cy * TW + cx],
  });
};
