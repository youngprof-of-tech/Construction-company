/* Testimonial slider: prev/next buttons + touch swipe. */
(function () {
  "use strict";
  IF.ready(function () {
    var root = IF.$(".testimonials");
    if (!root) return;
    var track = IF.$(".testimonials__track", root);
    var slides = IF.$$(".testimonial", root);
    var prev = IF.$(".testimonials__prev", root);
    var next = IF.$(".testimonials__next", root);
    if (!track || slides.length < 2) return;

    var index = 0;
    function go(i) {
      index = Math.max(0, Math.min(i, slides.length - 1));
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      slides.forEach(function (s, n) { s.setAttribute("aria-hidden", n === index ? "false" : "true"); });
    }
    if (next) next.addEventListener("click", function () { go(index + 1 >= slides.length ? 0 : index + 1); });
    if (prev) prev.addEventListener("click", function () { go(index - 1 < 0 ? slides.length - 1 : index - 1); });

    // Touch swipe.
    var startX = 0, delta = 0, dragging = false;
    var vp = IF.$(".testimonials__viewport", root);
    if (vp) {
      vp.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; dragging = true; delta = 0; }, { passive: true });
      vp.addEventListener("touchmove", function (e) { if (dragging) delta = e.touches[0].clientX - startX; }, { passive: true });
      vp.addEventListener("touchend", function () {
        if (!dragging) return;
        dragging = false;
        if (Math.abs(delta) > 50) {
          if (delta < 0) go(index + 1 >= slides.length ? 0 : index + 1);
          else go(index - 1 < 0 ? slides.length - 1 : index - 1);
        }
      });
    }
    go(0);
  });
})();
