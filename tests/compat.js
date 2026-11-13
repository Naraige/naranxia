async () => {
  rollWorld();
  randomSite();
  CX = pickPos.tx;
  CY = pickPos.ty;
  reset();
  startGame();
  for (const R of RESP) {
    R.g = 999;
    R.w = 999;
    R.s = 999;
  }
  for (let i = 0; i < 3; i++) units.push(mkU(0, "knight", (CX + 4.5) * TS, (CY + 4.5) * TS));
  for (let k = 0; k < 200; k++) update(0.05);
  paused = true;
  const nU = units.length,
    nS = structs.length,
    out = {};
  const txt = await svPack();
  const mod = (f) => {
    const S = JSON.parse(txt);
    f(S);
    return JSON.stringify(S);
  };
  const unitsId = (S) => S.R.units.$r;
  const cases = {
    mixed: (S) => {
      S.v = 1;
      delete S.gv;
      delete S.meta;
      S.R.zzzNew = S.R.units;
      delete S.R.OBJ;
      delete S.R.GST;
      const o = S.objs[unitsId(S)].$a,
        id = S.objs.length;
      S.objs.push({ $o: { uid: 99999, type: "removed_unit", t: 0, x: 5, y: 5, hp: 9 } });
      o.push({ $r: id });
      delete S.objs[o[0].$r].$o.hp;
    },
    newer: (S) => {
      S.v = 99;
      S.extra = { a: 1 };
    },
  };
  for (const k in cases) {
    try {
      await svApply(mod(cases[k]));
      out[k] = { u: units.length, s: structs.length, nan: units.some((u) => !Number.isFinite(u.hp)) };
      for (let i = 0; i < 5; i++) update(0.05);
      out[k].ran = true;
    } catch (e) {
      out[k] = "ERR " + e.message;
    }
  }
  let bad = false;
  try {
    await svApply('{"v":1}');
  } catch (e) {
    bad = /Unknown save format/.test(e.message);
  }
  const ok =
    ["mixed", "newer"].every((k) => out[k] && out[k].ran && out[k].u === nU && out[k].s === nS && !out[k].nan) && bad;
  return JSON.stringify({ ok, bad, out });
};
