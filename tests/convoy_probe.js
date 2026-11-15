async () => {
  /* NOT in the suite: probe of co-op convoys between pairs of valid castle sites 24 to 60 tiles apart (one page, the guest's convoy command run directly).
   python3 tools/run.py tests/convoy_probe.js   -> one line per pair as it ends (LOG), then TOTAL.
   res: delivered / partly / returned (goods back after 120 s without progress or 900 s in all) / refused (no land route, said at once, nothing leaves).
   For a refused pair: link = is the partner's castle reachable from the porter in a window 300 tiles wider than the pair (the game looks 160 tiles around);
   home / there = number of tiles the porter / the partner's castle can reach in it (a small number = castle on a ledge or an islet without a ramp).
   Worlds are seeded per trial (trial 0..35; edit N for more). v92: 32 of 36 delivered (17 of 120 not); v93: 35 delivered in 7 to 163 s, 1 refused (trial 28: the sender's castle stands on a 30-tile ledge). */
  renderer.render = function () {};
  const out = {
      push(l) {
        console.log(l);
      },
    },
    N = 36;
  let nd = 0,
    nr = 0,
    n = 0;
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
      randomSite();
      if (!pickPos || !pickPos.ok) continue;
      const s = { tx: pickPos.tx, ty: pickPos.ty };
      if (!a) a = s;
      else {
        const d = Math.hypot(a.tx - s.tx, a.ty - s.ty);
        if (d >= 24 && d <= 60) b = s;
      }
    }
    Math.random = RR;
    if (!b) {
      out.push(JSON.stringify({ trial, nob: 1 }));
      continue;
    }
    MP.mine = a;
    MP.theirs = b;
    mpStart();
    waveT = 1e9;
    for (const R of RESP) {
      R.w = 5000;
      R.s = 5000;
    }
    for (let i = 0; i < 40; i++) update(0.05);
    const w0 = RESP[1].w,
      d = Math.round(Math.hypot(a.tx - b.tx, a.ty - b.ty));
    n++;
    mpExec({ k: "cv", g: 0, w: 120, s: 60, f: 0 }, false);
    const cv = () => units.filter((u) => u.cv);
    let res = "?",
      t = 0;
    const e0 = QST.e.cv | 0,
      np = cv().length;
    if (!np && RESP[1].w === w0) {
      const p = units
        .filter((u) => u.t === 0 && u.type === "peasant" && (u.pl | 0) === 1 && u.hp > 0)
        .sort(
          (x, y) => Math.hypot(x.x - CS2.x, x.y - CS2.y) - Math.hypot(y.x - CS2.x, y.y - CS2.y) || x.uid - y.uid,
        )[0];
      const ft = freeTile(CS.tx + 2, CS.ty + 2),
        st = freeTile(Math.floor(p.x / TS), Math.floor(p.y / TS)),
        m = 300,
        x0 = Math.min(a.tx, b.tx) - m,
        y0 = Math.min(a.ty, b.ty) - m,
        w = Math.abs(a.tx - b.tx) + 2 * m,
        h = Math.abs(a.ty - b.ty) + 2 * m;
      const cnt = (B) => {
          let c = 0;
          for (let k = 0; k < B.F.length; k++) if (B.F[k] < 65535) c++;
          return c;
        },
        B1 = bfsW([ft], true, x0, y0, w, h),
        B2 = bfsW([st], true, x0, y0, w, h);
      nr++;
      out.push(
        JSON.stringify({
          trial,
          a,
          b,
          d,
          res: "refused",
          link: B1.F[(st[1] - B1.y0) * B1.w + st[0] - B1.x0] < 65535,
          home: cnt(B2),
          there: cnt(B1),
        }),
      );
      MP.on = false;
      continue;
    }
    for (; t < 20000; t++) {
      update(0.05);
      const c = cv();
      if (!c.length) {
        res = "gone";
        break;
      }
      if (c.every((u) => u.cv.back)) {
        res = (QST.e.cv | 0) - e0 >= np ? "delivered" : (QST.e.cv | 0) > e0 ? "partly" : "returned";
        break;
      }
    }
    const sec = Math.round(t * 0.05);
    if (res === "delivered") nd++;
    out.push(
      JSON.stringify(
        res === "delivered"
          ? { trial, d, res, sec }
          : {
              trial,
              a,
              b,
              d,
              res,
              sec,
              dl: (QST.e.cv | 0) - e0,
              at: cv()
                .map((u) => Math.round(u.x / TS) + "," + Math.round(u.y / TS))
                .join(" "),
            },
      ),
    );
    MP.on = false;
  }
  return "TOTAL delivered " + nd + ", refused " + nr + ", of " + n;
};
