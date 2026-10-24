/* Blin4ik — personal site: small, dependency-free interactions */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var header = document.getElementById("site-header");
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("nav-toggle");
  var navToggleLabel = document.getElementById("nav-toggle-label");

  function setMenu(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    if (navToggleLabel) navToggleLabel.textContent = open ? "close" : "menu";
  }

  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        navToggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (navToggle.getAttribute("aria-expanded") !== "true") return;
      if (!event.target.closest("#site-header")) setMenu(false);
    });

    var desktop = window.matchMedia("(min-width: 821px)");
    var onDesktop = function (event) {
      if (event.matches) setMenu(false);
    };

    if (typeof desktop.addEventListener === "function") {
      desktop.addEventListener("change", onDesktop);
    } else if (typeof desktop.addListener === "function") {
      desktop.addListener(onDesktop);
    }
  }

  /* ---------- Header edge while scrolling ---------- */
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Active section in navigation ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = navLinks
    .map(function (link) {
      var href = link.getAttribute("href");
      return href && href.charAt(0) === "#" ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var setCurrent = function (id) {
      navLinks.forEach(function (link) {
        if (link.getAttribute("href") === "#" + id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      spy.observe(section);
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        var href = link.getAttribute("href");
        if (href) setCurrent(href.slice(1));
      });
    });
  }

  /* ---------- Ship clock ---------- */
  var clock = document.querySelector("[data-clock]");

  if (clock) {
    var renderClock = function () {
      var now = new Date();
      var pad = function (value) {
        return value < 10 ? "0" + value : String(value);
      };
      clock.textContent =
        pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    };

    renderClock();
    window.setInterval(renderClock, 1000);
  }

  /* ---------- Copy e-mail ---------- */
  var copyButton = document.getElementById("copy-email");
  var copyStatus = document.getElementById("copy-status");
  var copyLabel = copyButton ? copyButton.querySelector(".copy-email__label") : null;
  var copyTimer = null;

  function showCopyStatus(text) {
    if (!copyStatus) return;
    copyStatus.textContent = text;
    copyStatus.classList.add("is-visible");
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(function () {
      copyStatus.classList.remove("is-visible");
      if (copyLabel) copyLabel.textContent = "скопировать адрес";
    }, 2600);
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      var email = copyButton.getAttribute("data-email") || "";
      if (!email) return;

      var copy = navigator.clipboard && window.isSecureContext
        ? navigator.clipboard.writeText(email)
        : Promise.reject(new Error("Clipboard API недоступен"));

      copy
        .then(function () {
          if (copyLabel) copyLabel.textContent = "скопировано";
          showCopyStatus("адрес " + email + " скопирован");
        })
        .catch(function () {
          showCopyStatus("не удалось скопировать — адрес: " + email);
        });
    });
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });
})();

