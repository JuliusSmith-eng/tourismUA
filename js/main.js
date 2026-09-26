/**
 * main.js
 * Точка входа: инициализирует тему/язык, рендерит контент, вешает
 * обработчики на переключатели в шапке. Запускается по DOMContentLoaded.
 */

(function () {
  function applyStaticTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key) el.textContent = I18N.t(key);
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const [attr, key] = el.getAttribute("data-i18n-attr").split(":");
      if (attr && key) el.setAttribute(attr, I18N.t(key));
    });
    document.title = I18N.t("hero.title") + " — Effective Tourism";
  }

  function updateLangButtons(lang) {
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang-btn") === lang ? "true" : "false");
    });
  }

  function updateMetaThemeColor(theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#071b27" : "#0b314a");
  }

  function initHeaderControls() {
    // Theme toggle
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => THEME.toggle());
    });
    document.addEventListener("themechange", (e) => updateMetaThemeColor(e.detail.theme));

    // Language switch
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang-btn");
        I18N.setLang(lang);
      });
    });

    document.addEventListener("langchange", (e) => {
      applyStaticTranslations();
      updateLangButtons(e.detail.lang);
    });
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        // "Home" в навигации всегда ведёт к самому верху страницы,
        // а не к элементу с id="top" (такого нет — это просто начало).
        if (a.hasAttribute("data-scroll-top")) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          closeMobileNav();
          return;
        }
        const id = a.getAttribute("href").slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          closeMobileNav();
        }
      });
    });
  }

  let mobileNavPanel, mobileNavToggle;

  function closeMobileNav() {
    if (!mobileNavPanel) return;
    mobileNavPanel.setAttribute("data-open", "false");
    mobileNavToggle?.setAttribute("aria-expanded", "false");
  }

  function initMobileNav() {
    mobileNavPanel = document.getElementById("mobile-nav-panel");
    mobileNavToggle = document.querySelector("[data-nav-toggle]");
    if (!mobileNavPanel || !mobileNavToggle) return;

    mobileNavToggle.addEventListener("click", () => {
      const isOpen = mobileNavPanel.getAttribute("data-open") === "true";
      mobileNavPanel.setAttribute("data-open", isOpen ? "false" : "true");
      mobileNavToggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });

    // Закрываем меню, если окно расширили до десктопного вида.
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 860) closeMobileNav();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobileNav();
    });
  }

  /**
   * Hero "відео", синхронізоване зі скролом ("скрол-скраббінг"),
   * реалізоване як послідовність растрових кадрів (assets/videos/frames/),
   * які малюються на <canvas> — а не через video.currentTime.
   *
   * Чому не справжнє відео: перемотка video.currentTime на кожен кадр
   * скролу виявилась нестабільною — навіть з ідеальними ключовими кадрами
   * браузер періодично "зависає" на декодуванні (це і виглядало як
   * ривки/лаги при прокрутці). Малювання вже готового зображення на
   * canvas — операція без декодування відео, тому завжди швидка й плавна.
   *
   * .hero розтягнутий на 300vh (css/layout.css, ~2 екрани запасу), а
   * .hero__pin всередині — position: sticky, тому сам hero НЕ їде разом
   * зі сторінкою, поки не скінчиться запас висоти. Прогрес прокрутки в
   * межах цього запасу напряму вибирає, який кадр намалювати. Коли запас
   * скінчився — .hero__pin відліплюється, і сторінка плавно переходить
   * до #excursions (той самий hero__wave-перехід).
   */
  function initHeroFrameScrub() {
    const hero = document.querySelector("[data-hero]");
    const canvas = document.querySelector("[data-hero-canvas]");
    const poster = document.querySelector("[data-hero-poster]");
    if (!hero || !canvas || !canvas.getContext) return;

    // Людям з prefers-reduced-motion лишаємо статичний перший кадр (poster,
    // звичайний <img>) — послідовність кадрів навіть не завантажуємо.
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const FRAME_COUNT = 192;
    const FRAME_PATH = (i) => `assets/videos/frames/f${String(i).padStart(3, "0")}.jpg`;

    const ctx = canvas.getContext("2d");
    const images = new Array(FRAME_COUNT).fill(null);
    let targetIndex = 0;
    let drawnIndex = -1;
    let ticking = false;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        drawnIndex = -1; // після зміни розміру перемальовуємо навіть той самий кадр
        drawClosestAvailable();
      }
    }

    // Малює кадр на всю площу canvas за принципом object-fit: cover
    // (кадр масштабується, щоб повністю вкрити канву, з обрізкою країв).
    function drawFrame(img) {
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Малює потрібний за прогресом скролу кадр, якщо він вже завантажений;
    // інакше — найближчий раніше завантажений кадр (щоб рух не "зависав"
    // повністю, поки довантажуються решта кадрів).
    function drawClosestAvailable() {
      if (images[targetIndex]) {
        if (drawnIndex !== targetIndex) {
          drawFrame(images[targetIndex]);
          drawnIndex = targetIndex;
        }
        return;
      }
      for (let i = targetIndex - 1; i >= 0; i--) {
        if (images[i]) {
          if (drawnIndex !== i) {
            drawFrame(images[i]);
            drawnIndex = i;
          }
          return;
        }
      }
    }

    function update() {
      const rect = hero.getBoundingClientRect();
      const scrollable = Math.max(rect.height - window.innerHeight, 1);
      const scrolledWithinHero = Math.min(Math.max(-rect.top, 0), scrollable);
      const progress = scrolledWithinHero / scrollable;
      targetIndex = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(progress * (FRAME_COUNT - 1))));
      drawClosestAvailable();
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    // Кадри вантажимо в порядку відтворення, але ПАРАЛЕЛЬНО (пул із кількох
    // "воркерів", а не один запит за раз) — інакше на реальному з'єднанні з
    // помітною затримкою (не localhost) 192 послідовні запити (кожен чекає
    // завершення попереднього) складаються у дуже довге очікування першого
    // показу відео. З пулом воркерів одночасно летить кілька запитів, і
    // браузер/CDN природно мультиплексують їх через HTTP/2.
    // Canvas "переймає" естафету від poster-картинки, щойно перший кадр
    // завантажився — до того просто видно <img data-hero-poster>.
    function preloadFrames() {
      const CONCURRENCY = 8;
      let nextIndex = 0;

      function loadOne(idx) {
        return new Promise((resolve) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => {
            images[idx] = img;
            if (idx === targetIndex || (idx < targetIndex && drawnIndex < idx)) {
              drawClosestAvailable();
            }
            if (idx === 0 && poster) {
              poster.style.visibility = "hidden"; // canvas вже показує той самий перший кадр
            }
            resolve();
          };
          img.onerror = () => resolve();
          img.src = FRAME_PATH(idx + 1);
        });
      }

      async function worker() {
        while (nextIndex < FRAME_COUNT) {
          const idx = nextIndex++;
          await loadOne(idx);
        }
      }

      for (let w = 0; w < CONCURRENCY; w++) {
        worker();
      }
    }

    resizeCanvas();
    preloadFrames();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resizeCanvas, { passive: true });
  }

  function initRevealOnScroll() {
    const targets = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || !targets.length) {
      targets.forEach((t) => t.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach((t) => observer.observe(t));
  }

  function initFooterYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  async function init() {
    const theme = THEME.init();
    const lang = I18N.init();
    updateLangButtons(lang);
    updateMetaThemeColor(theme);
    applyStaticTranslations();
    initHeaderControls();
    initMobileNav();
    initSmoothAnchors();
    initFooterYear();
    initHeroFrameScrub();

    // Загружаем занятость мест, затем рендерим экскурсии и галерею.
    await SPOTS.load();
    RENDER.renderAll();

    initRevealOnScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
