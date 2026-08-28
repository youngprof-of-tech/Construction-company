/* Scroll-triggered fade/slide-in for .reveal elements. */
(function () {
  "use strict";
  IF.ready(function () {
    var els = IF.$$(".reveal");
    if (!els.length) return;

    if (IF.prefersReducedMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    els.forEach(function (el) { io.observe(el); });
  });
})();
