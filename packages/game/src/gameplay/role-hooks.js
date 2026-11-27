/* ---- hooks of the roles (v101): the King view and the Dragon role ----
   A module without imports. The game loop, the input, the HUD, the reset and the command dispatcher call these; core/roles.js fills them at
   start-up from the modules that do the work (input/king-view.js, rendering/dragon-rider.js, gameplay/dragon.js). The old modules thus
   never import the new ones (no new import cycle). Every hook has a harmless default. */
export const roleHooks = {
  /* every frame before the camera keys are read: true when a role used them (the camera must not pan) */
  frame: (_dt, _keys) => false,
  /* the wheel: true when a close view took the zoom */
  zoom: (_d) => false,
  /* a mouse button on the world: true when the dragon rider took it */
  mouse: (_e, _down) => false,
  /* is the local player the dragon rider? */
  rider: () => false,
  /* the key that switches the King view and the view from above */
  viewToggle: () => {},
  /* the rider's gauges under the top bar: returns their height */
  bar: (_UW, _y) => 0,
  /* the rider's keys (U window, Esc closes it): true when taken */
  key: (_k) => false,
  /* the rider's window, drawn over the game after the quest log */
  panel: (_UW, _UH) => {},
  /* simulation: the breath burns, once a tick */
  tick: (_dt) => {},
  /* simulation: the 'dg' command */
  dragonSet: (_c) => {},
  /* reset: the King of a castle at the start, the dragon of a game with a rider */
  startKing: (_castle) => {},
  mkDragon: (_castle) => null,
};
