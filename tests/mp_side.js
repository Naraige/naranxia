async () => {
  /* co-op leftovers (issues #26 #3 #4): a guest whose partner left goes on alone as player 2. A save made then must load as player 2
     (it loaded as the host's kingdom: placements on player 1's castle, own buildings foreign), and a moved second castle moves SITE2. */
  const REND = renderer.render;
  renderer.render = function () {};
  const out = { ok: true, notes: [] };
  const HOME = () => (CURPL === 1 && CS2 ? CS2 : CS);
  const need = (c, m) => {
    if (!c) {
      out.ok = false;
      out.notes.push(m);
    }
  };
  let s = 11;
  const RR = Math.random;
  Math.random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  rollWorld();
  let a = null,
    b = null;
  for (let t = 0; t < 20000 && !(a && b); t++) {
    randomSite();
    if (!pickPos || !pickPos.ok) continue;
    const q = { tx: pickPos.tx, ty: pickPos.ty };
    if (!a) a = q;
    else if (Math.hypot(a.tx - q.tx, a.ty - q.ty) >= 24 && Math.hypot(a.tx - q.tx, a.ty - q.ty) <= 60) b = q;
  }
  CX = a.tx;
  CY = a.ty;
  SITE2 = { tx: b.tx, ty: b.ty, rot: 0 };
  MP.on = true;
  MP.host = false;
  reset();
  startGame();
  MP.on = true;
  MP.host = false;
  setPl(1);
  for (const R of RESP) {
    R.g = 90000;
    R.w = 90000;
    R.s = 90000;
  }
  need(CURPL === 1 && HOME() === CS2, "guest is not player 2 in co-op");
  /* the partner leaves */
  mpLost();
  need(MP.side === 1 && !MP.on, "guest alone must be player 2 (side " + MP.side + ")");
  need(LPL() === 1 && HOME() === CS2, "after the partner left, home is not the guest castle");
  const hsave = JSON.stringify(RESP[1]);
  for (let k = 0; k < 30; k++) update(0.05);
  /* a save made now, loaded now: still player 2 */
  SAVA.GI[1](SAVA.GORD[0]().length);
  paused = true;
  const txt = await svPack();
  MP.side = 0;
  setPl(0);
  await svApply(txt);
  need(MP.side === 1, "loaded save lost the guest side (" + MP.side + ")");
  need(CURPL === 1 && HOME() === CS2, "loaded save plays the host kingdom (CURPL " + CURPL + ")");
  need(res === RESP[1], "res is not player 2's after load");
  need(
    CAM.x > 0 && Math.abs(CAM.x - CS2.tx) < 12,
    "camera not on the guest castle after load: " + CAM.x + " vs " + CS2.tx,
  );
  /* a placement after the load lands on the guest side, owned by player 2 */
  let placed = null;
  const n0 = structs.length;
  for (let r = 6; r < 16 && !placed; r++)
    for (let i = -r; i <= r && !placed; i += 3) {
      const tx = CS2.tx + 2 + i,
        ty = CS2.ty + 2 + r;
      if (!valid(tx, ty) || !valid(tx + 1, ty + 1)) continue;
      build("house", tx, ty);
      if (structs.length > n0) placed = structs[structs.length - 1];
    }
  need(placed && (placed.pl | 0) === 1, "house after load not owned by player 2");
  need(
    placed && Math.hypot(placed.tx - CS2.tx, placed.ty - CS2.ty) < Math.hypot(placed.tx - CS.tx, placed.ty - CS.ty),
    "house after load stands on the host side",
  );
  need(JSON.stringify(RESP[0]) !== "" && hsave !== undefined, "resources");
  /* an old save (no side) loads as the host, as before */
  const S = JSON.parse(txt);
  const o = S.R && S.R.MPSIDE;
  need(o !== undefined || JSON.stringify(S).includes("MPSIDE"), "MPSIDE not written in the save");
  /* a moved second castle moves SITE2 */
  MP.side = 1;
  setPl(1);
  const c = CS2,
    before = { ...SITE2 };
  let moved = false;
  for (let d = 4; d < 12 && !moved; d++)
    for (const [dx, dy] of [
      [d, 0],
      [-d, 0],
      [0, d],
      [0, -d],
      [d, d],
      [-d, -d],
    ]) {
      const x0 = CS2.tx,
        y0 = CS2.ty;
      build("movec", x0 + 2 + dx, y0 + 2 + dy);
      if (CS2.tx !== x0 || CS2.ty !== y0) {
        moved = true;
        break;
      }
    }
  need(moved, "no spot to move the castle to (test limit)");
  if (moved) {
    need(
      SITE2.tx === CS2.tx + 2 && SITE2.ty === CS2.ty + 2,
      "SITE2 did not follow the moved castle: " + JSON.stringify(SITE2) + " castle " + CS2.tx + "," + CS2.ty,
    );
    need(SITE2.tx !== before.tx || SITE2.ty !== before.ty, "SITE2 unchanged");
  }
  renderer.render = REND;
  Math.random = RR;
  return JSON.stringify(out);
};
