/* Sticky-header shadow + mobile nav toggle (slide-in panel). */
(function () {
  "use strict";
  IF.ready(function () {
    var header = IF.$(".site-header");
    var toggle = IF.$(".nav-toggle");
    var nav = IF.$(".nav");
    var navClose = IF.$(".nav-close");
    var backdrop = IF.$(".nav-backdrop");
    if (!header) return;

    // Sticky shadow after scrolling past a threshold.
    var threshold = 40;
    function onScroll() {
      header.classList.toggle("is-stuck", window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Mobile nav.
    function closeNav() {
      document.body.classList.remove("nav-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
    function openNav() {
      document.body.classList.add("nav-open");
      if (toggle) toggle.setAttribute("aria-expanded", "true");
    }
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        if (document.body.classList.contains("nav-open")) closeNav();
        else openNav();
      });
      IF.$$(".nav__link", nav).forEach(function (link) {
        link.addEventListener("click", closeNav);
      });
      if (navClose) navClose.addEventListener("click", closeNav);
      if (backdrop) backdrop.addEventListener("click", closeNav);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeNav();
      });
    }
  });
})();
