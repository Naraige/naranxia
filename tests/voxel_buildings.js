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
  O.ok = O.types >= 18 && O.bad.length === 0;
  window.__test.check("voxel buildings", O.ok, true);
  return JSON.stringify(O);
};
