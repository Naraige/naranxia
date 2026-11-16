async () => {
  /* NOT in the suite: how much of the lane routes runs through mountains and water (#30, v95 route bending). Many seeded worlds, solo. The raw land (rawGround = baseHW, before the route
   cuts its corridor) is read at every 3rd route point 50+ tiles from the castle, at the centre and 6 tiles to each side: hill = centre 3+ above the plains, mtn = the highest of the three
   5+ above the plains (the terrain then cuts a canyon for the lane), wat = water at the centre. Also the route length against its straight line and the ms spent in confirmPick.
   python3 tools/run.py tests/route_probe.js   (globals RN = worlds (default 16), R0 = first) */
  renderer.render = function () {};
  const N = typeof RN === "number" ? RN : 16,
    S0 = typeof R0 === "number" ? R0 : 0,
    LAND0 = 12,
    T = { pts: 0, hill: 0, mtn: 0, wat: 0, len: 0, str: 0, ms: 0 };
  for (let trial = S0; trial < N + S0; trial++) {
    const RR = Math.random;
    let sd = ((trial * 7919 + 4242) % 2147483646) + 1;
    const rn = () => {
      sd = (sd * 16807) % 2147483647;
      return (sd - 1) / 2147483646;
    };
    for (let i = 0; i < 20; i++) rn();
    Math.random = rn;
    rollWorld();
    if (pvKey !== SEED) buildPreview();
    let a = null;
    for (let t = 0; t < 20000 && !a; t++) {
      randomSite();
      if (pickPos && pickPos.ok) a = { tx: pickPos.tx, ty: pickPos.ty };
    }
    MP.on = false;
    MP.conn = false;
    pickPos = { tx: a.tx, ty: a.ty, ok: true };
    const t0 = performance.now();
    confirmPick();
    T.ms += performance.now() - t0;
    const W = { pts: 0, hill: 0, mtn: 0, wat: 0, len: 0, str: 0 };
    for (const RT of ROUTES) {
      let l = 0;
      for (let i = 0; i < RT.pts.length; i++) {
        const p = RT.pts[i];
        if (i) l += Math.hypot(p[0] - RT.pts[i - 1][0], p[1] - RT.pts[i - 1][1]);
        if (i % 3 || i + 1 >= RT.pts.length || Math.hypot(p[0] - a.tx, p[1] - a.ty) < 50) continue;
        const q = RT.pts[i + 1],
          dl = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1,
          nx = -(q[1] - p[1]) / dl,
          ny = (q[0] - p[0]) / dl,
          at = (s) => rawGround(Math.round(p[0] + nx * s), Math.round(p[1] + ny * s)),
          c = at(0);
        W.pts++;
        if (c < 0) W.wat++;
        else if (c - LAND0 >= 3) W.hill++;
        if (Math.max(c, at(6), at(-6)) - LAND0 >= 5) W.mtn++;
      }
      const e = RT.pts[0],
        s = RT.pts[RT.pts.length - 1];
      W.len += l;
      W.str += Math.hypot(e[0] - s[0], e[1] - s[1]);
    }
    Math.random = RR;
    for (const k in W) T[k] += W[k];
    console.log("world " + trial + " " + JSON.stringify(W, (k, v) => (typeof v === "number" ? Math.round(v) : v)));
  }
  return "TOTAL " + JSON.stringify(T, (k, v) => (typeof v === "number" ? Math.round(v) : v));
};
