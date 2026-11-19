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
  /* fortifications: every wall join, both towers with and without an engine, both gates, keep, torch, in timber and stone */
  O.forts = 0;
  const fort = (s, m, op) => {
    const F = fortOf(s, m, op);
    if (!F) return O.bad.push(s.type + ": no block model");
    const B = F.make();
    O.forts++;
    if (B.M.unk && B.M.unk.length) O.bad.push(F.k + ": unknown blocks " + B.M.unk.join(","));
    const g = voxelGeo(B.M, { ox: B.o, oz: B.oz === undefined ? B.o : B.oz, k: 1 / BPT });
    if (!g.attributes.position || g.attributes.position.count < 24) O.bad.push(F.k + ": empty geometry");
  };
  for (const tier of [0, 1]) {
    for (let m = 0; m < 64; m++) fort({ type: "wall", tier }, m, false);
    for (const op of [false, true]) {
      fort({ type: "tower", tier, sz: 1 }, 0, op);
      fort({ type: "tower", tier, sz: 2 }, 0, op);
    }
    fort({ type: "gate", tier, gl: 2 }, 0, false);
    fort({ type: "gate", tier, gl: 3 }, 0, false);
    fort({ type: "keep", tier, sz: 2 }, 0, false);
    fort({ type: "torch", tier }, 0, false);
  }
  O.ok = O.types >= 18 && O.forts === 144 && O.bad.length === 0;
  window.__test.check("voxel buildings", O.ok, true);
  return JSON.stringify(O);
};
