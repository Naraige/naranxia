async () => {
  /* world size: one size only since v101 (the whole island). An old Medium or Small choice left in the browser no longer shortens the lanes of a new game. */
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
    if (sz === null) LS.removeItem("dk_msize");
    else LS.setItem("dk_msize", String(sz));
    seedR(77);
    rollWorld();
    randomSite();
    pickPos = { tx: pickPos.tx, ty: pickPos.ty, ok: true };
    confirmPick();
    let m = 0;
    for (const r of ROUTES) for (const p of r.pts) m = Math.max(m, Math.hypot(p[0] - CX - 0.5, p[1] - CY - 0.5));
    return Math.round(m);
  };
  O.plain = far(null);
  O.oldSmall = far(2);
  window.__test.check("lanesReachTheIslet", O.plain > 172, true);
  window.__test.check("oldSmallChoiceIgnored", O.oldSmall, O.plain);
  const pk = await svPack();
  O.packed = !!pk;
  Math.random = RR;
  if (k0 === null) LS.removeItem("dk_msize");
  else LS.setItem("dk_msize", k0);
  O.ok = O.plain > 172 && O.oldSmall === O.plain && O.packed;
  return JSON.stringify(O);
};
