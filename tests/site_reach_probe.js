async () => {
  /* NOT in the suite: how often does a random castle start land off the main land (closed ledge, behind a river)?
   python3 tools/run.py tests/site_reach_probe.js   (globals SRN = worlds, default 40; SRP = co-op pairs to start for real, default 0; SRO = 1 -> old pick, no mainland rule)
   Per world: SITES old-style random sites (siteOK only) off the mainland, and the new randomSite() off the mainland (must be 0).
   With SRP > 0 it also starts SRP co-op games per world (castles 60 to 220 tiles apart, the range of a convoy) and counts convoyLinked() = false, the real test of "the convoy is possible". */
  renderer.render = function () {};
  const N = typeof SRN === "number" ? SRN : 40,
    P = typeof SRP === "number" ? SRP : 0,
    OLD = typeof SRO === "number" && SRO === 1,
    SITES = 60;
  let off = 0,
    tot = 0,
    offNew = 0,
    bad = 0,
    pairs = 0,
    worldsOff = 0;
  MP.dc = { readyState: "open", send: () => {} };
  const pick = () => {
    if (OLD) {
      for (let a = 0; a < 2000; a++) {
        const tx = 140 + ((Math.random() * (TW - 280)) | 0),
          ty = 110 + ((Math.random() * (TH - 220)) | 0);
        if (siteOK(tx, ty)) return { tx, ty };
      }
      return null;
    }
    randomSite();
    return pickPos && pickPos.ok ? { tx: pickPos.tx, ty: pickPos.ty } : null;
  };
  for (let trial = 0; trial < N; trial++) {
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
    let wo = 0;
    for (let k = 0; k < SITES; k++) {
      let s = null;
      for (let a = 0; a < 2000 && !s; a++) {
        const tx = 140 + ((Math.random() * (TW - 280)) | 0),
          ty = 110 + ((Math.random() * (TH - 220)) | 0);
        if (siteOK(tx, ty)) s = { tx, ty };
      }
      tot++;
      if (s && !siteOnMainland(s.tx, s.ty)) {
        off++;
        wo++;
      }
      randomSite();
      if (pickPos && pickPos.ok && !siteOnMainland(pickPos.tx, pickPos.ty)) offNew++;
    }
    if (wo) worldsOff++;
    for (let q = 0; q < P; q++) {
      const a = pick();
      let b = null;
      for (let t = 0; t < 400 && a && !b; t++) {
        const c = pick();
        const d = c ? Math.hypot(a.tx - c.tx, a.ty - c.ty) : 0;
        if (d >= 60 && d <= 220) b = c;
      }
      if (!a || !b) continue;
      MP.host = true;
      MP.conn = true;
      MP.mine = a;
      MP.theirs = b;
      mpStart();
      waveT = 1e9;
      for (let i = 0; i < 10; i++) update(0.05);
      pairs++;
      const lk = convoyLinked();
      if (!lk) bad++;
      console.log(JSON.stringify({ trial, a, b, linked: lk }));
      MP.on = false;
      MP.conn = false;
      SITE2 = null;
    }
    Math.random = RR;
  }
  return JSON.stringify({
    worlds: N,
    sites: tot,
    oldOff: off,
    oldOffPct: +((100 * off) / tot).toFixed(1),
    worldsWithOffSites: worldsOff,
    newOff: offNew,
    pairs,
    notLinked: bad,
    old: OLD,
  });
};
