/* Shared visibility and setup state for panels that other systems observe. */
export const convoyPanelState = {
  convoyOpen: false,
};

export const modeState = { open: false };

export const saveMenuState = {
  saveOpen: false,
  svList: null,
  delAsk: null,
  last: undefined,
};

export const settingsState = {
  nameBox: null,
  TOPH: 28,
  fromGame: false,
  setupOpen: false,
  settingsOpen: false,
  rebind: null,
  sliderDrag: null,
};

export const troopPanelState = {
  troopsOpen: false,
};
