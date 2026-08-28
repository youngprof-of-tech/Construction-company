/* Hero rotating cards: autoplay, pause-on-hover, prev/next, dots, keyboard. */
(function () {
  "use strict";
  IF.ready(function () {
    var root = IF.$(".hero-cards");
    var controls = IF.$(".hero__controls");
    if (!root) return;

    var cards = IF.$$(".hero-card", root);
    var dots = controls ? IF.$$(".dot", controls) : [];
    var prev = controls ? IF.$(".carousel-btn--prev", controls) : null;
    var next = controls ? IF.$(".carousel-btn--next", controls) : null;
    if (cards.length < 2) return;

    var index = 0;
    var timer = null;
    var DELAY = 5000;

    function show(i) {
      index = (i + cards.length) % cards.length;
      cards.forEach(function (c, n) { c.classList.toggle("is-active", n === index); });
      dots.forEach(function (d, n) {
        d.classList.toggle("is-active", n === index);
        d.setAttribute("aria-selected", n === index ? "true" : "false");
      });
    }
    function nextSlide() { show(index + 1); }
    function prevSlide() { show(index - 1); }

    function start() {
      if (IF.prefersReducedMotion || timer) return;
      timer = setInterval(nextSlide, DELAY);
    }
    function stop() { clearInterval(timer); timer = null; }

    if (next) next.addEventListener("click", function () { nextSlide(); });
    if (prev) prev.addEventListener("click", function () { prevSlide(); });
    dots.forEach(function (d, n) { d.addEventListener("click", function () { show(n); }); });

    [root, controls].forEach(function (el) {
      if (!el) return;
      el.addEventListener("mouseenter", stop);
      el.addEventListener("mouseleave", start);
      el.addEventListener("focusin", stop);
      el.addEventListener("focusout", start);
    });

    show(0);
    start();
  });
})();
