/* the lit ground of the night, shared by the rules of the night (lighting.js) and by the step of a unit (movement.js).
   LITL: [x, y, radius] of every light while the night is deep (empty by day), refreshed twice a second by darkTick; saved (SAVA). */
export const lightingState = {
  LITL: [],
  darkT: 0,
};

export const litAt = (x, y) => {
  for (const l of lightingState.LITL) {
    const dx = x - l[0],
      dy = y - l[1];
    if (dx * dx + dy * dy < l[2] * l[2]) return true;
  }
  return false;
};

/* THE DARK VEIL (the King: "le brouillard pendant la nuit se transforme en voile tenebreux qui empeche les unites d'y aller").
   While the night is deep the unlit ground is a veil the player's units cannot walk into: a unit standing in the light is held at the
   edge of it. It may still cross a dark gap when its order ends in the light (from one lit place of the base to another: the darkness
   hurts it on the way, as before), a unit caught outside walks freely (back to the light), and the bannerman and the captain carry
   their own light, so a troop follows them through the night. The horde comes through the veil as it pleases. */
export const veilBars = (u, ox, oy) =>
  lightingState.LITL.length > 0 &&
  u.type !== "bannerman" &&
  u.type !== "captain" &&
  !litAt(u.x, u.y) &&
  litAt(ox, oy) &&
  !(u.o && litAt(u.o.x, u.o.y));

/* who dims the lights: ai/wave-boss.js gives bossShade (the Knight of Darkness), asked by lightSources */
export let lightShade = () => null;
export const setLightShade = (fn) => {
  lightShade = fn;
};
