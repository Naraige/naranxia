export const diagnosticsState = {
  DEVU: false,
  devOpen: false,
  BUGQ: null,
};

/* bug report (F8): the last errors and messages of the session; test mode (F10) state.  */
export const ERRLOG = [],
  MSGL = [];

export function initializeDiagnostics() {
  try {
    const lg = (o) => {
      o.t = Math.round(performance.now() / 1000);
      ERRLOG.push(o);
      if (ERRLOG.length > 30) ERRLOG.shift();
    };
    addEventListener("error", (e) =>
      lg({
        m: String(e.message || "").slice(0, 300),
        at:
          String(e.filename || "")
            .split("/")
            .pop()
            .slice(-40) +
          ":" +
          e.lineno +
          ":" +
          e.colno,
        s: String((e.error && e.error.stack) || "").slice(0, 700),
      }),
    );
    addEventListener("unhandledrejection", (e) => {
      const r = e.reason;
      lg({
        m: "promise: " + String((r && r.message) || r).slice(0, 300),
        s: String((r && r.stack) || "").slice(0, 700),
      });
    });
    const ce = console.error;
    console.error = function (...a) {
      try {
        lg({
          m:
            "console: " +
            a
              .map((x) => String((x && x.stack) || x))
              .join(" ")
              .slice(0, 700),
        });
      } catch {
        /* Keep forwarding console errors if diagnostic capture fails. */
      }
      return ce.apply(console, a);
    };
  } catch {
    /* Diagnostics are optional; leave the game running if hooks cannot be installed. */
  }
}
