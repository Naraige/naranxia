async () => {
  /* trap, oil and era timers are decided from the simulation time alone: the result must not depend on what ran before (co-op machines, resync, load) */
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
    __test.check(n, !!v);
    O[n] = v;
    C.push(!!v);
  };
  for (const R of RESP) {
    R.g = 99999;
    R.w = 99999;
    R.s = 99999;
    R.f = 999;
  }
  const f = freeTile(CS.tx + 6, CS.ty + 6),
    tx = f[0],
    ty = f[1],
    ti = ty * TW + tx;
  const run = (pre) => {
    SPK.clear();
    for (let i = units.length - 1; i >= 0; i--) if (units[i].t === 1) units.splice(i, 1);
    SPK.set(ti, 120);
    const z0 = mkU(1, "zombie", (tx + 0.5) * TS, (ty + 0.5) * TS, null, -1);
    units.push(z0);
    for (let i = 0; i < pre; i++) {
      z0.x = (tx + 0.5) * TS;
      z0.y = (ty + 0.5) * TS;
      update(0.05);
    } /* history with a different phase */
    z0.hp = 0;
    units.splice(units.indexOf(z0), 1);
    SPK.clear();
    SPK.set(ti, 120);
    const z = mkU(1, "zombie", (tx + 0.5) * TS, (ty + 0.5) * TS, null, -1);
    units.push(z);
    z.hp = z.max = 1e6;
    time = 1000;
    for (let i = 0; i < 40; i++) {
      z.x = (tx + 0.5) * TS;
      z.y = (ty + 0.5) * TS;
      update(0.05);
    }
    return [Math.round(1e6 - z.hp), SPK.get(ti)];
  };
  const a = run(0),
    b = run(7),
    c = run(13);
  O.spk = [a, b, c];
  chk("spikeFired", a[0] > 0);
  chk("spikePhaseIndependent", a[0] === b[0] && b[0] === c[0] && a[1] === b[1] && b[1] === c[1]);
  /* era regeneration: +1% every 2 s of sim time, same whatever happened before */
  RS2.done.era = true;
  const q = structs.find((x) => x.t === 0 && x.prog >= 1 && x.hp > 0 && x.max > 0);
  const era = (pre) => {
    q.hp = q.max * 0.5;
    for (let i = 0; i < pre; i++) update(0.05);
    q.hp = q.max * 0.5;
    time = 1000;
    for (let i = 0; i < 41; i++) update(0.05);
    return Math.round(((q.hp - q.max * 0.5) / q.max) * 1000);
  };
  const e = [era(0), era(9), era(23)];
  O.era = e;
  chk("eraPhaseIndependent", e[0] === e[1] && e[1] === e[2] && e[0] >= 5 && e[0] <= 10);
  /* demolish a trap (issue #31): placed and removed through the same "b" command a co-op partner receives, full refund */
  {
    SPK.clear();
    const R0 = RESP[CURPL | 0],
      cmd = (t) => mpExec({ k: "b", t, x: tx, y: ty, r: 0, ti: 1, gl: 2, sb: null }, true),
      g0 = R0.g,
      w0 = R0.w;
    cmd("spike");
    const placed = SPK.has(ti),
      paid = [g0 - R0.g, w0 - R0.w];
    cmd("demolish");
    O.demo = [placed, paid, SPK.has(ti), R0.g - g0, R0.w - w0];
    chk("trapPlaced", placed && paid[0] === 10 && paid[1] === 15);
    chk("trapDemolished", !SPK.has(ti) && R0.g === g0 && R0.w === w0);
    cmd("demolish");
    chk("demolishEmptyTileNoRefund", R0.g === g0 && R0.w === w0);
    cmd("spike");
    const g1 = R0.g;
    cmd("spike");
    chk("noDoublePlacement", SPK.has(ti) && R0.g === g1);
    SPK.clear();
  }
  // Isolate one trap contact from other combat. A positive delta alone would
  // accept incorrect damage, wear and even a second unit damaging the target.
  const isolated = freeTile(CS.tx + 16, CS.ty + 16),
    ii = isolated[1] * TW + isolated[0],
    target = mkU(1, "zombie", (isolated[0] + 0.5) * TS, (isolated[1] + 0.5) * TS, null, -1);
  units.splice(0, units.length, target);
  target.hp = target.max = 1e6;
  target.cd = 1e9;
  SPK.clear();
  SPK.set(ii, 120);
  waveN = 0;
  time = 1000.49;
  update(0.05);
  __test.check("exact trap damage", 1e6 - target.hp, 7);
  __test.check("exact trap wear", SPK.get(ii), 113);
  SPK.set(ii, 7);
  time = 1001.49;
  target.x = (isolated[0] + 0.5) * TS;
  target.y = (isolated[1] + 0.5) * TS;
  update(0.05);
  __test.check("worn trap removed", SPK.has(ii), false);
  Math.random = RR;
  O.ok = C.every(Boolean);
  return JSON.stringify(O);
};
