async () => {
  /* dragon of the co-op Dragon role, alone on one machine (DRGDEV): the breath burns what stands where it lands and nothing else, it cannot land
     beyond its reach, and the dragon survives a save */
  let s = 41;
  const RR = Math.random;
  Math.random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  renderer.render = function () {};
  DRGDEV = 1;
  rollWorld();
  randomSite();
  pickPos = { tx: pickPos.tx, ty: pickPos.ty, ok: true };
  confirmPick();
  waveT = 1e9;
  const chk = (n, v) => window.__test.check(n, !!v);
  chk("a dragon waits by the castle", DRG && DRG.fl === 0 && DRG.f === 0);
  chk("the King stands at the start", units.filter((u) => u.type === "king").length === 1);
  const near = mkU(1, "zombie", DRG.x + TS * 6, DRG.y),
    far = mkU(1, "zombie", DRG.x + TS * 14, DRG.y);
  near.hp = far.hp = 5000;
  units.push(near, far);
  const cmd = (f, ax) => dragonSend({ x: DRG.x, y: DRG.y, a: 2500, w: 0, p: 0, f, fl: 1, ax, ay: DRG.y });
  cmd(1, DRG.x + TS * 6);
  for (let i = 0; i < 30; i++) dragonTick(1 / 30);
  chk("the breath burns the zombie it lands on", near.hp < 5000 - 60 && near.hp > 5000 - 130);
  chk("and spares the one beside", far.hp === 5000);
  cmd(0, DRG.x + TS * 6);
  const h = near.hp;
  for (let i = 0; i < 30; i++) dragonTick(1 / 30);
  chk("no breath, no burn", near.hp === h);
  cmd(1, DRG.x + TS * 400);
  chk("the breath cannot land beyond its reach", Math.abs(DRG.ax - DRG.x - TS * 18) < 2 && DRG.ay === DRG.y);
  const before = JSON.stringify(DRG),
    txt = await svPack();
  DRG.x += 999;
  await svApply(txt);
  chk("the dragon survives a save", JSON.stringify(DRG) === before);
  Math.random = RR;
  return JSON.stringify({ ok: true });
};
