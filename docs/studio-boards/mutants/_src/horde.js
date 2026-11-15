async () => {
  window.__MUT2 = "MODE_"; //@PRELUDE
  /* a horde at game distance in front of the castle: 4 zombies in 10, the six mutants, one wave boss; then draw calls and triangles */
  settle(3);
  explore(20);
  const X0 = cast.x,
    Y0 = cast.y + TS * 8;
  const Z = ["zombie", "brute", "husk", "runner", "zombie", "bomber", "acid", "zombie", "miner", "zombie"];
  for (let i = 0; i < 60; i++) {
    const u = mkU(
      1,
      Z[(i + ((i / 10) | 0) * 3) % Z.length],
      X0 + ((i % 10) - 4.5) * TS * 1.3,
      Y0 + (((i / 10) | 0) * 1.45 + 0.5) * TS,
    );
    u.face = (((i * 7) % 5) - 2) * 0.25;
    units.push(u);
  }
  const bz = mkU(1, "brute", X0, Y0 - TS * 2.2);
  bz.boss = 1;
  bz.bn = 0;
  bz.sv = 1.6;
  bz.face = 0;
  units.push(bz);
  look(X0 / TS, Y0 / TS + 3.6, ZOOM_, 0.92, 0);
  window.requestAnimationFrame = () => 0;
  for (let i = 0; i < 6; i++) render3D(0.05);
  renderer.info.autoReset = false;
  renderer.info.reset();
  render3D(0.016);
  const inf = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
  renderer.info.autoReset = true;
  Math.random = RR;
  return JSON.stringify({ mode: "MODE_", units: units.length, calls: inf.calls, tris: inf.triangles });
};
