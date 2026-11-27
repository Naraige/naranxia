async () => {
  const runOnce = () => {
    MP.on = true;
    MP.host = true;
    const R0 = Math.random;
    SEED = 123.456;
    GPR = { fq: 0.012, wl: 0.3, mt: 0.55, rv: 0.012, rg: 0.95, am: 0.9, tr: 0.6, gd: 1, tc: 0.006 };
    SITE2 = null;
    Math.random = rngf(777);
    randomSite();
    CX = pickPos.tx;
    CY = pickPos.ty;
    reset();
    inGame = true;
    started = false;
    waveT = 1e9;
    Math.random = rngf(999);
    const L = nextL[0],
      P = ROUTES[L].pts,
      pe = P[P.length - 1],
      dx = pe[0] - CX,
      dy = pe[1] - CY,
      dl = Math.hypot(dx, dy),
      fx = dx / dl,
      fy = dy / dl;
    res.w = 9999;
    res.s = 9999;
    for (const [t, a, b] of [
      ["tower", 6, -3],
      ["tower", 6, 3],
      ["tower", 9, 0],
      ["market", -4, -6],
      ["torch", 3, 8],
      ["farm", -8, 5],
      ["farm", -8, 9],
      ["forester", -12, 2],
      ["guild", -4, 10],
    ]) {
      const f = freeSite(t, Math.round(CX + fx * a - fy * b), Math.round(CY + fy * a + fx * b), 40);
      if (!f) continue;
      const m = structs.length;
      _N.build(t, f[0], f[1]);
      if (structs.length > m) {
        const st = structs[structs.length - 1];
        st.prog = 1;
        st.hp = st.max;
      }
    }
    for (let i = 0; i < 6; i++) {
      const f = freeTile(Math.round(CX + fx * 4), Math.round(CY + fy * 4));
      units.push(mkU(0, i % 2 ? "archer" : "knight", (f[0] + 0.5) * TS, (f[1] + 0.5) * TS));
    }
    for (let i = 0; i < 6; i++) {
      const p = spawnPos(CS);
      units.push(mkU(0, "peasant", p.x, p.y));
    }
    setPl(0);
    roleAdj0("b", 1);
    roleAdj0("r", 1);
    {
      const f = freeTile(Math.round(CX - fx * 22), Math.round(CY - fy * 22));
      units.push(mkU(0, "knight", (f[0] + 0.5) * TS, (f[1] + 0.5) * TS));
    }
    for (let k = 0; k < 9; k++) {
      const t = ["bomber", "acid", "miner"][k % 3],
        a = 14 + k,
        b2 = (k - 4) * 2;
      const f = freeTile(Math.round(CX + fx * a - fy * b2), Math.round(CY + fy * a + fx * b2));
      if (f) units.push(mkU(1, t, (f[0] + 0.5) * TS, (f[1] + 0.5) * TS, null, -1));
    }
    waveN = 14;
    waveST = time;
    wave();
    waveOn = hordeOn = true;
    hordeT = time;
    waveT = 0;
    const hs = [];
    for (let k = 0; k < 6000; k++) {
      if (k === 300) {
        setPl(0);
        _N.trade("sellw");
        _N.trade("buys");
      }
      if (k === 400) {
        RS.done = true;
        for (let q = 0; q < 2; q++) {
          const f = freeTile(Math.round(CX + fx * 3), Math.round(CY + fy * 3));
          units.push(mkU(0, "cannon", (f[0] + 0.5) * TS, (f[1] + 0.5) * TS));
        }
        units.forEach((u) => (u.sel = u.t === 0 && u.type !== "peasant"));
        formType = 2;
        _N.order({ x: (CX + fx * 7) * TS, y: (CY + fy * 7) * TS });
        FORCEF = 1.2;
        _N.order({ x: (CX + fx * 9) * TS, y: (CY + fy * 9) * TS });
        FORCEF = null;
        units.forEach((u) => (u.sel = false));
        formType = 0;
      }
      update(1 / 30);
      if (k % 750 === 749)
        hs.push(
          mpHash() +
            ":" +
            (typeof SW !== "undefined" ? SW.n : 0) +
            ":" +
            kills +
            ":" +
            units.filter((u) => u.dk).length +
            ":" +
            Math.round(res.g) +
            ":" +
            PRICE.w.toFixed(4) +
            ":sh" +
            units.filter((u) => u.shel).length +
            ":nl" +
            nightLv.toFixed(2) +
            ":f" +
            Math.round(res.f) +
            ":sp" +
            SAPL.size +
            ":ro" +
            RHAS[0].b +
            RHAS[0].r +
            ":wk" +
            units.filter((u) => u.job === "f" || u.job === "p").length +
            ":T" +
            (() => {
              let h = 0;
              for (let y = CY - 70; y < CY + 70; y++)
                for (let x = CX - 70; x < CX + 70; x++) {
                  const i = y * TW + x;
                  h = (h * 31 + HT[i] * 7 + ter[i] + (TFL[i] ? 3 : 0)) | 0;
                }
              return h;
            })() +
            ":z" +
            units
              .filter((u) => u.t === 1)
              .map((u) => u.type[0])
              .join("").length +
            ":pu" +
            PUD.length +
            ":fg" +
            FGS.length +
            ":fp" +
            units.filter((u) => u.fpos).length,
        );
    }
    Math.random = R0;
    MP.on = false;
    return hs;
  };
  if (window.__NX_PROFILE_DET__) {
    const t = performance.now(),
      h = runOnce();
    return JSON.stringify({ ms: Math.round(performance.now() - t), h });
  }
  const a = runOnce(),
    b = runOnce(),
    same = JSON.stringify(a) === JSON.stringify(b);
  // Captured from the v95 polish lots (lot A: route reach 112 tiles, contour spread of crowded hordes, terrain-aware lane routes #30, spawn patch that widens with the wave size, weighted unit separation with body block), identical on two runs: v94 release branch (main formatting merge, far wave spawn, horde pile-up fix, 10 Hz swarm, lane-field target fix, spike removal) plus route bending.
  const expected = [
    "479017398:21749:8:0:1096:0.9614:sh0:nl0.12:f192:sp0:ro11:wk3:T625368844:z131:pu0:fg0:fp5",
    "487928772:25999:8:0:1101:0.9768:sh0:nl0.28:f240:sp0:ro11:wk3:T625368844:z131:pu0:fg0:fp5",
    "1247960188:25999:8:0:1121:0.9875:sh8:nl0.49:f240:sp0:ro11:wk0:T625368844:z131:pu0:fg0:fp5",
    "-115812872:25999:8:1:1121:0.9934:sh8:nl0.71:f240:sp0:ro11:wk0:T625368844:z131:pu0:fg0:fp5",
    "-1068679618:25999:8:1:1121:0.9965:sh8:nl0.89:f240:sp0:ro11:wk0:T625368844:z131:pu0:fg0:fp5",
    "460491442:25999:8:0:1121:0.9982:sh8:nl0.99:f240:sp0:ro10:wk0:T625368844:z131:pu0:fg0:fp5",
    "1787709875:25999:8:0:1121:0.9982:sh8:nl1.00:f240:sp0:ro10:wk0:T625368844:z131:pu0:fg0:fp5",
    "1013165400:25999:8:0:1121:0.9982:sh8:nl1.00:f240:sp0:ro00:wk0:T625368844:z131:pu0:fg0:fp5",
  ];
  const reference = JSON.stringify(a) === JSON.stringify(expected);
  __test.check("repeated simulation fingerprints", a, b);
  __test.check(
    "pinned fingerprints (re-pinned v101 (King and guards at the start; rescale: body radii x1.6, swarm density 5): round island, no rival kingdoms, kingdom paths, flatter world; open heart, bridge and islet of the portals)",
    a,
    expected,
  );
  return JSON.stringify({ ok: same && reference, same, reference, a, b });
};
