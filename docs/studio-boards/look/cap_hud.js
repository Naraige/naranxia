async () => {
  let s = 7;
  Math.random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  rollWorld();
  reset();
  startGame();
  waveT = 1e9;
  for (const R of RESP) {
    R.g = 99999;
    R.w = 99999;
    R.s = 99999;
    R.f = 999;
  }
  const c = CS,
    cx = c.tx + 1,
    cy = c.ty + 1;
  for (const t of ["knight", "knight", "archer", "archer", "archer", "peasant", "peasant", "peasant", "peasant"])
    units.push(mkU(0, t, (cx + 2 + Math.random() * 3) * TS, (cy + 3 + Math.random() * 3) * TS, null, -1));
  for (let i = 0; i < 15; i++) update(0.1);
  troopPanelState.troopsOpen = true;
  for (let i = 0; i < 4; i++) {
    render3D(0.05);
    await new Promise((r) => setTimeout(r, 15));
  }
  return "ok";
};
