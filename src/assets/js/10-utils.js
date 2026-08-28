/* Shared helpers + reduced-motion flag. Exposed on window.IF */
(function () {
  "use strict";
  window.IF = window.IF || {};
  IF.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  IF.ready = function (fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  };
  IF.$ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  IF.$$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
})();
