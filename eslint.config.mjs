import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["**/dist/**", "node_modules/**", "apps/desktop/out/**"],
  },
  js.configs.recommended,
  {
    files: ["packages/game/src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      "no-var": "error",
      "prefer-const": ["error", { destructuring: "all" }],
      // `_` is reserved for intentionally discarded iterator or destructuring values.
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", varsIgnorePattern: "^_$" },
      ],
    },
  },
  {
    files: ["tools/**/*.mjs", "tools/**/*.js", "docs/**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },
  {
    files: ["apps/desktop/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: globals.node,
    },
  },
  {
    files: ["tests/**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },
  {
    files: ["tests/**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: globals.node,
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: globals.browser,
    },
    // These snippets are evaluated inside the running game page, so the game bundle owns their globals.
    rules: { "no-undef": "off" },
  },
  {
    files: ["tools/shots/**/*.js", "tools/preview/j_*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: globals.browser,
    },
    // These snippets are evaluated inside the running game page, so the game bundle owns their globals.
    rules: { "no-undef": "off" },
  },
  {
    files: ["tools/shots/_prelude.js"],
    // The runner evaluates this prelude and each shot snippet in the same page scope.
    rules: { "no-unused-vars": "off" },
  },
  {
    files: ["docs/studio-boards/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: globals.browser,
    },
    // Review-board snippets run inside the game page and refer to its loaded globals.
    rules: { "no-undef": "off" },
  },
  {
    files: ["packages/game/src/**/*.js"],
    languageOptions: {
      globals: {
        __NX_VERSION__: "readonly",
        __NX_NOTES__: "readonly",
      },
    },
  },
];
