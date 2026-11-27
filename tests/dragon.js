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
  let near = mkU(1, "zombie", DRG.x + TS * 6, DRG.y),
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
  /* level, skills, fireball and roar (#66): the rider's command 'dk' sets them, the simulation does the rest */
  /* the save restored new bodies: stand two fresh ones where the first pair stood */
  near = mkU(1, "zombie", DRG.x + TS * 6, DRG.y);
  far = mkU(1, "zombie", DRG.x + TS * 14, DRG.y);
  near.hp = far.hp = 5000;
  units.push(near, far);
  dragonSend({ lv: 1, u: [0, 0, 0, 0, 0, 0, 0, 0, 0], lk: 0, fc: 0 }, "dk");
  cmd(1, DRG.x + TS * 6);
  near.hp = 5000;
  for (let i = 0; i < 30; i++) dragonTick(1 / 30);
  const base = 5000 - near.hp;
  dragonSend({ lv: 5, u: [2, 0, 0, 1, 1, 0, 1, 0, 0], lk: 3, fc: 2 }, "dk");
  chk("the level, skills and look are stored", DRG.lv === 5 && DRG.u[0] === 2 && DRG.lk === 3 && DRG.fc === 2);
  near.hp = 5000;
  for (let i = 0; i < 30; i++) dragonTick(1 / 30);
  const boost = 5000 - near.hp;
  chk(
    "two breath skills and four levels burn about twice as much (" + (boost / base).toFixed(2) + ")",
    boost / base > 1.7 && boost / base < 2.1,
  );
  cmd(0, DRG.x + TS * 6);
  dragonSend({ lv: 1, u: [0, 0, 0, 0, 0, 0, 0, 0, 0], lk: 0, fc: 0 }, "dk");
  dragonSend({ ax: DRG.x + TS * 6, ay: DRG.y }, "db");
  chk("no fireball without the skill", DRG.bl.length === 0);
  dragonSend({ lv: 5, u: [0, 0, 0, 1, 1, 0, 0, 0, 0], lk: 0, fc: 0 }, "dk");
  near.hp = 5000;
  dragonSend({ ax: DRG.x + TS * 6, ay: DRG.y }, "db");
  chk("the fireball flies", DRG.bl.length === 1 && DRG.cb > 5);
  dragonSend({ ax: DRG.x + TS * 6, ay: DRG.y }, "db");
  chk("one fireball at a time, the cooldown holds", DRG.bl.length === 1);
  for (let i = 0; i < 10; i++) dragonTick(1 / 30);
  chk("it has not burst yet", near.hp === 5000 && DRG.bl.length === 1);
  for (let i = 0; i < 20; i++) dragonTick(1 / 30);
  chk(
    "it bursts where it was thrown (" + (5000 - near.hp).toFixed(0) + ")",
    DRG.bl.length === 0 && near.hp < 5000 - 120,
  );
  chk("and its blast reaches the one beside less than the one under it", far.hp === 5000 || far.hp > near.hp);
  dragonSend({}, "dr");
  chk("the roar starts, slows for 4 s and cools down", DRG.rt > 3.9 && DRG.rt <= 4 && DRG.cr > 17);
  const rt = DRG.rt;
  dragonSend({}, "dr");
  chk("a second roar waits", DRG.rt === rt);
  for (let i = 0; i < 150; i++) dragonTick(1 / 30);
  chk("the roar ends", DRG.rt === 0 && DRG.cr > 12);
  const b2 = JSON.stringify(DRG),
    t2 = await svPack();
  DRG.lv = 9;
  await svApply(t2);
  chk("level, skills and cooldowns survive a save", JSON.stringify(DRG) === b2);
  Math.random = RR;
  return JSON.stringify({ ok: true });
};
