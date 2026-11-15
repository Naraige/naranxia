import { hex } from "../core/math.js";
import { BANNER, bannerTex } from "./structures.js";
import { canvasesState, cvs } from "../ui/canvases.js";
import { circ, ICN, ln, poly, rrg } from "../ui/drawing.js";
import { IC, thIcons } from "../ui/icons.js";
import { PAL, THEME } from "../ui/kingdom-theme.js";

/* ---- kingdom banner & emblems ---- */
export const EMB = [
  (g) => {
    rrg(g, 6, 1.5, 4, 13, 1, g.fillStyle, "rgba(0,0,0,.5)", 0.5);
    rrg(g, 2, 5.5, 12, 4, 1, g.fillStyle, "rgba(0,0,0,.5)", 0.5);
  },
  (g) => {
    const p = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 3.2 : 7.2,
        a = -Math.PI / 2 + (i * Math.PI) / 5;
      p.push([8 + Math.cos(a) * r, 8.4 + Math.sin(a) * r]);
    }
    poly(g, p, g.fillStyle, "rgba(0,0,0,.5)", 0.5);
  },
  (g) => {
    poly(
      g,
      [
        [1.5, 12.5],
        [1, 4.5],
        [4.8, 8],
        [8, 2.5],
        [11.2, 8],
        [15, 4.5],
        [14.5, 12.5],
      ],
      g.fillStyle,
      "rgba(0,0,0,.5)",
      0.5,
    );
    rrg(g, 1.5, 11.6, 13, 2.4, 0.8, g.fillStyle, "rgba(0,0,0,.5)", 0.5);
  },
  (g) => {
    const f = g.fillStyle;
    ln(g, 3, 13, 13, 3, "rgba(0,0,0,.5)", 3);
    ln(g, 13, 13, 3, 3, "rgba(0,0,0,.5)", 3);
    ln(g, 3, 13, 13, 3, f, 1.8);
    ln(g, 13, 13, 3, 3, f, 1.8);
    ln(g, 2.6, 9.6, 6.4, 13.4, f, 1.6);
    ln(g, 13.4, 9.6, 9.6, 13.4, f, 1.6);
  },
  (g) => {
    rrg(g, 4.2, 6, 7.6, 8.6, 0.6, g.fillStyle, "rgba(0,0,0,.5)", 0.5);
    rrg(g, 3, 4.4, 10, 2.2, 0.4, g.fillStyle, "rgba(0,0,0,.5)", 0.5);
    [3, 6.9, 10.8].forEach((x) => rrg(g, x, 2.4, 2.2, 2.2, 0.3, g.fillStyle, "rgba(0,0,0,.5)", 0.5));
  },
  (g) => {
    const f = g.fillStyle;
    circ(g, 8, 8, 3.4, f, "rgba(0,0,0,.5)", 0.5);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ln(g, 8 + Math.cos(a) * 4.8, 8 + Math.sin(a) * 4.8, 8 + Math.cos(a) * 7, 8 + Math.sin(a) * 7, f, 1.5);
    }
  },
  (g) => {
    poly(
      g,
      [
        [8, 1.5],
        [13, 7],
        [3, 7],
      ],
      g.fillStyle,
      "rgba(0,0,0,.5)",
      0.5,
    );
    poly(
      g,
      [
        [8, 4.5],
        [13.6, 10.5],
        [2.4, 10.5],
      ],
      g.fillStyle,
      "rgba(0,0,0,.5)",
      0.5,
    );
    rrg(g, 7, 10, 2, 4.5, 0.4, g.fillStyle, "rgba(0,0,0,.5)", 0.5);
  },
  (g) => {
    poly(
      g,
      [
        [9.2, 1],
        [3, 9],
        [7.4, 9],
        [6, 15],
        [13, 6.4],
        [8.6, 6.4],
      ],
      g.fillStyle,
      "rgba(0,0,0,.5)",
      0.5,
    );
  },
  (g) => {
    const f = g.fillStyle;
    g.beginPath();
    g.arc(8, 8, 6.6, Math.PI * 0.28, Math.PI * 1.72, false);
    g.arc(10.6, 8, 5.1, Math.PI * 1.62, Math.PI * 0.38, true);
    g.closePath();
    g.fillStyle = f;
    g.fill();
    g.lineWidth = 0.5;
    g.strokeStyle = "rgba(0,0,0,.5)";
    g.stroke();
    const p = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.9 : 2.1,
        a = -Math.PI / 2 + (i * Math.PI) / 5;
      p.push([12.2 + Math.cos(a) * r, 4.4 + Math.sin(a) * r]);
    }
    poly(g, p, f, null);
  },
  (g) => {
    const f = g.fillStyle;
    circ(g, 8, 3, 1.7, null, "rgba(0,0,0,.5)", 2.4);
    circ(g, 8, 3, 1.7, null, f, 1.4);
    rrg(g, 7.2, 4.4, 1.6, 9.2, 0.4, f, "rgba(0,0,0,.5)", 0.5);
    rrg(g, 4, 6, 8, 1.5, 0.5, f, "rgba(0,0,0,.5)", 0.5);
    g.beginPath();
    g.arc(8, 9, 5, Math.PI * 0.12, Math.PI * 0.88, false);
    g.lineWidth = 2.6;
    g.strokeStyle = "rgba(0,0,0,.5)";
    g.stroke();
    g.lineWidth = 1.6;
    g.strokeStyle = f;
    g.stroke();
    poly(
      g,
      [
        [1.8, 9.6],
        [3.6, 8.4],
        [3.8, 11],
      ],
      f,
      null,
    );
    poly(
      g,
      [
        [14.2, 9.6],
        [12.4, 8.4],
        [12.2, 11],
      ],
      f,
      null,
    );
  },
  (g) => {
    const f = g.fillStyle;
    circ(g, 5, 5, 3.2, null, "rgba(0,0,0,.5)", 2.8);
    circ(g, 5, 5, 3.2, null, f, 1.8);
    ln(g, 7.2, 7.2, 14, 14, "rgba(0,0,0,.5)", 2.8);
    ln(g, 7.2, 7.2, 14, 14, f, 1.8);
    ln(g, 11.4, 11.4, 9.6, 13.2, f, 1.6);
    ln(g, 13, 13, 11.4, 14.6, f, 1.6);
  },
  (g) => {
    const f = g.fillStyle;
    ln(g, 4, 14.5, 11.5, 3, "rgba(0,0,0,.5)", 2.4);
    ln(g, 4, 14.5, 11.5, 3, "#c8a070", 1.4);
    poly(
      g,
      [
        [9.4, 2.2],
        [14.6, 4.6],
        [14, 9.8],
        [11.4, 6.6],
      ],
      f,
      "rgba(0,0,0,.5)",
      0.5,
    );
  },
  (g) => {
    const f = g.fillStyle,
      S = "rgba(0,0,0,.5)";
    poly(
      g,
      [
        [8, 1.5],
        [10, 5],
        [9.2, 9.5],
        [8, 10.5],
        [6.8, 9.5],
        [6, 5],
      ],
      f,
      S,
      0.5,
    );
    poly(
      g,
      [
        [6.6, 9],
        [3.6, 7.6],
        [2, 4.6],
        [3.2, 3.2],
        [4.6, 5.4],
        [6.4, 6.6],
      ],
      f,
      S,
      0.5,
    );
    poly(
      g,
      [
        [9.4, 9],
        [12.4, 7.6],
        [14, 4.6],
        [12.8, 3.2],
        [11.4, 5.4],
        [9.6, 6.6],
      ],
      f,
      S,
      0.5,
    );
    rrg(g, 4.6, 10, 6.8, 1.8, 0.5, f, S, 0.5);
    poly(
      g,
      [
        [7, 11.8],
        [9, 11.8],
        [9.6, 14.6],
        [6.4, 14.6],
      ],
      f,
      S,
      0.5,
    );
  },
  (g) => {
    const f = g.fillStyle,
      S = "rgba(0,0,0,.5)";
    poly(
      g,
      [
        [8, 4.6],
        [11, 6.2],
        [15, 4.2],
        [13.6, 7.4],
        [10.6, 9],
        [9.6, 12],
        [8, 14.4],
        [6.4, 12],
        [5.4, 9],
        [2.4, 7.4],
        [1, 4.2],
        [5, 6.2],
      ],
      f,
      S,
      0.5,
    );
    circ(g, 8, 3.4, 1.5, f, S, 0.5);
  },
  (g) => {
    const f = g.fillStyle,
      S = "rgba(0,0,0,.5)";
    poly(
      g,
      [
        [8, 1.2],
        [11.4, 6.4],
        [12.4, 10],
        [10.8, 13.4],
        [8, 14.8],
        [5.2, 13.4],
        [3.6, 10],
        [4.6, 6.4],
        [6.4, 8.6],
      ],
      f,
      S,
      0.5,
    );
    poly(
      g,
      [
        [8, 7.4],
        [9.8, 10.4],
        [8, 13.2],
        [6.2, 10.4],
      ],
      "rgba(0,0,0,.25)",
      null,
    );
  },
  (g) => {
    const f = g.fillStyle,
      S = "rgba(0,0,0,.5)";
    poly(
      g,
      [
        [2.4, 2],
        [13.6, 2],
        [13.6, 8],
        [8, 14.6],
        [2.4, 8],
      ],
      f,
      S,
      0.5,
    );
    poly(
      g,
      [
        [2.4, 9],
        [8, 4.6],
        [13.6, 9],
        [13.6, 11],
        [8, 6.8],
        [2.4, 11],
      ],
      "rgba(0,0,0,.28)",
      null,
    );
  },
];

export const lighten = (c, k) => {
  const h = hex(c);
  return (
    "#" +
    h
      .map((v) =>
        Math.round(v + (255 - v) * k)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
};

export function bannerPattern(g, W, H, p, c2) {
  g.fillStyle = c2;
  g.beginPath();
  if (p === 1) g.rect(W / 2, 0, W / 2, H);
  else if (p === 2) {
    g.moveTo(0, H * 0.62);
    g.lineTo(W / 2, H * 0.3);
    g.lineTo(W, H * 0.62);
    g.lineTo(W, H * 0.8);
    g.lineTo(W / 2, H * 0.48);
    g.lineTo(0, H * 0.8);
  } else if (p === 3) {
    g.moveTo(0, H * 0.08);
    g.lineTo(W * 0.3, 0);
    g.lineTo(W, H * 0.62);
    g.lineTo(W, H * 0.84);
  } else if (p === 4) {
    g.rect(0, 0, W / 2, H * 0.38);
    g.rect(W / 2, H * 0.38, W / 2, H);
  } else if (p === 5) g.rect(0, H * 0.3, W, H * 0.2);
  else if (p === 6) {
    g.rect(0, 0, W, H);
    g.rect(W * 0.16, H * 0.08, W * 0.68, H * 0.86);
  } else if (p === 7) {
    g.moveTo(0, 0);
    g.lineTo(W * 0.18, 0);
    g.lineTo(W, H * 0.72);
    g.lineTo(W, H * 0.88);
    g.closePath();
    g.moveTo(W, 0);
    g.lineTo(W * 0.82, 0);
    g.lineTo(0, H * 0.72);
    g.lineTo(0, H * 0.88);
    g.closePath();
  }
  if (p) g.fill(p === 6 ? "evenodd" : "nonzero");
}

export function drawBanner() {
  const g = BANNER.getContext("2d"),
    W = 128,
    H = 192,
    p = PAL[THEME.c][1],
    s = PAL[THEME.c][2];
  g.clearRect(0, 0, W, H);
  g.lineJoin = "round";
  const path = () => {
    g.beginPath();
    g.moveTo(8, 4);
    g.lineTo(W - 8, 4);
    g.lineTo(W - 8, H - 30);
    g.lineTo(W / 2, H - 58);
    g.lineTo(8, H - 30);
    g.closePath();
  };
  path();
  const q = g.createLinearGradient(0, 0, 0, H);
  q.addColorStop(0, lighten(p, 0.22));
  q.addColorStop(1, p);
  g.fillStyle = q;
  g.fill();
  g.save();
  path();
  g.clip();
  bannerPattern(g, W, H, THEME.p | 0, PAL[THEME.c2 | 0][1]);
  const sh = g.createLinearGradient(0, 0, W, 0);
  sh.addColorStop(0, "rgba(255,255,255,.12)");
  sh.addColorStop(0.5, "rgba(255,255,255,0)");
  sh.addColorStop(1, "rgba(0,0,0,.18)");
  g.fillStyle = sh;
  g.fillRect(0, 0, W, H);
  g.restore();
  path();
  g.lineWidth = 11;
  g.strokeStyle = s;
  g.stroke();
  g.lineWidth = 2;
  g.strokeStyle = "rgba(0,0,0,.4)";
  g.stroke();
  {
    const im = embImg(THEME.e | 0, embMetal(THEME.c));
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    g.drawImage(im, W / 2 - 55, 31, 110, 110);
  }
  {
    const rg = g.createLinearGradient(0, 0, 0, 9);
    rg.addColorStop(0, "#fff1b0");
    rg.addColorStop(0.5, "#c8922a");
    rg.addColorStop(1, "#7a5410");
    g.fillStyle = rg;
    g.fillRect(2, 1, W - 4, 7);
    g.strokeStyle = "#3a2406";
    g.lineWidth = 1;
    g.strokeRect(2.5, 1.5, W - 5, 6);
    for (const fx of [4, W - 4]) {
      const fg = g.createRadialGradient(fx - 1.5, 3, 1, fx, 4.5, 5);
      fg.addColorStop(0, "#fff6c8");
      fg.addColorStop(1, "#a8741a");
      g.beginPath();
      g.arc(fx, 4.5, 4.6, 0, 6.283);
      g.fillStyle = fg;
      g.fill();
      g.stroke();
    }
  }
}

export function saveTheme() {
  try {
    localStorage.setItem("dk_theme", JSON.stringify(THEME));
  } catch {
    /* The selected banner theme remains active in memory for this session. */
  }
}

const EMBC = {};
const embMetal = (c) => (c === 3 || c === 10 || c === 11 ? "s" : "g");

function embImg(e, m) {
  const k = e + m;
  if (EMBC[k]) return EMBC[k];
  const N = 128,
    c = cvs(N, N),
    q = c.getContext("2d");
  q.scale(N / 20, N / 20);
  q.translate(2, 2);
  const gr = q.createLinearGradient(0, 1, 0, 15);
  if (m === "s") {
    gr.addColorStop(0, "#ffffff");
    gr.addColorStop(0.45, "#d6dce8");
    gr.addColorStop(0.55, "#9aa4b8");
    gr.addColorStop(1, "#eef2f8");
  } else {
    gr.addColorStop(0, "#fff6c4");
    gr.addColorStop(0.42, "#f2c64a");
    gr.addColorStop(0.58, "#b8801a");
    gr.addColorStop(1, "#ffd860");
  }
  q.fillStyle = gr;
  q.lineJoin = "round";
  EMB[e](q);
  const o = cvs(N, N),
    p = o.getContext("2d");
  p.drawImage(c, 0, 0);
  p.globalCompositeOperation = "source-in";
  p.fillStyle = m === "s" ? "#1c2232" : "#3a2406";
  p.fillRect(0, 0, N, N);
  const f = cvs(N, N),
    h = f.getContext("2d");
  h.shadowColor = "rgba(0,0,0,.7)";
  h.shadowBlur = 5;
  h.shadowOffsetY = 4;
  for (const [dx, dy] of [
    [-2.5, 0],
    [2.5, 0],
    [0, -2.5],
    [0, 2.5],
    [-1.8, -1.8],
    [1.8, 1.8],
    [-1.8, 1.8],
    [1.8, -1.8],
  ])
    h.drawImage(o, dx, dy);
  h.shadowColor = "transparent";
  h.drawImage(c, 0, 0);
  const hi = cvs(N, N),
    j = hi.getContext("2d");
  j.drawImage(c, 0, -2.5);
  j.globalCompositeOperation = "source-in";
  j.fillStyle = "rgba(255,255,255,.55)";
  j.fillRect(0, 0, N, N);
  j.globalCompositeOperation = "destination-out";
  j.drawImage(c, 0, 1);
  h.globalCompositeOperation = "source-atop";
  h.drawImage(hi, 0, 0);
  return (EMBC[k] = f);
}

export function drawEmblemR(x, y, s, e, c) {
  const im = embImg(e, embMetal(c == null ? THEME.c : c)),
    p = s * 0.125;
  canvasesState.ctx.imageSmoothingEnabled = true;
  canvasesState.ctx.imageSmoothingQuality = "high";
  canvasesState.ctx.drawImage(im, x - p, y - p, s + 2 * p, s + 2 * p);
}

function shieldPath(x, y, w, h) {
  canvasesState.ctx.beginPath();
  canvasesState.ctx.moveTo(x, y);
  canvasesState.ctx.lineTo(x + w, y);
  canvasesState.ctx.lineTo(x + w, y + h * 0.52);
  canvasesState.ctx.quadraticCurveTo(x + w, y + h * 0.86, x + w / 2, y + h);
  canvasesState.ctx.quadraticCurveTo(x, y + h * 0.86, x, y + h * 0.52);
  canvasesState.ctx.closePath();
}

export function shieldTile(x, y, s, inner) {
  const w = s,
    h = s * 1.12,
    y0 = y - s * 0.06;
  canvasesState.ctx.save();
  canvasesState.ctx.shadowColor = "rgba(0,0,0,.55)";
  canvasesState.ctx.shadowBlur = 2;
  canvasesState.ctx.shadowOffsetY = 1;
  shieldPath(x, y0, w, h);
  const c = PAL[THEME.c][1],
    q = canvasesState.ctx.createLinearGradient(x, y0, x + w, y0 + h);
  q.addColorStop(0, lighten(c, 0.28));
  q.addColorStop(1, c);
  canvasesState.ctx.fillStyle = q;
  canvasesState.ctx.fill();
  canvasesState.ctx.restore();
  canvasesState.ctx.save();
  shieldPath(x, y0, w, h);
  canvasesState.ctx.clip();
  inner(x, y0, w, h);
  const sh = canvasesState.ctx.createLinearGradient(x, y0, x + w, y0);
  sh.addColorStop(0, "rgba(255,255,255,.16)");
  sh.addColorStop(0.5, "rgba(255,255,255,0)");
  sh.addColorStop(1, "rgba(0,0,0,.2)");
  canvasesState.ctx.fillStyle = sh;
  canvasesState.ctx.fillRect(x, y0, w, h);
  canvasesState.ctx.restore();
  shieldPath(x + 0.6, y0 + 0.6, w - 1.2, h - 1.2);
  const gr = canvasesState.ctx.createLinearGradient(0, y0, 0, y0 + h);
  gr.addColorStop(0, "#fff1b0");
  gr.addColorStop(0.5, "#c89a2e");
  gr.addColorStop(1, "#f6d878");
  canvasesState.ctx.lineWidth = 1.2;
  canvasesState.ctx.strokeStyle = gr;
  canvasesState.ctx.stroke();
  shieldPath(x, y0, w, h);
  canvasesState.ctx.lineWidth = 0.5;
  canvasesState.ctx.strokeStyle = "rgba(20,12,0,.8)";
  canvasesState.ctx.stroke();
}

export function gemSwatch(x, y, s, col) {
  canvasesState.ctx.save();
  canvasesState.ctx.shadowColor = "rgba(0,0,0,.5)";
  canvasesState.ctx.shadowBlur = 1.5;
  canvasesState.ctx.shadowOffsetY = 0.8;
  canvasesState.ctx.beginPath();
  canvasesState.ctx.arc(x + s / 2, y + s / 2, s / 2 - 0.3, 0, 6.283);
  const q = canvasesState.ctx.createRadialGradient(x + s * 0.36, y + s * 0.3, s * 0.05, x + s / 2, y + s / 2, s * 0.62);
  q.addColorStop(0, lighten(col, 0.6));
  q.addColorStop(0.45, col);
  q.addColorStop(1, lighten(col, -0.0) && "#00000000" === "" ? col : col);
  canvasesState.ctx.fillStyle = q;
  canvasesState.ctx.fill();
  canvasesState.ctx.restore();
  canvasesState.ctx.beginPath();
  canvasesState.ctx.arc(x + s / 2, y + s / 2, s / 2 - 0.3, 0, 6.283);
  const d = canvasesState.ctx.createRadialGradient(x + s / 2, y + s / 2, s * 0.25, x + s / 2, y + s / 2, s * 0.52);
  d.addColorStop(0, "rgba(0,0,0,0)");
  d.addColorStop(1, "rgba(0,0,0,.38)");
  canvasesState.ctx.fillStyle = d;
  canvasesState.ctx.fill();
  canvasesState.ctx.lineWidth = 0.9;
  canvasesState.ctx.strokeStyle = "#c99a3a";
  canvasesState.ctx.stroke();
  canvasesState.ctx.beginPath();
  canvasesState.ctx.ellipse(x + s * 0.38, y + s * 0.3, s * 0.15, s * 0.09, -0.6, 0, 6.283);
  canvasesState.ctx.fillStyle = "rgba(255,255,255,.6)";
  canvasesState.ctx.fill();
}

export function initializeKingdomBanner() {
  thIcons();
  drawBanner();
  bannerTex.needsUpdate = true;

  IC.gear = ICN((g) => {
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      ln(g, 8 + Math.cos(a) * 4.5, 8 + Math.sin(a) * 4.5, 8 + Math.cos(a) * 7, 8 + Math.sin(a) * 7, "#f6e9d2", 2.6);
    }
    circ(g, 8, 8, 5, "#f6e9d2", "#2a303a", 0.8);
    circ(g, 8, 8, 2, "#2a303a", "#2a303a", 0.5);
  });
  IC.upgrade = ICN((g) => {
    poly(
      g,
      [
        [8, 1.5],
        [14, 8],
        [10, 8],
        [10, 14.5],
        [6, 14.5],
        [6, 8],
        [2, 8],
      ],
      "#ffd23c",
      "#7a5a00",
      0.9,
    );
  });
}
