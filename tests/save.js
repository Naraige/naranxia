async () => {
  /* software WebGL: the live loop draws a frame (seconds each) at every await of pack / load; that made tPack / tLoad look like minutes (1 to 2 s without it) */ const REND =
    renderer.render;
  renderer.render = function () {};
  let s = 31,
    rc = 0;
  const RR = Math.random;
  const seedR = (k) => {
    s = k;
    rc = 0;
    Math.random = () => {
      rc++;
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  };
  seedR(31);
  rollWorld();
  randomSite();
  CX = pickPos.tx;
  CY = pickPos.ty;
  reset();
  startGame();
  for (const R of RESP) {
    R.g = 99999;
    R.w = 99999;
    R.s = 99999;
  }
  const f = (a, b) => freeTile(CX + a, CY + b);
  for (const [t, a, b] of [
    ["tower", 6, -3],
    ["farm", -8, 5],
    ["forester", -12, 2],
    ["guild", -4, 10],
    ["academy", 8, 8],
    ["storage", -8, -8],
    ["barracks", 10, -8],
    ["house", 0, 12],
    ["market", -12, -6],
    ["wall", 6, 0],
    ["wall", 6, 1],
  ]) {
    const q = f(a, b);
    if (q) build(t, q[0], q[1]);
  }
  for (let i = 0; i < 4; i++) units.push(mkU(0, "knight", (CX + 4.5) * TS, (CY + 4.5) * TS));
  for (let k = 0; k < 2400; k++) {
    if (k === 200) waveT = 0;
    update(0.05);
  }
  const dg = () => {
    let h = 0;
    for (const u of units) h = (h * 31 + Math.round(u.x) + Math.round(u.y) * 7 + Math.round(u.hp)) | 0;
    let hs = 0;
    for (const q of structs) hs = (hs * 31 + Math.round(q.hp) + q.tx) | 0;
    let ht = 0;
    for (let i = 0; i < HT.length; i += 97) ht = (ht * 31 + HT[i] + ter[i] * 3) | 0;
    let sw = SW.n;
    for (let i = 0; i < SW.n; i++)
      sw = (Math.imul(sw, 31) + ((SW.x[i] * 64) | 0) + Math.imul((SW.y[i] * 64) | 0, 7)) | 0;
    /* every unit and structure in full (position, health, kept target), the whole swarm, the co-op hash, prices and the number of random draws: a loaded game must go on exactly like the saved one (issue #5) */
    const tg = (o) => (o._tc ? o._tc.tk + ":" + (o._tc.b ? o._tc.b.uid || -o._tc.b.sid : 0) : "");
    let hu = 0;
    const mix = (t) => {
      for (let i = 0; i < t.length; i++) hu = (Math.imul(hu, 31) + t.charCodeAt(i)) | 0;
    };
    for (const u of units) mix(u.uid + u.type + u.x.toFixed(3) + "," + u.y.toFixed(3) + "," + u.hp.toFixed(3) + tg(u));
    for (const q of structs) mix(q.sid + q.type + q.hp.toFixed(3) + (q.zq | 0) + tg(q));
    return [
      units.length,
      structs.length,
      h,
      hs,
      ht,
      waveN,
      Math.round(time * 100),
      JSON.stringify(RESP),
      hu,
      sw,
      mpHash(),
      JSON.stringify(PRICE),
      rc,
    ].join("|");
  };
  /* solo generates the far chunks in the background, by the clock (bgGen / idle callback), also while the awaits below let frames run: that is
    wall time, not saved state, so it is stopped here (everything left counts as generated) and both continuations see the same world */
  SAVA.GI[1](SAVA.GORD[0]().length);
  rc = 0;
  const D1 = dg();
  paused = true;
  /* the live frame loop would keep ticking during the awaits */ window.__svw = [];
  const t1 = performance.now();
  const txt = await svPack();
  const tPack = performance.now() - t1;
  seedR(77);
  for (let k = 0; k < 400; k++) update(0.05);
  const A = dg();
  seedR(5);
  rollWorld();
  randomSite();
  CX = pickPos.tx;
  CY = pickPos.ty;
  reset();
  startGame();
  for (let k = 0; k < 50; k++) update(0.05);
  const terrainKeys = ["HT", "ter", "amt", "pth", "FLG", "TFL", "genF", "stairs", "occ", "CAMPS", "RUINS"];
  const terrainRefs = terrainKeys.map((k) => SAVA[k][0]());
  const t2 = performance.now();
  await svApply(txt);
  const tLoad = performance.now() - t2;
  rc = 0;
  const D2 = dg();
  const sameTerrainRefs = terrainRefs.every((v, i) => v === SAVA[terrainKeys[i]][0]());
  if (!sameTerrainRefs) throw new Error("terrain arrays or collections were replaced during save restore");
  seedR(77);
  for (let k = 0; k < 400; k++) update(0.05);
  const B = dg();
  renderer.render = REND;
  render3D(0.05);
  /* one real frame of the loaded game: must not throw */ Math.random = RR;
  const w = {};
  for (const x of window.__svw) w[x] = (w[x] || 0) + 1;
  return JSON.stringify({
    ok: D1 === D2 && A === B && sameTerrainRefs,
    len: txt.length,
    tPack: Math.round(tPack),
    tLoad: Math.round(tLoad),
    same0: D1 === D2,
    sameCont: A === B,
    sameTerrainRefs,
    w,
  });
};
