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
  chk("one that comes near a castle reports", scRep === 1 && !sc[0].sc && /scout/i.test(hudDisplayState.msgS));
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
  chk("all scouts slain: the horde comes blind", sc2.length === 3 && scRep === 2 && /blind/.test(hudDisplayState.msgS));
  /* the chieftain, and what a wave that knew says */
  scRep = 1;
  waveN = 3;
  waveT = 0;
  wave();
  const ch = units.filter((u) => u.chief && u.hp > 0);
  chk("from wave 4 a chieftain leads the horde", waveN === 4 && ch.length === 1 && ch[0].type === "brute");
  chk("the wave that was scouted says so", /least guarded/.test(hudDisplayState.msgS) && scRep === 0);
  /* the bridge (#75, #76): 12 tiles across on the fortification grid, paved, and a gate closes it */
  const G = islandGate(),
    mid = (G.H + G.R - 30) / 2,
    mx = Math.round(G.cx + G.ex * mid),
    my = Math.round(G.cy + G.ey * mid);
  let wide = 0,
    paved = 0;
  ensureAround(mx, my, 2);
  for (let c = -10; c < 22; c++) {
    const x = G.ex ? mx : G.X0 + c,
      y = G.ex ? G.Y0 + c : my;
    if (islandBridge(x, y) === 1) {
      wide++;
      if (pth[y * TW + x] === 2 && ter[y * TW + x] === 0) paved++;
    }
  }
  chk("the bridge is 12 tiles across, on the grid of the walls", wide === 12 && G.X0 % 4 === 0 && G.Y0 % 4 === 0);
  chk("its deck is paved stone over the sea (" + paved + ")", paved === 12);
  for (const R of RESP) R.w = R.s = R.g = 9000;
  const n0 = structs.length;
  build("gate", G.ex ? mx : G.X0 + 6, G.ex ? G.Y0 + 6 : my);
  const gt = structs[n0];
  chk(
    "a gate can be laid across it",
    structs.length === n0 + 1 && gt.type === "gate" && islandBridge(gt.tx, gt.ty) === 1,
  );
  /* peaceful game (#93): the countdown stands still, no wave comes */
  const wn = waveN;
  wavesState.waveOn = false;
  peace = 1;
  waveT = 3;
  for (let n = 0; n < 200; n++) update(1 / 30);
  chk("in a peaceful game no wave ever comes", waveN === wn && waveT === 3 && !wavesState.waveOn);
  peace = 0;
  /* the King's orders (#116): the soldiers around him follow, then hold where they stand */
  {
    const K = kingOf(0),
      men = [0, 1, 2].map((i) => {
        const u = mkU(0, "knight", K.x + (i + 2) * TS, K.y + TS * 3);
        units.push(u);
        return u;
      });
    roleHooks.rally(1);
    chk(
      "follow me: the soldiers nearby fall in behind the King",
      men.every((u) => u.cap === K && K.sq.includes(u)),
    );
    const p0 = { x: K.x, y: K.y };
    for (let n = 0; n < 260; n++) {
      K.x += TS * 0.04; /* he is led east, a tile and a bit a second */
      K.face = Math.PI / 2;
      update(1 / 30);
    }
    const moved = Math.hypot(K.x - p0.x, K.y - p0.y) / TS,
      far = Math.max(...men.map((u) => Math.hypot(u.x - K.x, u.y - K.y) / TS));
    chk("they march with him (" + moved.toFixed(1) + " tiles, " + far.toFixed(1) + " behind)", moved > 6 && far < 8);
    roleHooks.rally(0);
    chk(
      "hold here: they leave him and hold their ground",
      men.every((u) => !u.cap && u.stn === "hold") && K.sq.every((u) => u.rg),
    );
  }
  /* a tower takes one upgrade (#119), and the squares of the bridgehead make it a fort (#77) */
  {
    res.g = res.w = res.s = 9999;
    const f = freeSite("tower", CS.tx + 30, CS.ty + 4, 14);
    build("tower", f[0], f[1]);
    const tw = structs[structs.length - 1];
    tw.prog = 1;
    const r0 = towerReach(tw),
      g0 = res.g;
    roleHooks.towerUp(tw, 1);
    chk(
      "a tower upgrade is paid and gives 8 tiles of reach",
      tw.up === 1 && res.g === g0 - 80 && Math.abs(towerReach(tw) - r0 - 8 * TS) < 0.01,
    );
    roleHooks.towerUp(tw, 3);
    chk("one upgrade only", tw.up === 1 && res.g === g0 - 80);
    const G = islandGate(),
      fx = G.hx - G.ey * 13,
      fy = G.hy + G.ex * 13,
      ft = { type: "tower", tx: Math.round(fx - 4), ty: Math.round(fy - 4), sz: 8, tier: 0 },
      off = {
        type: "tower",
        tx: ft.tx + 30 * Math.abs(G.ey) - 30 * G.ex,
        ty: ft.ty + 30 * Math.abs(G.ex) - 30 * G.ey,
        sz: 8,
        tier: 0,
      };
    chk("a tower on a square of the bridgehead is a fort", towerFort(ft) && !towerFort(off));
    chk(
      "the square is paved",
      (ensureAround(Math.round(fx), Math.round(fy), 2), pth[Math.round(fy) * TW + Math.round(fx)] === 2),
    );
  }
  Math.random = RR;
  return JSON.stringify({ ok: true });
};
