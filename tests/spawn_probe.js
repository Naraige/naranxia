async () => {
  /* NOT in the suite: where do the hordes spawn? Many fixed worlds, solo and co-op (castles 10..60 tiles apart = "near", anywhere = "far").
   python3 tools/run.py tests/spawn_probe.js   (globals SPN = trials, SP0 = first trial, SPK = 0 solo / 1 near / 2 far)
   One LOG line per trial: per lane L (all 3 or 6 lanes) the spawn tile, the route length from the spawn to its own castle (path), the straight distance to each castle,
   and the totals: v45 / v90 = spawns within 45 / 90 tiles (default zoom view with margin / widest zoom view) of any castle. */
  renderer.render = function () {};
  const N = typeof SPN === "number" ? SPN : 32,
    T0 = typeof SP0 === "number" ? SP0 : 0,
    KK = typeof SPK === "number" ? SPK : -1;
  const tot = { n: 0, v45: 0, v90: 0, min: 1e9, shortR: 0, lanes: 0, rt: 0 };
  MP.dc = { readyState: "open", send: () => {} };
  for (let trial = T0; trial < T0 + N; trial++)
    for (const kind of KK < 0 ? [0, 1, 2] : [KK]) {
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
      let a = null,
        b = null;
      for (let t = 0; t < 20000 && !(a && (b || kind === 0)); t++) {
        randomSite();
        if (!pickPos || !pickPos.ok) continue;
        const s = { tx: pickPos.tx, ty: pickPos.ty };
        if (!a) a = s;
        else {
          const d = Math.max(Math.abs(a.tx - s.tx), Math.abs(a.ty - s.ty));
          if (kind === 2 ? d >= 10 : d >= 10 && d <= 60) b = s;
        }
      }
      if (kind && !b) {
        Math.random = RR;
        continue;
      }
      if (kind) {
        MP.host = true;
        MP.conn = true;
        MP.mine = a;
        MP.theirs = b;
        mpStart();
      } else {
        MP.on = false;
        MP.conn = false;
        pickPos = { tx: a.tx, ty: a.ty, ok: true };
        confirmPick();
      }
      waveT = 1e9;
      for (let i = 0; i < 10; i++) update(0.05);
      const Cs = [CS, CS2].filter(Boolean),
        nl = SITE2 ? 6 : 3,
        row = [];
      for (let L = 0; L < nl; L++) {
        const an = spawnAnchor(L),
          P = ROUTES[L].pts,
          i = Math.min(P.length - 1, an.ph * 3);
        let len = 0;
        for (let j = i; j < P.length - 1; j++) len += Math.hypot(P[j + 1][0] - P[j][0], P[j + 1][1] - P[j][1]);
        const ds = Cs.map((c) => Math.round(Math.hypot(an.p[0] - c.x / TS, an.p[1] - c.y / TS))),
          dm = Math.min(...ds);
        tot.lanes++;
        if (dm < 45) tot.v45++;
        if (dm < 90) tot.v90++;
        if (dm < tot.min) tot.min = dm;
        if (len < 150) tot.shortR++;
        tot.rt += len;
        row.push(
          L + ":" + Math.round(an.p[0]) + "," + Math.round(an.p[1]) + " rt" + Math.round(len) + " d" + ds.join("/"),
        );
      }
      tot.n++;
      console.log(JSON.stringify({ trial, kind, a, b, row }));
      Math.random = RR;
      MP.on = false;
      MP.conn = false;
      SITE2 = null;
    }
  tot.rt = Math.round(tot.rt / Math.max(1, tot.lanes));
  return "TOTAL " + JSON.stringify(tot);
};
