import { GVER } from '../core/version.js';
import { loadPeer, peerConfig } from './connection.js';

/* ================= PUBLIC LOBBY, peer to peer (no server of ours) =================
   PeerJS cannot list rooms, so the players keep the list themselves. Whoever opens the lobby first claims the well-known peer id
   HUB through the free PeerJS broker and becomes the hub: it keeps the list of open games in memory. Everybody else connects to the hub,
   asks for the list ({k:'list'}) and hosts announce their game ({k:'pub'}) every 15 s. When the hub leaves, the next player to open the
   lobby (or the next host heartbeat) claims the id again. The hub only holds code, host name and version; games are still joined
   peer to peer with their room code. */
const HUB = 'nrx-hub-1';
const BEAT = 15000;
const TTL = 40000;
const MAXG = 200;
const CODE = /^[A-Z0-9]{3,16}$/;

let link = null;      // promise of the current hub link: { hub: true } or { hub: false, conn }
let me = null;        // { peer, games: Map, own: Map(conn -> Set(code)) } while this page is the hub
let pub = null;
let beat = 0;
let ackT = 0;

export const registryOn = () => true;

const clean = (s, n) => String(s == null ? '' : s).replace(/[^\p{L}\p{N} _.'-]/gu, '').slice(0, n);

function sweep() {
  const t = Date.now();
  for (const [k, g] of me.games) if (t - g.t > TTL) me.games.delete(k);
}

function hubAdd(code, name, ver, conn) {
  code = clean(code, 16).toUpperCase().replace(/ /g, '');
  if (!CODE.test(code)) return;
  const old = me.games.get(code);
  if (!old && me.games.size >= MAXG) return;
  me.games.set(code, { code, name: clean(name, 18), ver: clean(ver, 12), t: Date.now(), s: old ? old.s : Date.now(), c: conn || null });
}

function hubList() {
  sweep();
  const t = Date.now();
  return [...me.games.values()].sort((a, b) => b.t - a.t).map((g) => ({ code: g.code, name: g.name, ver: g.ver, age: Math.round((t - g.s) / 1000) }));
}

function serve(c) {
  c.on('data', (m) => {
    try {
      if (typeof m === 'string') m = JSON.parse(m);
      if (!m || typeof m !== 'object') return;
      if (m.k === 'list') c.send({ k: 'games', l: hubList() });
      else if (m.k === 'pub') { hubAdd(m.code, m.name, m.ver, c); c.send({ k: 'ack' }) }
      else if (m.k === 'unpub') { const g = me.games.get(String(m.code)); if (g && g.c === c) me.games.delete(g.code) }
    } catch { /* ignore a bad message */ }
  });
  const drop = () => { for (const [k, g] of me.games) if (g.c === c) me.games.delete(k) };
  c.on('close', drop);
  c.on('error', drop);
}

function reset() {
  link = null;
  if (me) { try { me.peer.destroy() } catch { /* already gone */ } me = null }
}

/* become the hub, or connect to the one that exists */
function connect() {
  return new Promise((res, rej) => {
    let done = false;
    const fail = (e) => { if (!done) { done = true; rej(e) } };
    const t = setTimeout(() => fail(new Error('timeout')), 12000);
    const ok = (v) => { if (!done) { done = true; clearTimeout(t); res(v) } };
    loadPeer().then(() => {
      const hubPeer = new window.Peer(HUB, peerConfig());
      hubPeer.on('open', () => {
        me = { peer: hubPeer, games: new Map() };
        hubPeer.on('connection', serve);
        hubPeer.on('error', () => {});
        hubPeer.on('disconnected', reset);
        ok({ hub: true });
      });
      hubPeer.on('error', (e) => {
        try { hubPeer.destroy() } catch { /* already gone */ }
        if (e.type !== 'unavailable-id') return fail(e);
        const p = new window.Peer(peerConfig());
        p.on('open', () => {
          const conn = p.connect(HUB, { reliable: true, serialization: 'json' });
          conn.on('data', (m) => { if (typeof m === 'string') { try { m = JSON.parse(m) } catch { return } } if (m && m.k === 'ack') ackT = Date.now() });
          conn.on('open', () => { ok({ hub: false, conn, peer: p }) });
          conn.on('close', () => { if (link) reset() });
          conn.on('error', () => { if (link) reset() });
          setTimeout(() => { if (!done) { try { p.destroy() } catch { /* gone */ } fail(new Error('hub')) } }, 8000);
        });
        p.on('error', fail);
      });
    }).catch(fail);
  });
}

function ensure() {
  if (!link) {
    link = connect();
    link.catch(() => { link = null });
  }
  return link;
}

/* open games, newest first: [{code, name, ver, age}] */
export async function registryList() {
  let l;
  try { l = await ensure() } catch { reset(); l = await ensure() }
  if (l.hub) return hubList();
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('timeout')), 6000);
    const on = (m) => {
      if (typeof m === 'string') { try { m = JSON.parse(m) } catch { return } }
      if (m && m.k === 'games') { clearTimeout(t); l.conn.off && l.conn.off('data', on); res((Array.isArray(m.l) ? m.l : []).filter((g) => g && CODE.test(String(g.code))).slice(0, 50).map((g) => ({ code: String(g.code), name: clean(g.name, 18), ver: clean(g.ver, 12), age: g.age | 0 }))) }
    };
    l.conn.on('data', on);
    l.conn.send({ k: 'list' });
  });
}

async function announce(again) {
  if (!pub) return;
  try {
    const l = await ensure();
    if (!pub) return;
    if (l.hub) { hubAdd(pub.code, pub.name, pub.ver, null); return }
    if (!l.conn.open) { reset(); if (!again) announce(true); return }
    const t = Date.now();
    l.conn.send({ k: 'pub', ...pub });
    /* the hub acknowledges every announcement: silence means it is gone, so claim or find the hub again */
    setTimeout(() => { if (pub && link && ackT < t && !again) { reset(); announce(true) } }, 6000);
  } catch { /* retried at the next beat */ }
}

/* host side: announce now and every 15 s until registryHide() */
export function registryShow(code, name) {
  registryHide();
  pub = { code, name: clean(name, 18), ver: GVER };
  announce();
  beat = setInterval(announce, BEAT);
}

export function registryHide() {
  clearInterval(beat);
  beat = 0;
  if (!pub) return;
  const code = pub.code;
  pub = null;
  if (!link) return;
  link.then((l) => { if (l.hub) me && me.games.delete(code); else l.conn.send({ k: 'unpub', code }) }).catch(() => {});
}

export const registryShown = () => !!pub;
