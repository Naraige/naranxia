async () => {
  /* the ideas batch of 2026-11-27: scouts and the horde that knows the weak side (#83, #84), the chieftain (#86), the King's round (#87),
     towers on high ground (#89), the wave summary (#94) */
  let s = 53;
  const RR = Math.random;
  Math.random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  renderer.render = function () {};
  rollWorld();
  randomSite();
  pickPos = { tx: pickPos.tx, ty: pickPos.ty, ok: true };
  confirmPick();
  waveT = 1e9;
  const chk = (n, v) => window.__test.check(n, !!v);
  for (let i = 0; i < 10; i++) update(1 / 30);
  /* the King's round */
  const k = kingOf(0),
    p = units.find((u) => u.type === "peasant");
  p.x = k.x + TS * 3;
  p.y = k.y;
  update(1 / 30);
  chk("a peasant beside his King works a quarter faster", kingRound(p) === 1.25);
  p.x = k.x + TS * 20;
  update(1 / 30);
  chk("and at his usual pace far from him", kingRound(p) === 1);
  /* high ground */
  const f = { type: "tower", tx: CS.tx + 30, ty: CS.ty, sz: 2, tier: 0 },
    i = f.ty * TW + f.tx,
    h0 = HT[i];
  HT[i] = LAND;
  const r0 = towerReach(f);
  HT[i] = LAND + 4;
  const r4 = towerReach(f);
  HT[i] = LAND + 30;
  const r9 = towerReach(f);
  HT[i] = h0;
  chk("a tower four levels up reaches two tiles further", Math.abs(r4 - r0 - 2 * TS) < 0.01);
  chk("the gain stops at six levels", Math.abs(r9 - r0 - 3 * TS) < 0.01);
  /* scouts: they leave when the sun has burnt the stragglers */
  waveN = 2;
  nextL = [0];
  scRep = 0;
  wavesState.waveOn = false;
  wavesState.burnAt = time - 1;
  waveTick();
  const sc = units.filter((u) => u.sc);
  chk(
    "three scouts leave the portal after the wave",
    sc.length === 3 && sc.every((u) => u.type === "runner" && u.t === 1),
  );
  waveTick();
  chk("far from the castle they have seen nothing", scRep === 0);
  sc[0].x = CS.x + TS * 20;
  sc[0].y = CS.y;
  waveTick();
  chk(
    "one that comes near a castle reports",
    scRep === 1 && !sc[0].sc && /scout/i.test(hudDisplayState.msgS),
  );
  for (const u of sc) u.hp = 0;
  /* next rest: all three slain on the way */
  for (let n = 0; n < 5; n++) update(1 / 30);
  scRep = 0;
  wavesState.burnAt = time - 1;
  waveTick();
  const sc2 = units.filter((u) => u.sc && u.hp > 0);
  waveTick();
  for (const u of sc2) u.hp = 0;
  waveTick();
  chk(
    "all scouts slain: the horde comes blind",
    sc2.length === 3 && scRep === 2 && /blind/.test(hudDisplayState.msgS),
  );
  /* the chieftain, and what a wave that knew says */
  scRep = 1;
  waveN = 3;
  waveT = 0;
  wave();
  const ch = units.filter((u) => u.chief && u.hp > 0);
  chk("from wave 4 a chieftain leads the horde", waveN === 4 && ch.length === 1 && ch[0].type === "brute");
  chk("the wave that was scouted says so", /least guarded/.test(hudDisplayState.msgS) && scRep === 0);
  Math.random = RR;
  return JSON.stringify({ ok: true });
};
