#!/usr/bin/env node
// Registry of public co-op games for the Naranxia lobby. No dependencies, memory only.
//   node tools/lobby-server.mjs [port]        (PORT env also works; default 8787)
// GET /games -> [{code,name,ver,age}]   POST /games {code,name,ver}   DELETE /games/CODE
// A game disappears 40 s after its last announcement (the game sends one every 15 s).
// Put it behind HTTPS (the game page is https) and set window.MP_LOBBY_URL to its address.
import http from 'node:http';

const PORT = +(process.argv[2] || process.env.PORT || 8787);
const TTL = 40000;
const MAX = 200;
const games = new Map();
const clean = (s, n) => String(s ?? '').replace(/[^\p{L}\p{N} _.'-]/gu, '').slice(0, n);
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS', 'access-control-allow-headers': 'content-type' };

function sweep() {
  const t = Date.now();
  for (const [k, g] of games) if (t - g.t > TTL) games.delete(k);
}

http.createServer((req, res) => {
  const send = (code, body) => {
    res.writeHead(code, { ...CORS, ...(body === undefined ? {} : { 'content-type': 'application/json' }) });
    res.end(body === undefined ? undefined : JSON.stringify(body));
  };
  if (req.method === 'OPTIONS') return send(204);
  const u = new URL(req.url, 'http://x');
  sweep();
  if (req.method === 'GET' && u.pathname === '/games') {
    const t = Date.now();
    return send(200, [...games.values()].sort((a, b) => b.t - a.t).map((g) => ({ code: g.code, name: g.name, ver: g.ver, age: Math.round((t - g.s) / 1000) })));
  }
  if (req.method === 'POST' && u.pathname === '/games') {
    let b = '';
    req.on('data', (d) => { b += d; if (b.length > 2000) req.destroy(); });
    req.on('end', () => {
      try {
        const j = JSON.parse(b);
        const code = clean(j.code, 16).toUpperCase().replace(/ /g, '');
        if (code.length < 3) return send(400, { error: 'code' });
        const old = games.get(code);
        if (!old && games.size >= MAX) return send(503, { error: 'full' });
        games.set(code, { code, name: clean(j.name, 18), ver: clean(j.ver, 12), t: Date.now(), s: old ? old.s : Date.now() });
        send(204);
      } catch (e) { send(400, { error: 'json' }); }
    });
    return;
  }
  if (req.method === 'DELETE' && u.pathname.startsWith('/games/')) {
    games.delete(clean(decodeURIComponent(u.pathname.slice(7)), 16).toUpperCase());
    return send(204);
  }
  send(404, { error: 'not found' });
}).listen(PORT, () => console.log('lobby registry on :' + PORT));
