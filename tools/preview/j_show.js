async () => {
  window.requestAnimationFrame = () => 0;
  await new Promise((r) => setTimeout(r, 300));
  const N = +(window.__N || 640),
    sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight(0xfff0dc, 0x403830, +(window.__HL || 0.8)));
  const dl = new THREE.DirectionalLight(0xfff2e0, +(window.__DL || 1.0));
  dl.position.set(-4, 7, 6);
  sc.add(dl);
  const dl2 = new THREE.DirectionalLight(0x9fb8ff, +(window.__D2 || 0.35));
  dl2.position.set(5, 3, -4);
  sc.add(dl2);
  if (window.__SH) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    dl.castShadow = true;
    dl.shadow.mapSize.set(2048, 2048);
    const q = dl.shadow.camera;
    q.left = -36;
    q.right = 36;
    q.top = 36;
    q.bottom = -36;
    q.near = 1;
    q.far = 220;
    q.updateProjectionMatrix();
    dl.shadow.bias = -0.0003;
    dl.shadow.normalBias = 0.03;
    sc.add(dl.target);
  }
  const SS = +(window.__SS || 1),
    M = N * SS,
    cam = new THREE.PerspectiveCamera(24, 1, 0.05, 500),
    rt = new THREE.WebGLRenderTarget(M, M),
    buf = new Uint8Array(M * M * 4);
  const shot = (g, yaw, pitch, fill) => {
    sc.add(g);
    g.updateMatrixWorld(true);
    let GP = null;
    if (window.__SH) {
      g.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = !!window.__SR;
          if (o.material) o.material.needsUpdate = true;
        }
      });
      if (window.__GP) {
        const b0 = new THREE.Box3().setFromObject(g);
        GP = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: +window.__GP }));
        GP.rotation.x = -Math.PI / 2;
        GP.position.set((b0.min.x + b0.max.x) / 2, b0.min.y + 0.002, (b0.min.z + b0.max.z) / 2);
        GP.receiveShadow = true;
        sc.add(GP);
        GP.updateMatrixWorld(true);
      }
    }
    const bb = new THREE.Box3().setFromObject(g),
      sp = bb.getBoundingSphere(new THREE.Sphere()),
      c = sp.center,
      r = sp.radius,
      d = (r / Math.sin((cam.fov * Math.PI) / 360)) * (fill || 1.05);
    cam.position.set(
      c.x + Math.sin(yaw) * Math.cos(pitch) * d,
      c.y + Math.sin(pitch) * d,
      c.z + Math.cos(yaw) * Math.cos(pitch) * d,
    );
    if (window.__SH) {
      dl.position.set(c.x - 40, c.y + 70, c.z + 60);
      dl.target.position.copy(c);
      dl.target.updateMatrixWorld();
    }
    cam.near = d * 0.05;
    cam.far = d * 4;
    cam.updateProjectionMatrix();
    cam.lookAt(c);
    const f0 = FOWU.fowP.value.w,
      f1 = FOWU.fowP.value.z;
    FOWU.fowP.value.w = 0;
    FOWU.fowP.value.z = 0;
    renderer.setClearColor(window.__BG !== undefined ? window.__BG : 0x0b0a0e, 1);
    renderer.setRenderTarget(rt);
    renderer.clear();
    renderer.render(sc, cam);
    renderer.readRenderTargetPixels(rt, 0, 0, M, M, buf);
    renderer.setRenderTarget(null);
    FOWU.fowP.value.w = f0;
    FOWU.fowP.value.z = f1;
    sc.remove(g);
    if (GP) sc.remove(GP);
    const c2 = document.createElement("canvas");
    c2.width = c2.height = M;
    const x2 = c2.getContext("2d"),
      im = x2.createImageData(M, M);
    for (let y = 0; y < M; y++) {
      const sy = M - 1 - y;
      for (let i = 0; i < M; i++) {
        const a = (sy * M + i) * 4,
          o = (y * M + i) * 4;
        for (let k = 0; k < 4; k++) im.data[o + k] = buf[a + k];
      }
    }
    x2.putImageData(im, 0, 0);
    const cv = document.createElement("canvas");
    cv.width = cv.height = N;
    const x = cv.getContext("2d");
    x.imageSmoothingEnabled = true;
    x.imageSmoothingQuality = "high";
    x.drawImage(c2, 0, 0, N, N);
    if (window.__GR) {
      const id = x.getImageData(0, 0, N, N),
        D = id.data;
      for (let i = 0; i < D.length; i += 4) {
        let r = D[i] / 255,
          gg = D[i + 1] / 255,
          b = D[i + 2] / 255;
        const L = 0.299 * r + 0.587 * gg + 0.114 * b;
        r = L + (r - L) * 1.08;
        gg = L + (gg - L) * 1.08;
        b = L + (b - L) * 1.08;
        const t = Math.min(1, Math.max(0, (L - 0.12) / 0.6)),
          k = t * t * (3 - 2 * t),
          cr = 0.85 + (1.06 - 0.85) * k,
          cg = 0.96 + (1 - 0.96) * k,
          cb = 1.1 + (0.9 - 1.1) * k;
        r = Math.min(1, Math.max(0, r * cr));
        gg = Math.min(1, Math.max(0, gg * cg));
        b = Math.min(1, Math.max(0, b * cb));
        r = r + (r * r * (3 - 2 * r) - r) * 0.32;
        gg = gg + (gg * gg * (3 - 2 * gg) - gg) * 0.32;
        b = b + (b * b * (3 - 2 * b) - b) * 0.32;
        D[i] = r * 255;
        D[i + 1] = gg * 255;
        D[i + 2] = b * 255;
      }
      x.putImageData(id, 0, 0);
    }
    return cv.toDataURL("image/jpeg", 0.92);
  };
  const out = {};
  const units = (window.__U || "king,guard,knight,archer,captain,bannerman,peasant,zombie,brute").split(",");
  for (const t0 of units) {
    if (!t0 || t0 === "-") continue;
    const q = t0.split("@"),
      t = q[0];
    const g = icoUnit(t, t === "zombie" || t === "brute" ? 1 : 0);
    out["u_" + t0.replace(/[@.]/g, "_")] = shot(
      g,
      q[1] ? +q[1] : window.__UY || 0.55,
      window.__UPI !== undefined ? window.__UPI : 0.12,
      window.__UF || 1.0,
    );
  }
  const bs = (window.__B || "castle,house,barracks,tower,market,academy,guild,forester,storage,farm").split(",");
  for (const t of bs) {
    if (!t || t === "-") continue;
    const s = {
      type: t,
      t: 0,
      tier: 1,
      sz: t === "castle" ? 5 : t === "tower" ? 2 : 2,
      tiles: [],
      tx: 0,
      ty: 0,
      pl: 0,
      hm: 0,
      rot: 0,
    };
    if (t === "tower") s.sz = 2;
    const m = new THREE.Mesh(sGeo(s, 0), matV);
    const g = new THREE.Group();
    g.add(m);
    out["b_" + t] = shot(g, 0.62, 0.38, 1.0);
  }
  if (window.__TL) {
    const T = toolGeos();
    for (const k0 of window.__TL.split(",")) {
      const q = k0.split("@"),
        k = q[0],
        sh = k.startsWith("sh_"),
        al = q[2] !== undefined && q[2] !== "" ? +q[2] : +(window.__AL || 0),
        geo0 = sh ? shieldGeo(k.slice(3), al) : T[k],
        geo = q[4] === "v" ? geo0.clone().rotateX(-Math.PI / 2) : geo0,
        g = new THREE.Group(),
        m = new THREE.Mesh(geo, matUI);
      g.add(m);
      out["t_" + k0.replace(/[@.]/g, "_")] = shot(
        g,
        q[1] ? +q[1] : sh ? 0.42 : window.__TY || 1.25,
        q[3] !== undefined ? +q[3] : sh ? 0.16 : 0.3,
        sh ? 0.95 : 0.9,
      );
    }
  }
  return JSON.stringify(out);
};
