async () => {
  /* world size (#34): the zombie lanes start at most MAPD tiles from the castle (Large = the whole world, as before), the size is saved with the game and an old save without it means Large */
  renderer.render = function () {};
  const RR = Math.random,
    LS = localStorage,
    k0 = LS.getItem("dk_msize"),
    O = {};
  const seedR = (k) => {
    let s = k;
    Math.random = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  };
  const far = (sz) => {
    LS.setItem("dk_msize", String(sz));
    seedR(77);
    rollWorld();
    randomSite();
    pickPos = { tx: pickPos.tx, ty: pickPos.ty, ok: true };
    confirmPick();
    let m = 0;
    for (const r of ROUTES) for (const p of r.pts) m = Math.max(m, Math.hypot(p[0] - CX - 0.5, p[1] - CY - 0.5));
    return Math.round(m);
  };
  O.large = far(0);
  O.medium = far(1);
  O.small = far(2);
  window.__test.check("smallLanesWithin170", O.small <= 172 && O.small > 100, true);
  window.__test.check("mediumLanesWithin380", O.medium <= 382 && O.medium > 172, true);
  /* the world is one island since v101: its roads (about 300 tiles) fit inside the Medium limit, so Large and Medium can be equal */
  window.__test.check("largeIsLongest", O.large >= O.medium, true);
  /* saved and restored */
  const pk = await svPack();
  O.packed = !!pk;
  LS.setItem("dk_msize", "0");
  Math.random = RR;
  if (k0 === null) LS.removeItem("dk_msize");
  else LS.setItem("dk_msize", k0);
  O.ok = O.small <= 172 && O.medium <= 382 && O.large >= O.medium && O.packed;
  return JSON.stringify(O);
};
