async () => {
  /* horde portals: the first horde of a lane opens a portal at its spawn point, one per lane, never twice; portals survive a save and load */
  renderer.render = function () {};
  const O = {};
  let s = 5;
  const RR = Math.random;
  Math.random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  rollWorld();
  randomSite();
  pickPos = { tx: pickPos.tx, ty: pickPos.ty, ok: true };
  confirmPick();
  O.start = portals.length;
  const L1 = nextL.slice();
  wave();
  O.afterW1 = portals.length;
  O.lanesMatch = L1.every((L) => portals.some((q) => q.L === L)) && portals.length === L1.length;
  O.nearSpawn = portals.every((q) => {
    const R = ROUTES[q.L].pts;
    return R.some((p) => Math.hypot(p[0] - q.x, p[1] - q.y) < 6);
  });
  for (let k = 0; k < 6; k++) wave();
  const ls = portals.map((q) => q.L);
  O.unique = new Set(ls).size === ls.length;
  O.most3 = portals.length <= 3;
  const n = portals.length,
    txt = await svPack();
  await svApply(txt);
  O.restored = portals.length === n && portals.every((q) => typeof q.x === "number");
  Math.random = RR;
  O.ok = O.start === 0 && O.lanesMatch && O.nearSpawn && O.unique && O.most3 && O.restored;
  window.__test.check("portals", O.ok, true);
  return JSON.stringify(O);
};
