async () => {
  // One simulation, both command owners. Separate two-peer transport tests cover
  // delivery/lockstep; these checks isolate public command semantics and costs.
  let sd = 103;
  const saved = Math.random;
  Math.random = () => {
    sd = (sd * 16807) % 2147483647;
    return (sd - 1) / 2147483646;
  };
  rollWorld();
  buildPreview();
  let a = null,
    b = null;
  for (let k = 0; k < 20000 && !b; k++) {
    randomSite();
    if (!pickPos?.ok) continue;
    const p = { tx: pickPos.tx, ty: pickPos.ty };
    if (!a) a = p;
    else {
      const d = Math.hypot(a.tx - p.tx, a.ty - p.ty);
      if (d >= 24 && d <= 60) b = p;
    }
  }
  MP.host = true;
  MP.conn = true;
  MP.dc = { readyState: "open", send: () => {} };
  MP.mine = a;
  MP.theirs = b;
  mpStart();
  Math.random = saved;
  for (const r of RESP) Object.assign(r, { g: 5000, w: 5000, s: 5000, f: 5000 });
  waveT = 1e9;
  const before = QST.on;
  MP.out = [];
  questSwitch(!before);
  __test.check("switch enqueues exactly once", MP.out.length, 1);
  __test.check("no speculative command execution", QST.on, before);
  const command = MP.out.shift();
  if (!command) return JSON.stringify({ ok: false });
  __test.check("switch payload", command, { k: "qs", on: before ? 0 : 1 });
  mpExec(command, true);
  __test.check("queued switch applied", QST.on, before ? 0 : 1);
  const snapshots = RESP.map((r) => [r.g, r.w, r.s, r.f]);
  mpExec({ k: "t", t: "king", b: CS.sid }, false);
  // curB deliberately falls back to HOMEC for an invalid selection. The
  // invariant is that the foreign castle and its owner's stock are untouched.
  __test.check("foreign selection falls back to guest castle", queue[0].b.sid, CS2.sid);
  __test.check("foreign selection preserves host stock", [RESP[0].g, RESP[0].w, RESP[0].s, RESP[0].f], snapshots[0]);
  mpExec({ k: "t", t: "king", b: CS2.sid }, false);
  __test.check("guest king command accepted", queue.length, 1);
  __test.check("king queue owner", queue[0].b.pl | 0, 1);
  __test.check("host stock untouched", [RESP[0].g, RESP[0].w, RESP[0].s, RESP[0].f], snapshots[0]);
  __test.check("guest pays king cost", [RESP[1].g, RESP[1].s, RESP[1].f], [4550, 4880, 4910]);
  mpExec({ k: "t", t: "king", b: CS2.sid }, false);
  __test.check("duplicate king rejected", queue.length, 1);
  return JSON.stringify({ ok: __test.assertions.every((a) => a.passed) });
};
