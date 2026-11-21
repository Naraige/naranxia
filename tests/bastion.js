async () => {
  /* bastion buildings and units: placed, orchard food, sanctuary heal, sappers/engineer repair */
  let s = 33;
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
  const types = [
      "observatory",
      "granary",
      "bell",
      "sanctuary",
      "beacon",
      "orchard",
      "forge",
      "embassy",
      "warroom",
      "sappers",
    ],
    B = {};
  let k = 0;
  for (const t of types) {
    /* a real site for the footprint of each (12 to 24 tiles a side), on a ring round the castle */
    const an = (k / types.length) * 6.283,
      f = freeSite(t, Math.round(CS.tx + 10 + Math.cos(an) * 46), Math.round(CS.ty + 10 + Math.sin(an) * 46), 60);
    if (f) build(t, f[0], f[1]);
    k++;
    const st = structs.find((x) => x.type === t);
    if (st) {
      st.prog = 1;
      B[t] = st;
    }
  }
  chk(
    "placed",
    types.every((t) => B[t]),
  );
  O.missing = types.filter((t) => !B[t]).join(",");
  /* orchard: +2 food every 6 s */
  const f0 = RESP[0].f;
  if (B.orchard) {
    for (let i = 0; i < 140; i++) update(0.05);
  }
  chk("orchardFood", RESP[0].f >= f0 + 2);
  /* sanctuary heals a hurt knight standing next to it */
  if (B.sanctuary) {
    const kn = mkU(0, "knight", B.sanctuary.x + 30, B.sanctuary.y + 50);
    units.push(kn);
    const mx = T.knight.hp;
    kn.hp = mx * 0.3;
    const h0 = kn.hp;
    for (let i = 0; i < 60; i++) {
      kn.x = B.sanctuary.x + 30;
      kn.y = B.sanctuary.y + 50;
      update(0.05);
    }
    chk("sanctuaryHeal", kn.hp > h0);
  }
  /* sappers repair nearby buildings; an engineer repairs fast */
  if (B.sappers && B.observatory) {
    const o = B.observatory;
    // Put the damaged structure inside the repair radius; distance must never
    // serve as an alternative success condition for a repair test.
    o.x = B.sappers.x + TS * 2;
    o.y = B.sappers.y;
    o.hp = o.hp * 0.5;
    const h0 = o.hp;
    for (let i = 0; i < 40; i++) update(0.05);
    chk("sappersRepair", o.hp > h0 && o.hp <= o.max);
  }
  {
    const g = CS;
    g.hp = g.hp * 0.5;
    const h0 = g.hp,
      en = mkU(0, "engineer", g.x + TS * 1.5, g.y);
    units.push(en);
    for (let i = 0; i < 40; i++) {
      en.x = g.x + TS * 1.5;
      en.y = g.y;
      update(0.05);
    }
    chk("engineerRepair", g.hp > h0 + 10);
  }
  const sc = mkU(0, "scout", CS.x, CS.y + TS * 4);
  units.push(sc);
  chk("scoutSpeed", T.scout.spd > T.knight.spd);
  Math.random = RR;
  for (let i = 0; i < 3; i++) {
    render3D(0.05);
  }
  O.ok = C.every(Boolean);
  O.fails = Object.keys(O).filter((k) => k !== "ok" && k !== "missing" && k !== "fails" && !O[k]);
  return JSON.stringify(O);
};
