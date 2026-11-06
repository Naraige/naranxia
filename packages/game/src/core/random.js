export let REALR;

export function rngf(s){s=(s>>>0)||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}

export function initializeRandom() {
  REALR = Math.random;
}
