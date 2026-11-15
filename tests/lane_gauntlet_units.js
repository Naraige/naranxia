async () => {
  /* NOT in the suite: lane gauntlet (#30). Sends a small horde along real stretches of the real lanes of seeded worlds (no castle fighting, nothing else on the map)
   and measures how long it needs for LEN way points against the free-walking time, and where the laggards stand.
   python3 tools/run.py tests/lane_gauntlet.js   (GN = worlds (default 3), G0 = first world, GF = tree density 0..1 planted around the stretch, GL = way points per stretch (24), GZ = zombies (40))
   Per stretch: arrived = zombies that passed way point a+LEN within TMAX s, t50/t90/tmax = seconds for 50 % / 90 % / the last of them, ideal = LEN * 4.5 tiles / mean speed,
   lag = the laggards (not arrived): "tx,ty:tile:neighbours:state:field value there". Total line: stretches with arrived < 100 %, and the worst t90/ideal. */
  renderer.render = function () {};
  const N = typeof GN === "number" ? GN : 3,
    G0 = typeof G0v === "number" ? G0v : 0,
    LEN = typeof GL === "number" ? GL : 24,
    NZ = typeof GZ === "number" ? GZ : 40,
    FOR = typeof GF === "number" ? GF : 0,
    TMAX = typeof GT === "number" ? GT : 420,
    UT = typeof GU === "string" ? GU : "runner",
    LET = ".wTSGM",
    tl = (m) => (ter[m] === 5 ? "M" : LET[ter[m]] || "?");
  let bad = 0,
    n = 0,
    worst = 0;
  MP.dc = { readyState: "open", send: () => {} };
  for (let trial = G0; trial < N + G0; trial++) {
    const RR = Math.random;
    let sd = ((trial * 7919 + 4242) % 2147483646) + 1;
    const rn = () => {
      sd = (sd * 16807) % 2147483647;
      return (sd - 1) / 2147483646;
    };
    for (let i = 0; i < 20; i++) rn();
    Math.random = rn;
    rollWorld();
    if (pvKey !== SEED) buildPreview();
    let a = null;
    for (let t = 0; t < 20000 && !a; t++) {
      randomSite();
      if (pickPos && pickPos.ok) a = { tx: pickPos.tx, ty: pickPos.ty };
    }
    MP.on = false;
    MP.conn = false;
    pickPos = { tx: a.tx, ty: a.ty, ok: true };
    confirmPick();
    waveT = 1e9;
    for (let i = 0; i < 40; i++) update(0.05);
    const C0 = structs.filter((s) => s.type === "castle")[0];
    for (let L = 0; L < ROUTES.length; L++) {
      const Wp = ROUTES[L].wps;
      for (const f of [0.12, 0.4, 0.68]) {
        const a0 = Math.round(Wp.length * f),
          a1 = a0 + LEN;
        if (a1 >= Wp.length - 12) continue;
        const e = Wp[a1];
        if (Math.hypot(e[0] - C0.tx, e[1] - C0.ty) < 60) continue;
        for (const u of units) if (u.t === 1) u.hp = 0;
        update(0.05);
        update(0.05);
        if (FOR > 0)
          for (let k = a0 - 2; k <= a1 + 8 && k < Wp.length; k++) {
            const p = Wp[k];
            ensureAround(p[0] | 0, p[1] | 0, 2);
            for (let j = -10; j <= 10; j++)
              for (let i = -10; i <= 10; i++) {
                const x = (p[0] | 0) + i,
                  y = (p[1] | 0) + j,
                  q = y * TW + x;
                if (!gOK(x, y) || ter[q] || occ.get(q) || stairs.has(q)) continue;
                if (rn() < FOR) ter[q] = 2;
              }
            ver++;
          }
        const s0 = Wp[a0];
        ensureAround(s0[0] | 0, s0[1] | 0, 2);
        if (FOR > 0)
          for (let j = -6; j <= 6; j++)
            for (let i = -6; i <= 6; i++) {
              const q = ((s0[1] | 0) + j) * TW + (s0[0] | 0) + i;
              if (ter[q] === 2) ter[q] = 0;
            }
        ver++;
        const us = [];
        for (let q = 0; q < NZ; q++) {
          const x = (s0[0] + rn() * 6 - 3) * TS,
            y = (s0[1] + rn() * 6 - 3) * TS;
          if (swDbg.solid((x / TS) | 0, (y / TS) | 0)) continue;
          const zu = mkU(1, UT, x, y, null, L);
          zu.ph = a0;
          units.push(zu);
          us.push(zu);
        }
        const arr = new Map(),
          lastP = new Map(),
          stuck = new Map();
        for (let k = 0; k < TMAX * 20; k++) {
          update(0.05);
          for (const u of us) if (u.hp > 0 && !arr.has(u) && u.ph >= a1) arr.set(u, (k + 1) / 20);
          if (k % 600 === 599)
            for (const u of us) {
              if (u.hp <= 0 || arr.has(u)) continue;
              const p = lastP.get(u);
              lastP.set(u, [u.x, u.y]);
              if (p && Math.hypot(u.x - p[0], u.y - p[1]) < TS) stuck.set(u, (stuck.get(u) | 0) + 1);
            }
          if (arr.size >= us.length) break;
        }
        const lag = [];
        for (const u of us) {
          if (arr.has(u) || lag.length >= 5) continue;
          const tx = (u.x / TS) | 0,
            ty = (u.y / TS) | 0,
            ti = ty * TW + tx;
          let nb = "";
          for (let j = -1; j <= 1; j++)
            for (let q = -1; q <= 1; q++) if (q || j) nb += gOK(tx + q, ty + j) ? tl(ti + j * TW + q) : "#";
          lag.push(
            (u.hp > 0 ? "" : "dead ") +
              tx +
              "," +
              ty +
              ":" +
              tl(ti) +
              ":[" +
              nb +
              "]:ph" +
              u.ph +
              ":lost" +
              (u.lost | 0) +
              ":inC" +
              (u.inC | 0) +
              ":stuck" +
              (stuck.get(u) | 0),
          );
        }
        const ts = [...arr.values()].sort((x, y) => x - y),
          NZ0 = us.length,
          t90 = ts[Math.floor(NZ0 * 0.9) - 1] || 9999,
          ideal = Math.round((LEN * 4.5 * TS) / (T[UT].spd * (typeof SLOWK === "number" ? SLOWK : 1)));
        n++;
        if (arr.size < NZ0) bad++;
        worst = Math.max(worst, t90 / ideal);
        console.log(
          JSON.stringify({
            w: trial,
            L,
            a0,
            a1,
            from: s0.map((q) => q | 0),
            n: NZ0,
            arrived: arr.size,
            t50: ts[NZ0 >> 1],
            t90,
            tmax: ts[ts.length - 1],
            ideal,
            lag,
          }),
        );
      }
    }
    Math.random = RR;
  }
  return "TOTAL " + n + " stretches, " + bad + " not fully arrived, worst t90/ideal " + worst.toFixed(2);
};
