import { sessionState } from '../gameplay/session.js';
import { L } from '../i18n/language.js';
import { SEASC, SEAS, WXN, wxKindFor } from '../rendering/weather.js';
import { canvasesState } from './canvases.js';

/* ================= TITLE SCREEN: the season and weather of the last game, drawn over the army scene =================
   Purely visual (UI canvas, never touches the simulation). Season = 4 waves each, weather from the same wave hash as in the game. */
const SEAWASH = ['rgba(120,200,110,.07)', 'rgba(255,214,90,.07)', 'rgba(255,140,60,.10)', 'rgba(170,215,255,.10)'];
const DRIFT = [['#ffc2d6', 3.2], ['#ffe9a0', 2], ['#e0782c', 4.2]];
const NP = 140;

let last;
let parts = null;
let tPrev = 0;
let key = '';

export function lastRun() {
  if (last === undefined) {
    last = null;
    try { last = JSON.parse(localStorage.getItem('dk_last') || 'null') } catch { last = null }
    if (!last || !(last.w >= 0)) last = null;
  }
  return last;
}

export function titleWeatherLabel() {
  const r = lastRun();
  if (!r) return '';
  const s = ((r.w / 4) | 0) % 4, k = wxKindFor(r.w);
  return L(SEAS[s]) + (k ? ' - ' + L(WXN[k]) : '');
}

export function titleSeasonColor() {
  const r = lastRun();
  return SEASC[r ? ((r.w / 4) | 0) % 4 : 0];
}

function seed(UW, UH) {
  parts = [];
  for (let i = 0; i < NP; i++) parts.push({ x: Math.random() * UW, y: Math.random() * UH, v: .5 + Math.random(), ph: Math.random() * 6.28, z: Math.random() });
}

export function drawTitleWeather(UW, UH) {
  const r = lastRun(), w = r ? r.w : 0, s = ((w / 4) | 0) % 4, k = wxKindFor(w), c = canvasesState.ctx;
  const kk = s + ':' + k + ':' + UW + ':' + UH;
  if (!parts || kk !== key) { key = kk; seed(UW, UH) }
  const now = sessionState.clockT, dt = Math.min(.1, Math.max(0, now - tPrev));
  tPrev = now;
  c.save();
  c.fillStyle = SEAWASH[s];
  c.fillRect(0, 0, UW, UH);
  const hr = new Date().getHours(), night = hr >= 21 || hr < 5;
  const tod = night ? 'rgba(8,14,44,.30)' : hr >= 18 ? 'rgba(255,120,50,.10)' : hr < 8 ? 'rgba(255,170,110,.09)' : '';
  if (tod) { c.fillStyle = tod; c.fillRect(0, 0, UW, UH) }
  if (night) for (let i = 0; i < 40; i++) {
    const p = parts[i], tw = .35 + .65 * Math.abs(Math.sin(now * (.6 + p.v) + p.ph));
    c.fillStyle = 'rgba(255,248,220,' + (tw * .8).toFixed(2) + ')';
    c.fillRect(Math.round(p.x * .9 + 6), Math.round(p.y * .45), p.z > .8 ? 2 : 1, p.z > .8 ? 2 : 1);
  }
  if (k === 2) { c.fillStyle = 'rgba(170,175,185,.22)'; c.fillRect(0, 0, UW, UH) }
  const rain = k === 1, snow = k === 3 || (s === 3 && k === 0);
  const n = rain ? NP : snow ? 110 : k === 2 ? 0 : 36;
  for (let i = 0; i < n; i++) {
    const p = parts[i];
    if (rain) {
      p.y += dt * 520 * (.7 + p.v * .5);
      p.x -= dt * 70;
      c.strokeStyle = 'rgba(190,215,255,' + (.25 + p.z * .3).toFixed(2) + ')';
      c.lineWidth = 1;
      c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + 4, p.y - 13); c.stroke();
    } else if (snow) {
      p.y += dt * 38 * (.5 + p.v);
      p.x += Math.sin(now * .8 + p.ph) * dt * 22;
      c.fillStyle = 'rgba(255,255,255,' + (.45 + p.z * .45).toFixed(2) + ')';
      c.fillRect(Math.round(p.x), Math.round(p.y), 1 + p.z * 2 | 0 || 1, 1 + p.z * 2 | 0 || 1);
    } else {
      const d = DRIFT[Math.min(2, s)];
      p.y += dt * 24 * p.v;
      p.x += Math.sin(now * 1.1 + p.ph) * dt * 30 + dt * 10;
      c.fillStyle = d[0];
      c.globalAlpha = .55 + p.z * .35;
      const sz = d[1] * (.6 + p.z * .7);
      c.save(); c.translate(p.x, p.y); c.rotate(now * p.v + p.ph);
      c.fillRect(-sz / 2, -sz / 4, sz, sz / 2);
      c.restore();
      c.globalAlpha = 1;
    }
    if (p.y > UH + 4) { p.y = -6; p.x = Math.random() * UW }
    if (p.x > UW + 6) p.x = -6;
    else if (p.x < -6) p.x = UW + 6;
  }
  c.restore();
}
