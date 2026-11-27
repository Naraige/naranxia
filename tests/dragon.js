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
  /* the dragon can be hurt (#72): claws when it is low over the horde, none high up, it mends, falls, comes back */
  const pos = (g, fl) => dragonSend({ x: near.x, y: near.y, a: 2500, g, w: 0, p: 0, f: 0, fl, ax: near.x, ay: near.y });
  near.hp = far.hp = 1e6;
  dragonSend({ lv: 1, u: [0, 0, 0, 0, 0, 0, 0, 0, 0], lk: 0, fc: 0 }, "dk");
  DRG.hp = 220;
  pos(2500, 1);
  for (let i = 0; i < 60; i++) dragonTick(1 / 30);
  chk("high over the horde nothing reaches it", DRG.hp === 220);
  pos(300, 1);
  for (let i = 0; i < 60; i++) dragonTick(1 / 30);
  const lost = 220 - DRG.hp;
  chk("low over a zombie it is clawed (" + lost.toFixed(1) + " in 2 s)", lost > 20 && lost < 40);
  pos(2500, 1);
  const h1 = DRG.hp;
  for (let i = 0; i < 90; i++) dragonTick(1 / 30);
  chk("no mending in the first seconds after a wound", DRG.hp === h1);
  for (let i = 0; i < 120; i++) dragonTick(1 / 30);
  chk("then it mends", DRG.hp > h1 + 5 && DRG.hp <= 220);
  DRG.hp = 3;
  pos(300, 1);
  for (let i = 0; i < 30; i++) dragonTick(1 / 30);
  chk(
    "it falls: out of the fight, carried home",
    DRG.dn > 18 && DRG.hp === 0 && DRG.x === DRG.hx && DRG.y === DRG.hy && !DRG.fl && DRG.falls === 1,
  );
  pos(300, 1);
  dragonSend({}, "dr");
  chk("down, it neither moves nor roars", DRG.x === DRG.hx && DRG.rt === 0);
  for (let i = 0; i < 620; i++) dragonTick(1 / 30);
  chk("it comes back with part of its life", DRG.dn === 0 && DRG.hp >= 132 && DRG.hp < 220);
  dragonSend({ lv: 5, u: [0, 0, 0, 0, 0, 1, 0, 0, 0], lk: 0, fc: 0 }, "dk");
  chk("levels and Growth raise its life (" + dragonMaxHp(DRG) + ")", dragonMaxHp(DRG) === 352);
  /* the King's mark (#80): the fire burns half again as hard inside it, then it wears off and waits */
  /* the save above restored new bodies: take the zombie that stands where the first one stood */
  near = units
    .filter((u) => u.t === 1 && u.hp > 0)
    .sort((p, q) => Math.hypot(p.x - near.x, p.y - near.y) - Math.hypot(q.x - near.x, q.y - near.y))[0];
  dragonSend({ lv: 1, u: [0, 0, 0, 0, 0, 0, 0, 0, 0], lk: 0, fc: 0 }, "dk");
  const burnS = () => {
    near.hp = 1e6;
    dragonSend({ x: near.x - TS * 6, y: near.y, a: 2500, g: 2500, w: 0, p: 0, f: 1, fl: 1, ax: near.x, ay: near.y });
    for (let i = 0; i < 30; i++) dragonTick(1 / 30);
    return 1e6 - near.hp;
  };
  const b0 = burnS();
  dragonSend({ x: Math.round(near.x), y: Math.round(near.y) }, "km");
  chk("the King marks the ground", DRG.mt > 11 && DRG.mc > 29);
  const b1 = burnS();
  chk(
    "inside the mark the breath burns half again as hard (" + (b1 / b0).toFixed(2) + ")",
    b1 / b0 > 1.45 && b1 / b0 < 1.55,
  );
  const mt = DRG.mt;
  dragonSend({ x: 0, y: 0 }, "km");
  chk("a second mark waits its turn", DRG.mt === mt && DRG.mk[0] === Math.round(near.x));
  for (let i = 0; i < 400; i++) dragonTick(1 / 30);
  dragonSend({ x: near.x - TS * 6, y: near.y, a: 2500, g: 2500, w: 0, p: 0, f: 0, fl: 1, ax: near.x, ay: near.y });
  chk("the mark wears off", DRG.mt === 0 && Math.abs(burnS() / b0 - 1) < 0.05);
  /* the sanctuary is the dragon's roost (#79): with one standing it is down 12 s and not 20 */
  dragonSend({ x: near.x, y: near.y, a: 2500, g: 300, w: 0, p: 0, f: 0, fl: 1, ax: near.x, ay: near.y });
  structs.push({ t: 0, type: "sanctuary", x: DRG.hx + TS * 60, y: DRG.hy, hp: 100, max: 100, prog: 1, pl: 0, rad: TS });
  DRG.hp = 1;
  for (let i = 0; i < 20; i++) dragonTick(1 / 30);
  chk("with a sanctuary it is down for 12 s", DRG.dn > 11 && DRG.dn <= 12);
  structs.pop();
  DRG.dn = 0;
  DRG.hp = dragonMaxHp(DRG);
  /* the progress code (#92) goes round */
  prCode(); /* loads the stored progress once, before the test writes its own */
  PR.xp = 1234;
  PR.gold = 77;
  PR.tree = { f1: 1, w1: 1 };
  const code = prCode();
  PR.xp = 0;
  PR.gold = 0;
  PR.tree = {};
  chk(
    "a progress code brings xp, gold and skills back",
    prFromCode(code) && Math.floor(PR.xp) === 1234 && PR.gold === 77 && PR.tree.f1 && PR.tree.w1,
  );
  chk("anything else is refused and changes nothing", !prFromCode("hello") && PR.gold === 77);
  /* a smarter enemy (#73): a guarded road weighs more than a bare one */
  const g0 = [0, 1, 2].map(laneGuard),
    R1 = ROUTES[1].pts,
    q = R1[R1.length - 20];
  structs.push({ type: "tower", x: q[0] * TS, y: q[1] * TS, hp: 100, max: 100, prog: 1, pl: 0, rad: TS });
  const g1 = [0, 1, 2].map(laneGuard);
  structs.pop();
  chk("a tower on a road guards it (" + g0 + " -> " + g1 + ")", g1[1] >= g0[1] + 3);
  Math.random = RR;
  return JSON.stringify({ ok: true });
};
