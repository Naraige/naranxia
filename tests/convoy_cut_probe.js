async () => {
  /* Registered browser coverage: which seeded pairs of castle sites are cut (no land route for a convoy), and what the route check of the
   co-op quest costs there. Same worlds and sites as tests/convoy_probe.js (trial 0..N-1), but no convoy walks: per trial the two castles
   are founded, then convoyLinked() (multiplayer/convoys.js) is timed 3 times. A cut pair is the costly case (both wide floods run).
   python3 tools/run.py tests/convoy_cut_probe.js   -> one line per cut pair, then the totals (ms: median of the 3 calls).
   why: river = water tiles on the straight line between the castles; ledge = the flood of one castle is small (home / there tiles). */
  renderer.render = function () {};
  const N = 120,
    cut = [],
    tl = [],
    tc = [];
  MP.dc = { readyState: "open", send: () => {} };
  MP.host = true;
  MP.conn = true;
  for (let trial = 0; trial < N; trial++) {
    const RR = Math.random;
    let sd = ((trial * 7919 + 12345) % 2147483646) + 1;
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
    for (let t = 0; t < 20000 && !(a && b); t++) {
      randomSite(false);
      if (!pickPos || !pickPos.ok) continue;
      const s = { tx: pickPos.tx, ty: pickPos.ty };
      if (!a) a = s;
      else {
        const d = Math.hypot(a.tx - s.tx, a.ty - s.ty);
        if (d >= 24 && d <= 60) b = s;
      }
    }
    Math.random = RR;
    if (!b) continue;
    MP.mine = a;
    MP.theirs = b;
    mpStart();
    if (!MP.on) mpStart(); /* v95: the first call only asks to confirm over a running game */
    waveT = 1e9;
    for (let i = 0; i < 20; i++) update(0.05);
    const before = mpHash();
    const outcomes = [];
    const ms = [];
    let r;
    for (let i = 0; i < 3; i++) {
      const t0 = performance.now();
      r = convoyLinked();
      outcomes.push(r);
      ms.push(performance.now() - t0);
    }
    __test.check(
      "route lookup stable " + trial,
      outcomes.every((v) => v === outcomes[0]),
    );
    __test.check("route lookup preserves gameplay state " + trial, mpHash(), before);
    if (trial === 77) __test.check("known river cut", r, false);
    ms.sort((x, y) => x - y);
    if (r) tl.push(ms[1]);
    else {
      tc.push(ms[1]);
      const fa = freeTile(CS.tx + 2, CS.ty + 2),
        fb = freeTile(CS2.tx + 2, CS2.ty + 2),
        m = 160,
        x0 = Math.min(a.tx, b.tx) - m,
        y0 = Math.min(a.ty, b.ty) - m,
        w = Math.abs(a.tx - b.tx) + 2 * m,
        h = Math.abs(a.ty - b.ty) + 2 * m;
      const cnt = (B) => {
          let c = 0;
          for (let k = 0; k < B.F.length; k++) if (B.F[k] < 65535) c++;
          return c;
        },
        BA = bfsW([fa], true, x0, y0, w, h),
        BB = bfsW([fb], true, x0, y0, w, h);
      let wat = 0;
      const n = Math.ceil(Math.hypot(a.tx - b.tx, a.ty - b.ty));
      for (let i = 0; i <= n; i++) {
        const x = Math.round(a.tx + 2 + ((b.tx - a.tx) * i) / n),
          y = Math.round(a.ty + 2 + ((b.ty - a.ty) * i) / n);
        if (ter[y * TW + x] === 1) wat++;
      }
      const row = { trial, a, b, d: n, ms: +ms[1].toFixed(1), home: cnt(BA), there: cnt(BB), water: wat };
      cut.push(row);
      console.log(JSON.stringify(row));
    }
    MP.on = false;
  }
  const med = (A) => {
      const s = A.slice().sort((x, y) => x - y);
      return s.length ? +s[s.length >> 1].toFixed(1) : 0;
    },
    mx = (A) => (A.length ? +Math.max(...A).toFixed(1) : 0);
  __test.check("every seeded pair exercised", tl.length + tc.length, N);
  __test.check("both linked and cut maps covered", tl.length > 0 && tc.length > 0);
  return JSON.stringify({
    ok: __test.assertions.every((a) => a.passed),
    pairs: tl.length + tc.length,
    linked: tl.length,
    cut: tc.length,
    medianLinked: med(tl),
    medianCut: med(tc),
    maxLinked: mx(tl),
    maxCut: mx(tc),
  });
};
