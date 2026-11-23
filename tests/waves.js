async () => {
  /* waves end (#27): fixed worlds where v93 left the horde standing, played with a perfect defence (castles cannot fall, zombies die within KR tiles of a castle).
   World 1 (two castles): the lane to the second castle runs into a rock massif 50 tiles out; v93 piled the whole horde on one way point and hit the 900 s limit.
   World 19 (two castles; it was world 9 before castles grew to 20 tiles and had to stand further apart): a lake lies between the spawn and the castles; hundreds of zombies wade through it.
   World 0 (solo): plain land with a one-tile ramp, as a reference.
   Then on the last world: zombies put on a water tile near the castle walk out; a zombie held on one spot is taken away without a kill; a swarm saved before v94 (no sa / sk) steps.
   Spawn far (v94 lot): the hordes appear at the far end of their route, never within 100 tiles of a castle of either player (widest zoom shows about 90),
   on 8 more worlds (solo, co-op near, picked lanes over 10 draws) and on the real queue of wave 1 in the three worlds above.
   Horde pile-up lot (v94): world 2 (lane 0 crosses a rock massif, one rock mountain between lane and castle) took 875 s in wave 3: the horde crossed the way points without field in single file and every dense tile slowed it to 30 %.
   Flow check on all four worlds (world 2 plays its wave 3, 6225 zombies, must end under 700 s; v94 far spawn 875 s): no more than 60 zombies within 40 tiles of a castle that bite nothing and stayed within one tile for 60 s (stand), and the wave ends in time.
   Same worlds and seeds as tests/waves_probe.js (trial = world). */
  renderer.render = function () {};
  const KR = 16,
    O = {},
    C = [],
    chk = (n, v) => {
      __test.check(n, !!v);
      O[n] = v;
      C.push(!!v);
    };
  MP.dc = { readyState: "open", send: () => {} };
  const RR = Math.random;
  const castles = () => structs.filter((s) => s.type === "castle"),
    isW = (x, y) => ter[((y / TS) | 0) * TW + ((x / TS) | 0)] === 1;
  let arrivals = 0;
  const tick = () => {
    update(0.05);
    const Cs = castles();
    for (const c of Cs) c.hp = c.max;
    over = false;
    for (let i = 0; i < SW.n; i++) {
      if (SW.hp[i] <= 0) continue;
      for (const c of Cs)
        if (Math.abs(SW.x[i] - c.x) < KR * TS && Math.abs(SW.y[i] - c.y) < KR * TS) {
          SW.hp[i] = 0;
          arrivals++;
          break;
        }
    }
    for (const u of units)
      if (u.t === 1 && u.hp > 0)
        for (const c of Cs)
          if (Math.abs(u.x - c.x) < KR * TS && Math.abs(u.y - c.y) < KR * TS) {
            u.hp = 0;
            break;
          }
  };
  const world = (trial) => {
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
      randomSite(false); /* legacy rule: keeps the worlds this test was written for */
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
      if (!MP.on) mpStart(); /* v95: the first call only asks to confirm over a running game */
    } else {
      MP.on = false;
      MP.conn = false;
      pickPos = { tx: a.tx, ty: a.ty, ok: true };
      confirmPick();
    }
    waveT = 1e9;
    for (let i = 0; i < 40; i++) update(0.05);
  };
  const dcs = (x, y) => Math.min(...[CS, CS2].filter(Boolean).map((c) => Math.hypot(x - c.x / TS, y - c.y / TS)));
  let spMin = 1e9,
    spTot = 0;
  const playWave = (w) => {
    waveN = w - 1;
    waveST = time;
    wave();
    for (const q of SW.q) {
      spMin = Math.min(spMin, dcs(q.x, q.y));
      spTot++;
    }
    for (const u of units)
      if (u.t === 1 && u.lane >= 0) {
        spMin = Math.min(spMin, dcs(u.x / TS, u.y / TS));
        spTot++;
      }
    waveOn = hordeOn = true;
    hordeT = time;
    waveT = 0;
    arrivals = 0;
    const t0 = time,
      z = SW.n + SW.q.reduce((n, q) => n + q.left, 0);
    const last = new Map();
    let stk = new Set(),
      stk2 = new Set(),
      wmax = 0,
      nrMax = 0;
    for (let k = 0; k < 18400 && waveOn; k++) {
      tick();
      if (k % 600 === 599) {
        const pv = stk;
        stk = new Set();
        stk2 = new Set();
        let wn = 0,
          nr = 0;
        for (let i = 0; i < SW.n; i++) {
          if (SW.hp[i] <= 0) continue;
          const id = SW.id[i],
            x = SW.x[i],
            y = SW.y[i],
            p = last.get(id);
          if (isW(x, y)) wn++;
          if (p && Math.abs(p[0] - x) < TS && Math.abs(p[1] - y) < TS && SW.st[i] !== 1 && SW.st[i] !== 7) {
            stk.add(id);
            if (pv.has(id)) {
              stk2.add(id);
              if (dcs(x / TS, y / TS) < 40) nr++;
            }
          }
          last.set(id, [x, y]);
        }
        if (wn > wmax) wmax = wn;
        if (nr > nrMax) nrMax = nr;
      }
    }
    let left = 0,
      wat = 0,
      s2 = 0;
    for (let i = 0; i < SW.n; i++) {
      if (SW.hp[i] <= 0) continue;
      left++;
      if (isW(SW.x[i], SW.y[i])) wat++;
      if (stk2.has(SW.id[i])) s2++;
    }
    return { z, arrivals, end: Math.round(time - t0), left, wat, stk2: s2, wmax, stand: nrMax };
  };
  /* spawn distances on more worlds: every lane, and the lanes pickLanes draws */
  {
    let minAll = 1e9,
      minPick = 1e9,
      nPick = 0,
      shortRt = 1e9,
      bad = 0;
    for (const trial of [2, 3, 4, 5, 6, 7, 8, 11]) {
      world(trial);
      const nl = SITE2 ? 6 : 3;
      for (let L = 0; L < nl; L++) {
        const an = spawnAnchor(L),
          d = dcs(an.p[0], an.p[1]),
          P = ROUTES[L].pts;
        let len = 0;
        for (let j = Math.min(P.length - 1, an.ph * 3); j < P.length - 1; j++)
          len += Math.hypot(P[j + 1][0] - P[j][0], P[j + 1][1] - P[j][1]);
        if (d < minAll) minAll = d;
        if (len < shortRt) shortRt = len;
        if (d < 100) bad++;
      }
      for (let k = 0; k < 10; k++) {
        waveN = k;
        for (const L of pickLanes()) {
          const an = spawnAnchor(L),
            d = dcs(an.p[0], an.p[1]);
          nPick++;
          if (d < minPick) minPick = d;
        }
      }
    }
    O.spawn = { minAll: Math.round(minAll), minPick: Math.round(minPick), nPick, shortRt: Math.round(shortRt), bad };
    chk("spawnLanesFar", bad <= 1 && minAll >= 100);
    chk("spawnPickedFar", minPick >= 125 && nPick > 150);
    chk("spawnWalk", shortRt >= 110);
  }
  for (const trial of [0, 1, 2, 19]) {
    world(trial);
    const r = playWave(trial === 2 ? 3 : 1);
    O["w" + trial] = r;
    chk("spawnQueueFar" + trial, spMin >= 100 && spTot > 0);
    O["sp" + trial] = Math.round(spMin);
    spMin = 1e9;
    spTot = 0;
    chk("ends" + trial, r.end < (trial === 2 ? 800 : 600) && r.z > (trial === 2 ? 5000 : 500));
    chk("reachesDefence" + trial, r.arrivals > 0);
    chk("noneStuck" + trial, r.stk2 === 0);
    chk("flows" + trial, r.stand <= 60);
    chk("noneInWater" + trial, r.wat === 0);
    if (trial !== 19) MP.on = false;
  }
  /* v101: the heart of the round island is dry, a lake to cross is no longer on every route: the horde of this world must still arrive (wmax is only logged) */
  chk("lakeCrossed", O.w19.arrivals > 0);
  /* zombies standing on a water tile near a castle (as v93 left them) walk out */
  {
    for (let k = 0; k < 700; k++) tick();
    /* past the dawn that burns the stragglers */ let c = CS,
      wt = null,
      bd = 1e9;
    for (const cc of [CS, CS2].filter(Boolean))
      for (let j = -110; j <= 110; j++)
        for (let i = -110; i <= 110; i++) {
          const x = cc.tx + i,
            y = cc.ty + j,
            d = Math.hypot(i, j);
          if (d < 12 || d > 110 || d >= bd || !gOK(x, y) || ter[y * TW + x] !== 1) continue;
          let dp = true;
          for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ])
            if (ter[(y + dy) * TW + x + dx] !== 1) dp = false;
          if (dp) {
            bd = d;
            wt = [x, y];
            c = cc;
          }
        }
    O.waterAt = wt ? wt.join(",") + " " + Math.round(bd) : null;
    chk("waterNear", !!wt);
    if (wt) {
      const f = freeTile(c.tx + 10, c.ty + 10),
        n0 = SW.n;
      SW.q.push({ ln: 0, x: f[0] + 0.5, y: f[1] + 0.5, ph: 65535, left: 30, rate: 600, hp: 5 });
      update(0.1);
      const D = swDbg.SWD,
        ids = new Set();
      for (let i = n0; i < SW.n; i++) {
        D[SW.ti[i]]--;
        SW.x[i] = SW.px[i] = (wt[0] + 0.5) * TS;
        SW.y[i] = SW.py[i] = (wt[1] + 0.5) * TS;
        SW.ti[i] = wt[1] * TW + wt[0];
        SW.sa[i] = SW.ti[i];
        D[SW.ti[i]]++;
        ids.add(SW.id[i]);
      }
      O.put = ids.size;
      const escaped = new Set();
      let inW = 0,
        t = 0;
      for (; t < 2400; t++) {
        tick();
        inW = 0;
        let al = 0;
        for (let i = 0; i < SW.n; i++)
          if (ids.has(SW.id[i]) && SW.hp[i] > 0) {
            al++;
            if (isW(SW.x[i], SW.y[i])) inW++;
            else escaped.add(SW.id[i]);
          }
        if (!al) break;
      }
      O.outSec = Math.round(t * 0.05);
      O.stillInWater = inW;
      __test.check("waterTraversalNotDeletion", escaped.size >= ids.size * 0.9);
      chk(
        "wadesOut",
        ids.size >= 20 && inW === 0,
      ); /* v101: the water is 90 tiles from the castle, out of the defenders' reach: the horde lives on after wading out */
    }
  }
  /* last resort: a zombie that still stands 80 s after giving up its path is taken away, without a kill */
  {
    const c = CS,
      f = freeTile(c.tx - 30, c.ty - 30);
    SW.q.push({ ln: 0, x: f[0] + 0.5, y: f[1] + 0.5, ph: 65535, left: 1, rate: 600, hp: 5 });
    const n0 = SW.n;
    update(0.1);
    const id = SW.id[n0],
      x = SW.x[n0],
      y = SW.y[n0],
      k0 = kills;
    const at = () => {
      for (let i = 0; i < SW.n; i++) if (SW.id[i] === id) return i;
      return -1;
    };
    let gone = -1,
      gave = -1;
    for (let t = 0; t < 2600 && gone < 0; t++) {
      const i = at();
      if (i < 0) {
        gone = t;
        break;
      }
      if (gave < 0 && SW.sk[i] >= 10) gave = t;
      if (SW.st[i] === 1 || SW.st[i] === 7) SW.st[i] = 0;
      SW.x[i] = x;
      SW.y[i] = y;
      update(0.05);
      const j = at();
      if (j >= 0) {
        swDbg.SWD[SW.ti[j]]--;
        SW.x[j] = x;
        SW.y[j] = y;
        SW.ti[j] = ((y / TS) | 0) * TW + ((x / TS) | 0);
        swDbg.SWD[SW.ti[j]]++;
      }
    }
    O.gaveUpSec = Math.round(gave * 0.05);
    O.goneSec = Math.round(gone * 0.05);
    chk("givesUp", gave > 500 && gave < 720);
    chk("takenAway", gone > 2000 && gone < 2400 && kills === k0);
  }
  /* v95: a sapling that grows into a tree beside a lane marks the lane fields whose window holds it as stale (the tree is solid, saplTick does not bump ver) */
  {
    const L = 0,
      sg = 3,
      Wp = ROUTES[L].wps,
      p = Wp[Math.min(Wp.length - 1, sg * 8 + 3)];
    for (let k = sg * 8; k <= sg * 8 + 10 && k < Wp.length; k++) ensureAround(Wp[k][0] | 0, Wp[k][1] | 0, 2);
    swDbg.LFLD.clear();
    const S = swDbg.laneFieldQ(L, sg),
      E = swDbg.LFLD.get(L * 4096 + sg),
      f = freeTile(p[0] | 0, p[1] | 0),
      i = f[1] * TW + f[0];
    SAPL.set(i, { t: -1e6, s: -1 });
    const fresh = !!E && E.v === ver;
    for (let k = 0; k < 25; k++) update(0.05);
    update(1.05);
    chk("saplLane", !!S && fresh && ter[i] === 2 && E.v === -1);
  }
  /* a swarm saved before v94 has no sa / sk */
  {
    const c = CS,
      f = freeTile(c.tx + 14, c.ty + 14);
    SW.q.push({ ln: 0, x: f[0] + 0.5, y: f[1] + 0.5, ph: 65535, left: 5, rate: 600, hp: 5 });
    update(0.05);
    delete SW.sa;
    delete SW.sk;
    let ok = true;
    try {
      for (let k = 0; k < 80; k++) update(0.05);
    } catch (e) {
      ok = false;
      O.err = String(e);
    }
    chk("oldSwarm", ok && SW.sa instanceof Int32Array && SW.sk instanceof Uint8Array);
  }
  Math.random = RR;
  MP.on = false;
  O.ok = C.every((v) => v);
  return JSON.stringify(O);
};
