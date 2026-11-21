async () => {
  /* block-built buildings: every type has a footprint (BSZ) that matches its model, every block of every model is known, and both tiers build geometry */
  const O = { types: 0, bad: [] };
  for (const t in VOXB) {
    O.types++;
    const B = VOXB[t];
    if (BSZ[t] !== B.sz) O.bad.push(t + ": BSZ " + BSZ[t] + " vs model " + B.sz);
    for (const tier of [0, 1]) {
      const M = B.make(tier);
      if (M.w > B.sz * BPT || M.l > B.sz * BPT) O.bad.push(t + ": model " + M.w + "x" + M.l + " exceeds " + B.sz * BPT);
      if (M.unk && M.unk.length) O.bad.push(t + ": unknown blocks " + M.unk.join(","));
      const g = voxelGeo(M, { ox: B.ox || 0, oz: B.oz || 0, k: 1 / BPT });
      if (!g.attributes.position || g.attributes.position.count < 100) O.bad.push(t + ": empty geometry tier " + tier);
    }
  }
  for (const t in BSZ) if (!VOXB[t]) O.bad.push(t + ": footprint without model");
  /* every look of a building with several looks */
  for (const t in VOXB)
    for (let v = 1; v < (VOXB[t].variants || 1); v++)
      for (const tier of [0, 1]) {
        const M = VOXB[t].make(tier, v);
        if (M.unk && M.unk.length) O.bad.push(t + " look " + v + ": unknown blocks " + M.unk.join(","));
      }
  /* fortifications, in timber and stone: wall pieces of several looks (in a run, alone, an end, an inner corner, fitted against something, with a
     fire basket), both towers with and without an engine, both gates, keep, torch. Each model is as wide as its footprint on the grid of FCELL
     tiles (towers and gates carry one block of margin for what hangs on their faces) */
  O.forts = 0;
  const fort = (s, m, op, w, l) => {
    const F = fortOf(s, m, op);
    if (!F) return O.bad.push(s.type + ": no block model");
    const B = F.make();
    O.forts++;
    if (B.M.unk && B.M.unk.length) O.bad.push(F.k + ": unknown blocks " + B.M.unk.join(","));
    if (B.M.w !== w || B.M.l !== l) O.bad.push(F.k + ": model " + B.M.w + "x" + B.M.l + ", expected " + w + "x" + l);
    const g = voxelGeo(B.M, { ox: B.o, oz: B.oz === undefined ? B.o : B.oz, k: 1 / BPT });
    if (!g.attributes.position || g.attributes.position.count < 24) O.bad.push(F.k + ": empty geometry");
  };
  const LOOKS = [
    "1111000000004444",
    "9113800280026446",
    "9111800080008444",
    "0000000000000000",
    "g000000000000000",
    "93--a2--e6------",
    "1111000000004444L",
    null,
  ];
  for (const tier of [0, 1]) {
    for (const lk of LOOKS) fort({ type: "wall", tier, tx: 8, ty: 12 }, lk, false, FCELL, FCELL);
    for (const op of [false, true]) {
      fort({ type: "tower", tier, sz: FCELL }, 0, op, FCELL + 2, FCELL + 2);
      fort({ type: "tower", tier, sz: 2 * FCELL }, 0, op, 2 * FCELL + 2, 2 * FCELL + 2);
    }
    fort({ type: "gate", tier, gl: 2 }, 0, false, 2 * FCELL + 2, FCELL + 2);
    fort({ type: "gate", tier, gl: 3 }, 0, false, 3 * FCELL + 2, FCELL + 2);
    fort({ type: "keep", tier, sz: 2 * FCELL }, 0, false, 2 * FCELL + 2, 2 * FCELL + 2);
    fort({ type: "torch", tier }, 0, false, 1, 1);
  }
  O.ok = O.types >= 18 && O.forts === 32 && O.bad.length === 0;
  window.__test.check("voxel buildings", O.ok, true);
  return JSON.stringify(O);
};
