/* small yes/no player options kept in localStorage (key dk_<name>) */
export const pref = (k, d) => {
  try {
    const v = localStorage.getItem("dk_" + k);
    return v === null ? d : v === "1";
  } catch {
    return d;
  }
};
export const setPref = (k, v) => {
  try {
    localStorage.setItem("dk_" + k, v ? "1" : "0");
  } catch {
    /* Storage is optional; keep the preference in memory for this session. */
  }
};

/* reduce motion, cached for the per-frame callers (camera shake, weather particles, fireflies, lightning) */
let _rm = false,
  _rmT = -1e9;
export const rmotion = () => {
  const n = performance.now();
  if (n - _rmT > 400) {
    _rmT = n;
    _rm = pref("rm", false);
  }
  return _rm;
};

/* colour-blind palette (visual only, never read by the simulation): cached like rmotion; cb(normal,alt) picks a colour */
let _cb = false,
  _cbT = -1e9;
export const cbOn = () => {
  const n = performance.now();
  if (n - _cbT > 400) {
    _cbT = n;
    _cb = pref("cb", false);
  }
  return _cb;
};
export const cbSet = (v) => {
  setPref("cb", v);
  _cb = v;
  _cbT = performance.now();
};
export const cb = (a, b) => (cbOn() ? b : a);
