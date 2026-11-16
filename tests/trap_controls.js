async () => {
  let s = 33;
  const original = Math.random,
    draw = renderer.render;
  Math.random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  rollWorld();
  randomSite();
  pickPos = { tx: pickPos.tx, ty: pickPos.ty, ok: true };
  confirmPick();
  waveT = 1e9;
  paused = true;
  renderer.render = () => {};
  const f = freeTile(CS.tx + 6, CS.ty + 6);
  CAM.x = f[0] + 0.5;
  CAM.z = f[1] + 0.5;
  render3D(0);
  const px = innerWidth / 2,
    py = innerHeight * 0.53;
  cv.dispatchEvent(new PointerEvent("pointermove", { clientX: px, clientY: py, pointerType: "mouse", bubbles: true }));
  const p = pickGround((px * cv.width) / innerWidth, (py * cv.height) / innerHeight);
  const tx = Math.floor(p.x),
    ty = Math.floor(p.z),
    i = ty * TW + tx;
  mode = "spike";
  render3D(0);
  const ghosts = scene.children.filter(
    (o) =>
      o.isGroup &&
      o.userData.m?.opacity === 0.7 &&
      o.children.filter((c) => c.geometry?.type === "ConeGeometry").length === 5,
  );
  __test.check("one placement cursor", ghosts.length, 1);
  const cursor = ghosts[0];
  const preview = () => {
    mode = "spike";
    render3D(0);
    return cursor.visible && cursor.userData.m.color.getHex() === 0x9dff9d;
  };
  const r = RESP[0];
  r.g = 100;
  r.w = 100;
  __test.check("empty affordable tile preview", preview());
  r.g = 9;
  __test.check("insufficient gold preview rejected", preview(), false);
  r.g = 100;
  r.w = 14;
  __test.check("insufficient wood preview rejected", preview(), false);
  r.w = 100;
  const before = [r.g, r.w];
  build("spike", tx, ty);
  __test.check("placement costs", [r.g, r.w], [before[0] - 10, before[1] - 15]);
  __test.check("placed trap health", SPK.get(i), 120);
  __test.check("duplicate preview rejected", preview(), false);
  const spikeMeshes = scene.children.filter(
    (o) => o.isInstancedMesh && [0xaab0ba, 0x2e2218].includes(o.material.color?.getHex()),
  );
  __test.check(
    "trap geometry is submitted",
    spikeMeshes.map((o) => o.count).sort((a, b) => a - b),
    [1, 5],
  );
  const paid = [r.g, r.w];
  build("spike", tx, ty);
  __test.check("duplicate placement is inert", [r.g, r.w, SPK.get(i)], [...paid, 120]);
  mode = "demolish";
  render3D(0);
  __test.check("trap demolition preview visible", cursor.visible);
  __test.check("demolition highlights the real trap model", cursor.userData.m.color.getHex(), 0xff6a6a);
  build("demolish", tx, ty);
  __test.check("full trap cost refunded", [r.g, r.w], before);
  __test.check("demolition removes trap", SPK.has(i), false);
  render3D(0);
  __test.check(
    "demolition clears both trap meshes",
    spikeMeshes.map((o) => o.count),
    [0, 0],
  );
  const after = [r.g, r.w];
  build("demolish", tx, ty);
  __test.check("repeated demolition is inert", [r.g, r.w], after);
  mode = null;
  Math.random = original;
  renderer.render = draw;
  render3D(0);
  return JSON.stringify({ ok: __test.assertions.every((a) => a.passed), tile: [tx, ty] });
};
