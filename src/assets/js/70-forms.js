/* Real-time inline validation for [data-validate] forms.
   - Required fields + email format
   - Submit disabled until valid
   - Success / error status states
   Structured so a real endpoint (e.g. Netlify Forms) drops in with minimal
   change: the markup already carries name="form-name" + data-netlify hooks. */
(function () {
  "use strict";
  IF.ready(function () {
    var forms = IF.$$("form[data-validate]");
    if (!forms.length) return;
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    forms.forEach(function (form) {
      var fields = IF.$$("[data-required], [type=email]", form);
      var submit = form.querySelector("[type=submit]");
      var status = form.querySelector(".form__status");

      function validateField(input) {
        var field = input.closest(".field") || input.parentNode;
        var errorEl = field.querySelector(".field__error");
        var value = (input.value || "").trim();
        var msg = "";
        if (input.hasAttribute("data-required") && !value) {
          msg = "This field is required.";
        } else if (input.type === "email" && value && !EMAIL.test(value)) {
          msg = "Please enter a valid email address.";
        } else if (input.hasAttribute("data-required") && input.tagName === "SELECT" && !value) {
          msg = "Please choose an option.";
        }
        field.classList.toggle("is-invalid", !!msg);
        if (errorEl) errorEl.textContent = msg;
        return !msg;
      }

      function formValid() {
        return fields.every(function (f) {
          var value = (f.value || "").trim();
          if (f.hasAttribute("data-required") && !value) return false;
          if (f.type === "email" && value && !EMAIL.test(value)) return false;
          return true;
        });
      }

      function refresh() {
        if (submit) submit.disabled = !formValid();
      }

      fields.forEach(function (f) {
        f.addEventListener("input", function () { validateField(f); refresh(); });
        f.addEventListener("blur", function () { validateField(f); });
      });
      refresh();

      form.addEventListener("submit", function (e) {
        var ok = fields.map(validateField).every(Boolean);
        if (!ok) {
          e.preventDefault();
          if (status) { status.textContent = "Please fix the highlighted fields."; status.className = "form__status is-error"; }
          return;
        }
        // No backend wired yet: every form's `action` points at /thank-you/,
        // so send the visitor there ourselves instead of a real POST (which
        // has nothing to receive it locally). Once Netlify Forms is enabled
        // (form gets data-netlify="true"), skip this entirely and let the
        // browser do a real submit — Netlify itself redirects to `action`
        // on success, which is what makes ad-conversion pixels on that page
        // fire reliably. See README.
        if (!form.hasAttribute("data-netlify")) {
          e.preventDefault();
          window.location.assign(form.getAttribute("action") || "/thank-you/");
        }
      });
    });
  });
})();
