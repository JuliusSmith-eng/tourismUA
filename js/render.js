/**
 * render.js
 * Строит DOM карточек экскурсий и галереи на основе EXCURSIONS (data.js)
 * и текущего состояния SPOTS/COUNTDOWN. Реагирует на смену языка,
 * успешную регистрацию и обновление данных о местах — перерисовывает
 * только то, что нужно.
 */

const RENDER = (() => {
  const gridSelector = "[data-excursions-grid]";
  const stripsSelector = "[data-gallery-strips]";
  const subgridSelector = "[data-gallery-subgrid]";
  let activeGalleryIndex = 0;

  function formatPrice(excursion) {
    return `${excursion.price.amount} ${excursion.price.currency}`;
  }

  function spotsStatusClass(remaining, total) {
    if (remaining <= 0) return "spots-left--out";
    if (remaining <= Math.max(2, Math.round(total * 0.15))) return "spots-left--low";
    return "";
  }

  function spotsStatusText(remaining) {
    if (remaining <= 0) return I18N.t("card.spots.out");
    if (remaining <= 3) return `${remaining} ${I18N.t("card.spots.low")}`;
    return `${remaining} ${I18N.t("card.spots.left")}`;
  }

  function buildCard(excursion, index) {
    const lang = I18N.getLang();
    const remaining = SPOTS.getRemaining(excursion);
    const expired = COUNTDOWN.isExpired(excursion.dateEnd);
    const isClosed = remaining <= 0 || expired;

    const card = document.createElement("article");
    card.className = "excursion-card" + (isClosed ? " excursion-card--closed" : "");
    card.style.setProperty("--i", index);
    card.setAttribute("data-excursion-id", excursion.id);

    const percentFull = Math.min(100, Math.round(((excursion.spotsTotal - remaining) / excursion.spotsTotal) * 100));

    card.innerHTML = `
      <div class="excursion-card__media" data-media></div>
      <div class="excursion-card__body">
        <div class="flex-row" style="justify-content: space-between;">
          <span class="tag">${excursion.location[lang]}</span>
        </div>
        <h3 class="excursion-card__title">${excursion.title[lang]}</h3>
        <p class="excursion-card__desc">${excursion.description[lang]}</p>

        <div class="excursion-card__meta">
          <span>${I18N.t("card.date")}: ${excursion.tripDate[lang]}</span>
          <span><strong>${formatPrice(excursion)}</strong></span>
        </div>

        <div class="stack" data-live-block>
          <div>
            <div class="flex-row" style="justify-content: space-between; margin-bottom:6px;">
              <span class="spots-left ${spotsStatusClass(remaining, excursion.spotsTotal)}" data-spots-text>
                <span class="spots-left__dot"></span>${spotsStatusText(remaining)}
              </span>
            </div>
            <div class="spots-bar"><div class="spots-bar__fill" style="width:${percentFull}%"></div></div>
          </div>

          <div>
            <div class="flex-row" style="justify-content: space-between; margin-bottom:6px;">
              <span style="font-size:0.82rem; color: var(--text-muted);">${I18N.t("card.timer.title")}</span>
            </div>
            <div class="countdown" data-countdown>
              <div class="countdown__unit"><span class="countdown__value" data-unit="days">00</span><span class="countdown__label">${I18N.t("countdown.days")}</span></div>
              <div class="countdown__unit"><span class="countdown__value" data-unit="hours">00</span><span class="countdown__label">${I18N.t("countdown.hours")}</span></div>
              <div class="countdown__unit"><span class="countdown__value" data-unit="minutes">00</span><span class="countdown__label">${I18N.t("countdown.minutes")}</span></div>
              <div class="countdown__unit"><span class="countdown__value" data-unit="seconds">00</span><span class="countdown__label">${I18N.t("countdown.seconds")}</span></div>
            </div>
          </div>
        </div>

        <div class="excursion-card__footer">
          <button type="button" class="btn btn--primary btn--block" data-register-btn ${isClosed ? "disabled" : ""}>
            ${I18N.t("card.cta")}
          </button>
        </div>
      </div>
    `;

    const mediaEl = card.querySelector("[data-media]");
    if (isClosed) {
      GALLERY.createMiniCarousel(mediaEl, excursion.images);
      const overlay = document.createElement("div");
      overlay.className = "closed-overlay";
      const closedKey = remaining <= 0 ? "closed.soldout" : "closed.expired";
      overlay.innerHTML = `
        <span class="closed-overlay__badge">${I18N.t("closed.badge")}</span>
        <span class="closed-overlay__title">${I18N.t(closedKey + ".title")}</span>
      `;
      mediaEl.style.position = "relative";
      mediaEl.appendChild(overlay);
    } else {
      const img = document.createElement("img");
      img.src = excursion.images[0];
      img.alt = excursion.title[lang];
      img.loading = "lazy";
      mediaEl.appendChild(img);

      COUNTDOWN.register(card.querySelector("[data-countdown]"), excursion.dateEnd, () => {
        rerenderCard(excursion.id);
      });

      card.querySelector("[data-register-btn]").addEventListener("click", () => {
        REGISTRATION_FORM.open(excursion);
      });
    }

    return card;
  }

  function rerenderCard(excursionId) {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;
    const oldCard = grid.querySelector(`[data-excursion-id="${excursionId}"]`);
    if (!oldCard) return;
    const excursion = EXCURSIONS.find((x) => x.id === excursionId);
    if (!excursion) return;
    const index = Array.prototype.indexOf.call(grid.children, oldCard);
    const newCard = buildCard(excursion, index);
    grid.replaceChild(newCard, oldCard);
  }

  function renderExcursions() {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;
    grid.innerHTML = "";
    EXCURSIONS.filter((x) => x.active).forEach((excursion, index) => {
      grid.appendChild(buildCard(excursion, index));
    });
  }

  // Натуральні розміри вже завантажених обкладинок категорій (щоб не
  // перезавантажувати Image() щоразу) — ключ: шлях до фото.
  const coverDimsCache = {};

  // ---------- Ліниве завантаження обкладинок неактивних категорій ----------
  // Секція "Галерея" — нижче першого екрана, і одразу після завантаження
  // сторінки реально потрібна лише обкладинка АКТИВНОЇ категорії (вона й так
  // видима). Обкладинки решти 5 категорій важать разом ~1 МБ+ і раніше
  // підвантажувались одразу всі — тепер відкладаємо їх до моменту, коли
  // секція галереї наближається до вьюпорта (IntersectionObserver),
  // або довантажуємо одразу, якщо на момент рендеру вона вже видима.
  let galleryLazyRevealed = false;
  let galleryLazyObserver = null;
  const pendingCoverLoads = []; // [{ strip, cat }, ...] — чекають на появу секції

  function loadStripCover(strip, cat) {
    if (strip.dataset.coverLoaded === "true") return;
    strip.dataset.coverLoaded = "true";
    strip.style.backgroundImage = `url("${cat.photos[0]}")`;
    getCoverDims(cat.photos[0]).then((dims) => {
      if (dims) fitStripBackground(strip);
    });
  }

  function ensureGalleryLazyObserver() {
    if (galleryLazyObserver || galleryLazyRevealed) return;
    const section = document.getElementById("gallery");
    if (!section || typeof IntersectionObserver === "undefined") {
      // Немає підтримки IntersectionObserver (дуже старий браузер) —
      // просто не відкладаємо, щоб галерея точно не лишилась порожньою.
      galleryLazyRevealed = true;
      return;
    }
    galleryLazyObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        galleryLazyRevealed = true;
        galleryLazyObserver.disconnect();
        galleryLazyObserver = null;
        pendingCoverLoads.splice(0).forEach(({ strip, cat }) => loadStripCover(strip, cat));
      },
      { rootMargin: "400px 0px" } // починаємо трохи заздалегідь, щоб фото встигло підвантажитись до скролу
    );
    galleryLazyObserver.observe(section);
  }

  function getCoverDims(src) {
    if (coverDimsCache[src]) return Promise.resolve(coverDimsCache[src]);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const dims = { w: img.naturalWidth, h: img.naturalHeight };
        coverDimsCache[src] = dims;
        resolve(dims);
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  /**
   * Рахує й фіксує background-size смужки в px під конкретні пропорції її
   * фото — так, щоб РОЗКРИТА смужка була повністю покрита фото без "дірок",
   * а сам масштаб при цьому НЕ змінювався по ходу анімації (інакше фото на
   * очах "зумиться" — саме так виглядав баг із Лондоном: у нього пропорції
   * фото сильніше відрізнялись від розкритого блока, ніж в інших фото).
   * Працює для будь-яких пропорцій фото, тож нові категорії, які клієнт
   * додасть самостійно (з довільними фото), теж відкриватимуться без зуму.
   */
  function fitStripBackground(strip) {
    const src = strip.dataset.coverSrc;
    const dims = src && coverDimsCache[src];
    const row = strip.parentElement;
    if (!dims || !row) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const rowRect = row.getBoundingClientRect();
    const n = row.children.length;
    const gapPx = 8; // тримаємо синхронно з var(--gap-xs) у css/layout.css

    let activeW, activeH;
    if (isMobile) {
      activeW = rowRect.width;
      activeH = 320; // синхронно з .gallery-strip.is-active висотою на мобільному
    } else {
      // 5 неактивних смужок з flex-grow:1 + 1 активна з flex-grow:7.
      const totalFlex = (n - 1) + 7;
      activeW = ((rowRect.width - gapPx * (n - 1)) * 7) / totalFlex;
      activeH = 420; // синхронно з .gallery-strips height на десктопі
    }
    if (!activeW || !activeH) return;

    const scale = Math.max(activeW / dims.w, activeH / dims.h);
    strip.style.backgroundSize = `${Math.ceil(dims.w * scale)}px ${Math.ceil(dims.h * scale)}px`;
  }

  /**
   * Розмитий фон секції "Галерея" під обкладинку активної категорії.
   *
   * Чому це НЕ навантажує сайт:
   *  - Жодного нового запиту в мережу: це та сама картинка, яка вже
   *    завантажена (обкладинка вже висить як фон смужки) — браузер бере
   *    її з кешу, а не качає ще раз.
   *  - Немає постійної анімації чи перерахунку: css-фільтр (blur) і
   *    opacity рахуються один раз при перемиканні категорії, а не щокадру
   *    (це не scroll/rAF-ефект) — GPU займається цим ~700мс і забуває.
   *  - Тому навіть на слабких телефонах це відчутно "дешевше", ніж,
   *    наприклад, будь-яка з анімацій, які вже є на сторінці.
   *
   * Технічно — кросфейд між двома шарами (a/b): у неактивний шар
   * підставляється нове фото, тоді він плавно проявляється поверх
   * попереднього. Так background-image "анімується" (сам по собі він не
   * transition-able).
   */
  let backdropTopLayer = null; // "a" | "b" | null (ще не ініціалізовано)

  function setGalleryBackdrop(src) {
    const backdrop = document.querySelector("[data-gallery-backdrop]");
    if (!backdrop) return;
    const layerA = backdrop.querySelector('[data-backdrop-layer="a"]');
    const layerB = backdrop.querySelector('[data-backdrop-layer="b"]');
    if (!layerA || !layerB) return;

    const showLayer = backdropTopLayer === "a" ? layerB : layerA;
    const hideLayer = backdropTopLayer === "a" ? layerA : layerB;

    showLayer.style.backgroundImage = `url("${src}")`;
    // Force reflow, щоб браузер встиг застосувати новий background-image
    // ДО того, як ми додамо клас, що анімує opacity — інакше transition
    // може "проковтнутися" і шар просто миттєво з'явиться.
    // eslint-disable-next-line no-unused-expressions
    showLayer.offsetHeight;
    showLayer.classList.add("is-visible");
    hideLayer.classList.remove("is-visible");

    backdropTopLayer = backdropTopLayer === "a" ? "b" : "a";
  }

  function fitAllStripBackgrounds() {
    document.querySelectorAll(".gallery-strip").forEach(fitStripBackground);
  }

  let resizeRaf = null;

  /**
   * Галерея: рядок смужок-категорій (js/gallery-data.js) — клік по смужці
   * розкриває її обкладинку (перше фото категорії) великою, решта смужок
   * стискаються. Під рядком — сітка з інших фото активної категорії;
   * клік по будь-якому фото (і по самій розкритій смужці) відкриває
   * лайтбокс (GALLERY.open) з усіма фото цієї категорії.
   */
  function renderGalleryStrips() {
    const wrap = document.querySelector(stripsSelector);
    if (!wrap || typeof GALLERY_CATEGORIES === "undefined") return;
    const lang = I18N.getLang();

    setGalleryBackdrop(GALLERY_CATEGORIES[activeGalleryIndex].photos[0]);

    // Якщо смужки вже побудовані для цієї мови — просто перемикаємо клас
    // is-active на вже існуючих елементах, а не перестворюємо DOM. Це
    // важливо для плавної анімації: якщо на кожен клік видаляти й заново
    // створювати кнопки, у нового елемента вже виставлений фінальний клас
    // в момент вставки в DOM — браузеру нема від чого анімувати flex-grow,
    // і розкриття відбувається миттєво замість плавно.
    const existing = wrap.querySelectorAll(".gallery-strip");
    if (existing.length === GALLERY_CATEGORIES.length && wrap.dataset.lang === lang) {
      existing.forEach((strip, i) => {
        const isActive = i === activeGalleryIndex;
        strip.classList.toggle("is-active", isActive);
        strip.setAttribute("aria-pressed", isActive ? "true" : "false");
        // Підстраховка: яку б категорію не активували (клік, клавіатура),
        // її обкладинка мусить бути завантажена одразу, навіть якщо секція
        // галереї технічно ще не встигла "спрацювати" через спостерігач.
        if (isActive) loadStripCover(strip, GALLERY_CATEGORIES[i]);
      });
      renderGallerySubgrid();
      return;
    }

    wrap.dataset.lang = lang;
    wrap.innerHTML = "";
    GALLERY_CATEGORIES.forEach((cat, i) => {
      const isActive = i === activeGalleryIndex;
      const strip = document.createElement("button");
      strip.type = "button";
      strip.className = "gallery-strip" + (isActive ? " is-active" : "");
      // Важливо: задаємо background-image напряму інлайн-стилем (а не
      // через CSS custom property), інакше url() у var() резолвиться
      // відносно css-файлу, де оголошено правило, а не відносно сторінки,
      // і шлях до фото ламається.
      strip.dataset.coverSrc = cat.photos[0];
      if (isActive || galleryLazyRevealed) {
        // Активну категорію показуємо одразу (вона й так на екрані),
        // решту — одразу, якщо секція вже потрапляла у вьюпорт раніше
        // (наприклад, це повторний рендер після зміни мови).
        loadStripCover(strip, cat);
      } else {
        pendingCoverLoads.push({ strip, cat });
      }
      strip.setAttribute("aria-pressed", isActive ? "true" : "false");
      strip.innerHTML = `
        <span class="gallery-strip__shadow" aria-hidden="true"></span>
        <span class="gallery-strip__meta">
          <span class="gallery-strip__icon" aria-hidden="true">${cat.icon || "📍"}</span>
          <span class="gallery-strip__label">${cat.title[lang]}</span>
        </span>
      `;
      strip.addEventListener("click", () => {
        if (activeGalleryIndex === i) {
          GALLERY.open(cat.photos, 0);
          return;
        }
        activeGalleryIndex = i;
        renderGalleryStrips();
      });
      wrap.appendChild(strip);
    });

    ensureGalleryLazyObserver();
    renderGallerySubgrid();
  }

  /**
   * Карусель "решти фото" активної категорії: показує по кілька карток
   * (6 на десктопі, менше на вужчих екранах) і крутиться по колу стрілками.
   *
   * Реалізація — класичний трюк із "клонованими" сторінками по краях:
   * трек виглядає як [клон останньої сторінки, сторінка 1, ... сторінка N,
   * клон першої сторінки]. Стрілка "вперед" на останній реальній сторінці
   * анімовано їде на клон першої — а щойно анімація закінчується, трек
   * миттєво (без transition) перестрибує на справжню першу сторінку. Глядач
   * бачить безшовний нескінченний рух по колу, а DOM-ів для цього рахує
   * рівно N+2 сторінки, а не нескінченну стрічку.
   */
  let carouselPageIndex = 1; // з урахуванням клону-заглушки на початку
  let carouselTotalPages = 1;
  let carouselTransitioning = false;

  function itemsPerCarouselPage() {
    if (window.matchMedia("(min-width: 1024px)").matches) return 6;
    if (window.matchMedia("(min-width: 640px)").matches) return 3;
    return 2;
  }

  function buildCarouselPageEl(photos, startIndex, cat) {
    const page = document.createElement("div");
    page.className = "gallery-carousel__page";
    photos.forEach((src, i) => {
      const item = document.createElement("div");
      item.className = "gallery-subgrid__item";
      item.innerHTML = `<img src="${src}" alt="" loading="lazy" />`;
      item.addEventListener("click", () => GALLERY.open(cat.photos, startIndex + i + 1));
      page.appendChild(item);
    });
    return page;
  }

  function renderGallerySubgrid() {
    const track = document.querySelector(subgridSelector);
    const cat = typeof GALLERY_CATEGORIES !== "undefined" ? GALLERY_CATEGORIES[activeGalleryIndex] : null;
    if (!track || !cat) return;

    const rest = cat.photos.slice(1);
    const perPage = itemsPerCarouselPage();
    const pages = [];
    for (let i = 0; i < rest.length; i += perPage) {
      pages.push(rest.slice(i, i + perPage));
    }
    if (pages.length === 0) pages.push([]);
    carouselTotalPages = pages.length;

    track.innerHTML = "";
    track.style.transition = "none";

    // Клон останньої сторінки — перед усіма; клон першої — після всіх.
    track.appendChild(buildCarouselPageEl(pages[pages.length - 1], rest.length - pages[pages.length - 1].length, cat));
    pages.forEach((pagePhotos, pIdx) => {
      const startIndex = pIdx * perPage;
      track.appendChild(buildCarouselPageEl(pagePhotos, startIndex, cat));
    });
    track.appendChild(buildCarouselPageEl(pages[0], 0, cat));

    carouselPageIndex = 1;
    track.style.transform = `translateX(-${carouselPageIndex * 100}%)`;
    // eslint-disable-next-line no-unused-expressions
    track.offsetHeight;
    track.style.transition = "";

    const carousel = document.querySelector("[data-gallery-carousel]");
    if (carousel) carousel.classList.toggle("gallery-carousel--single-page", carouselTotalPages <= 1);
  }

  function goToCarouselPage(delta) {
    const track = document.querySelector(subgridSelector);
    if (!track || carouselTransitioning || carouselTotalPages <= 1) return;
    carouselTransitioning = true;
    carouselPageIndex += delta;
    track.style.transform = `translateX(-${carouselPageIndex * 100}%)`;
  }

  document.addEventListener(
    "transitionend",
    (e) => {
      if (!e.target.matches(subgridSelector) || e.propertyName !== "transform") return;
      const track = e.target;
      carouselTransitioning = false;
      // Доїхали до клону в кінці (після останньої реальної сторінки) —
      // безшовно перестрибуємо на справжню першу.
      if (carouselPageIndex >= carouselTotalPages + 1) {
        carouselPageIndex = 1;
        track.style.transition = "none";
        track.style.transform = `translateX(-${carouselPageIndex * 100}%)`;
        // eslint-disable-next-line no-unused-expressions
        track.offsetHeight;
        track.style.transition = "";
      }
      // Доїхали до клону на початку — перестрибуємо на справжню останню.
      if (carouselPageIndex <= 0) {
        carouselPageIndex = carouselTotalPages;
        track.style.transition = "none";
        track.style.transform = `translateX(-${carouselPageIndex * 100}%)`;
        // eslint-disable-next-line no-unused-expressions
        track.offsetHeight;
        track.style.transition = "";
      }
    },
    true
  );

  const carouselPrevBtn = document.querySelector("[data-carousel-prev]");
  const carouselNextBtn = document.querySelector("[data-carousel-next]");
  if (carouselPrevBtn) carouselPrevBtn.addEventListener("click", () => goToCarouselPage(-1));
  if (carouselNextBtn) carouselNextBtn.addEventListener("click", () => goToCarouselPage(1));

  window.addEventListener("resize", () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      fitAllStripBackgrounds();
      renderGallerySubgrid();
    });
  });

  function renderAll() {
    renderExcursions();
    renderGalleryStrips();
  }

  document.addEventListener("langchange", renderAll);
  document.addEventListener("spotsloaded", renderAll);
  document.addEventListener("registration:success", (e) => {
    rerenderCard(e.detail.excursionId);
  });

  return { renderAll, renderExcursions, renderGalleryStrips, rerenderCard };
})();
