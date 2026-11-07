/* Languages added after the first six. One file per language: { "English text": "translation" } (templates keep their {0} {1}).
   A language is listed here only when its file covers the whole table (check with `node tools/langcheck.mjs`).
   The order here is the order in the language list, after English, French, Spanish, German, Italian and Portuguese. */
import { NL } from './nl.js';
import { PL } from './pl.js';

export const EXTRA = [
  { name: 'Nederlands', flag: 'nl', tr: NL },
  { name: 'Polski', flag: 'pl', tr: PL },
];
