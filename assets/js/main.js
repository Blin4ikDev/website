/* Персональный сайт — интерактивность без зависимостей */
(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersLight = window.matchMedia("(prefers-color-scheme: light)");
  var THEME_KEY = "theme";

  /* ---------- Тема ---------- */
  var themeToggle = document.getElementById("theme-toggle");
  var themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    var isDark = theme === "dark";

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", isDark ? "#070b14" : "#f5f7fd");
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
    }
  }

  if (themeToggle) {
    applyTheme(root.dataset.theme === "light" ? "light" : "dark");

    themeToggle.addEventListener("click", function () {
      var next = root.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) { /* приватный режим — просто игнорируем */ }
    });

    // Следуем системной теме, пока пользователь не выбрал свою
    var onSystemThemeChange = function (event) {
      var saved = null;
      try {
        saved = localStorage.getItem(THEME_KEY);
      } catch (e) { /* ignore */ }
      if (!saved) applyTheme(event.matches ? "light" : "dark");
    };

    if (typeof prefersLight.addEventListener === "function") {
      prefersLight.addEventListener("change", onSystemThemeChange);
    }
  }

  /* ---------- Мобильное меню ---------- */
  var header = document.getElementById("site-header");
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("nav-toggle");

  function setMenu(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
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

    // При переходе на десктоп сбрасываем состояние меню
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (event) {
      if (event.matches) setMenu(false);
    });
  }

  /* ---------- Тень шапки при скролле ---------- */
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Подсветка активного пункта меню ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
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
        var id = link.getAttribute("href");
        if (id) setCurrent(id.slice(1));
      });
    });
  }

  /* ---------- Появление блоков ---------- */
  var revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || prefersReducedMotion.matches) {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  /* ---------- Копирование e-mail ---------- */
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
      if (copyLabel) copyLabel.textContent = "Скопировать адрес";
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
          if (copyLabel) copyLabel.textContent = "Скопировано!";
          showCopyStatus("Адрес " + email + " скопирован");
        })
        .catch(function () {
          showCopyStatus("Не удалось скопировать — адрес: " + email);
        });
    });
  }

  /* ---------- Год в подвале ---------- */
  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });
})();

