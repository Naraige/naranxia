async () => {
  /* NOT in the suite: probe of "waves jam against trees / the lane crosses a mountain" (#30). Same worlds as tests/waves_probe.js, perfect defence.
   python3 tools/run.py tests/stuck_probe.js   (set STN = number of worlds, ST0 = first, STW = wave, STF = tree density 0..1 planted along the lanes, STT = max seconds)
   Every 30 s each live swarm zombie that moved less than a tile and is not biting is "stuck": we print its tile type (ter), its 8 neighbours
   (letters: . free, w water, T tree, S stone, G gold, M mountain, # off map), the biggest height step, state, lane and distance to the castle.
   Total line: stuck samples (a zombie that stays stuck is counted once per sample) and the slowest wave. */
  renderer.render = function () {};
  const N = typeof STN === "number" ? STN : 8,
    S0 = typeof ST0 === "number" ? ST0 : 0,
    W0 = typeof STW === "number" ? STW : 3,
    FOR = typeof STF === "number" ? STF : 0,
    TMAX = typeof STT === "number" ? STT : 700,
    KR = 8,
    LSEG = 8,
    { SWD, laneFieldQ, fv } = swDbg,
    LET = ".wTSGM";
  const tl = (m) => (ter[m] === 5 ? "M" : LET[ter[m]] || "?");
  let tot = 0,
    worst = 0;
  MP.dc = { readyState: "open", send: () => {} };
  for (let trial = S0; trial < N + S0; trial++) {
    const coop = trial % 2 === 1,
      RR = Math.random;
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
    if (coop && !b) {
      Math.random = RR;
      continue;
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
    let planted = 0;
    if (FOR > 0) {
      /* forests grown along the lanes: seeded, free land tiles only, never within 14 tiles of a castle */
      const cs0 = structs.filter((s) => s.type === "castle");
      for (const R of ROUTES)
        for (let k = 0; k < R.pts.length; k += 2) {
          const p = R.pts[k];
          ensureAround(p[0] | 0, p[1] | 0, 2);
          for (let j = -9; j <= 9; j++)
            for (let i = -9; i <= 9; i++) {
              const x = (p[0] | 0) + i,
                y = (p[1] | 0) + j,
                q = y * TW + x;
              if (!gOK(x, y) || ter[q] || occ.get(q) || stairs.has(q)) continue;
              if (cs0.some((c) => Math.hypot(c.tx - x, c.ty - y) < 14)) continue;
              if (rn() < FOR) {
                ter[q] = 2;
                planted++;
              }
            }
        }
      ver++;
    }
    waveN = W0 - 1;
    waveST = time;
    wave();
    waveOn = hordeOn = true;
    hordeT = time;
    waveT = 0;
    const t0 = time,
      z = SW.n + SW.q.reduce((n, q) => n + q.left, 0) + units.filter((u) => u.t === 1 && u.lane >= 0).length,
      cs = () => structs.filter((s) => s.type === "castle"),
      last = new Map(),
      kinds = {},
      ex = [];
    let trk = null,
      stkN = 0,
      k = 0;
    for (; k < TMAX * 20 && waveOn; k++) {
      update(0.05);
      const C = cs();
      for (const c of C) c.hp = c.max;
      over = false;
      for (let i = 0; i < SW.n; i++) {
        if (SW.hp[i] <= 0) continue;
        for (const c of C)
          if (Math.abs(SW.x[i] - c.x) < KR * TS && Math.abs(SW.y[i] - c.y) < KR * TS) {
            SW.hp[i] = 0;
            break;
          }
      }
      for (const u of units)
        if (u.t === 1 && u.hp > 0)
          for (const c of C)
            if (Math.abs(u.x - c.x) < KR * TS && Math.abs(u.y - c.y) < KR * TS) {
              u.hp = 0;
              break;
            }
      if (trk) {
        const i = SW.id.indexOf(trk.id);
        if (i >= 0 && i < SW.n && SW.hp[i] > 0) {
          if ((k - trk.k0) % 10 === 0)
            console.log(
              "  TR " +
                trk.id +
                " t" +
                (k - trk.k0) +
                " " +
                (SW.x[i] / TS).toFixed(2) +
                "," +
                (SW.y[i] / TS).toFixed(2) +
                " st" +
                SW.st[i] +
                " sk" +
                SW.sk[i] +
                " D" +
                SWD[SW.ti[i]] +
                " mx" +
                SW.mx[i].toFixed(2) +
                "," +
                SW.my[i].toFixed(2),
            );
        }
        if (k - trk.k0 > 300) trk = null;
      }
      if (k % 600 === 599) {
        for (let i = 0; i < SW.n; i++) {
          if (SW.hp[i] <= 0) continue;
          const id = SW.id[i],
            x = SW.x[i],
            y = SW.y[i],
            p = last.get(id);
          last.set(id, [x, y]);
          if (!(p && Math.abs(p[0] - x) < TS && Math.abs(p[1] - y) < TS && SW.st[i] !== 1 && SW.st[i] !== 7)) continue;
          const tx = (x / TS) | 0,
            ty = (y / TS) | 0,
            ti = ty * TW + tx;
          let nb = "",
            dh = 0;
          for (let j = -1; j <= 1; j++)
            for (let q = -1; q <= 1; q++) {
              if (!q && !j) continue;
              if (!gOK(tx + q, ty + j)) {
                nb += "#";
                continue;
              }
              const m = ti + j * TW + q;
              nb += tl(m);
              dh = Math.max(dh, Math.abs(HT[m] - HT[ti]));
            }
          let dc = 1e9;
          for (const c of C) dc = Math.min(dc, Math.hypot(x - c.x, y - c.y) / TS);
          const crowd = SWD[ti] > 6 ? "crowd" : "free";
          if (dc < 14) continue;
          let hd = "";
          if (SW.st[i] === 2 || SW.st[i] === 3) {
            const Wp = ROUTES[SW.ln[i]].wps,
              wp = Wp[Math.min(SW.ph[i], Wp.length - 1)],
              ddx = wp[0] * TS - x,
              ddy = wp[1] * TS - y,
              dl = Math.hypot(ddx, ddy) || 1,
              hx = ((x + (ddx / dl) * 1.2 * TS) / TS) | 0,
              hy = ((y + (ddy / dl) * 1.2 * TS) / TS) | 0;
            hd = "/head" + (gOK(hx, hy) ? tl(hy * TW + hx) : "#");
          }
          const key = tl(ti) + "/st" + SW.st[i] + hd + "/" + crowd;
          kinds[key] = (kinds[key] | 0) + 1;
          stkN++;
          if (crowd === "free" && !trk && typeof STR === "number" && SW.st[i] === STR) trk = { id: id, k0: k };
          if (crowd === "free" && ex.length < 8) {
            const Wp = ROUTES[SW.ln[i]].wps,
              pp = Math.min(SW.ph[i], Wp.length - 1),
              wp = Wp[pp],
              S = SW.ph[i] < 65535 && SW.ph[i] < Wp.length ? laneFieldQ(SW.ln[i], (SW.ph[i] / LSEG) | 0) : null,
              v = S ? fv(S, tx, ty) : -1;
            ex.push(
              "w" +
                wp.map((q) => Math.round(q)) +
                "#" +
                tl((wp[1] | 0) * TW + (wp[0] | 0)) +
                " ph" +
                SW.ph[i] +
                " fv" +
                v +
                " tg" +
                (S ? S.tg : -1) +
                " sk" +
                SW.sk[i] +
                " " +
                tx +
                "," +
                ty +
                ":" +
                tl(ti) +
                ":nb[" +
                nb +
                "]:dh" +
                dh +
                ":st" +
                SW.st[i] +
                ":L" +
                SW.ln[i] +
                ":dc" +
                Math.round(dc),
            );
          }
        }
      }
    }
    const end = Math.round(time - t0);
    tot += stkN;
    worst = Math.max(worst, end);
    console.log(JSON.stringify({ trial, coop: coop ? 1 : 0, z, planted, end, left: SW.n, stuckSamples: stkN, kinds }));
    for (const e of ex) console.log("  EX " + trial + " " + e);
    Math.random = RR;
    MP.on = false;
  }
  return "TOTAL stuck samples " + tot + ", slowest wave " + worst + " s";
};
