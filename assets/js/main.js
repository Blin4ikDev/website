/* Персональный сайт — интерактивность без зависимостей */
(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersLight = window.matchMedia("(prefers-color-scheme: light)");
  var THEME_KEY = "theme";

  /* ---------- Тема ---------- */
  var themeToggle = document.getElementById("theme-toggle");
  var themeLabel = document.getElementById("theme-label");
  var themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    var isDark = theme === "dark";

    if (themeLabel) themeLabel.textContent = isDark ? "dark" : "light";
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", isDark ? "#04070d" : "#e8edf3");
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
    }

    // Перерисовываем звёзды, если анимация отключена
    if (typeof redrawStarfield === "function") redrawStarfield();
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

    // При переходе на десктоп сбрасываем состояние меню
    window.matchMedia("(min-width: 821px)").addEventListener("change", function (event) {
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

  /* ---------- Печатная машинка в hero ---------- */
  var typed = document.querySelector("[data-typed]");

  if (typed && !prefersReducedMotion.matches) {
    var fullText = typed.getAttribute("data-typed") || typed.textContent;
    var index = 0;

    typed.textContent = "";

    var typeNext = function () {
      typed.textContent = fullText.slice(0, index);
      index += 1;

      if (index <= fullText.length) {
        // Небольшая «неровность» скорости, как у настоящего ввода
        window.setTimeout(typeNext, 26 + Math.random() * 46);
      }
    };

    window.setTimeout(typeNext, 480);
  }

  /* ---------- Часы в sysinfo ---------- */
  var clock = document.querySelector("[data-clock]");

  if (clock) {
    var renderClock = function () {
      var now = new Date();
      var pad = function (value) {
        return value < 10 ? "0" + value : String(value);
      };
      clock.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    };

    renderClock();
    window.setInterval(renderClock, 1000);
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

  /* ---------- Год в подвале ---------- */
  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  /* ---------- Звёздное поле ---------- */
  var starCanvas = document.getElementById("starfield");
  var starContext = starCanvas && starCanvas.getContext
    ? starCanvas.getContext("2d")
    : null;
  var starfieldWidth = 0;
  var starfieldHeight = 0;
  var starfieldDpr = 1;
  var starfieldStars = [];
  var starfieldRaf = 0;
  var starfieldRunning = false;

  function resizeStarfield() {
    if (!starCanvas || !starContext) return;

    var rect = starCanvas.getBoundingClientRect();
    starfieldWidth = Math.max(1, Math.round(rect.width));
    starfieldHeight = Math.max(1, Math.round(rect.height));
    starfieldDpr = Math.min(window.devicePixelRatio || 1, 2);

    starCanvas.width = Math.round(starfieldWidth * starfieldDpr);
    starCanvas.height = Math.round(starfieldHeight * starfieldDpr);
    starContext.setTransform(starfieldDpr, 0, 0, starfieldDpr, 0, 0);

    var count = Math.round((starfieldWidth * starfieldHeight) / 11000);
    count = Math.max(60, Math.min(220, count));
    starfieldStars = [];

    for (var i = 0; i < count; i += 1) {
      starfieldStars.push({
        x: Math.random() * starfieldWidth,
        y: Math.random() * starfieldHeight,
        radius: Math.random() < 0.88
          ? Math.random() * 1.05 + 0.35
          : Math.random() * 1.7 + 0.9,
        alpha: Math.random() * 0.55 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.7 + 0.25,
        warm: Math.random() < 0.12
      });
    }
  }

  function drawStarfield(time) {
    if (!starContext) return;

    var light = root.dataset.theme === "light";
    starContext.clearRect(0, 0, starfieldWidth, starfieldHeight);

    for (var i = 0; i < starfieldStars.length; i += 1) {
      var star = starfieldStars[i];
      var twinkle = prefersReducedMotion.matches
        ? 1
        : 0.62 + 0.38 * Math.sin(time * 0.001 * star.speed + star.phase);
      var alpha = star.alpha * twinkle * (light ? 0.55 : 1);
      var rgb = star.warm
        ? "255, 200, 87"
        : light
          ? "7, 70, 86"
          : "190, 232, 255";

      starContext.beginPath();
      starContext.fillStyle = "rgba(" + rgb + ", " + alpha.toFixed(3) + ")";
      starContext.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      starContext.fill();
    }
  }

  function starfieldLoop(time) {
    if (!starfieldRunning) return;
    drawStarfield(time);
    starfieldRaf = window.requestAnimationFrame(starfieldLoop);
  }

  function startStarfield() {
    if (!starContext) return;

    window.cancelAnimationFrame(starfieldRaf);
    starfieldRunning = false;

    if (prefersReducedMotion.matches) {
      drawStarfield(0);
      return;
    }

    starfieldRunning = true;
    starfieldRaf = window.requestAnimationFrame(starfieldLoop);
  }

  function redrawStarfield() {
    // applyTheme() can run before the starfield is initialised.
    if (starfieldStars && starfieldStars.length) drawStarfield(Date.now());
  }

  if (starContext) {
    resizeStarfield();
    startStarfield();

    var starfieldResizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(starfieldResizeTimer);
      starfieldResizeTimer = window.setTimeout(function () {
        resizeStarfield();
        startStarfield();
      }, 150);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        window.cancelAnimationFrame(starfieldRaf);
        starfieldRunning = false;
      } else {
        startStarfield();
      }
    });

    if (typeof prefersReducedMotion.addEventListener === "function") {
      prefersReducedMotion.addEventListener("change", startStarfield);
    }
  }

  /* ---------- Пасхалка: стратагема ---------- */
  var stratToast = document.getElementById("strat-toast");
  var stratSequence = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight"
  ];
  var stratIndex = 0;
  var stratToastTimer = null;

  if (stratToast) {
    document.addEventListener("keydown", function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      var key = event.key;

      if (key === stratSequence[stratIndex]) {
        stratIndex += 1;

        if (stratIndex === stratSequence.length) {
          stratIndex = 0;
          stratToast.textContent = "СТРАТАГЕМА ГОТОВА // ORBITAL SUPPORT REQUESTED";
          stratToast.classList.add("is-visible");
          window.clearTimeout(stratToastTimer);
          stratToastTimer = window.setTimeout(function () {
            stratToast.classList.remove("is-visible");
          }, 3800);
        }
      } else {
        stratIndex = key === stratSequence[0] ? 1 : 0;
      }
    });
  }
})();

