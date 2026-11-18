/* Sponge .schem (v2/v3) reader: gzip NBT -> {w,h,l, pal:[name], data:Int32Array(y*l*w + z*w + x)} */
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";

export function parseNbt(buf) {
  let p = 0;
  const rd = {
    1: () => buf.readInt8(p++),
    2: () => ((p += 2), buf.readInt16BE(p - 2)),
    3: () => ((p += 4), buf.readInt32BE(p - 4)),
    4: () => ((p += 8), Number(buf.readBigInt64BE(p - 8))),
    5: () => ((p += 4), buf.readFloatBE(p - 4)),
    6: () => ((p += 8), buf.readDoubleBE(p - 8)),
  };
  const str = () => {
    const n = buf.readUInt16BE(p);
    p += 2;
    return buf.toString("utf8", p, (p += n));
  };
  const pl = (t) => {
    if (rd[t]) return rd[t]();
    if (t === 7) {
      const n = rd[3]();
      return buf.subarray(p, (p += n));
    }
    if (t === 8) return str();
    if (t === 9) {
      const tt = rd[1](),
        n = rd[3](),
        a = [];
      for (let i = 0; i < n; i++) a.push(pl(tt));
      return a;
    }
    if (t === 10) {
      const d = {};
      for (let tt = rd[1](); tt !== 0; tt = rd[1]()) {
        const k = str();
        d[k] = pl(tt);
      }
      return d;
    }
    if (t === 11 || t === 12) {
      const n = rd[3](),
        a = [];
      for (let i = 0; i < n; i++) a.push(rd[t === 11 ? 3 : 4]());
      return a;
    }
    throw new Error("nbt tag " + t);
  };
  const t = rd[1]();
  str();
  return pl(t);
}

export function readSchem(file) {
  const root = parseNbt(gunzipSync(readFileSync(file))),
    r = root.Schematic || root,
    pal = [],
    P = r.Palette || r.Blocks.Palette,
    B = r.BlockData || r.Blocks.Data;
  for (const k in P) pal[P[k]] = k;
  const n = r.Width * r.Height * r.Length,
    data = new Int32Array(n);
  let q = 0;
  for (let i = 0; i < n; i++) {
    let v = 0,
      sh = 0,
      b;
    do {
      b = B[q++];
      v |= (b & 127) << sh;
      sh += 7;
    } while (b & 128);
    data[i] = v;
  }
  return { w: r.Width, h: r.Height, l: r.Length, pal, data };
}
