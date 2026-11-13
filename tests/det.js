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
      const f = freeTile(Math.round(CX + fx * a - fy * b), Math.round(CY + fy * a + fx * b));
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
  // Captured from the unmodified v94 baseline at 4a57714017d38c8d5294445e20962eb4b1e76c11.
  const expected = [
    "1289907662:21950:1:0:1045:0.9614:sh9:nl0.99:f150:sp0:ro00:wk0:T-767045186:z139:pu2:fg1:fp3",
    "1277869275:25993:7:0:1082:0.9768:sh9:nl1.00:f150:sp0:ro00:wk0:T-1684843046:z132:pu2:fg0:fp9",
    "1806847686:25993:7:0:1082:0.9875:sh9:nl1.00:f150:sp0:ro00:wk0:T-1684843046:z132:pu0:fg0:fp9",
    "-1490071179:25993:7:0:1082:0.9934:sh9:nl1.00:f150:sp0:ro00:wk0:T-1684843046:z132:pu0:fg0:fp9",
    "-733253062:25986:18:0:1094:0.9965:sh9:nl1.00:f150:sp0:ro00:wk0:T423784588:z128:pu0:fg0:fp9",
    "-1208506384:25896:118:0:1129:0.9982:sh9:nl1.00:f150:sp0:ro00:wk0:T423784588:z118:pu0:fg0:fp9",
    "-1815204722:25660:364:0:1290:0.9982:sh9:nl1.00:f200:sp0:ro00:wk0:T423784588:z110:pu0:fg0:fp8",
    "-19860095:25528:509:2:1567:0.9982:sh0:nl1.00:f300:sp0:ro00:wk2:T423784588:z100:pu6:fg0:fp5",
  ];
  const reference = JSON.stringify(a) === JSON.stringify(expected);
  return JSON.stringify({ ok: same && reference, same, reference, a, b });
};
