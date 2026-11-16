async () => {
  /* NOT in the suite: static check of the lane fields of seeded worlds (#30). No zombies: for every lane stretch (LSEG way points) it builds the stretch's path field and asks
   (a) is there a field at all (a free tile near one of the stretch's last way points), (b) does the field reach the stretch's first way point (the zombies arrive there from the previous stretch),
   (c) how far does the way point lie in solid ground (tree / rock / mountain / water) and (d) the detour: field value at the first way point / straight distance to the target.
   python3 tools/run.py tests/lane_static.js   (SN = worlds (default 6), S0v = first). Prints per world: stretches, nofield, unreach, solidWp (way points on solid tiles, by type), detour>2.5. */
  renderer.render = function () {};
  const N = typeof SN === "number" ? SN : 6,
    S0 = typeof S0v === "number" ? S0v : 0,
    LSEG = 8,
    LET = ".wTSGM",
    tl = (m) => (ter[m] === 5 ? "M" : LET[ter[m]] || "?");
  const { laneFieldQ, fv, solid } = swDbg;
  MP.dc = { readyState: "open", send: () => {} };
  let T = { seg: 0, nof: 0, unr: 0, det: 0 };
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
    confirmPick();
    waveT = 1e9;
    for (let i = 0; i < 40; i++) update(0.05);
    const C0 = structs.filter((s) => s.type === "castle")[0],
      W = { seg: 0, nof: 0, unr: 0, det: 0, solid: {}, ex: [] };
    for (let L = 0; L < ROUTES.length; L++) {
      const Wp = ROUTES[L].wps;
      for (let sg = 0; sg * LSEG < Wp.length; sg++) {
        const a0 = sg * LSEG,
          e = Wp[Math.min(Wp.length - 1, a0 + LSEG)];
        if (Math.hypot(e[0] - C0.tx, e[1] - C0.ty) < 50) continue;
        for (let k = a0; k <= Math.min(Wp.length - 1, a0 + LSEG + 2); k++) ensureAround(Wp[k][0] | 0, Wp[k][1] | 0, 2);
        ver++;
        swDbg.LFLD.clear();
        const S = laneFieldQ(L, sg);
        W.seg++;
        if (!S) {
          W.nof++;
          continue;
        }
        const p = Wp[a0],
          v = fv(S, p[0] | 0, p[1] | 0),
          g = Wp[S.tg],
          sd0 = Math.hypot(g[0] - p[0], g[1] - p[1]),
          ti = (p[1] | 0) * TW + (p[0] | 0);
        if (ter[ti]) W.solid[tl(ti)] = (W.solid[tl(ti)] | 0) + 1;
        if (v >= 65535) {
          W.unr++;
          const g2 = Wp[S.tg],
            cx = g2[0] | 0,
            cy = g2[1] | 0,
            sds = [];
          for (let j = -2; j <= 2; j++)
            for (let i = -2; i <= 2; i++) if (!solid(cx + i, cy + j)) sds.push([cx + i, cy + j]);
          const x0 = Math.min(p[0], g2[0]) | 0,
            y0 = Math.min(p[1], g2[1]) | 0,
            x1 = Math.max(p[0], g2[0]) | 0,
            y1 = Math.max(p[1], g2[1]) | 0;
          for (const R of [30, 60, 120, 240]) {
            const B = bfsW(sds, false, x0 - R, y0 - R, x1 - x0 + 2 * R, y1 - y0 + 2 * R),
              vb = fv(B, p[0] | 0, p[1] | 0);
            if (vb < 65535) {
              (W.big = W.big || {})[R] = (W.big[R] | 0) + 1;
              if (W.ex.length < 4)
                W.ex.push(
                  "L" +
                    L +
                    " sg" +
                    sg +
                    " wp" +
                    (p[0] | 0) +
                    "," +
                    (p[1] | 0) +
                    " ->tg" +
                    S.tg +
                    " reached at box+" +
                    R +
                    " len" +
                    vb +
                    " (straight " +
                    Math.round(Math.hypot(g2[0] - p[0], g2[1] - p[1])) +
                    ")",
                );
              break;
            }
            if (R === 240 && W.ex.length < 4)
              W.ex.push("L" + L + " sg" + sg + " wp" + (p[0] | 0) + "," + (p[1] | 0) + " NO PATH even box+240");
          }
        } else if (v > 2.5 * Math.max(8, sd0)) W.det++;
      }
    }
    Math.random = RR;
    for (const k of ["seg", "nof", "unr", "det"]) T[k] += W[k];
    console.log("world " + trial + " " + JSON.stringify(W));
  }
  return "TOTAL " + JSON.stringify(T);
};
