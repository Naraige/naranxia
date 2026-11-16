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
    LET = ".wTSGM",
    tl = (m) => (ter[m] === 5 ? "M" : LET[ter[m]] || "?");
  const { SWD, laneFieldQ, fv } = swDbg;
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
        for (let i = 0; i < SW.n; i++) SW.hp[i] = 0;
        SW.q = [];
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
        SW.q.push({ ln: L, x: s0[0], y: s0[1], ph: a0, left: NZ, rate: 400, hp: 5 });
        const ids = new Set(),
          arr = new Map();
        let tid = -1,
          lp = null;
        const lastR = new Map(),
          slow = [],
          doom = [],
          dseen = new Set();
        for (let k = 0; k < TMAX * 20; k++) {
          update(0.05);
          if (tid < 0 && SW.n > 20) tid = SW.id[10];
          if (k % 10 === 5)
            for (let i = 0; i < SW.n; i++)
              if (SW.hp[i] > 0)
                lastR.set(SW.id[i], [k, SW.x[i] / TS, SW.y[i] / TS, SW.st[i], SW.ph[i], SW.sk[i], SW.sa[i]]);
          if (k % 20 === 10 && doom.length < 6)
            for (let i = 0; i < SW.n && doom.length < 6; i++)
              if (SW.hp[i] > 0 && SW.sk[i] >= 10 && SW.sk[i] < 14 && !dseen.has(SW.id[i])) {
                dseen.add(SW.id[i]);
                const tx = (SW.x[i] / TS) | 0,
                  ty = (SW.y[i] / TS) | 0,
                  ti = ty * TW + tx;
                let nb = "";
                for (let j = -1; j <= 1; j++)
                  for (let q = -1; q <= 1; q++) if (q || j) nb += gOK(tx + q, ty + j) ? tl(ti + j * TW + q) : "#";
                const S = SW.ph[i] < Wp.length ? laneFieldQ(L, (SW.ph[i] / 8) | 0) : null,
                  wp = Wp[Math.min(SW.ph[i], Wp.length - 1)];
                doom.push(
                  "t" +
                    (k + 1) / 20 +
                    " " +
                    tx +
                    "," +
                    ty +
                    ":" +
                    tl(ti) +
                    ":[" +
                    nb +
                    "]:st" +
                    SW.st[i] +
                    ":ph" +
                    SW.ph[i] +
                    "->" +
                    (wp[0] | 0) +
                    "," +
                    (wp[1] | 0) +
                    ":fv" +
                    (S ? fv(S, tx, ty) : -1) +
                    ":D" +
                    SWD[SW.ti[i]] +
                    ":sk" +
                    SW.sk[i],
                );
              }
          if (k % 100 === 99 && tid >= 0) {
            const i = SW.id.indexOf(tid);
            if (i >= 0 && i < SW.n && SW.hp[i] > 0) {
              const x = SW.x[i] / TS,
                y = SW.y[i] / TS;
              if (lp && Math.hypot(x - lp[0], y - lp[1]) < 2.2 && slow.length < 8) {
                const tx = x | 0,
                  ty = y | 0,
                  ti = ty * TW + tx;
                let nb = "";
                for (let j = -1; j <= 1; j++)
                  for (let q = -1; q <= 1; q++) if (q || j) nb += gOK(tx + q, ty + j) ? tl(ti + j * TW + q) : "#";
                const S = SW.ph[i] < Wp.length ? laneFieldQ(L, (SW.ph[i] / 8) | 0) : null;
                slow.push(
                  "t" +
                    (k + 1) / 20 +
                    " " +
                    tx +
                    "," +
                    ty +
                    ":" +
                    tl(ti) +
                    ":[" +
                    nb +
                    "]:st" +
                    SW.st[i] +
                    ":ph" +
                    SW.ph[i] +
                    ":fv" +
                    (S ? fv(S, tx, ty) : -1) +
                    ":D" +
                    SWD[SW.ti[i]],
                );
              }
              lp = [x, y];
              if (typeof GTR === "number" && L === GTRL && a0 === GTR && k % 300 === 299)
                console.log(
                  "  PATH t" +
                    (k + 1) / 20 +
                    " " +
                    x.toFixed(0) +
                    "," +
                    y.toFixed(0) +
                    " st" +
                    SW.st[i] +
                    " ph" +
                    SW.ph[i] +
                    " wp" +
                    Wp[Math.min(SW.ph[i], Wp.length - 1)].map((q) => q | 0),
                );
            }
          }
          for (let i = 0; i < SW.n; i++) {
            if (SW.hp[i] <= 0) continue;
            ids.add(SW.id[i]);
            if (!arr.has(SW.id[i]) && SW.ph[i] >= a1) arr.set(SW.id[i], (k + 1) / 20);
          }
          if (arr.size >= NZ) break;
        }
        const ts = [...arr.values()].sort((x, y) => x - y),
          ideal = Math.round((LEN * 4.5) / 0.9),
          lag = [];
        for (let i = 0; i < SW.n && lag.length < 5; i++) {
          if (SW.hp[i] <= 0 || arr.has(SW.id[i])) continue;
          const tx = (SW.x[i] / TS) | 0,
            ty = (SW.y[i] / TS) | 0,
            ti = ty * TW + tx;
          let nb = "";
          for (let j = -1; j <= 1; j++)
            for (let q = -1; q <= 1; q++) if (q || j) nb += gOK(tx + q, ty + j) ? tl(ti + j * TW + q) : "#";
          const S = SW.ph[i] < Wp.length ? laneFieldQ(L, (SW.ph[i] / 8) | 0) : null;
          lag.push(
            tx +
              "," +
              ty +
              ":" +
              tl(ti) +
              ":[" +
              nb +
              "]:st" +
              SW.st[i] +
              ":ph" +
              SW.ph[i] +
              ":fv" +
              (S ? fv(S, tx, ty) : -1) +
              ":sk" +
              SW.sk[i],
          );
        }
        n++;
        const t90 = ts[Math.floor(NZ * 0.9) - 1] || 9999;
        if (arr.size < NZ) bad++;
        worst = Math.max(worst, t90 / ideal);
        console.log(
          JSON.stringify({
            w: trial,
            L,
            a0,
            a1,
            from: s0.map((q) => q | 0),
            arrived: arr.size,
            t50: ts[NZ >> 1],
            t90,
            tmax: ts[ts.length - 1],
            ideal,
            lag,
          }),
        );
        let nl = 0;
        for (const [id, r] of lastR)
          if (!arr.has(id) && nl++ < 6) {
            const tx = r[1] | 0,
              ty = r[2] | 0,
              ti = ty * TW + tx;
            let nb = "";
            for (let j = -1; j <= 1; j++)
              for (let q = -1; q <= 1; q++) if (q || j) nb += gOK(tx + q, ty + j) ? tl(ti + j * TW + q) : "#";
            console.log(
              "  GONE " +
                trial +
                " L" +
                L +
                " a" +
                a0 +
                " lastSeen t" +
                r[0] / 20 +
                " " +
                tx +
                "," +
                ty +
                ":" +
                tl(ti) +
                ":[" +
                nb +
                "]:st" +
                r[3] +
                ":ph" +
                r[4] +
                ":sk" +
                r[5],
            );
          }
        for (const q of doom) console.log("  DOOM " + trial + " L" + L + " a" + a0 + " " + q);
        if (ts[NZ >> 1] > 1.5 * 140 || arr.size < NZ)
          for (const q of slow) console.log("  SLOW " + trial + " L" + L + " a" + a0 + " " + q);
      }
    }
    Math.random = RR;
  }
  return "TOTAL " + n + " stretches, " + bad + " not fully arrived, worst t90/ideal " + worst.toFixed(2);
};
