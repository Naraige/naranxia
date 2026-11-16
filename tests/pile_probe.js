/* eslint-disable no-unused-vars */
async () => {
  /* NOT in the suite: where does the horde stand still? Worlds SPW (default [2]), wave SPV (3), perfect defence like spawn_pace.js. Every 20 s: zombies per swarm state (0..9), within 40 tiles of a castle (n40) and of those not biting (free40), the most crowded tiles (tx,ty,count,lane,wp index,state,distance to castle). Ends with the wave end time. */
  renderer.render = function () {};
  var SPD = [],
    SPE = 100000,
    SPW = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
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
        if (d >= 24 && d <= 60) b = s;
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
    waveN = W - 1;
    waveST = time;
    wave();
    waveOn = hordeOn = true;
    hordeT = time;
    waveT = 0;
    const t0 = time;
    let mxS = 0,
      pileS = 0;
    globalThis.__P60 = null;
    globalThis.__H60 = [];
    for (let k = 0; k < 18400 && waveOn && time - t0 < (typeof SPL === "number" ? SPL : 2000); k++) {
      update(0.05);
      const Cs = structs.filter((s) => s.type === "castle");
      for (const c of Cs) c.hp = c.max;
      over = false;
      for (let i = 0; i < SW.n; i++) {
        if (SW.hp[i] <= 0) continue;
        for (const c of Cs)
          if (Math.abs(SW.x[i] - c.x) < KR * TS && Math.abs(SW.y[i] - c.y) < KR * TS) {
            SW.hp[i] = 0;
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
      if ((typeof SPD === "object" ? SPD : [380]).includes(Math.round(time - t0)) && k % 20 === 0) {
        const CN = new Map();
        let bt = 0,
          bn = 0;
        for (let i = 0; i < SW.n; i++)
          if (SW.hp[i] > 0) {
            if (
              typeof SPN === "number" &&
              Math.min(...Cs.map((c) => Math.hypot(SW.x[i] - c.x, SW.y[i] - c.y) / TS)) >= SPN
            )
              continue;
            const c = (CN.get(SW.ti[i]) || 0) + 1;
            CN.set(SW.ti[i], c);
            if (c > bn) {
              bn = c;
              bt = SW.ti[i];
            }
          }
        const cx = bt % TW,
          cy = (bt / TW) | 0;
        for (let y = cy - 10; y <= cy + 10; y++) {
          let r1 = "",
            r2 = "";
          for (let x = cx - 19; x <= cx + 19; x++) {
            const q = y * TW + x;
            r1 += CN.get(q) ? String(Math.min(99, CN.get(q))).padStart(2) : ter[q] > 0 ? "##" : " .";
            r2 += String(HT[q] % 100).padStart(2);
          }
          console.log("D " + y + " " + r1 + "   H " + r2);
        }
        console.log(
          "WPS " +
            ROUTES[0].wps
              .slice(436, 456)
              .map((w, i) => 436 + i + ":" + w[0].toFixed(0) + "," + w[1].toFixed(0))
              .join(" "),
        );
        console.log("CASTLES " + Cs.map((c) => c.tx + "," + c.ty).join(" "));
        console.log("DUMP t=" + Math.round(time - t0) + " x0=" + (cx - 24));
      }
      if (typeof SPT === "number" && time - t0 >= SPT && k % 100 === 0) {
        if (!globalThis.__TR) {
          globalThis.__TR = [];
          for (let i = 0; i < SW.n && __TR.length < 8; i += Math.max(1, (SW.n / 8) | 0)) {
            if (SW.hp[i] > 0 && Math.min(...Cs.map((c) => Math.hypot(SW.x[i] - c.x, SW.y[i] - c.y) / TS)) < 45)
              __TR.push(SW.id[i]);
          }
        }
        const rows = [];
        for (let i = 0; i < SW.n; i++)
          if (__TR.includes(SW.id[i]))
            rows.push(
              `id${SW.id[i]} ${SW.ti[i] % TW},${(SW.ti[i] / TW) | 0} st${SW.st[i]} ph${SW.ph[i]} sk${SW.sk[i]} ter${ter[SW.ti[i]]} ht${HT[SW.ti[i]]} d${Math.round(Math.min(...Cs.map((c) => Math.hypot(SW.x[i] - c.x, SW.y[i] - c.y) / TS)))}`,
            );
        console.log("TR t=" + Math.round(time - t0) + " " + rows.join(" | "));
      }
      if (typeof SPO === "number" && Math.round(time - t0) === SPO && k % 20 === 0) {
        for (const [X, Y] of [
          [208, 614],
          [191, 593],
        ]) {
          const r = [];
          for (let y = Y - 3; y <= Y + 3; y++) {
            let l = "";
            for (let x = X - 4; x <= X + 4; x++) {
              const s = occ.get(y * TW + x);
              l +=
                (s ? (s.type || "?").slice(0, 4) + s.t : ".....") + "/" + ter[y * TW + x] + "/" + HT[y * TW + x] + " ";
            }
            r.push(l);
          }
          console.log("OCC " + X + "," + Y + "\n" + r.join("\n"));
        }
      }
      if (k % 400 === 0) {
        const t = Math.round(time - t0);
        const cur = new Map();
        let ns = 0;
        for (let i = 0; i < SW.n; i++) {
          if (SW.hp[i] <= 0) continue;
          const id = SW.id[i];
          cur.set(id, [SW.x[i], SW.y[i]]);
          const o = globalThis.__P60 && __P60.get(id);
          if (
            o &&
            SW.st[i] !== 1 &&
            SW.st[i] !== 7 &&
            Math.hypot(SW.x[i] - o[0], SW.y[i] - o[1]) < 3 * TS &&
            Math.min(...Cs.map((c) => Math.hypot(SW.x[i] - c.x, SW.y[i] - c.y) / TS)) < 40
          )
            ns++;
        }
        (globalThis.__H60 = globalThis.__H60 || []).push(cur);
        if (__H60.length > 3) __H60.shift();
        globalThis.__P60 = __H60.length >= 3 ? __H60[0] : null;
        if (globalThis.__P60) {
          mxS = Math.max(mxS, ns);
          if (ns >= 100) pileS += 20;
        }
      }
      if (k % EV === 0 && typeof SPH === "number") {
        const H = {};
        for (let i = 0; i < SW.n; i++) {
          if (SW.hp[i] <= 0) continue;
          const key = SW.st[i] + ":" + (SW.ph[i] === 65535 ? "F" : (SW.ph[i] >> 2) * 4);
          H[key] = (H[key] || 0) + 1;
        }
        console.log(
          "H t=" +
            Math.round(time - t0) +
            " " +
            Object.entries(H)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 14)
              .map((e) => e.join("="))
              .join(" "),
        );
      }
      if (k % EV === 0) {
        const st = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          tiles = {};
        let n40 = 0,
          free40 = 0;
        for (let i = 0; i < SW.n; i++) {
          if (SW.hp[i] <= 0) continue;
          st[SW.st[i]]++;
          let dm = 1e9;
          for (const c of Cs) dm = Math.min(dm, Math.hypot(SW.x[i] - c.x, SW.y[i] - c.y) / TS);
          if (dm < 40) {
            n40++;
            if (SW.st[i] !== 1 && SW.st[i] !== 7) free40++;
          }
          const key = SW.ti[i];
          const o = tiles[key] || (tiles[key] = { n: 0, ln: SW.ln[i], ph: SW.ph[i], st: SW.st[i], dm: Math.round(dm) });
          o.n++;
        }
        const t6 = {};
        for (let i = 0; i < SW.n; i++) {
          if (SW.hp[i] <= 0 || (SW.st[i] !== 6 && SW.st[i] !== 3)) continue;
          const key = SW.st[i] + ":" + SW.ti[i];
          const o = t6[key] || (t6[key] = { n: 0, ph: SW.ph[i], ln: SW.ln[i], sk: SW.sk[i] });
          o.n++;
        }
        const s6 = Object.entries(t6)
          .sort((p, q) => q[1].n - p[1].n)
          .slice(0, 3)
          .map(([k, o]) => {
            const [s, ti] = k.split(":").map(Number);
            return `st${s} ${ti % TW},${(ti / TW) | 0}x${o.n} ph${o.ph} ln${o.ln} sk${o.sk} ter${ter[ti]} ht${HT[ti]} wp${JSON.stringify(ROUTES[o.ln].wps[Math.min(o.ph, ROUTES[o.ln].wps.length - 1)])} nw${ROUTES[o.ln].wps.length}`;
          });
        const top = Object.entries(tiles)
          .sort((p, q) => q[1].n - p[1].n)
          .slice(0, 2)
          .map(([k, o]) => `${k % TW},${(k / TW) | 0}x${o.n} ln${o.ln} ph${o.ph} st${o.st} dc${o.dm}`);
        console.log(
          JSON.stringify({
            trial,
            t: Math.round(time - t0),
            n: SW.n,
            q: SW.q.reduce((n, q) => n + q.left, 0),
            st: st.join("/"),
            n40,
            free40,
            top,
            s6,
          }),
        );
      }
    }
    console.log(JSON.stringify({ trial, coop, end: Math.round(time - t0), maxStuck: mxS, pileSec: pileS }));
    Math.random = RR;
    MP.on = false;
  }
  return "DONE";
};
