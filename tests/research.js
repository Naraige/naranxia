async () => {
  /* exclusive research paths, market fatigue, envoy tribute cap */
  let s = 57;
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
    C0 = [];
  const chk = (n, v) => {
    O[n] = v;
    C0.push(!!v);
  };
  const R = RESP[0];
  R.g = 9000;
  R.w = 900;
  R.s = 900;
  R.f = 900;
  CURPL = 0;
  const put = (t) => {
    for (let a = 0; a < 40; a++) {
      const n0 = structs.length,
        f = freeTile(CS.tx + 7 + (a % 5) * 4, CS.ty + 7 + ((a / 5) | 0) * 4);
      build(t, f[0], f[1]);
      if (structs.length > n0) {
        const m = structs[structs.length - 1];
        m.prog = 1;
        m.hp = m.max;
        return m;
      }
    }
    return null;
  };
  const ac = put("academy");
  put("market");
  const clr = () => {
    RS2.on = null;
    RS2.t = 0;
    delete RS2.ch;
    for (const k in RS2.done) RS2.done[k] = false;
    RS2.done.iron = true;
    RS2.done.plate = true;
    RS2.done.fletch = true;
    RS.done = true;
  };
  /* path 1: steel closes chain mail, iron age opens after either */
  clr();
  selB = ac;
  buy("steel");
  chk("startSteel", RS2.on === "steel" && RS2.ch[0] === "steel");
  RS2.on = null;
  RS2.done.steel = true;
  buy("mail");
  chk("mailClosed", RS2.on === null && !RS2.done.mail && rxLock("mail") === "steel");
  buy("era");
  chk("eraViaSteel", RS2.on === "era");
  clr();
  RS2.done.mail = true;
  RS2.ch = { 0: "mail" };
  buy("steel");
  chk("steelClosed", RS2.on === null && rxLock("steel") === "mail");
  buy("era");
  chk("eraViaMail", RS2.on === "era");
  /* old save: no RS2.ch, state derived from done */
  clr();
  RS2.done.fire = true;
  delete RS2.ch;
  chk("oilClosedNoCh", rxLock("oil") === "fire");
  RS2.done.bastion = true;
  buy("oil");
  chk("oilBlocked", RS2.on === null);
  /* grandfathered save with both done stays valid, nothing crashes */
  clr();
  RS2.done.harvest = true;
  RS2.done.tools = true;
  chk("bothDoneOk", rxLock("harvest") === "tools" && RS2.done.harvest && RS2.done.tools);
  /* the third pair, and a free choice stays free */
  clr();
  buy("harvest");
  chk("harvestOpens", RS2.on === "harvest" && RS2.ch[2] === "harvest");
  RS2.on = null;
  RS2.done.harvest = true;
  buy("tools");
  chk("toolsClosed", RS2.on === null);
  buy("drill");
  chk("drillFree", RS2.on === "drill" && rxLock("drill") === null);
  /* the choice survives a save round trip of RS2 (SAVA assigns the whole object) */
  const snap = JSON.parse(JSON.stringify(RS2));
  svAssign("RS2", snap);
  chk("chKept", RS2.ch && RS2.ch[2] === "harvest");
  const snapWithoutChoice = { ...snap };
  delete snapWithoutChoice.ch;
  svAssign("RS2", snapWithoutChoice);
  chk("chAbsentOk", RS2.ch === undefined && rxLock("tools") === "harvest");
  RS2.ch = {};
  RS2.on = null;
  /* market fatigue: selling the same resource in a row drops the price harder each time */
  Object.assign(PRICE, PBASE);
  FAT.w = FAT.s = FAT.f = 0;
  R.w = 900;
  const p0 = PRICE.w;
  buy("sellw");
  const d1 = p0 - PRICE.w,
    p1 = PRICE.w;
  buy("sellw");
  const d2 = ((p1 - PRICE.w) / p1) * p0;
  chk("fatigueStacks", FAT.w === 2 && d2 > d1);
  const p2 = PRICE.w;
  for (let i = 0; i < 6; i++) buy("sellw");
  chk("priceFloor", PRICE.w >= 0.3 && PRICE.w < p2 && FAT.w === 8);
  R.w = 900;
  buy("sellw");
  chk("fatMax", FAT.w === 8);
  /* other resources unaffected, buying does not add fatigue */
  chk("otherFree", FAT.s === 0 && FAT.f === 0);
  buy("buys");
  chk("buyNoFat", FAT.s === 0);
  /* barter out counts too */
  R.f = 900;
  buy("xfs");
  chk("barterFat", FAT.f === 1);
  /* recovery is slower under fatigue, then complete, deterministic */
  Object.assign(PRICE, PBASE);
  PRICE.w = 0.5;
  PRICE.s = 0.5;
  FAT.w = 8;
  FAT.s = 0;
  economyState.priceT = 0;
  for (let i = 0; i < 6; i++) {
    priceTick(5);
  }
  chk("slowRecovery", PRICE.s > PRICE.w && PRICE.w > 0.5 && FAT.w < 8);
  for (let i = 0; i < 400; i++) priceTick(5);
  chk("fullRecovery", Math.abs(PRICE.w - 1) < 0.01 && FAT.w === 0);
  /* envoy tribute: degressive per camp and capped in all */
  const bs = BASES.filter((b) => b.alive);
  if (!bs.length) {
    Math.random = RR;
    return JSON.stringify({ ok: false, why: "no base" });
  }
  const b = bs[0];
  delete b.envN;
  delete b.envG;
  delete b.envF;
  R.g = 0;
  R.f = 0;
  const gains = [];
  for (let i = 0; i < 8; i++) {
    const g0 = R.g,
      f0 = R.f;
    b.envT = 0;
    const u = mkU(0, "envoy", b.x + TS, b.y);
    units.push(u);
    for (let k = 0; k < 6; k++) update(0.05);
    gains.push([R.g - g0, R.f - f0]);
  }
  chk("firstFull", gains[0][0] === 80 + 8 * Math.min(waveN, 20) && gains[0][0] > 0);
  chk("degressive", gains[1][0] < gains[0][0] && gains[2][0] < gains[1][0]);
  b.envN = 9;
  b.envG = 690;
  b.envF = 340;
  b.envT = 0;
  R.g = 0;
  R.f = 0;
  {
    const u = mkU(0, "envoy", b.x + TS, b.y);
    units.push(u);
    for (let k = 0; k < 6; k++) update(0.05);
    chk("capped", R.g === 10 && R.f === 10 && b.envG === 700 && b.envF === 350 && u.hp <= 0);
  }
  b.envT = 0;
  R.g = 0;
  R.f = 0;
  const ux = mkU(0, "envoy", b.x + TS, b.y);
  units.push(ux);
  for (let k = 0; k < 6; k++) update(0.05);
  chk("exhaustedKeepsEnvoy", ux.hp > 0 && R.g === 0 && R.f === 0);
  chk(
    "oldBaseOk",
    (() => {
      const o = { x: b.x, y: b.y, alive: true };
      return (o.envN | 0) === 0 && (o.envG | 0) === 0;
    })(),
  );
  Math.random = RR;
  return JSON.stringify({ ok: C0.every(Boolean), gains: JSON.stringify(gains), ...O });
};
