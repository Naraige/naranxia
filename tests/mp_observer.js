() => {
  // Exact numeric fields (no rounding); view/mesh/cache-version fields are local.
  // The animation fields below are written only for units visible to each
  // camera. They are not read by gameplay, AI, terrain or multiplayer rules.
  const excluded = new Set([
    "sel",
    "m",
    "o3",
    "ver",
    "pfS",
    "dy",
    "ap",
    "fa",
    "gwr",
    "kwr",
    "lph",
    "mal",
    "mrk",
    "mt",
    "sr",
    "sv",
    "atk",
    "hurt",
    "head",
    "arm",
    "bolt",
    "tpv",
    "cw",
    "door",
    "flag",
    "scaf",
    "dop",
    "dopen",
  ]);
  const hash = (value) => {
    let h = 2166136261,
      second = 5381;
    for (let i = 0; i < value.length; i++) {
      h = Math.imul(h ^ value.charCodeAt(i), 16777619);
      second = (Math.imul(second, 33) ^ value.charCodeAt(i)) | 0;
    }
    return `${h | 0}:${second}:${value.length}`;
  };
  const distanceFields = new WeakMap();
  const plain = (object) => {
    const seen = new WeakSet();
    const visit = (value, key, root = false) => {
      if (
        key === "ver" ||
        key === "pfS" ||
        typeof value === "function" ||
        value?.isObject3D ||
        value?.isMaterial ||
        value?.isBufferGeometry ||
        value?.isTexture
      )
        return undefined;
      if (value && typeof value === "object") {
        if (!root && value.uid !== undefined) return { uid: value.uid };
        if (!root && value.sid !== undefined) return { sid: value.sid };
        if (seen.has(value)) return "cycle";
        seen.add(value);
        if (ArrayBuffer.isView(value)) {
          // Traversal F fields are filled before publication, then replaced
          // rather than mutated. Active swarm arrays are hashed below each tick.
          if (key === "F") {
            if (!distanceFields.has(value)) distanceFields.set(value, hash(JSON.stringify(Array.from(value))));
            return { length: value.length, hash: distanceFields.get(value) };
          }
          return Array.from(value);
        }
        if (Array.isArray(value)) return value.map((v) => visit(v, ""));
        if (value instanceof Map) return [...value].map(([k, v]) => [k, visit(v, "")]);
        return Object.fromEntries(
          Object.keys(value)
            .sort()
            .filter((k) => !root || !excluded.has(k))
            .map((k) => [k, visit(value[k], k)]),
        );
      }
      return value;
    };
    return JSON.stringify(visit(object, "", true));
  };
  let inner = MP.simR,
    draws = 0,
    rngHash = 0;
  const rng = () => {
    const value = inner();
    draws++;
    rngHash = hash(rngHash + ":" + value);
    return value;
  };
  Object.defineProperty(MP, "simR", {
    configurable: true,
    get: () => rng,
    set: (f) => {
      inner = f;
      draws = 0;
      rngHash = 0;
    },
  });
  window.__audit = {};
  window.__auditDetails = {};
  window.__commands = [];
  const execute = mpExec;
  mpExec = (command, mine) => {
    const stock = () => RESP.map((r) => [r.g, r.w, r.s, r.f, r.ren | 0]);
    const before = stock(),
      tick = MP.tick,
      epoch = MP.ep,
      player = mine ? LPL() : 1 - LPL();
    const value = execute(command, mine);
    window.__commands.push({ command, tick, epoch, player, before, after: stock() });
    return value;
  };
  const capture = (full = true) => {
    const parts = {
      units: units.map((u) => plain(u)).join("|"),
      structures: structs.map((s) => plain(s)).join("|"),
      queue: plain(queue),
      resources: JSON.stringify([RESP, PRICE, FAT]),
      quests: plain(QST),
      events: plain(EVS),
      research: plain([RS, RS2, SAVA.ROLE[0](), SAVA.RHAS[0]()]),
      traps: plain([...SPK]),
      world: plain([SAVA.BASES[0](), SAVA.CAMPS[0](), SAVA.RUINS[0]()]),
      progression: plain([
        SAVA.OBJ[0](),
        // GST intentionally counts only the local player's positive income;
        // see gameplay/statistics.js. It is saved UI history, not shared state.
        SAVA.JRN[0](),
        SAVA.nextL[0](),
        SAVA.SAPL[0](),
        SAVA.PRES[0](),
        SAVA.RALLY[0](),
        SAVA.RALLYC[0](),
      ]),
      scalars: JSON.stringify(
        Object.fromEntries(
          Object.entries(SAVA)
            .filter(([name]) => name !== "BTIER")
            .map(([name, [get]]) => [name, get()])
            .filter(([, value]) => value === null || typeof value !== "object"),
        ),
      ),
      rng: draws + ":" + rngHash,
    };
    // A generated world can contain 30,000+ stairs (1.5 MB serialized).
    // Check the complete mutable map once per simulation second. Entity,
    // command, RNG and other authoritative state still have per-tick checks.
    // Explicit captures (fault contracts/diagnostics) always include the map.
    if (full || MP.tick % 30 === 0) parts.terrain = plain(SAVA.stairs[0]());
    // Include every active swarm field, not just sampled/rounded positions.
    parts.swarm =
      plain([SW.n, SW.acc, SW.step, SW.gacc, SW.nid, SW.q]) +
      Object.keys(SW)
        .filter((k) => ArrayBuffer.isView(SW[k]))
        .map((k) => k + ":" + hash(JSON.stringify(Array.from(SW[k].subarray(0, SW.n)))))
        .join("|");
    return parts;
  };
  window.__captureAudit = capture;
  const previous = update;
  update = (dt) => {
    previous(dt);
    if (!MP.on) return;
    const key = MP.ep + ":" + MP.tick,
      parts = capture(false);
    window.__audit[key] = Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, hash(v)]));
    window.__auditDetails[key] = parts;
    const legacyKey = window.__H && (key in window.__H ? key : MP.tick);
    if (window.__H && legacyKey in window.__H) window.__H[legacyKey] += "|" + JSON.stringify(window.__audit[key]);
    delete window.__audit[MP.ep + ":" + (MP.tick - 120)];
    delete window.__auditDetails[MP.ep + ":" + (MP.tick - 120)];
  };
};
