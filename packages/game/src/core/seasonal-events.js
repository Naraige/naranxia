/* ================= SEASONAL EVENTS: the calendar (the King: "prepare seasonal event") =================
   Events of the real year, by the date of the player's machine: which event runs today, shown on the title screen.
   The simulation never reads the clock (co-op runs in lockstep): a game takes its event once, when it starts (sessionState.sev, saved;
   in co-op the host's, sent in the start message), and plays it to its end even if the feast is over by then.
   What an event does in a game: the Winter Feast (v99) snows the world in (rendering/weather.js) and sends gift bearers with the horde
   (ai/wave-boss.js). The three others only show on the title for now.
   An automated browser has no event unless window.__EVENT names one: the tests play the same game all year.
   from / to: [month 1..12, day], both included; an event may run over the new year. */
export const SEASONAL = [
  { id: "winter", name: "Winter Feast", from: [12, 1], to: [1, 6], col: "#bfe6ff" },
  { id: "spring", name: "Spring Fair", from: [3, 20], to: [4, 5], col: "#b8f0a0" },
  { id: "summer", name: "Midsummer Fires", from: [6, 15], to: [6, 30], col: "#ffd98a" },
  { id: "horde", name: "Night of the Horde", from: [10, 24], to: [11, 2], col: "#d9a0ff" },
];

const key = (m, d) => m * 100 + d;

/* the event that runs on that day (today when left out), or null. window.__EVENT (an id, or "" for none) overrides it for previews */
export function seasonalEvent(now) {
  if (typeof window !== "undefined" && window.__EVENT !== undefined)
    return SEASONAL.find((e) => e.id === window.__EVENT) || null;
  if (!now && typeof navigator !== "undefined" && navigator.webdriver) return null;
  const t = now || new Date(),
    k = key(t.getMonth() + 1, t.getDate());
  for (const e of SEASONAL) {
    const a = key(e.from[0], e.from[1]),
      b = key(e.to[0], e.to[1]);
    if (a <= b ? k >= a && k <= b : k >= a || k <= b) return e;
  }
  return null;
}

/* the event a game that starts now takes ("" for none) */
export const eventId = () => (seasonalEvent() || { id: "" }).id;
