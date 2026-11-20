/* eslint-disable no-unused-vars */
async () => {
  /* NOT in the suite: where does the horde stand still? Worlds SPW (default [2]), wave SPV (3), perfect defence like spawn_pace.js. Every 20 s: zombies per swarm state (0..9), within 40 tiles of a castle (n40) and of those not biting (free40), the most crowded tiles (tx,ty,count,lane,wp index,state,distance to castle). Ends with the wave end time. */
  renderer.render = function () {};
  var SPD = [];
  const KR = 8,
    W = typeof SPV === "number" ? SPV : 3,
    TR = typeof SPW === "object" ? SPW : [2],
    EV = typeof SPE === "number" ? SPE : 1000;
  MP.dc = { readyState: "open", send: () => {} };
  const RR = Math.random;
  for (const trial of TR) {
    const coop = trial % 2 === 1;
    let sd = ((trial * 7919 + 4242) % 2147483646) + 1;
    const rn = () => {
      sd = (sd * 16807) % 2147483647;
      return (sd - 1) / 2147483646;
    };
    for (let i = 0; i < 20; i++) rn();
    Math.random = rn;
    rollWorld();
    if (pvKey !== SEED) buildPreview();
    let a = null,
      b = null;
    for (let t = 0; t < 20000 && !(a && (b || !coop)); t++) {
      randomSite();
      if (!pickPos || !pickPos.ok) continue;
      const s = { tx: pickPos.tx, ty: pickPos.ty };
      if (!a) a = s;
      else {
        const d = Math.hypot(a.tx - s.tx, a.ty - s.ty);
        if (d >= 48 && d <= 84) b = s;
      }
    }
    if (coop) {
      MP.host = true;
      MP.conn = true;
      MP.mine = a;
      MP.theirs = b;
      mpStart();
    } else {
      MP.on = false;
      MP.conn = false;
      pickPos = { tx: a.tx, ty: a.ty, ok: true };
      confirmPick();
    }
    waveT = 1e9;
    for (let i = 0; i < 40; i++) update(0.05);
    const C = structs.find((s) => s.type === "castle");
    console.log("castle", C.tx, C.ty, C.sz, C.x / TS, C.y / TS);
    for (let y = C.ty - 14; y <= C.ty + 16; y++) {
      let r = "";
      for (let x = C.tx - 8; x <= C.tx + 30; x++) {
        const q = y * TW + x;
        const o = occ.get(q);
        r += (o ? "B" : ter[q] > 0 ? "#" : ".") + String(HT[q] % 100).padStart(2, "0") + " ";
      }
      console.log("M " + String(y).padStart(3) + " " + r);
    }
    Math.random = RR;
    MP.on = false;
  }
  return "DONE";
};
