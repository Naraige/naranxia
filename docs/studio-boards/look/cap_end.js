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
  for (let i = 0; i < 5; i++) update(0.1);
  waveN = 12;
  kills = 87;
  sessionState.over = true;
  for (let i = 0; i < 4; i++) {
    render3D(0.05);
    await new Promise((r) => setTimeout(r, 15));
  }
  return "ok";
};
