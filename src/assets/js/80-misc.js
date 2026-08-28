/* Back-to-top button + smooth-scroll for on-page anchors with focus handling. */
(function () {
  "use strict";
  IF.ready(function () {
    // Back to top
    var btn = IF.$(".back-to-top");
    if (btn) {
      function toggle() { btn.classList.toggle("is-visible", window.scrollY > 600); }
      toggle();
      window.addEventListener("scroll", toggle, { passive: true });
      btn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: IF.prefersReducedMotion ? "auto" : "smooth" });
      });
    }

    // Smooth-scroll anchors (respect reduced motion, move focus for a11y)
    IF.$$('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (id.length < 2) return;
        var target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: IF.prefersReducedMotion ? "auto" : "smooth", block: "start" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  });
})();
