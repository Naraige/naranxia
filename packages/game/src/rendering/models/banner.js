import { BH, BW, bannerArt, bannerRects, tone } from "../banner-art.js";
import { BKB, matOfKind } from "../blocks.js";
import { addBox, geometryState, newG, quad, rgb, toGeo } from "../geometry.js";

/* ================= A BANNER OF THE KINGDOM, BUILT THE MINECRAFT WAY =================
   A wooden crossbar with a gold knob on each end and, hanging from it, a cloth one pixel thick: the 20 x 40 pixels of bannerArt, one quad to
   each rectangle of one colour. In blocks. The origin is on the axis of the crossbar, about which the cloth swings (rendering/frame.js); the
   cloth hangs down -y and shows its face to +z. k: blocks to 16 pixels (1 = the pixel of the block textures). both: painted on its back as
   well, as a banner seen from both sides is (the picture is the same from behind: mirrored, like a Minecraft banner); the back of a banner
   that hangs against a wall is plain. Drawn with the material of the buildings, so the light, the night and the seasons fall on it.
   Visual only: never read by the simulation. */
const WOOD = "#5a3e24",
  GOLD = "#d9a938";

export function bannerGeo(th, k, both) {
  const G = newG(),
    u = k / 16,
    px = bannerArt(th).px,
    R = bannerRects(px),
    sv = geometryState.BMAT,
    zf = u / 2,
    edge = rgb(tone(px[BW * 3], 0.8)),
    back = rgb(tone(px[BW * 6 + 1], 0.7));
  geometryState.BMAT = matOfKind(BKB.plain);
  try {
    addBox(G, (-BW / 2) * u, -u, -u, (BW / 2) * u, u, u, rgb(WOOD));
    for (const s of [-1, 1]) {
      const x = s * (BW / 2 + 0.5) * u;
      addBox(G, x - u / 2, -1.5 * u, -1.5 * u, x + u / 2, 1.5 * u, 1.5 * u, rgb(GOLD));
    }
    /* each rectangle laps a twentieth of a pixel over its neighbours: where three of them meet along an edge no hair of the wall shows through */
    const e = u / 20;
    for (const [x, y, w, h, c] of R) {
      const x0 = (x - BW / 2) * u - e,
        x1 = x0 + w * u + 2 * e,
        y1 = -(1 + y) * u + e,
        y0 = y1 - h * u - 2 * e,
        q = rgb(c);
      quad(G, [x0, y0, zf], [x1, y0, zf], [x1, y1, zf], [x0, y1, zf], [0, 0, 1], q, q, q, q);
      if (both) quad(G, [x1, y0, -zf], [x0, y0, -zf], [x0, y1, -zf], [x1, y1, -zf], [0, 0, -1], q, q, q, q);
    }
    /* the two long edges, the hem above the tassels, and the plain back of a wall banner */
    const xa = (-BW / 2) * u,
      xb = (BW / 2) * u,
      ya = -BH * u,
      yb = -u;
    quad(G, [xa, ya, -zf], [xa, ya, zf], [xa, yb, zf], [xa, yb, -zf], [-1, 0, 0], edge, edge, edge, edge);
    quad(G, [xb, ya, zf], [xb, ya, -zf], [xb, yb, -zf], [xb, yb, zf], [1, 0, 0], edge, edge, edge, edge);
    quad(G, [xa, ya, -zf], [xb, ya, -zf], [xb, ya, zf], [xa, ya, zf], [0, -1, 0], edge, edge, edge, edge);
    if (!both) quad(G, [xb, ya, -zf], [xa, ya, -zf], [xa, yb, -zf], [xb, yb, -zf], [0, 0, -1], back, back, back, back);
  } finally {
    geometryState.BMAT = sv;
  }
  return toGeo(G);
}
