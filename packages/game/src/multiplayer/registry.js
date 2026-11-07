import { GVER } from '../core/version.js';

/* ================= PUBLIC LOBBY: list of open co-op games =================
   PeerJS cannot list rooms, so public games are announced to a small registry service (tools/lobby-server.mjs).
   The registry only stores {code, host name, version, age}; players still connect peer to peer with the room code.
   Set window.MP_LOBBY_URL (index.html or launcher) to enable it; with no URL the lobby says it is not configured. */
const URL_ = () => String(window.MP_LOBBY_URL || '').replace(/\/+$/, '');
const BEAT = 15000;

let beat = 0;
let pub = null;

export const registryOn = () => !!URL_();

async function call(method, path, body) {
  const r = await fetch(URL_() + path, { method, headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error('http ' + r.status);
  return r.status === 204 ? null : r.json();
}

/* open games, newest first: [{code, name, ver, age}] */
export async function registryList() {
  if (!registryOn()) throw new Error('off');
  const l = await call('GET', '/games');
  return (Array.isArray(l) ? l : []).filter((g) => g && /^[A-Z0-9]{3,16}$/.test(g.code)).slice(0, 50);
}

/* host side: announce now and every 15 s until registryHide() */
export function registryShow(code, name) {
  registryHide();
  if (!registryOn()) return;
  pub = { code, name: String(name || '').slice(0, 18), ver: GVER };
  const send = () => { if (pub) call('POST', '/games', pub).catch(() => {}); };
  send();
  beat = setInterval(send, BEAT);
}

export function registryHide() {
  clearInterval(beat);
  beat = 0;
  if (pub && registryOn()) call('DELETE', '/games/' + pub.code).catch(() => {});
  pub = null;
}

export const registryShown = () => !!pub;
