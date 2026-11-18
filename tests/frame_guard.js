async () => {
  /* a frame that throws must not stop the loop: the next frame still runs, the player gets one message, and the loop works again once the fault is gone */
  rollWorld();
  reset();
  startGame();
  waveT = 1e9;
  msgS = "";
  const O = {},
    log = console.error;
  let calls = 0;
  const render0 = renderer.render;
  console.error = () => {};
  renderer.render = function () {
    calls++;
    throw new Error("test fault");
  };
  for (let i = 0; i < 6; i++) __stepFrame();
  console.error = log;
  O.framesAfterFault = calls;
  const a = calls >= 6,
    b = /game goes on/.test(msgS);
  window.__test.check("loopSurvivesFault", a, true);
  window.__test.check("playerToldOnce", b, true);
  renderer.render = function () {
    calls++;
  };
  const c0 = calls;
  for (let i = 0; i < 3; i++) __stepFrame();
  const c = calls >= c0 + 3;
  window.__test.check("loopWorksAgain", c, true);
  renderer.render = render0;
  O.ok = a && b && c;
  return JSON.stringify(O);
};
