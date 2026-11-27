/* eslint-disable */
import { THREE as T } from "../three.js";
import { mkModel0 } from "./units.js";

/* ---- the dragon of the Dragon role (co-op, v101) ----
   A wyvern built of textured boxes on a small skeleton (neck and tail chains, bat wings with fingers and flat membranes, legs), animated by
   animRig from the flight state. It carries a Captain of the game, unarmed. Model units are metres of the first prototype: the caller scales
   the root (DRK tiles per metre). Everything here is visual: the simulation only knows where the dragon is and where its breath lands.
   Built on first use (canvas textures need the page). */
let KIT = null;
export function dragonKit() {
  if (KIT) return KIT;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const TAU = Math.PI * 2;
  const angDiff = (a, b) => {
    let d = (b - a) % TAU;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    return d;
  };
  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hex2rgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgb2hex(r, g, b) {
    return "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
  }
  function shade(h, f) {
    const c = hex2rgb(h);
    return rgb2hex(c[0] * f, c[1] * f, c[2] * f);
  }
  const DEFAULT_LOOK = {
    name: "Ember",
    d: {
      build: 1,
      limbs: 0,
      head: 0,
      horns: 6,
      frill: 1,
      crest: 1,
      wings: 0,
      tail: 0,
      skin: 0,
      pattern: 4,
      armor: 0,
      saddle: 0,
      size: 1.15,
      span: 1.1,
      neck: 1.1,
      tailL: 1.1,
      body: "#3b3632",
      belly: "#6e5a3a",
      wing: "#5a2a22",
      accent: "#2c2c36",
      horn: "#e4dfcf",
      crestC: "#2c2c36",
      eye: "#ffd23c",
      flame: "#ff8a1f",
      saddleC: "#4a2e16",
    },
  };
  const hsh = (a, b, c) => {
    const x = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453;
    return x - Math.floor(x);
  };
  const tone4 = (q) => (q < 0.22 ? 0.76 : q < 0.58 ? 0.85 : q < 0.86 ? 0.92 : 1);
  const tone3 = (q) => (q < 0.25 ? 0.8 : q < 0.65 ? 0.9 : 1);
  function mkTex(size, fn, rep) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const x = c.getContext("2d");
    for (let j = 0; j < size; j++)
      for (let i = 0; i < size; i++) {
        const v = Math.round(clamp(fn(i, j), 0, 1) * 255);
        x.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
        x.fillRect(i, j, 1, 1);
      }
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.magFilter = T.NearestFilter;
    t.minFilter = T.NearestMipmapLinearFilter;
    t.repeat.set(rep, rep);
    return t;
  }
  const TEX = {
    /* tissu, corne, cuir : grain simple */
    pix: mkTex(8, (i, j) => tone3(hsh(i, j, 7)), 1),
    /* écailles : rangs décalés de 8 x 4 pixels, un ton par écaille, lèvre sombre en bas, arête claire en haut */
    scale: mkTex(
      16,
      (i, j) => {
        const row = j >> 2,
          sx = i + (row % 2) * 4,
          bx = sx % 8,
          t = tone4(hsh((sx >> 3) % 2, row, 1));
        return t * (j % 4 === 3 ? 0.7 : bx === 0 ? 0.8 : 1) * (j % 4 === 0 ? 1 : 0.95) * (0.96 + 0.06 * hsh(i, j, 2));
      },
      0.5,
    ),
    /* ventre : plaques horizontales */
    plate: mkTex(
      16,
      (i, j) =>
        [0.86, 0.94, 1][(hsh(j >> 2, 0, 3) * 3) | 0] *
        (j % 4 === 3 ? 0.68 : j % 4 === 0 ? 1 : 0.94) *
        (0.97 + 0.04 * hsh(i, j, 4)),
      0.5,
    ),
    /* membrane d'aile : nervures tous les 8 pixels */
    wing: mkTex(16, (i, j) => (i % 8 === 0 ? 0.74 : 1) * [0.86, 0.93, 1][(hsh(i >> 1, j >> 1, 5) * 3) | 0], 0.5),
    /* pierre de taille : briques 8 x 4, joints sombres, 4 tons (la règle du jeu pour la pierre) */
    brick: mkTex(
      16,
      (i, j) => {
        const row = j >> 2,
          sx = i + (row % 2) * 4,
          bx = sx % 8,
          t = tone4(hsh((sx >> 3) % 2, row, 11));
        return (
          (j % 4 === 0 || bx === 0 ? 0.6 : t * (j % 4 === 1 ? 1 : j % 4 === 3 ? 0.9 : 0.95)) *
          (0.95 + 0.08 * hsh(i, j, 12))
        );
      },
      0.5,
    ),
    /* planches 16 x 4 */
    plank: mkTex(
      16,
      (i, j) => {
        const row = j >> 2,
          end = (i + row * 5) % 16 === 0;
        return (j % 4 === 0 || end ? 0.64 : [0.86, 1, 0.93, 0.9][row]) * (hsh((i / 3) | 0, j, 13) > 0.74 ? 0.9 : 1);
      },
      0.5,
    ),
    leaf: mkTex(
      16,
      (i, j) => {
        const q = hsh(i, j, 21);
        return q < 0.1 ? 0.52 : q < 0.38 ? 0.8 : q < 0.8 ? 0.91 : 1;
      },
      0.5,
    ),
    bark: mkTex(
      16,
      (i, j) => {
        const q = hsh(i, (j / 5) | 0, 23);
        return (q < 0.28 ? 0.72 : q < 0.7 ? 0.88 : 1) * (0.96 + 0.06 * hsh(i, j, 24));
      },
      0.5,
    ),
    rock: mkTex(
      16,
      (i, j) => {
        const q = hsh(i >> 1, j >> 1, 31);
        return (q < 0.2 ? 0.8 : q < 0.7 ? 0.9 : 1) * (hsh(i, j, 32) < 0.06 ? 0.72 : 1);
      },
      0.5,
    ),
    grass: mkTex(
      16,
      (i, j) => {
        const q = hsh(i, j, 41);
        return q < 0.16 ? 0.8 : q < 0.55 ? 0.9 : q < 0.93 ? 0.96 : 1;
      },
      650,
    ),
  };
  /* matériau selon la couleur : KDYN (le dragon en cours de construction) passe avant KSTD (pierre et bois du monde) */
  const KSTD = {};
  let KDYN = null,
    OVC = null;
  const matC = {},
    basC = {},
    geoC = {};
  /* les pièces posées à fleur du corps (motifs, plaques du ventre, dos sombre) sont tirées vers la caméra d'un cheveu : jamais de scintillement là où deux faces se touchent */
  function mat(c, k) {
    k = k || (KDYN && KDYN[c]) || KSTD[c] || "pix";
    const ov = !!(OVC && OVC.has(c)),
      q = c + k + (ov ? "o" : "");
    return (
      matC[q] ||
      (matC[q] = new T.MeshLambertMaterial({
        color: c,
        map: TEX[k],
        polygonOffset: ov,
        polygonOffsetFactor: -1.5,
        polygonOffsetUnits: -3,
      }))
    );
  }
  function bas(c) {
    return (
      basC[c] ||
      (basC[c] = new T.MeshBasicMaterial({
        color: c,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -4,
      }))
    );
  }
  function vgeo(w, h, d) {
    const k = w + "|" + h + "|" + d;
    let g = geoC[k];
    if (g) return g;
    g = new T.BoxGeometry(w, h, d);
    const uv = g.attributes.uv,
      dm = [
        [d, h],
        [d, h],
        [w, d],
        [w, d],
        [w, h],
        [w, h],
      ];
    for (let f = 0; f < 6; f++)
      for (let v = 0; v < 4; v++) {
        const i = f * 4 + v;
        uv.setXY(i, uv.getX(i) * dm[f][0], uv.getY(i) * dm[f][1]);
      }
    uv.needsUpdate = true;
    return (geoC[k] = g);
  }
  function B(p, w, h, d, c, x, y, z, o) {
    const m = new T.Mesh(vgeo(w, h, d), o && o.basic ? bas(c) : mat(c, o && o.k));
    m.position.set(x, y, z);
    if (o) {
      if (o.rx) m.rotation.x = o.rx;
      if (o.ry) m.rotation.y = o.ry;
      if (o.rz) m.rotation.z = o.rz;
    }
    p.add(m);
    return m;
  }
  function G(p, x, y, z) {
    const g = new T.Group();
    g.position.set(x || 0, y || 0, z || 0);
    p.add(g);
    return g;
  }
  const UNITM = new T.MeshBasicMaterial({ vertexColors: true });
  UNITM.color.setRGB(1.42, 1.42, 1.42);
  function unitRig(mdl) {
    const g = new T.Group(),
      meshes = [],
      mesh = (geo) => {
        const m = new T.Mesh(geo, UNITM);
        meshes.push(m);
        return m;
      };
    const body = new T.Group();
    body.position.y = mdl.hip;
    const tor = mesh(mdl.torso);
    tor.position.y = -mdl.hip;
    body.add(tor);
    const head = mesh(mdl.head);
    head.position.set(0, mdl.neck, 0);
    tor.add(head);
    const arm = mesh(mdl.arm);
    arm.position.set(mdl.ax, mdl.sh, 0);
    tor.add(arm);
    let armL = null,
      shd = null,
      weap = null;
    if (mdl.armL) {
      armL = mesh(mdl.armL);
      armL.position.set(-mdl.ax, mdl.sh, 0);
      tor.add(armL);
      if (mdl.shield) {
        shd = mesh(mdl.shield);
        shd.position.set(mdl.shp[0], mdl.shp[1], mdl.shp[2]);
        shd.rotation.set(0.33, -0.14, 0);
        armL.add(shd);
      }
    }
    const lL = mesh(mdl.leg),
      lR = mesh(mdl.leg);
    lL.position.set(-mdl.lx, mdl.hip, 0);
    lR.position.set(mdl.lx, mdl.hip, 0);
    g.add(lL, lR, body);
    const ex = {};
    for (const p of mdl.parts || []) {
      const m = mesh(p.geo);
      m.position.set(p.x, p.y, p.z);
      (p.par ? ex[p.par] : tor).add(m);
      ex[p.k] = m;
    }
    if (mdl.weap && mdl.T && mdl.T[mdl.weap]) {
      weap = mesh(mdl.T[mdl.weap]);
      weap.position.set(0, -4.5 * 0.05, 0.15 * 0.05);
      arm.add(weap);
    }
    return { g, body, tor, head, arm, armL, shd, lL, lR, ex, weap, meshes, mdl };
  }
  let CAPM = null;
  function buildCaptain() {
    CAPM = CAPM || mkModel0("captain", 0);
    const u = unitRig(CAPM),
      g = new T.Group();
    u.g.position.y = -CAPM.hip;
    g.add(u.g);
    u.lL.rotation.set(-1.2, 0, -0.42);
    u.lR.rotation.set(-1.2, 0, 0.42);
    u.arm.rotation.set(-0.8, 0, 0.14);
    if (u.armL) u.armL.rotation.set(-0.8, 0, -0.14);
    if (u.shd) u.shd.visible = false;
    if (u.weap) u.weap.visible = false;
    return { g, u };
  }
  function wingPanel(p, len, dep, col, style) {
    if (style === 0) {
      B(p, len, 0.05, dep, col, len / 2, -0.03, -dep / 2);
      return;
    }
    if (style === 1) {
      const n = 4,
        w = len / n,
        ds = [1, 0.68, 0.95, 0.6];
      for (let i = 0; i < n; i++) {
        const d = dep * ds[i];
        B(p, w, 0.05, d, i % 2 ? shade(col, 0.8) : col, w * (i + 0.5), -0.03, -d / 2);
      }
      return;
    }
    const n = Math.max(2, Math.round(len / 0.36)),
      w = len / n;
    for (let i = 0; i < n; i++) {
      const d = dep * (1.05 + 0.2 * (((i * 7) % 3) - 1));
      B(p, w * 0.8, 0.06, d, i % 2 ? shade(col, 1.3) : col, w * (i + 0.5), -0.03 - (i % 2) * 0.03, -d / 2);
      B(p, w * 0.8, 0.065, 0.2, shade(col, 0.62), w * (i + 0.5), -0.03 - (i % 2) * 0.03, -d + 0.1);
    }
  }
  /* aile de chauve-souris : bras, avant-bras, pouce griffu au poignet, quatre doigts en éventail ; la membrane est tendue de doigt en doigt (bord festonné)
   puis de l'avant-bras et du bras jusqu'au flanc. Repère d'un os : +x le long de l'os, +y la normale de la membrane, la membrane part vers -z. */
  const WLH = 1.9,
    WLF = 2.3,
    WFA = [0.02, 0.42, 0.84, 1.28],
    WFL = [3.5, 3.4, 3.0, 2.5];
  /* libère les géométries propres à un dragon remplacé */
  function disposeOwn(root) {
    root.traverse((m) => {
      if (m.userData && m.userData.own && m.geometry) m.geometry.dispose();
    });
  }
  const matDC = {};
  function matD(c) {
    return matDC[c] || (matDC[c] = new T.MeshLambertMaterial({ color: c, map: TEX.wing, side: T.DoubleSide }));
  }
  /* une surface plate dans le plan de l'aile : pts = [[x, z], ...] en éventail depuis le premier point */
  function flat(p, pts, y, col) {
    const P = [],
      U = [],
      I = [];
    pts.forEach((q) => {
      P.push(q[0], y, q[1]);
      U.push(q[0], q[1]);
    });
    for (let k = 1; k < pts.length - 1; k++) I.push(0, k, k + 1);
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(P, 3));
    g.setAttribute("uv", new T.Float32BufferAttribute(U, 2));
    g.setAttribute(
      "normal",
      new T.Float32BufferAttribute(
        pts.flatMap(() => [0, 1, 0]),
        3,
      ),
    );
    g.setIndex(I);
    const m = new T.Mesh(g, matD(col));
    m.userData.own = true;
    p.add(m);
    return m;
  }
  function buildWing(D) {
    const root = new T.Group(),
      s = G(root),
      body = D.body,
      lo = shade(D.body, 0.86),
      wc = D.wing,
      wd = shade(D.wing, 0.82),
      st = D.wings,
      hc = D.horn,
      fs = [],
      mm = [],
      wg = [];
    B(s, WLH, 0.42, 0.42, body, WLH / 2, 0, 0);
    B(s, 0.6, 0.6, 0.6, body, 0.1, 0, 0);
    if (st === 2) wingPanel(s, WLH, 2.2, wd, 2);
    else
      mm.push(
        flat(
          s,
          [
            [0, 0],
            [WLH, 0],
            [WLH, -2.9],
            [WLH * 0.5, -2.35],
            [0, -2.5],
          ],
          -0.09,
          wd,
        ),
      );
    const e = G(s, WLH, 0, 0);
    B(e, WLF, 0.32, 0.32, lo, WLF / 2, 0, 0);
    B(e, 0.44, 0.44, 0.44, body, 0, 0, 0);
    if (st === 2) wingPanel(e, WLF, 2.3, wc, 2);
    else
      mm.push(
        flat(
          e,
          [
            [0, 0],
            [WLF, 0],
            [WLF, -2.5],
            [WLF * 0.5, -2.3],
            [0, -2.9],
          ],
          -0.05,
          wc,
        ),
      );
    const w = G(e, WLF, 0, 0);
    B(w, 0.4, 0.62, 0.4, body, 0, 0.06, 0);
    B(w, 0.16, 0.16, 0.62, hc, 0.02, -0.14, 0.3, { rx: 0.45 });
    WFA.forEach((a, i) => {
      /* chaque doigt à sa hauteur et à son épaisseur : repliés, ils s'empilent au lieu de se confondre */
      const f = G(w, 0, 0.2 - i * 0.075, -0.02 * i),
        L = WFL[i];
      f.rotation.y = a;
      fs.push(f);
      B(f, L * 0.6, 0.2 - i * 0.02, 0.2 - i * 0.02, i % 2 ? body : lo, L * 0.3, 0, 0);
      const t = G(f, L * 0.6, 0, 0);
      t.rotation.y = 0.18;
      B(t, L * 0.42, 0.14 - i * 0.012, 0.14 - i * 0.012, i % 2 ? body : lo, L * 0.21, 0, 0);
      B(t, 0.22, 0.1, 0.1, hc, L * 0.42 + 0.08, 0, 0);
      if (st === 2) {
        wingPanel(f, L, 1.25, i % 2 ? wd : wc, 2);
        return;
      }
      if (i === 3) return;
      /* la toile entre ce doigt et le suivant : bord festonné, plus creusé pour les ailes dentelées */
      const da = WFA[i + 1] - a,
        L1 = WFL[i + 1],
        tip = [L * 0.6 + L * 0.42 * Math.cos(0.18), -L * 0.42 * Math.sin(0.18)],
        nx = [L1 * Math.cos(da) * 0.98, -L1 * Math.sin(da) * 0.98],
        k = st === 1 ? 0.6 : 0.8;
      const m = flat(
        f,
        [[0, 0], tip, [((tip[0] + nx[0]) / 2) * k, ((tip[1] + nx[1]) / 2) * k], nx],
        -0.02,
        i % 2 ? wd : wc,
      );
      wg.push({ m, da, i });
    });
    return { root, s, e, w, f: fs, mm, wg, ph: 0 };
  }
  const _wm = new T.Matrix4(),
    _wx = new T.Vector3(),
    _wy = new T.Vector3(),
    _wz = new T.Vector3(),
    V3 = (x, y, z) => new T.Vector3(x, y, z),
    BACK = V3(0, 0, -1);
  /* l'os pointe vers dir, la membrane part vers mem (au plus près) */
  function qAim(dir, mem) {
    _wx.copy(dir).normalize();
    _wz.copy(mem).addScaledVector(_wx, -mem.dot(_wx)).normalize().negate();
    _wy.crossVectors(_wz, _wx);
    _wm.makeBasis(_wx, _wy, _wz);
    return new T.Quaternion().setFromRotationMatrix(_wm);
  }
  /* une pose d'aile : la direction du bras, de l'avant-bras et de la main dans le repère du corps (aile gauche), et l'ouverture de l'éventail */
  function wingPose(H, F, K, fan, mH, mF, mK) {
    const qs = qAim(H, mH || BACK),
      qe = qAim(F, mF || BACK),
      qw = qAim(K, mK || BACK);
    return { s: qs, e: qs.clone().invert().multiply(qe), w: qe.clone().invert().multiply(qw), fan };
  }
  /* corne ou épine courbe : une chaîne de boîtes qui s'affinent, chacune tournée un peu plus que la précédente */
  function hornChain(p, x, y, z, len, th, rx, ry, rz, curve, n, col) {
    let g = G(p, x, y, z);
    g.rotation.set(rx, ry, rz);
    const sl = len / n;
    for (let i = 0; i < n; i++) {
      const t = th * (1 - i / (n + 0.6));
      B(g, t, t, sl + 0.03, col, 0, 0, -sl / 2);
      g = G(g, 0, 0, -sl);
      g.rotation.x = curve;
    }
    return g;
  }
  function buildDragon(D) {
    const root = new T.Group(),
      body = D.body,
      belly = D.belly,
      acc = D.accent,
      hc = D.horn,
      cc = D.crestC,
      fl = D.flame,
      wc = D.wing,
      ev = D.ev | 0;
    const bw = [0.86, 1, 1.16][D.build],
      bh = [0.93, 1, 1.1][D.build],
      sk = ["scale", "plate", "pix"][D.skin],
      dark = shade(body, 0.66),
      lo = shade(body, 0.86),
      hi = shade(body, 1.14),
      under = shade(body, 0.76);
    OVC = new Set([acc, belly, dark].filter((c) => c !== body && c !== hc));
    KDYN = {};
    [hc, acc, cc, D.saddleC].forEach((c) => {
      KDYN[c] = "pix";
    });
    KDYN[wc] = "wing";
    KDYN[shade(wc, 0.82)] = "wing";
    KDYN[shade(wc, 1.3)] = "wing";
    KDYN[belly] = "plate";
    [body, dark, lo, hi, under, shade(body, 0.9), shade(body, 0.8)].forEach((c) => {
      KDYN[c] = sk;
    });
    const rig = {
      root,
      legs: [],
      neck: [],
      tail: [],
      flames: [],
      eyes: [],
      wings: [],
      head: null,
      jaw: null,
      mouth: null,
      rider: null,
      core: null,
      cy: 2,
      wA: 0,
      wF: 0.5,
      wph: 0,
      lph: 0,
      fk: 0,
      WP: null,
      wc: null,
      wyv: D.limbs === 0,
    };
    const core = G(root);
    rig.core = core;
    const am = D.armor,
      plate = ["", "#6e4826", "#949aa3", "#949aa3", "#2c2c36"][am],
      trim = ["", "#4a2e16", "#c4c8ce", "#d4a234", "#ff8a1f"][am],
      glow = am === 4,
      cr = D.crest,
      pat = D.pattern;
    /* torse : sept tranches qui dessinent le poitrail profond, la taille fine et le bassin ; ventre en plaques, flancs plus sombres, arête dorsale */
    const SEG = [
      [1.4, 1.08, 1.12, 0.12],
      [0.86, 1.44, 1.5, 0.03],
      [0.32, 1.52, 1.56, 0],
      [-0.22, 1.42, 1.42, 0.03],
      [-0.76, 1.24, 1.22, 0.06],
      [-1.3, 1.12, 1.08, 0.05],
      [-1.84, 0.98, 0.94, 0.03],
    ].map((p) => [p[0], p[1] * bw, p[2] * bh, 0.6, p[3]]);
    const seg = (z) => {
      let b = SEG[0];
      for (const a of SEG) if (Math.abs(a[0] - z) < Math.abs(b[0] - z)) b = a;
      return b;
    };
    SEG.forEach((a, i) => {
      B(core, a[1], a[2], a[3], i % 2 ? lo : body, 0, a[4], a[0]);
      B(core, a[1] + 0.05, a[2] * 0.3, a[3] - 0.05, under, 0, a[4] - a[2] * 0.36 - 0.03, a[0]);
      B(core, a[1] * 0.6, 0.18, a[3] - 0.11, belly, 0, a[4] - a[2] / 2 - 0.08, a[0]);
      B(
        core,
        a[1] * (pat === 4 ? 0.7 : 0.34),
        0.12,
        a[3] + 0.02,
        pat === 4 ? dark : hi,
        0,
        a[4] + a[2] / 2 + 0.035,
        a[0],
      );
      if (pat === 1 && i % 2) B(core, a[1] + 0.12, a[2] + 0.12, 0.2, acc, 0, a[4], a[0]);
      if (cr && i > 0) crest(core, a[4] + a[2] / 2 + 0.06, a[0], 1 - i * 0.04, i % 2 ? 1 : -1, 0.56);
    });
    function crest(g, y, z, s, flip, len) {
      if (cr === 1) hornChain(g, 0, y + 0.02, z + 0.1, 0.62 * s, 0.17 * s, 1.1, 0, 0, -0.16, 2, hc);
      else if (cr === 2) {
        B(g, 0.1, 0.6 * s, 0.46 * s, cc, flip * 0.07, y + 0.28 * s, z);
        B(g, 0.11, 0.2 * s, 0.26 * s, shade(cc, 1.25), flip * 0.07, y + 0.58 * s, z);
      } else if (cr === 3) rig.flames.push(B(g, 0.22 * s, 0.44 * s, 0.22 * s, fl, 0, y + 0.22 * s, z, { basic: true }));
      else if (cr === 4) {
        B(g, 0.05, 0.7 * s, len || 0.6, cc, 0, y + 0.33 * s, z);
        B(g, 0.1, 0.9 * s, 0.1, hc, 0, y + 0.42 * s, z, { rx: -0.2 });
      }
    }
    /* épaules et hanches : les muscles qui portent les ailes et les pattes */
    [1, -1].forEach((s) => {
      B(core, 0.42, 0.92 * bh, 1.0, lo, 0.66 * bw * s, 0.24, 0.84);
      B(core, 0.36, 0.34, 0.74, body, 0.6 * bw * s, 0.72 * bh, 0.7);
      B(core, 0.34, 0.74 * bh, 0.9, lo, 0.5 * bw * s, -0.04, rig.wyv ? -1.02 : -1.4);
    });
    if (pat >= 2 && pat < 4) {
      const r = mulberry32(11),
        em = pat === 3,
        col = em ? fl : acc;
      for (let i = 0; i < 22; i++) {
        const z = (r() - 0.5) * 3.3 - 0.25,
          a = seg(z),
          top = r() < 0.4,
          sd = r() < 0.5 ? -1 : 1,
          s = 0.2 + r() * 0.18;
        const m = top
          ? B(core, s, 0.06, s, col, (r() - 0.5) * a[1] * 0.7, a[4] + a[2] / 2 + 0.012, z, { basic: em })
          : B(core, 0.06, s, s, col, sd * (a[1] / 2 + 0.012), a[4] + (r() - 0.3) * a[2] * 0.5, z, { basic: em });
        if (em) rig.flames.push(m);
      }
    }
    /* cou : huit segments, dressé en S au sol, tendu en vol */
    const NS = 8,
      nl = 0.4 * D.neck,
      RX0 = [-0.5, -0.42, -0.26, -0.08, 0.14, 0.32, 0.4, 0.42],
      RXF = [-0.16, -0.1, -0.05, 0, 0.05, 0.08, 0.1, 0.12];
    let par = G(core, 0, 0.3, 1.6);
    for (let i = 0; i < NS; i++) {
      const g = i === 0 ? par : G(par, 0, 0, nl),
        s = 1.0 - i * 0.05,
        w = s * 0.86 * (0.8 + 0.2 * bw);
      B(g, w, s, nl + 0.14, i % 2 ? lo : body, 0, 0, nl / 2);
      B(g, w + 0.04, s * 0.3, nl + 0.08, under, 0, -s * 0.36 - 0.025, nl / 2);
      B(g, w * 0.56, 0.14, nl - 0.03, belly, 0, -s / 2 - 0.06, nl / 2);
      B(g, w * (pat === 4 ? 0.62 : 0.3), 0.1, nl + 0.1, pat === 4 ? dark : hi, 0, s / 2 + 0.03, nl / 2);
      if (pat === 1 && i % 2) B(g, w + 0.1, s + 0.1, 0.16, acc, 0, 0, nl / 2);
      if (cr) crest(g, s / 2 + 0.05, nl / 2, 0.78 - i * 0.04, i % 2 ? 1 : -1, nl);
      if (am > 1 && (i === 0 || i === 3)) {
        B(g, w + 0.12, s + 0.12, 0.26, plate, 0, 0, nl / 2);
        B(g, w + 0.14, 0.08, 0.28, trim, 0, s / 2 + 0.07, nl / 2, { basic: glow });
      }
      g.rotation.x = RX0[i];
      rig.neck.push({ g, r0: RX0[i], rF: RXF[i], y: 0, s });
      par = g;
    }
    /* tête : crâne, pommettes, arcades, museau en trois pièces qui s'affinent, mâchoire articulée, dents */
    const head = G(par, 0, 0, nl);
    rig.head = head;
    B(head, 0.78, 0.6, 0.34, lo, 0, 0.02, -0.06);
    B(head, 0.9, 0.72, 0.7, body, 0, 0.04, 0.36);
    B(head, 0.56, 0.14, 0.62, hi, 0, 0.44, 0.3);
    [1, -1].forEach((s) => {
      B(head, 0.14, 0.3, 0.56, lo, 0.47 * s, -0.12, 0.34);
      B(head, 0.3, 0.16, 0.5, dark, 0.34 * s, 0.4, 0.52, { rz: -0.22 * s });
      B(head, 0.12, 0.12, 0.24, dark, 0.4 * s, 0.3, 0.84);
      rig.eyes.push(B(head, 0.05, 0.17, 0.24, D.eye, 0.462 * s, 0.17, 0.5, { basic: true }));
      B(head, 0.06, 0.17, 0.06, "#0e0c10", 0.468 * s, 0.17, 0.52);
    });
    let sw = 0.62,
      sh = 0.46,
      sl = 1.0,
      sy = -0.1;
    const z0 = 0.7;
    if (D.head === 1) {
      sw = 0.8;
      sh = 0.56;
      sl = 0.66;
    } else if (D.head === 2) {
      sl = 1.16;
      sh = 0.42;
    } else if (D.head === 3) {
      sw = 0.56;
      sh = 0.42;
      sl = 0.64;
    }
    const p3 = sl / 3;
    for (let k = 0; k < 3; k++) {
      const kw = [1, 0.88, 0.74][k],
        kh = [1, 0.9, 0.78][k];
      B(head, sw * kw, sh * kh, p3 + 0.04, k % 2 ? lo : body, 0, sy + sh * (1 - kh) * 0.1, z0 + p3 * (k + 0.5));
      B(head, sw * kw * 0.5, 0.08, p3, hi, 0, sy + (sh * kh) / 2 + 0.03, z0 + p3 * (k + 0.5));
    }
    let tip = z0 + sl;
    const tw = sw * 0.74,
      lipY = sy - sh * 0.39;
    if (D.head === 3) {
      B(head, 0.4, 0.3, 0.46, hc, 0, sy + 0.02, tip + 0.18);
      B(head, 0.26, 0.24, 0.24, hc, 0, sy - 0.06, tip + 0.48);
      B(head, 0.16, 0.26, 0.14, hc, 0, sy - 0.2, tip + 0.58);
      tip += 0.5;
    } else {
      [1, -1].forEach((s) => {
        B(head, 0.14, 0.12, 0.2, lo, tw * 0.3 * s, sy + sh * 0.39 + 0.04, tip - 0.14);
        B(head, 0.07, 0.07, 0.09, "#16110e", tw * 0.3 * s, sy + sh * 0.39 + 0.07, tip - 0.05);
        const nt = Math.max(3, Math.round(sl / 0.22));
        for (let k = 0; k < nt; k++)
          B(
            head,
            0.07,
            0.1 + (k % 2) * 0.05,
            0.08,
            hc,
            (sw * lerp(0.36, 0.48, k / nt) - 0.02) * s,
            lipY - 0.04,
            tip - 0.1 - (k * (sl - 0.1)) / nt,
          );
        if (D.head === 2) {
          B(head, 0.1, 0.34, 0.11, hc, (tw / 2 - 0.04) * s, lipY - 0.14, tip - 0.14);
          B(head, 0.09, 0.24, 0.1, hc, sw * 0.45 * s, lipY - 0.1, tip - 0.5);
        }
      });
      B(head, 0.07, 0.12, 0.07, hc, 0, lipY - 0.04, tip - 0.03);
    }
    const jaw = G(head, 0, sy - sh / 2 - 0.03, 0.42);
    rig.jaw = jaw;
    const jl = tip - 0.42 - (D.head === 3 ? 0.34 : 0.06);
    B(jaw, sw * 0.9, 0.18, jl * 0.55, lo, 0, -0.08, jl * 0.275);
    B(jaw, sw * 0.7, 0.15, jl * 0.5, lo, 0, -0.07, jl * 0.75);
    B(jaw, sw * 0.5, 0.1, jl * 0.8, belly, 0, -0.19, jl * 0.45);
    B(jaw, sw * 0.36, 0.05, jl * 0.6, "#8e2a2e", 0, 0.035, jl * 0.45);
    if (D.head !== 3)
      [1, -1].forEach((s) => {
        for (let k = 0; k < 3; k++)
          B(jaw, 0.06, 0.11 + (k === 0 ? 0.05 : 0), 0.08, hc, sw * (0.3 - k * 0.02) * s, 0.06, jl - 0.12 - k * 0.24);
      });
    B(jaw, 0.12, 0.2, 0.12, hc, 0, -0.27, 0.2);
    [1, -1].forEach((s) => B(jaw, 0.1, 0.1, 0.3, hc, sw * 0.44 * s, -0.1, 0.1, { ry: -0.5 * s }));
    rig.mouth = G(head, 0, sy - 0.08, tip + 0.15);
    /* cornes : courbes, en plusieurs pièces */
    const H = D.horns,
      hk = 1 + ev * 0.07;
    if (H === 1)
      [1, -1].forEach((s) => hornChain(head, 0.3 * s, 0.42, 0.06, 0.6 * hk, 0.2, 0.5, -0.2 * s, 0, -0.1, 2, hc));
    else if (H === 2)
      [1, -1].forEach((s) => hornChain(head, 0.32 * s, 0.42, 0.04, 1.5 * hk, 0.22, 0.34, -0.14 * s, 0, 0.1, 4, hc));
    else if (H === 3)
      [1, -1].forEach((s) => hornChain(head, 0.42 * s, 0.3, 0.1, 1.5 * hk, 0.26, 0.2, -0.9 * s, 0, -0.62, 6, hc));
    else if (H === 4)
      [-0.34, -0.17, 0, 0.17, 0.34].forEach((x, i) =>
        hornChain(
          head,
          x,
          0.42,
          0.02 - Math.abs(x) * 0.3,
          (0.5 + (i === 2 ? 0.3 : i % 2 ? 0.14 : 0)) * hk,
          0.14,
          1.1,
          -x * 0.5,
          0,
          -0.06,
          2,
          hc,
        ),
      );
    else if (H === 5)
      [1, -1].forEach((s) => {
        const e = hornChain(head, 0.3 * s, 0.42, 0.02, 0.9 * hk, 0.18, 1.35, -0.5 * s, 0, 0.0, 2, hc);
        e.rotation.set(0.5, 0.9 * s, 0);
        hornChain(e, 0, 0, 0, 0.7 * hk, 0.12, 0, 0, 0, -0.4, 3, hc);
      });
    else if (H === 6)
      [1, -1].forEach((s) => {
        [
          [0.3, 0.42, 1.2, 0.2, 0.32, 0.14],
          [0.42, 0.24, 1.0, 0.17, 0.2, 0.3],
          [0.44, 0.04, 0.8, 0.14, 0.08, 0.42],
          [0.14, 0.44, 0.8, 0.15, 0.5, 0.04],
        ].forEach((h) => hornChain(head, h[0] * s, h[1], 0.0, h[2] * hk, h[3], h[4], -h[5] * s, 0, 0.07, 3, hc));
        hornChain(head, 0.34 * s, -0.34, 0.2, 0.42, 0.11, -0.3, -0.4 * s, 0, 0, 2, hc);
      });
    if (D.frill === 1)
      [1, -1].forEach((s) =>
        [
          [0.2, 0.56],
          [-0.02, 0.7],
          [-0.24, 0.5],
        ].forEach((a) => hornChain(head, 0.46 * s, a[0], 0.04, a[1], 0.11, 0, -0.62 * s, 0, 0, 2, cc)),
      );
    else if (D.frill === 2)
      [1, -1].forEach((s) => {
        const f = G(head, 0.46 * s, 0.03, 0.02);
        f.rotation.y = -0.62 * s;
        flat(
          f,
          [
            [0, 0],
            [0.4, -0.02],
            [0.44, -0.86],
            [0, -0.74],
            [-0.42, -0.8],
            [-0.4, -0.02],
          ],
          0,
          wc,
        ).rotation.z = Math.PI / 2;
        [0.4, 0, -0.4].forEach((y) => hornChain(f, 0, y, 0, 0.84 - Math.abs(y) * 0.1, 0.09, y * 0.12, 0, 0, 0, 2, cc));
      });
    if (am > 0) {
      B(head, 1.02, 0.1, 0.8, plate, 0, 0.6, 0.32);
      B(head, 1.06, 0.26, 0.16, plate, 0, 0.5, 0.82);
      B(head, sw * 0.9, 0.1, sl * 0.6, plate, 0, sy + sh / 2 + 0.12, z0 + sl * 0.35);
      if (am > 1) B(head, 0.14, 0.12, 0.7, trim, 0, 0.7, 0.32, { basic: glow });
    }
    /* pattes : cuisse musclée, genou, jambe, cheville, pied à trois doigts et ergot */
    const leg = (x, y, z, front, ph) => {
      const k = front ? 0.88 : 1,
        a1 = front ? 0.35 : -0.6,
        a2 = front ? -0.7 : 1.15,
        sd = x > 0 ? 1 : -1;
      const t = G(core, x, y, z);
      B(t, 0.5 * k * bw, 1.0, 0.66 * k, body, 0, -0.42, 0);
      B(t, 0.6 * k * bw, 0.56, 0.84 * k, lo, 0.02 * sd, -0.12, 0.02);
      B(t, 0.3 * k, 0.6, 0.3 * k, hi, 0.2 * k * bw * sd, -0.2, 0.1);
      B(t, 0.34 * k, 0.3, 0.4 * k, lo, 0, -0.86, 0.06);
      const s = G(t, 0, -0.88, 0);
      B(s, 0.34 * k, 0.9, 0.4 * k, lo, 0, -0.4, 0);
      B(s, 0.26 * k, 0.5, 0.26 * k, under, 0, -0.3, -0.14 * k);
      B(s, 0.3 * k, 0.22, 0.34 * k, body, 0, -0.8, 0);
      const f = G(s, 0, -0.82, 0);
      B(f, 0.44 * k, 0.24, 0.5 * k, under, 0, -0.1, 0.06);
      [-0.17, 0, 0.17].forEach((cx, q) => {
        B(f, 0.13 * k, 0.16, 0.42 * k, under, cx * k, -0.13, 0.42 * k);
        hornChain(f, cx * k, -0.12, 0.6 * k, 0.3 * k, 0.11, Math.PI + 0.2, cx * 0.8, 0, 0.3, 2, hc);
      });
      hornChain(f, 0, -0.08, -0.16 * k, 0.26 * k, 0.1, -0.15, 0, 0, -0.3, 2, hc);
      if (am > 1) B(t, 0.6 * k * bw + 0.08, 0.36, 0.84 * k + 0.08, plate, 0.02 * sd, -0.1, 0.02);
      t.rotation.x = a1;
      s.rotation.x = a2;
      f.rotation.x = -(a1 + a2);
      rig.legs.push({ t, s, f, a1, a2, ph, front });
    };
    if (!rig.wyv) {
      leg(0.78 * bw, -0.08, 0.85, true, 0);
      leg(-0.78 * bw, -0.08, 0.85, true, Math.PI);
    }
    leg(0.7 * bw, -0.25, rig.wyv ? -1.02 : -1.4, false, Math.PI);
    leg(-0.7 * bw, -0.25, rig.wyv ? -1.02 : -1.4, false, 0);
    /* queue : quatorze segments qui s'affinent en douceur */
    const NT = 14,
      tl = 0.52 * D.tailL;
    par = G(core, 0, 0.02, -2.1);
    for (let i = 0; i < NT; i++) {
      const g = i === 0 ? par : G(par, 0, 0, -tl),
        k = i / (NT - 1),
        w = lerp(0.94 * bw, 0.16, Math.pow(k, 0.8)),
        h = lerp(0.9 * bh, 0.16, Math.pow(k, 0.8));
      B(g, w, h, tl + 0.05, i % 2 ? lo : body, 0, 0, -tl / 2);
      B(g, w + 0.035, h * 0.3, tl - 0.03, under, 0, -h * 0.36 - 0.02, -tl / 2);
      if (i < 9) B(g, w * 0.56, 0.1, tl - 0.09, belly, 0, -h / 2 - 0.045, -tl / 2);
      B(g, w * (pat === 4 ? 0.62 : 0.3), 0.08, tl + 0.02, pat === 4 ? dark : hi, 0, h / 2 + 0.025, -tl / 2);
      if (pat === 1 && i % 2 === 0) B(g, w + 0.1, h + 0.1, 0.16, acc, 0, 0, -tl / 2);
      if (cr && i < 11) crest(g, h / 2 + 0.04, -tl / 2, Math.max(0.28, 0.86 - i * 0.06), i % 2 ? 1 : -1, tl);
      if (am > 0 && i === 1) {
        B(g, w + 0.1, h + 0.1, 0.24, plate, 0, 0, -tl / 2);
        if (am > 1) B(g, w + 0.12, 0.08, 0.26, trim, 0, h / 2 + 0.07, -tl / 2, { basic: glow });
      }
      rig.tail.push(g);
      par = g;
    }
    const tg = G(par, 0, 0, -tl),
      T0 = D.tail;
    if (T0 === 0) hornChain(tg, 0, 0, 0.04, 1.0, 0.2, 0, 0, 0, 0, 3, hc);
    else if (T0 === 1) {
      B(tg, 0.7, 0.7, 0.7, lo, 0, 0, -0.34);
      B(tg, 0.5, 0.5, 0.9, body, 0, 0, -0.34);
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [0.7, 0.7],
        [-0.7, 0.7],
        [0.7, -0.7],
        [-0.7, -0.7],
      ].forEach((p) => hornChain(tg, p[0] * 0.3, p[1] * 0.3, -0.34, 0.4, 0.13, p[1] * 1.4, -p[0] * 1.4, 0, 0, 2, hc));
      hornChain(tg, 0, 0, -0.7, 0.4, 0.16, 0, 0, 0, 0, 2, hc);
    } else if (T0 === 2) {
      B(tg, 0.1, 0.5, 0.5, hc, 0, 0, -0.2);
      B(tg, 0.11, 1.2, 0.7, hc, 0, 0, -0.75);
      B(tg, 0.1, 0.8, 0.4, hc, 0, 0, -1.25);
      B(tg, 0.09, 0.36, 0.3, hc, 0, 0, -1.55);
    } else if (T0 === 3) {
      rig.flames.push(B(tg, 0.36, 0.36, 0.36, fl, 0, 0, -0.3, { basic: true }));
      rig.flames.push(B(tg, 0.24, 0.24, 0.3, "#ffe27a", 0, 0.06, -0.56, { basic: true }));
      rig.flames.push(B(tg, 0.14, 0.14, 0.2, "#ffffff", 0, 0.1, -0.76, { basic: true }));
    } else {
      flat(
        tg,
        [
          [0, 0],
          [0.7, -0.5],
          [0.5, -1.3],
          [0, -1.05],
          [-0.5, -1.3],
          [-0.7, -0.5],
        ],
        0,
        wc,
      );
      [-0.5, 0, 0.5].forEach((a) => hornChain(tg, 0, 0.02, 0, 1.25 - Math.abs(a) * 0.3, 0.1, 0, a, 0, 0, 3, cc));
    }
    /* ailes */
    [1, -1].forEach((sd) => {
      const W = buildWing(D);
      W.root.position.set(0.62 * bw * sd, 0.55 * bh, 0.9);
      W.root.scale.set(sd * D.span, D.span, D.span);
      W.ph = sd > 0 ? 0 : Math.PI;
      core.add(W.root);
      rig.wings.push(W);
    });
    /* barde */
    const C1 = SEG[1],
      C0 = SEG[0];
    if (am > 0) {
      B(core, C0[1] + 0.12, C0[2] + 0.1, 0.5, plate, 0, C0[4], 1.5);
      B(core, C1[1] + 0.1, C1[2] * 0.7, 0.4, plate, 0, C1[4] - 0.1, 1.0);
      B(core, C0[1] + 0.16, 0.1, 0.52, trim, 0, C0[4] + C0[2] / 2 + 0.07, 1.5, { basic: glow });
      [1, -1].forEach((s) => {
        B(core, 0.16, 0.6, 0.9, plate, (0.66 * bw + 0.26) * s, 0.5, 0.84);
        B(core, 0.18, 0.1, 0.92, trim, (0.66 * bw + 0.26) * s, 0.84, 0.84, { basic: glow });
      });
      if (am === 3)
        [1, -1].forEach((s) => {
          const a = SEG[3];
          B(core, 0.06, 0.95 * bh, 1.2, "#3f6fd0", (a[1] / 2 + 0.05) * s, -0.06, -0.5, { k: "pix" });
          B(core, 0.08, 0.12, 1.22, "#d4a234", (a[1] / 2 + 0.05) * s, -0.5 * bh, -0.5);
          B(core, 0.09, 0.3, 0.3, "#f0cc5c", (a[1] / 2 + 0.055) * s, -0.04, -0.5);
        });
      if (am === 4)
        [1, -1].forEach((s) =>
          rig.flames.push(B(core, 0.1, 0.1, 0.06, trim, 0.3 * s, C0[4] + 0.1, 1.77, { basic: true })),
        );
    }
    /* selle */
    const S2 = SEG[2],
      sdc = D.saddle === 2 ? "#2c2e34" : D.saddleC,
      sy0 = S2[4] + S2[2] / 2 + 0.05;
    B(core, 0.9, 0.2, 1.0, sdc, 0, sy0 + 0.1, 0.1, { k: "pix" });
    B(core, 0.96, 0.05, 0.3, shade(sdc, 0.7), 0, sy0 + 0.225, 0.1, { k: "pix" });
    B(core, S2[1] + 0.1, S2[2] + 0.1, 0.16, shade(sdc, 0.8), 0, S2[4], 0.3, { k: "pix" });
    B(core, 0.5, 0.3, 0.12, shade(sdc, 0.9), 0, sy0 + 0.3, 0.62, { k: "pix" });
    B(core, 0.76, 0.34, 0.12, shade(sdc, 0.9), 0, sy0 + 0.3, -0.42, { k: "pix" });
    [1, -1].forEach((s) => {
      B(core, 0.05, 0.6, 0.08, shade(sdc, 0.7), (S2[1] / 2 + 0.03) * s, sy0 - 0.4, 0.2, { k: "pix" });
      B(core, 0.08, 0.06, 0.2, "#949aa3", (S2[1] / 2 + 0.05) * s, sy0 - 0.72, 0.2);
    });
    if (D.saddle === 1) {
      B(core, 0.94, 0.05, 1.04, "#949aa3", 0, sy0 + 0.17, 0.1);
      [
        [0.38, 0.52],
        [-0.38, 0.52],
        [0.38, -0.32],
        [-0.38, -0.32],
      ].forEach((p) => B(core, 0.09, 0.09, 0.09, "#d4a234", p[0], sy0 + 0.22, p[1]));
    }
    if (D.saddle === 2)
      [1, -1].forEach((s) =>
        rig.flames.push(B(core, 0.06, 0.04, 0.8, "#ff8a1f", 0.22 * s, sy0 + 0.21, 0.1, { basic: true })),
      );
    /* évolution : à chaque palier (ev 0..5) le dragon se renforce à vue d'œil : épines, cornes, éperons, veines de braise, plaques d'os, couronne de flammes */
    if (ev >= 1) {
      const sz = 0.5 + ev * 0.16;
      SEG.forEach((a, i) => {
        if (i > 0)
          hornChain(core, 0, a[4] + a[2] / 2 + 0.04, a[0] + 0.12, sz * (1 - i * 0.05), 0.2, 1.05, 0, 0, -0.14, 3, hc);
      });
      rig.neck.forEach((N, i) => {
        if (i % 2 === 0 && i < 7)
          hornChain(N.g, 0, N.s / 2 + 0.03, nl / 2 + 0.08, sz * (0.72 - i * 0.05), 0.15, 1.05, 0, 0, -0.14, 2, hc);
      });
      rig.tail.forEach((g, i) => {
        if (i < 10 && (i % 2 === 0 || ev >= 3))
          hornChain(
            g,
            0,
            lerp(0.9 * bh, 0.16, Math.pow(i / 13, 0.8)) / 2 + 0.02,
            -tl / 2 + 0.06,
            sz * (0.85 - i * 0.06),
            0.14,
            0.95,
            0,
            0,
            -0.12,
            2,
            hc,
          );
      });
    }
    if (ev >= 2)
      [1, -1].forEach((s) => {
        hornChain(head, 0.46 * s, 0.26, 0.0, 0.7 + ev * 0.12, 0.15, 0.2, -0.42 * s, 0, 0.08, 3, hc);
        hornChain(core, 0.86 * bw * s, 0.7, 0.86, 0.6 + ev * 0.1, 0.26, 1.3, -0.7 * s, 0, -0.2, 3, hc);
      });
    if (ev >= 3) {
      [1, -1].forEach((s) =>
        SEG.forEach((a, i) => {
          if (i > 0 && i < 6)
            B(core, 0.06, 0.1, a[3] * 0.8, fl, s * (a[1] / 2 + 0.014), a[4] - a[2] * 0.14, a[0], { basic: true });
        }),
      );
      rig.eyes.forEach((e) => e.scale.set(1.8, 1, 1.3));
      rig.tail.slice(-3).forEach((g, k) =>
        flat(
          g,
          [
            [0, 0],
            [0.5 - k * 0.12, -tl * 0.3],
            [0, -tl],
            [-0.5 + k * 0.12, -tl * 0.3],
          ],
          0,
          hc,
        ),
      );
      rig.wings.forEach((W) => {
        hornChain(W.w, 0.02, -0.2, 0.2, 1.0, 0.2, Math.PI + 0.45, 0, 0, 0.2, 3, hc);
        hornChain(W.e, 0, 0.14, -0.1, 0.7, 0.16, 0.5, 0, 0, 0.15, 2, hc);
      });
    }
    if (ev >= 4) {
      SEG.forEach((a, i) => {
        if (i > 0) {
          B(core, a[1] * 0.5, 0.16, a[3] * 0.7, hc, 0, a[4] + a[2] / 2 + 0.1, a[0]);
          [1, -1].forEach((s) =>
            B(core, 0.14, a[2] * 0.3, a[3] * 0.6, hc, s * (a[1] / 2 + 0.03), a[4] + a[2] * 0.22, a[0]),
          );
        }
      });
      B(head, 0.6, 0.12, 0.7, hc, 0, am > 0 ? 0.76 : 0.6, 0.3);
      [1, -1].forEach((s) => hornChain(head, 0.3 * s, 0.5, 0.5, 0.6, 0.13, 1.3, 0, 0, -0.2, 2, hc));
    }
    if (ev >= 5) {
      [-0.3, 0, 0.3].forEach((x) => rig.flames.push(B(head, 0.2, 0.5, 0.2, fl, x, 1.0, -0.12, { basic: true })));
      rig.wings.forEach((W) =>
        W.f.forEach((f, i) => B(f, WFL[i] * 0.55, 0.07, 0.07, fl, WFL[i] * 0.3, 0.13, 0, { basic: true })),
      );
      rig.tail.forEach((g, i) => {
        if (i > 3)
          B(g, 0.08, 0.06, tl * 0.7, fl, 0, 0.05 + lerp(0.9 * bh, 0.16, Math.pow(i / 13, 0.8)) / 2, -tl / 2, {
            basic: true,
          });
      });
    }
    /* la gorge et le poitrail rougeoient avec la chaleur du souffle */
    rig.heatM = new T.MeshBasicMaterial({
      color: "#1a0f0c",
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -4,
    });
    rig.heatC = [new T.Color("#1a0f0c"), new T.Color(fl)];
    rig.neck.forEach((N) => {
      const q = new T.Mesh(vgeo(0.3, 0.06, nl * 0.7), rig.heatM);
      q.position.set(0, -N.s / 2 - 0.14, nl / 2);
      N.g.add(q);
    });
    {
      const q = new T.Mesh(vgeo(0.6 * bw, 0.06, 0.9), rig.heatM);
      q.position.set(0, C1[4] - C1[2] / 2 - 0.18, 0.86);
      core.add(q);
    }
    /* le Capitaine, à sa taille quelle que soit celle du dragon */
    const cap = buildCaptain();
    cap.g.position.set(0, sy0 + 0.31, 0.08);
    cap.g.scale.setScalar(((CAPM.sc || 1.35) * 1.5) / D.size);
    core.add(cap.g);
    rig.rider = cap.u;
    /* hauteur du corps : les pieds au sol dans la pose de repos */
    root.updateMatrixWorld(true);
    const bx = new T.Box3();
    let lowest = 0;
    rig.legs.forEach((L) => {
      bx.setFromObject(L.f);
      if (bx.min.y < lowest) lowest = bx.min.y;
    });
    rig.cy = -lowest;
    core.position.y = rig.cy;
    /* poses d'aile. Au sol, la wyverne marche sur ses poignets : le coude en arrière, l'avant-bras planté devant, les doigts repliés le long de l'avant-bras */
    const H0 = V3(0.73, -0.33, -0.6).normalize(),
      ey = 0.55 * bh + H0.y * WLH * D.span,
      LFs = WLF * D.span;
    const dy = clamp(-rig.cy + 0.16 - ey, -LFs * 0.97, -0.2),
      hz = Math.sqrt(LFs * LFs - dy * dy),
      F0 = V3(-0.16 * hz, dy, 0.987 * hz).normalize();
    rig.WP = {
      fly: wingPose(V3(0.9, 0.16, 0.22), V3(0.96, 0.06, -0.14), V3(0.92, 0, -0.3), 1),
      dive: wingPose(
        V3(0.7, 0.2, -0.4),
        V3(0.55, 0.05, -0.8),
        V3(0.4, -0.02, -0.9),
        0.5,
        V3(-0.5, 0, -1),
        V3(-1, 0, -0.4),
        V3(-1, 0, -0.2),
      ),
      mantle: wingPose(V3(0.72, 0.6, 0.12), V3(0.8, 0.52, -0.16), V3(0.86, 0.22, -0.42), 1),
      ground: rig.wyv
        ? wingPose(
            H0,
            F0,
            V3(-F0.x + 0.1, -F0.y * 0.85, -F0.z - 0.7),
            0.13,
            V3(-0.5, 0.5, -0.4),
            V3(-0.2, 0.3, -1),
            V3(-0.3, -0.5, -1),
          )
        : wingPose(
            V3(0.34, 0.62, -0.7),
            V3(0.1, -0.1, -1),
            V3(0.16, 0.42, -0.9),
            0.1,
            V3(-0.3, -1, -0.2),
            V3(-0.2, -1, 0),
            V3(-0.2, -1, 0),
          ),
    };
    const g0 = rig.WP.ground;
    rig.wc = { s: g0.s.clone(), e: g0.e.clone(), w: g0.w.clone(), fan: g0.fan };
    /* aucune face exactement dans le plan d'une autre : chaque boîte est décalée de quelques millimètres, d'une quantité qui lui est propre */
    let jn = 0;
    root.traverse((m) => {
      if (!m.isMesh || !m.geometry.parameters || m.geometry.parameters.width === undefined) return;
      jn++;
      m.position.x += (((jn * 7) % 11) - 5) * 0.0021;
      m.position.y += (((jn * 5) % 13) - 6) * 0.0019;
      m.position.z += (((jn * 3) % 7) - 3) * 0.0023;
      m.scale.multiplyScalar(1 + (jn % 5) * 0.0015);
    });
    KDYN = null;
    OVC = null;
    return rig;
  }

  /* ---------- animation ---------- */
  const _qF = new T.Quaternion(),
    _qT = new T.Quaternion(),
    _q2 = new T.Quaternion(),
    _eu = new T.Euler(),
    _AZ = new T.Vector3(0, 0, 1),
    _AX = new T.Vector3(1, 0, 0),
    _AY = new T.Vector3(0, 1, 0);
  function animRig(rig, s) {
    const t = s.t,
      dt = s.dt,
      spd = Math.max(0, s.speed),
      sp = clamp(spd, 0, 40),
      fly = s.flying,
      walk = fly ? 0 : clamp(sp / 5, 0, 1.3),
      alt = s.alt == null ? 99 : s.alt;
    if (!rig.tl) {
      rig.tl = rig.tail.map(() => 0);
      rig.tv = rig.tail.map(() => 0);
      rig.tph = 0;
      rig.hov = 0;
      rig.gear = 0;
      rig.eff = 0;
      rig.bob = 0;
      rig.vyS = 0;
    }
    /* régime de vol : stationnaire (lent), battu (on pousse, on monte), plané (vite, sans pousser), piqué */
    const hover = fly && spd < 6,
      dive = fly && s.vy < -4 && !s.boost,
      soar = fly && !hover && !dive && !s.thrust && s.vy < 1.5 && spd > 9;
    rig.hov = damp(rig.hov, hover ? 1 : 0, 3, dt);
    /* l'effort commande l'amplitude et la cadence : fort au décollage, en montée, en accélération ; presque nul en plané */
    const eff =
      s.show === 2
        ? 0.16
        : s.show || !fly
          ? 0
          : dive
            ? 0.08
            : soar
              ? 0.1
              : clamp(0.62 + (s.boost ? 0.28 : 0) + clamp(s.vy, 0, 8) * 0.03 + (hover ? 0.18 : 0), 0, 1);
    rig.eff = damp(rig.eff, eff, eff > rig.eff ? 7 : 2.2, dt);
    const WP = rig.WP,
      c = rig.wc,
      tgt = s.show === 2 ? WP.mantle : s.show ? WP.ground : fly ? (dive ? WP.dive : WP.fly) : WP.ground;
    const kk = 1 - Math.exp(-(fly ? 5 : 3.5) * dt);
    c.s.slerp(tgt.s, kk);
    c.e.slerp(tgt.e, kk);
    c.w.slerp(tgt.w, kk);
    c.fan = lerp(c.fan, tgt.fan, kk);
    rig.wF = damp(
      rig.wF,
      s.show ? 0.28 : !fly ? 0.4 : dive || soar ? 0.55 : 1.25 + rig.eff * 1.1 + (hover ? 0.35 : 0),
      4,
      dt,
    );
    rig.wph += dt * rig.wF;
    /* un battement : l'abattée prend 42 % du cycle (rapide, aile tendue), la remontée 58 % (lente, aile à demi repliée) */
    const u = rig.wph - Math.floor(rig.wph),
      down = u < 0.42,
      q = down ? u / 0.42 : (u - 0.42) / 0.58,
      st = down ? Math.cos(Math.PI * q) : -Math.cos(Math.PI * q);
    const up = down ? 0 : Math.sin(Math.PI * q),
      a = rig.eff * 0.74,
      lag = (d) => {
        const v = u - d,
          w = v - Math.floor(v);
        return w < 0.42 ? Math.cos((Math.PI * w) / 0.42) : -Math.cos((Math.PI * (w - 0.42)) / 0.58);
      };
    _qF.setFromAxisAngle(_AZ, st * a + a * 0.1 + (soar ? 0.07 : 0));
    /* en stationnaire les ailes rament d'avant en arrière */
    _q2.setFromAxisAngle(_AY, -st * a * 0.3 * rig.hov);
    _qF.premultiply(_q2);
    for (const W of rig.wings) {
      _qT.copy(_qF);
      if (!fly && walk > 0.02 && rig.wyv) {
        const g = rig.lph + W.ph;
        _q2.setFromAxisAngle(_AX, Math.sin(g) * 0.09 * Math.min(walk, 1));
        _qT.premultiply(_q2);
        _q2.setFromAxisAngle(_AZ, (0.02 + Math.max(0, Math.cos(g)) * 0.07) * Math.min(walk, 1));
        _qT.premultiply(_q2);
      }
      W.s.quaternion.copy(_qT).multiply(c.s);
      W.e.quaternion.copy(c.e).multiply(_q2.setFromEuler(_eu.set(0, up * a * 0.62, lag(0.1) * a * 0.5)));
      W.w.quaternion.copy(c.w).multiply(_q2.setFromEuler(_eu.set(0, up * a * 0.45, lag(0.19) * a * 0.55)));
      for (let i = 0; i < W.f.length; i++) {
        W.f[i].rotation.y = WFA[i] * c.fan * (1 - up * a * 0.22);
        W.f[i].rotation.z = lag(0.26) * a * 0.1 * (i + 1);
      }
      const kf = lerp(0.3, 1, clamp((c.fan - 0.13) / 0.8, 0, 1));
      for (const m of W.mm) m.scale.z = kf;
      for (const g of W.wg)
        g.m.scale.z = Math.sin(Math.max(0.02, W.f[g.i + 1].rotation.y - W.f[g.i].rotation.y)) / Math.sin(g.da);
    }
    rig.fk = damp(rig.fk, fly ? 1 : 0, 3, dt);
    if (!fly) rig.lph += dt * (1.6 + sp * 0.75) * Math.min(1, walk * 3);
    /* le corps : soulevé à l'abattée, retombe à la remontée ; cabré en stationnaire ; roulis et tangage du pas ; respiration */
    const heave = fly ? -lag(0.06) * a * 0.3 : 0;
    rig.bob = damp(rig.bob, heave, 14, dt);
    const br = Math.sin(t * 1.25);
    rig.core.position.y = rig.cy + (fly ? rig.bob : Math.abs(Math.sin(rig.lph)) * 0.09 * walk + br * 0.02);
    rig.core.rotation.z = fly ? 0 : Math.sin(rig.lph) * 0.045 * walk;
    rig.core.rotation.x =
      (rig.wyv ? lerp(-0.1, 0, rig.fk) : 0) -
      0.34 * rig.hov +
      (fly ? lag(0.12) * a * 0.035 : Math.sin(rig.lph * 2) * 0.012 * walk);
    rig.core.scale.set(1 + br * 0.008, 1 + br * 0.012, 1);
    /* pattes : rentrées en vol après le décollage, sorties à l'approche du sol, pendantes en stationnaire */
    const gearT = fly && !(alt < 5 && s.vy < 1) ? 1 : 0;
    rig.gear = damp(rig.gear, gearT, gearT ? 2.2 : 5, dt);
    const gk = rig.gear * (1 - 0.45 * rig.hov);
    for (const L of rig.legs) {
      let a1 = lerp(L.a1, L.front ? -0.45 : 0.95, gk),
        a2 = lerp(L.a2, L.front ? 1.95 : 0.95, gk),
        fx = (L.front ? 0.5 : 0.9) * gk;
      if (fly) {
        a1 += Math.sin(t * 1.5 + L.ph) * 0.05 + rig.bob * 0.3;
        fx += (1 - gk) * 0.35;
      } else if (walk > 0.02) {
        const g = rig.lph + L.ph,
          lift = Math.max(0, Math.cos(g)),
          w1 = Math.min(walk, 1);
        a1 += Math.sin(g) * 0.52 * w1;
        a2 += (L.front ? -1 : 1) * lift * 0.6 * w1;
        fx = -lift * 0.4 * w1 + Math.max(0, -Math.cos(g)) * 0.12 * w1;
      }
      L.t.rotation.x = damp(L.t.rotation.x, a1, 11, dt);
      L.s.rotation.x = damp(L.s.rotation.x, a2, 11, dt);
      L.f.rotation.x = damp(L.f.rotation.x, -(L.t.rotation.x + L.s.rotation.x) + fx, 13, dt);
    }
    /* cou : la tête regarde vers la visée et entre dans le virage avant le corps ; elle reste stable pendant que le corps monte et descend */
    const n = rig.neck.length,
      tn = clamp(s.turn || 0, -3.6, 3.6),
      ay = clamp((s.aimYaw || 0) * (s.firing ? 1 : 0.6) + tn * 0.12, -1.3, 1.3),
      ap = clamp(s.aimPitch || 0, -0.7, 0.7) * (s.firing ? 1 : 0.45) - 0.34 * rig.hov;
    rig.neck.forEach((N, i) => {
      N.y = damp(N.y, ay / n, 6, dt);
      N.g.rotation.x =
        lerp(N.r0, N.rF, rig.fk) -
        ap / n +
        Math.sin(t * 1.25 - i * 0.6) * 0.02 +
        (i < 2 ? rig.bob * 0.16 : i > n - 3 ? -rig.bob * 0.16 : 0) +
        (fly ? 0 : Math.sin(rig.lph * 2 - i * 0.5) * 0.02 * walk);
      N.g.rotation.y =
        N.y + Math.sin(t * 0.8 - i * 0.5) * 0.018 + (fly ? 0 : Math.sin(rig.lph - i * 0.4) * 0.02 * walk);
      N.g.rotation.z = (-tn * 0.012 * (i + 1)) / n;
    });
    rig.head.rotation.x = damp(
      rig.head.rotation.x,
      s.firing ? -0.1 + Math.sin(t * 34) * 0.02 : Math.sin(t * 1.1) * 0.035,
      10,
      dt,
    );
    rig.jaw.rotation.x = damp(
      rig.jaw.rotation.x,
      s.firing ? 0.6 : 0.03 + Math.max(0, Math.sin(t * 0.7)) * 0.05 + rig.eff * 0.05,
      14,
      dt,
    );
    const bl = t % 4.3 < 0.13 ? 0.12 : 1;
    rig.eyes.forEach((e) => {
      e.scale.y = bl;
    });
    /* queue : sa phase s'accumule (aucun saut quand la vitesse change) ; chaque segment suit le précédent avec retard, si bien qu'elle traîne dans les virages
     et fouette à la sortie ; ample et lente à l'arrêt, tendue et fine à grande vitesse ; elle contrebalance le tangage */
    rig.tph += dt * (1.1 + Math.min(sp, 30) * 0.035);
    rig.vyS = damp(rig.vyS, clamp(s.vy, -14, 14), 4, dt);
    const amp = lerp(1.25, 0.4, clamp(sp / 26, 0, 1)),
      nT = rig.tail.length;
    for (let i = 0; i < nT; i++) {
      const g = rig.tail[i],
        src = i === 0 ? tn : rig.tl[i - 1],
        srv = i === 0 ? rig.vyS : rig.tv[i - 1];
      rig.tl[i] = damp(rig.tl[i], src, 9 - i * 0.36, dt);
      rig.tv[i] = damp(rig.tv[i], srv, 8.5 - i * 0.33, dt);
      g.rotation.y =
        Math.sin(rig.tph - (i * 5.5) / nT) * (0.035 + (0.011 * i * 11) / nT) * (11 / nT) * amp +
        (rig.tl[i] - (i === 0 ? 0 : rig.tl[i - 1])) * 0.14 +
        rig.tl[i] * 0.022 +
        (fly ? 0 : -Math.sin(rig.lph - i * 0.35) * 0.03 * walk);
      g.rotation.x =
        lerp(
          i === 0 ? -0.3 : i === 1 ? -0.2 : i < nT * 0.45 ? 1.4 / nT : i < nT * 0.75 ? 0.3 / nT : -0.4 / nT,
          i === 0 ? 0.05 + 0.2 * rig.hov : i < 4 ? 0.06 * rig.hov : -0.012,
          rig.fk,
        ) -
        rig.tv[i] * 0.0045 +
        (rig.tv[i] - (i === 0 ? rig.vyS : rig.tv[i - 1])) * 0.012 +
        Math.sin(rig.tph * 0.7 - i * 0.4) * 0.01 * amp +
        (i < 3 ? -rig.bob * 0.12 : 0);
      g.rotation.z = rig.tl[i] * 0.01;
    }
    if (rig.heatM)
      rig.heatM.color
        .copy(rig.heatC[0])
        .lerp(rig.heatC[1], clamp((s.heat || 0) / 100, 0, 1) * (0.75 + 0.25 * Math.sin(t * 9)));
    for (let i = 0; i < rig.flames.length; i++)
      rig.flames[i].scale.setScalar(0.85 + 0.3 * Math.abs(Math.sin(t * 14 + i * 1.7)));
    const rd = rig.rider;
    if (rd) {
      const wind = clamp(sp * 0.035, 0, 1);
      if (rd.ex.cape)
        rd.ex.cape.rotation.x = 0.15 + wind * 0.95 + Math.sin(t * 8) * 0.04 * (0.3 + wind) + rig.bob * 0.3;
      if (rd.ex.cape2) rd.ex.cape2.rotation.x = wind * 0.3 + Math.sin(t * 8 - 1) * 0.05 * (0.3 + wind);
      rd.arm.rotation.x = damp(
        rd.arm.rotation.x,
        s.firing ? -1.6 : -1.05 + Math.sin(t * 2.2) * 0.04 - rig.bob * 0.4,
        8,
        dt,
      );
      rd.body.rotation.x = damp(
        rd.body.rotation.x,
        fly
          ? 0.2 + (s.boost ? 0.22 : 0) + 0.3 * rig.hov - rig.bob * 0.25
          : 0.04 + Math.abs(Math.sin(rig.lph)) * 0.03 * walk,
        5,
        dt,
      );
      rd.body.rotation.z = damp(rd.body.rotation.z, clamp(tn * 0.05, -0.2, 0.2), 4, dt);
      rd.head.rotation.x = -rd.body.rotation.x * 0.8;
      rd.head.rotation.y = damp(rd.head.rotation.y, clamp(s.aimYaw || 0, -0.9, 0.9), 6, dt);
    }
  }

  KIT = { buildDragon, animRig, look: DEFAULT_LOOK.d || DEFAULT_LOOK, disposeOwn };
  return KIT;
}
