import { TW } from "../gameplay/rules.js";
import { sessionState } from "../gameplay/session.js";
import { bxc, newG, toGeo } from "./geometry.js";
import { scene } from "./scene.js";
import { THREE } from "./three.js";
import { HT, terrainState } from "../world/terrain-state.js";

/* ---- horde portals: a huge frame of obsidian blocks (W x H cubes, one block = one tile) around a swirling violet plane, one per lane, standing where that lane's hordes appear ---- */
const PW = 9,
  PH = 12,
  PD = 2;
const OBS = [
  [0.1, 0.07, 0.16],
  [0.16, 0.1, 0.24],
  [0.07, 0.05, 0.12],
];
const GLOW = [0.75, 0.35, 1];

let portalMat,
  frameMat,
  built = "";
const group = new THREE.Group();
let inited = false;

/* deterministic block shading from the cell coordinates, so the frame looks like hand-placed obsidian */
const tone = (i, j) => OBS[(((i * 7 + j * 13 + ((i * j) % 5)) % 3) + 3) % 3];

function buildOne(q) {
  const R = terrainState.ROUTES[q.L].pts,
    i = Math.min(R.length - 1, Math.max(0, Math.round(q.ph || 0))),
    a = R[Math.max(0, i - 2)],
    b = R[Math.min(R.length - 1, i + 2)],
    ang = Math.atan2(b[1] - a[1], b[0] - a[0]),
    tx = q.x | 0,
    ty = q.y | 0,
    h0 = HT[ty * TW + tx] || 0,
    g = newG();
  /* the frame faces along the route: its plane is perpendicular to the walking direction */
  for (let u = 0; u < PW; u++)
    for (let v = 0; v < PH; v++) {
      const edge = u === 0 || u === PW - 1 || v === 0 || v === PH - 1;
      /* rounded corners: the four corner cells are missing and the next ones become the arch */
      if ((u === 0 || u === PW - 1) && (v === 0 || v === PH - 1)) continue;
      if (!edge) continue;
      const c = tone(u, v);
      bxc(g, -PW / 2 + u + 0.5, v, 0, 1, 1, PD, c);
      /* violet veins in the stone */
      if ((u + v) % 4 === 1) bxc(g, -PW / 2 + u + 0.5, v + 0.45, PD / 2 + 0.02, 0.4, 0.1, 0.05, GLOW);
    }
  /* buttresses at the foot */
  for (const s of [-1, 1]) {
    bxc(g, s * (PW / 2 + 0.5), 0, 0, 1, 2, PD + 1, OBS[2]);
    bxc(g, s * (PW / 2 + 0.5), 2, 0, 1, 1, PD, OBS[0]);
  }
  const m = new THREE.Mesh(toGeo(g), frameMat);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(PW - 2, PH - 2), portalMat);
  pl.position.set(0, 1 + (PH - 2) / 2, 0.0);
  const o = new THREE.Group();
  o.add(m);
  o.add(pl);
  o.position.set(q.x, h0, q.y);
  o.rotation.y = -ang + Math.PI / 2;
  /* a portal grows with every wave that came out of it since it opened (#78): the threat is read from afar */
  o.userData.k = 1 + Math.min(1, 0.06 * Math.max(0, (sessionState.waveN | 0) - (q.w | 0)));
  o.scale.setScalar(o.userData.k);
  return o;
}

/* rebuilt only when the set of portals changes (a new horde lane opens, a save is loaded) */
export function pulsePortals() {
  if (!inited) return;
  const P = sessionState.portals || [],
    key = (sessionState.waveN | 0) + "|" + P.map((q) => q.L + ":" + q.x + ":" + q.y).join("|");
  if (key !== built) {
    built = key;
    for (const c of group.children.slice()) {
      group.remove(c);
      c.children.forEach((k) => k.geometry && k.geometry.dispose());
    }
    for (const q of P) group.add(buildOne(q));
  }
  portalMat.uniforms.uT.value = sessionState.clockT;
  /* they breathe (#95): a slow swell, each on its own beat */
  group.children.forEach((o, i) =>
    o.scale.setScalar((o.userData.k || 1) * (1 + 0.03 * Math.sin(sessionState.clockT * 1.7 + i * 2.1))),
  );
}

export function initializePortals() {
  frameMat = new THREE.MeshBasicMaterial({ vertexColors: true });
  portalMat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader:
      "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:
      "uniform float uT;varying vec2 vUv;void main(){vec2 p=vUv-.5;float r=length(p);float a=atan(p.y,p.x);float s=.5+.5*sin(a*3.+r*18.-uT*3.);float f=.35+.45*s+.3*(1.-r*1.6);float al=clamp(.55+.35*s,0.,1.);gl_FragColor=vec4(vec3(.55,.2,.95)*f+vec3(.25,.1,.4)*(1.-r),al);}",
  });
  scene.add(group);
  inited = true;
}
