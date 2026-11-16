// Installed only by the browser harness. Every check records an observable claim.
(() => {
  const assertions = [];
  window.__test = {
    assertions,
    check(name, actual, expected = true) {
      const passed = JSON.stringify(actual) === JSON.stringify(expected);
      assertions.push({ name, passed, expected, actual });
      return passed;
    },
  };
})();
