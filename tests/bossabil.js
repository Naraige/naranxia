async () => {
  let s = 47;
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
  const O = {};
  const x = (CX + 14.5) * TS,
    y = (CY + 14.5) * TS;
  const mk = (bn) => {
    const b = mkU(1, "brute", x, y, null, 0);
    b.boss = 1;
    b.bn = bn;
    b.sv = 1.6;
    b.hp = 3000;
    b.bmax = 6000;
    units.push(b);
    return b;
  };
  const zc = () => units.filter((u) => u.t === 1 && u.hp > 0).length;
  {
    const b = mk(0);
    b.hp = 3000;
    for (let i = 0; i < 400; i++) update(0.05);
    O.heal = b.hp > 3000;
    b.hp = 0;
  }
  {
    const z0 = zc();
    const b = mk(1);
    for (let i = 0; i < 400; i++) update(0.05);
    O.bell = zc() >= z0 + 4;
    b.hp = 0;
  }
  {
    const rc = () => units.filter((u) => u.t === 1 && u.hp > 0 && u.type === "runner").length;
    const r0 = rc();
    const b = mk(3);
    for (let i = 0; i < 400; i++) update(0.05);
    O.hive = rc() >= r0 + 2;
    b.hp = 0;
  }
  {
    const b = mk(2);
    for (let i = units.length - 1; i >= 0; i--) if (units[i].t === 1 && units[i] !== b) units.splice(i, 1);
    const k = mkU(0, "knight", x + TS * 4, y);
    units.push(k);
    const h0 = k.hp;
    b.bs = 0.01;
    b.bt = 100;
    b.cd = 100;
    k.stn = "hold";
    update(0.05);
    O.frost = h0 - k.hp === 8 + waveN * 0.8;
    b.hp = 0;
  }
  for (const [name, value] of Object.entries(O)) __test.check(name, value);
  Math.random = RR;
  return JSON.stringify({ ok: O.heal && O.bell && O.hive && O.frost, O });
};
