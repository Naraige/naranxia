async () => {
  /* a full town of every building around the castle, seeded; returns frame time, draw calls and triangles */
  let s = 7;
  const RR = Math.random;
  Math.random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const o = renderer.render;
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
    cy = CS.ty + 2,
    miss = [];
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
    miss.push(t);
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
    ["barracks", 6, 7],
    ["academy", 9, 7],
    ["academy", 17, 7],
    ["guild", 12, 7],
    ["forester", -13, 12],
    ["observatory", -10, 13],
    ["granary", -7, 13],
    ["bell", -4, 13],
    ["sanctuary", -1, 13],
    ["beacon", 2, 13],
    ["orchard", 5, 13],
    ["forge", 8, 13],
    ["embassy", 11, 13],
    ["warroom", 14, 13],
    ["sappers", 14, 10],
    ["tower", -8, 2],
    ["tower", 8, 2],
    ["torch", -3, 10],
    ["torch", 3, 10],
    ["torch", -6, 16],
    ["torch", 6, 16],
    ["house", -9, 17, 0],
    ["house", -7, 17, 0],
    ["storage", -4, 17, 0],
    ["barracks", -1, 17, 0],
    ["forge", 2, 17, 0],
    ["granary", 5, 17, 0],
    ["academy", 8, 17, 0],
    ["sanctuary", 11, 17, 0],
    ["warroom", 14, 17, 0],
  ];
  for (const [t, dx, dy, tier] of L) put(t, dx, dy, tier);
  for (let x = -16; x <= 17; x++) if (Math.abs(x) > 1) put("wall", x, 20, 1);
  const site = put("house", -11, 4, 1);
  if (site) {
    site.prog = 0.45;
  }
  CS.tier = 1;
  for (const q of structs) if (q.o3) buildStructMesh(q);
  {
    const tx = cx + 15,
      ty = cy + 4;
    RUINS.set("bb", {
      x: (tx + 0.5) * TS,
      y: (ty + 0.5) * TS,
      tx,
      ty,
      h: HT[ty * TW + tx],
      d: 0,
      done: false,
      cx: 0,
      cy: 0,
      v: 2,
    });
    window.__RU = [tx, ty];
  }
  for (let dx = -32; dx <= 32; dx += 16)
    for (let dy = -16; dy <= 32; dy += 16)
      ensureAround(Math.max(1, Math.min(TW - 2, CX + dx)), Math.max(1, Math.min(TW - 2, CY + dy)), 1);
  const sc = [];
  for (const [a, b] of [
    [-12, 4],
    [0, 6],
    [12, 4],
    [-12, 14],
    [0, 14],
    [12, 14],
    [-6, 22],
    [6, 22],
    [-16, 10],
    [16, 10],
  ]) {
    const u = mkU(0, "scout", (cx + a) * TS, (cy + b) * TS);
    units.push(u);
    sc.push(u);
  }
  for (let i = 0; i < 14; i++) {
    update(0.1);
    if (i % 5 === 4) render3D(0.05);
  }
  sc.forEach((u) => {
    u.hp = 0;
  });
  update(0.1);
  for (const [t, a, b] of [
    ["knight", -2, 4],
    ["knight", 0, 4],
    ["archer", 2, 4],
    ["peasant", -6, 9],
    ["peasant", 3, 10],
    ["guard", 0, 10],
    ["king", 0, 5],
    ["peasant", 9, 10],
  ]) {
    units.push(mkU(0, t, (cx + a) * TS, (cy + b) * TS));
  }
  update(0.05);
  CAM.x = cx + 0.5;
  CAM.z = cy + 9;
  CAM.dist = +(window.__CD || 34);
  CAM.pitch = 0.86;
  CAM.yaw = 0;
  for (let i = 0; i < 6; i++) render3D(0.05);
  renderer.render = o;
  Math.random = RR;
  for (const c of document.querySelectorAll("canvas")) if (c !== renderer.domElement) c.style.visibility = "hidden";
  const gl = renderer.getContext(),
    px = new Uint8Array(4),
    T = [];
  renderer.info.autoReset = false;
  let inf = {};
  for (let i = 0; i < 8; i++) {
    renderer.info.reset();
    const t0 = performance.now();
    render3D(0.016);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    T.push(performance.now() - t0);
    inf = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
  }
  T.sort((a, b) => a - b);
  renderer.info.autoReset = true;
  return JSON.stringify({
    miss,
    structs: structs.length,
    ms_med: +T[4].toFixed(1),
    ms_min: +T[0].toFixed(1),
    calls: inf.calls,
    tris: inf.triangles,
  });
};
