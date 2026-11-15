import { REALR } from "../core/random.js";
import { $m, lobbyRender, lobbyShow, mpConnected, mpFallback, mpStatus } from "./lobby.js";
import { mpLost, mpMsg } from "./lockstep.js";
import { THEME } from "../ui/kingdom-theme.js";
import { registryShow } from "./registry.js";
import { MP } from "./session.js";

/* ---- connection 1: short room code through the free PeerJS broker ---- */
let PCFG;
const CODEC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const peerConfig = () => PCFG || {};

const rcode = () => Array.from({ length: 5 }, () => CODEC[(REALR() * CODEC.length) | 0]).join("");

export function loadPeer() {
  return window.Peer
    ? Promise.resolve()
    : new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = window.MP_PEER_SRC || "https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js";
        s.onload = res;
        s.onerror = () => rej(new Error("load"));
        document.head.appendChild(s);
        setTimeout(() => rej(new Error("timeout")), 9000);
      });
}

function attach(c) {
  MP.pcon = c;
  c.on("open", () => {
    MP.dc = { readyState: "open", send: (s) => c.send(s) };
    mpConnected();
  });
  c.on("data", (d) => {
    try {
      mpMsg(typeof d === "string" ? JSON.parse(d) : d);
    } catch {
      /* Ignore malformed or stale peer messages; later lockstep messages can still arrive. */
    }
  });
  c.on("close", mpLost);
  c.on("error", mpLost);
}

const normCode = (c) =>
  String(c || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 16);

export async function lobbyHost(custom, tries) {
  tries = tries || 0;
  custom = normCode(custom);
  if (custom && custom.length < 3) {
    mpStatus("Your code needs at least 3 letters or digits.");
    return;
  }
  mpStatus("Creating your room...");
  try {
    await loadPeer();
  } catch {
    mpStatus("Could not reach the matchmaking service. Check your connection and try again.");
    mpFallback(true);
    return;
  }
  MP.host = true;
  MP.code = custom || rcode();
  const peer = new window.Peer("nrx-" + MP.code, PCFG);
  MP.peer = peer;
  peer.on("open", () => {
    lobbyRender();
    lobbyShow();
    mpStatus("Waiting for your partner to join...");
    if ($m("mpPub").checked) registryShow(MP.code, THEME.n);
  });
  peer.on("connection", (c) => {
    if (MP.conn) {
      c.close();
      return;
    }
    attach(c);
  });
  peer.on("error", (e) => {
    if (e.type === "unavailable-id" && custom) {
      peer.destroy();
      MP.code = "";
      $m("mpHostP").style.display = "block";
      $m("mpLobby").style.display = "none";
      mpStatus("The code " + custom + " is already used by another room: choose a different one.");
    } else if (e.type === "unavailable-id" && tries < 4) {
      peer.destroy();
      lobbyHost("", tries + 1);
    } else {
      mpStatus("Matchmaking error (" + e.type + "). Check your connection and try again.");
      mpFallback(true);
    }
  });
}

export async function lobbyJoin(code) {
  code = normCode(code);
  if (code.length < 3) {
    mpStatus("Type the room code first.");
    return;
  }
  mpStatus("Joining room " + code + "...");
  try {
    await loadPeer();
  } catch {
    mpStatus("Could not reach the matchmaking service. Check your connection and try again.");
    mpFallback(true);
    return;
  }
  MP.host = false;
  MP.code = code;
  const peer = new window.Peer(PCFG);
  MP.peer = peer;
  const t = setTimeout(() => {
    if (!MP.conn) mpStatus("Room " + code + " not found. Check the code with the host.");
  }, 9000);
  peer.on("open", () => {
    const c = peer.connect("nrx-" + code, { reliable: true });
    attach(c);
    c.on("open", () => clearTimeout(t));
  });
  peer.on("error", (e) => {
    mpStatus(
      e.type === "peer-unavailable"
        ? "Room " + code + " not found. Check the code with the host."
        : "Connection error (" + e.type + ").",
    );
  });
}

/* ---- connection 2 (fallback): manual WebRTC codes, no server at all ---- */

export function initializeConnection() {
  PCFG = window.MP_PEER_CFG || {};
}
