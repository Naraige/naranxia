async () => {
  /* v91 features: seasons and weather, spike trap, boiling oil, boss, king skills, stats, records, co-op goals, save round trip */
  let s = 21;
  const RR = Math.random;
  Math.random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  rollWorld();
  randomSite();
  pickPos = { tx: pickPos.tx, ty: pickPos.ty, ok: true };
  confirmPick();
  waveT = 1e9;
  const O = {},
    C = [];
  const chk = (n, v) => {
    window.__test.check(n, !!v);
    O[n] = v;
    C.push(!!v);
  };
  for (const R of RESP) {
    R.g = 99999;
    R.w = 99999;
    R.s = 99999;
    R.f = 999;
  }
  /* seasons and weather: a season lasts 4 waves, the weather is fixed per wave, wave 0 is clear spring */
  const se = [];
  for (const w of [0, 1, 4, 5, 8, 12, 13, 16]) {
    waveN = w;
    se.push(seasonIdx() + "/" + wxKind());
  }
  waveN = 0;
  O.seas = se.join(" ");
  chk(
    "seasonCycle",
    se[0] === "0/0" &&
      se[1].startsWith("0/") &&
      se[2].startsWith("1/") &&
      se[5].startsWith("3/") &&
      se[7].startsWith("0/"),
  );
  waveN = 13;
  chk("label", /^Winter/.test(wxLabel()) && seasonIdx() === 3);
  waveN = 0;
  for (let i = 0; i < 30; i++) weatherTick(0.05);
  chk("weatherTick", WX.w[0] > 0.9);
  /* spike trap: placed, charged, hurts a zombie standing on it */
  const f = freeTile(CS.tx + 6, CS.ty + 6),
    tx = f[0],
    ty = f[1],
    ti = ty * TW + tx,
    g0 = RESP[0].g;
  build("spike", tx, ty);
  chk("spikePlaced", SPK.has(ti));
  chk("spikePaid", g0 - RESP[0].g === 10);
  const zz = mkU(1, "zombie", (tx + 0.5) * TS, (ty + 0.5) * TS, null, -1);
  units.push(zz);
  const hp0 = zz.hp;
  for (let i = 0; i < 30; i++) {
    zz.x = (tx + 0.5) * TS;
    zz.y = (ty + 0.5) * TS;
    update(0.05);
  }
  chk("spikeHurts", zz.hp < hp0 - 5 || zz.hp <= 0);
  chk("spikeWears", SPK.get(ti) === undefined || SPK.get(ti) < 120);
  /* boiling oil: a wall scalds a zombie next to it */
  RS2.done.oil = true;
  const fw = freeTile(CS.tx - 6, CS.ty + 6);
  build("wall", fw[0], fw[1]);
  const wl = structs[structs.length - 1];
  wl.prog = 1;
  wl.hp = wl.max;
  const oz = mkU(1, "zombie", wl.x + TS * 2.4, wl.y, null, -1);
  units.push(oz);
  waveOn = true;
  const oh = oz.hp;
  /* the oil boils only while a horde is on (more than 6 of the dead still on a lane); the check used to pass on a castle arrow */
  const pack = [];
  for (let i = 0; i < 8; i++) pack.push(mkU(1, "zombie", wl.x + TS * 2.4, wl.y, null, 0));
  units.push(...pack);
  waveST = time;
  for (let i = 0; i < 40; i++) {
    for (const z of pack) z.hp = 55;
    oz.x = wl.x + TS * 2.4;
    oz.y = wl.y;
    update(0.05);
  }
  waveOn = false;
  chk("oilScalds", oz.hp < oh - 5 || oz.hp <= 0);
  /* boss: wave 10 brings one, bigger and tougher, with a stomp that hurts the units around it */
  waveN = 9;
  wave();
  const bs = units.find((u) => u.boss);
  chk("bossSpawn", !!bs && bs.bn === 0 && bs.type === "brute" && bs.hp > T.brute.hp * 3 && bs.sv > 1.5);
  if (bs) {
    const pe = mkU(0, "knight", bs.x + TS * 1.2, bs.y, null, -1);
    units.push(pe);
    const ph = pe.hp;
    bossStomp(bs);
    chk("bossStomp", pe.hp < ph);
  }
  for (const u of units) if (u.boss) u.hp = 0;
  for (let i = 0; i < 3; i++) update(0.05);
  /* the calendar of seasonal events: the feast runs over the new year, nothing in February */
  chk(
    "seasonalCalendar",
    ["2026-12-24", "2027-01-06", "2027-01-07", "2027-02-10", "2027-03-20", "2027-06-30", "2027-10-31", "2027-11-03"]
      .map((d) => (seasonalEvent(new Date(d + "T12:00:00")) || { id: "-" }).id)
      .join() === "winter,winter,-,-,spring,summer,horde,-",
  );
  /* the dark veil (v98): in the deep night a unit in the light cannot walk into the dark, a bannerman can, and the dark does not hold
     a unit that ends its walk in the light */
  {
    const cs = structs.find((s) => s.type === "castle"),
      far = cs.x + TS * 60,
      edge = cs.x + TS * 13;
    hordeOn = true;
    hordeT = time;
    nightLv = 1;
    for (let i = 0; i < 12; i++) update(0.05);
    const put = (type, dy) => {
      const u = mkU(0, type, edge, cs.y + dy * TS, null, -1);
      units.push(u);
      return u;
    };
    const kn = put("knight", 0);
    chk("veilLit", litAt(kn.x, kn.y) && !litAt(far, cs.y));
    const walk = (u, n) => {
      let out = false;
      mpExec({ k: "o", i: [u.uid], x: far, y: cs.y, f: 0 }, true);
      for (let i = 0; i < n; i++) {
        hordeOn = true; /* no horde in this scene: hold the night */
        hordeT = time;
        nightLv = 1;
        update(0.05);
        for (const c of structs) if (c.type === "castle") c.hp = c.max;
        if (!litAt(kn.x, kn.y)) out = true;
      }
      return out;
    };
    chk("veilHolds", !walk(kn, 300) && kn.x > edge + TS && !kn.o && kn.hp > 0);
    const held = Math.round((kn.x - cs.x) / TS);
    /* a bannerman carries his light: he walks out; the knight may then join him, his order ends in the light */
    const bn = put("bannerman", 1);
    walk(bn, 200);
    chk("veilBannerman", bn.x > cs.x + TS * 24 && litAt(bn.x, bn.y));
    walk(kn, 300);
    chk("veilLitGoal", kn.x > cs.x + TS * 50 && litAt(kn.x, kn.y));
    O.veil = [held, Math.round((bn.x - cs.x) / TS), Math.round((kn.x - cs.x) / TS)];
    /* the Knight of Darkness dims the lights near him: the bannerman's reach falls from 5.5 tiles to 3 */
    const hold = (n) => {
      for (let i = 0; i < n; i++) {
        hordeOn = true;
        hordeT = time;
        nightLv = 1;
        update(0.05);
        kn.hp = bn.hp = 500;
      }
    };
    const rim = () => litAt(bn.x, bn.y + TS * 4.5);
    hold(12);
    const lit0 = rim(),
      dkk = mkU(1, "brute", bn.x, bn.y - TS * 5, null, -1);
    dkk.boss = 1;
    dkk.bn = 0;
    dkk.hp = dkk.bmax = 1e6;
    units.push(dkk);
    hold(12);
    chk("knightOfDarknessDimsLights", lit0 && !rim() && litAt(bn.x, bn.y));
    dkk.hp = 0;
    kn.hp = bn.hp = 0;
    hordeOn = false;
    nightLv = 0;
    hordeT = time - 60;
    for (let i = 0; i < 12; i++) update(0.05);
    chk("veilLiftsAtDawn", !litAt(cs.x, cs.y));
  }
  /* king skills: cry buffs the units around, charge speeds the king up, both go on cooldown */
  let kg = kingOf(0);
  if (!kg) {
    kg = mkU(0, "king", (CS.tx + 3.5) * TS, (CS.ty + 3.5) * TS, null, -1);
    units.push(kg);
  }
  const kn = mkU(0, "knight", kg.x + TS, kg.y, null, -1);
  units.push(kn);
  const t0 = time;
  kingSkill0("cry");
  chk("cry", kn.wcT > t0 + 7 && kskLeft(kg, "cry") > 40);
  const w1 = kn.wcT;
  kingSkill0("cry");
  chk("cryCooldown", kn.wcT === w1);
  kingSkill0("charge");
  kingTick();
  chk("charge", kg.chT > t0 + 3 && kg.spdK > 2);
  update(0.05);
  chk("buff", kn.buff >= 1.35 && kg.buff >= 1.8);
  /* stats: a kill credited to the unit that struck last, resources earned, units lost */
  const k0 = kills,
    kz = mkU(1, "zombie", (CS.tx + 8) * TS, (CS.ty + 8) * TS, null, -1);
  units.push(kz);
  LH.set(kz, "knight");
  kz.hp = 0;
  update(0.05);
  chk("statKill", kills === k0 + 1 && GST.k.knight === 1);
  chk("statBest", !!gstBest() && gstBest()[1] >= 1);
  /* record by map */
  waveN = 12;
  kills = 40;
  sbRec();
  chk("record", SBR && SBR.top[0].s === 1240 && SBR.rank === 0);
  /* co-op goals (simulation only, checked here with the flag set) */
  waveN = 5;
  MP.on = true;
  const g1 = RESP[0].g;
  objTick();
  chk("goalWave", OBJ.w === 2 && RESP[0].g - g1 >= 150);
  MP.on = false;
  /* the save registry knows traps, goals and stats (the real round trip is the slow `save` test) */
  chk("savaKeys", !!(SAVA.SPK && SAVA.OBJ && SAVA.GST));
  SPK.clear();
  svAssign("SPK", new Map([[ti, 77]]));
  svAssign("OBJ", { w: 3, k: 2 });
  svAssign("GST", { k: { knight: 2 }, g: 1234, w: 0, s: 0, f: 0, lost: 1 });
  chk("saveTraps", SPK.get(ti) === 77 && SPK.size === 1);
  chk("saveGoals", OBJ.w === 3 && OBJ.k === 2);
  chk("saveStats", GST.g === 1234 && GST.k.knight === 2);
  Math.random = RR;
  for (let i = 0; i < 3; i++) {
    render3D(0.05);
  }
  O.ok = C.every(Boolean);
  O.fails = Object.keys(O).filter((k) => k !== "ok" && k !== "seas" && k !== "fails" && !O[k]);
  return JSON.stringify(O);
};
