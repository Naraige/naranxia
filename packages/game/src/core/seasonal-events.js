/* ================= SEASONAL EVENTS: the calendar (the King: "prepare seasonal event") =================
   Events of the real year, by the date of the player's machine. This module is the groundwork: which event runs today, shown on the
   title screen. It is visual only and must stay so as it is: the simulation never reads the clock (co-op runs in lockstep). An event
   that changes the rules will have to be chosen by the host when the game starts and travel in the start message and the save, as the
   world seed does.
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
  const t = now || new Date(),
    k = key(t.getMonth() + 1, t.getDate());
  for (const e of SEASONAL) {
    const a = key(e.from[0], e.from[1]),
      b = key(e.to[0], e.to[1]);
    if (a <= b ? k >= a && k <= b : k >= a || k <= b) return e;
  }
  return null;
}
