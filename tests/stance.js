async () => {
  /* stances: a defensive knight fights where it stands (never runs out after a zombie held 70 or 130 px away, like Halt), an aggressive one chases */
  renderer.render = function () {};
  let s = 55;
  const RR = Math.random;
  Math.random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  rollWorld();
  reset();
  startGame();
  waveT = 1e9;
  const f = freeTile(CS.tx + 16, CS.ty + 16) || [CS.tx + 1, CS.ty + 9],
    O = {};
  for (const st of ["agg", "def", "hold"])
    for (const gap of [70, 130]) {
      const X = (f[0] + 0.5) * TS,
        Y = (f[1] + 0.5) * TS,
        u = mkU(0, "knight", X, Y);
      u.stn = st;
      u.gx = X;
      u.gy = Y;
      units.push(u);
      const z = mkU(1, "zombie", X, Y + gap, null, -1);
      z.hp = 99999;
      units.push(z);
      let mv = 0;
      for (let i = 0; i < 60; i++) {
        z.x = X;
        z.y = Y + gap;
        z.cd = 9;
        update(0.05);
        mv = Math.max(mv, dist(u.x, u.y, X, Y));
      }
      O[st + gap] = Math.round(mv);
      u.hp = 0;
      z.hp = 0;
      z.nokill = 1;
      for (let i = 0; i < 3; i++) update(0.05);
    }
  Math.random = RR;
  O.ok = O.def70 < 4 && O.def130 < 4 && O.hold70 < 4 && O.hold130 < 4 && O.agg70 > 8 && O.agg130 > 8;
  return JSON.stringify(O);
};
