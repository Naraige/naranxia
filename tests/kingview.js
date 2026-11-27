async () => {
  /* solo: the player who builds plays the King. The game opens beside him, the camera keys walk him (his guards follow, the camera too),
     opening a category of the build menu lifts the view from above where the keys no longer move him, closing it comes back to the King,
     and the view key switches by hand. Frames are driven as the game loop does: the role hook, then the simulation. */
  let s = 41;
  const RR = Math.random;
  Math.random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  renderer.render = function () {};
  rollWorld();
  randomSite();
  pickPos = { tx: pickPos.tx, ty: pickPos.ty, ok: true };
  confirmPick();
  Math.random = RR;
  waveT = 1e9;
  const chk = (n, v) => window.__test.check(n, !!v);
  let took = false;
  const fr = (n) => {
      for (let i = 0; i < n; i++) {
        took = roleHooks.frame(1 / 30, keys);
        update(1 / 30);
      }
    },
    king = () => kingOf(0),
    d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) / TS;
  fr(45);
  const k = king();
  chk(
    "the kingdom starts with its King and two guards",
    k && k.hp > 0 && units.filter((u) => u.type === "guard").length === 2,
  );
  chk("the game opens in the King view", kingViewState.on && took && CAM.dist < 20);
  chk("the camera sits on the King", Math.hypot(CAM.x - k.x / TS, CAM.z - k.y / TS) < 1.5);
  const p0 = { x: k.x, y: k.y };
  keys[KB.down] = true;
  fr(120);
  keys[KB.down] = false;
  fr(45);
  const walked = d(k, p0);
  chk("the camera keys walk the King (" + walked.toFixed(1) + " tiles)", walked > 4);
  chk("the camera follows him", Math.hypot(CAM.x - k.x / TS, CAM.z - k.y / TS) < 1.5);
  const far = Math.max(...units.filter((u) => u.type === "guard").map((g) => d(g, k)));
  chk("his guards march with him (" + far.toFixed(1) + ")", far < 8);
  const p1 = { x: k.x, y: k.y };
  fr(60);
  chk("he stops when the keys are released", d(k, p1) < 1.5);
  /* building: a category of the build menu shows the kingdom from above, and the keys move the camera, not the King */
  buildMenuState.BCAT = "eco";
  fr(20);
  chk("the build menu lifts the view from above", !kingViewState.on && !took && CAM.dist > 40);
  const p2 = { x: k.x, y: k.y };
  keys[KB.down] = true;
  fr(60);
  keys[KB.down] = false;
  chk("from above the keys do not walk the King", d(k, p2) < 1.5);
  buildMenuState.BCAT = null;
  fr(45);
  chk(
    "closing the menu comes back to the King",
    kingViewState.on && CAM.dist < 20 && Math.hypot(CAM.x - k.x / TS, CAM.z - k.y / TS) < 2,
  );
  roleHooks.viewToggle();
  fr(10);
  chk("the view key switches to the view from above", !kingViewState.on);
  roleHooks.viewToggle();
  fr(45);
  chk("and back", kingViewState.on);
  /* a placement tool in the hand also shows the map */
  mode = "house";
  fr(10);
  chk("a building tool in the hand shows the view from above", !kingViewState.on);
  mode = null;
  return JSON.stringify({ ok: true, walked: +walked.toFixed(1) });
};
