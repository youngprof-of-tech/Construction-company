/* Count-up animation for [data-count] when scrolled into view. */
(function () {
  "use strict";
  IF.ready(function () {
    var nums = IF.$$("[data-count]");
    if (!nums.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      if (IF.prefersReducedMotion) { el.textContent = target; return; }
      var duration = 1600;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        // easeOutCubic
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      nums.forEach(animate);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  });
})();
