async () => {
  let s = 4 * 7919 + 13;
  const rnd0 = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const RR = Math.random;
  Math.random = rnd0;
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
    cy = c.ty + 1,
    O = { ver: GVER, rest: restT(), st: starterTiles().size };
  for (const t of ["bomber", "acid", "miner", "bomber"])
    units.push(mkU(1, t, (cx + 12) * TS, (cy + 12) * TS, null, -1));
  waveN = 14;
  wave();
  for (let i = 0; i < 400; i++) update(0.05);
  RS.done = true;
  setTier(0);
  let st = null;
  for (const [i] of stairs) {
    const x = i % TW,
      y = (i / TW) | 0;
    if (inTerr(x, y)) {
      st = [x, y];
      break;
    }
  }
  if (st) {
    build("path", st[0], st[1]);
    O.rampPath = pth[st[1] * TW + st[0]];
  }
  O.z = units.filter((u) => u.t === 1).length;
  O.pud = PUD.length;
  O.scorch = SCRT.size;
  Math.random = RR;
  for (let i = 0; i < 40; i++) {
    render3D(0.05);
    await new Promise((r) => setTimeout(r, 15));
  }
  render3D(0);
  const gl = renderer.getContext(),
    pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4),
    colors = new Set();
  gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  for (let i = 0; i < pixels.length; i += 128) colors.add(pixels[i] + "," + pixels[i + 1] + "," + pixels[i + 2]);
  let visibleTriangles = 0;
  scene.traverseVisible((object) => {
    const geometry = object.geometry;
    if (geometry) visibleTriangles += (geometry.index?.count || geometry.attributes.position?.count || 0) / 3;
  });
  // renderer.info is reset by each post-processing pass; its last draw is a quad.
  __test.check("game builds visible geometry", visibleTriangles > 500 && renderer.info.render.calls > 0);
  __test.check("rendered game is not a uniform canvas", colors.size > 8);
  __test.check("packed version", /^v\d+$/.test(O.ver));
  __test.check("rest period", O.rest, 600);
  __test.check("starter area", O.st, 9);
  __test.check("ramp path", O.rampPath, 1);
  __test.check("wave spawns enemies", O.z > 0);
  O.ok = /^v\d+$/.test(O.ver) && O.rest === 600 && O.st === 9 && O.rampPath === 1 && O.z > 0;
  return JSON.stringify(O);
};
