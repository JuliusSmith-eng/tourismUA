/**
 * gallery.js
 * Два независимых виджета:
 *  1) Lightbox — полноэкранный просмотр фото галереи (клик по превью).
 *  2) Mini-carousel — компактная автопрокручиваемая карусель, которую
 *     render.js вставляет в "заглушку" закрытой экскурсии (места
 *     закончились / акция истекла), собранную из фото этой же экскурсии.
 */

const GALLERY = (() => {
  let images = [];
  let currentIndex = 0;
  let overlay, imgEl, closeBtn, prevBtn, nextBtn;

  function buildLightboxDom() {
    overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("data-open", "false");
    overlay.innerHTML = `
      <div class="lightbox__frame">
        <button type="button" class="lightbox__close" aria-label="Close">&times;</button>
        <button type="button" class="lightbox__prev" aria-label="Previous">&#8249;</button>
        <img class="lightbox__img" alt="" />
        <button type="button" class="lightbox__next" aria-label="Next">&#8250;</button>
      </div>
    `;
    document.body.appendChild(overlay);
    imgEl = overlay.querySelector(".lightbox__img");
    closeBtn = overlay.querySelector(".lightbox__close");
    prevBtn = overlay.querySelector(".lightbox__prev");
    nextBtn = overlay.querySelector(".lightbox__next");

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    prevBtn.addEventListener("click", () => show(currentIndex - 1));
    nextBtn.addEventListener("click", () => show(currentIndex + 1));
    document.addEventListener("keydown", (e) => {
      if (overlay.getAttribute("data-open") !== "true") return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(currentIndex - 1);
      if (e.key === "ArrowRight") show(currentIndex + 1);
    });
  }

  function show(index) {
    if (!images.length) return;
    currentIndex = (index + images.length) % images.length;
    imgEl.src = images[currentIndex];
  }

  function open(imageList, startIndex = 0) {
    images = imageList;
    if (!overlay) buildLightboxDom();
    show(startIndex);
    overlay.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (!overlay) return;
    overlay.setAttribute("data-open", "false");
    document.body.style.overflow = "";
  }

  /** Инициализирует делегирование кликов по сетке .gallery-grid */
  function initGrid(gridSelector = "[data-gallery-grid]") {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;
    const items = Array.from(grid.querySelectorAll("[data-gallery-index]"));
    const imgs = items.map((item) => item.getAttribute("data-full") || item.querySelector("img")?.src);
    items.forEach((item, idx) => {
      item.addEventListener("click", () => open(imgs, idx));
    });
  }

  /**
   * Создаёт автопрокручиваемую мини-карусель внутри переданного контейнера.
   * Используется на "странице-заглушке" (мест нет / акция истекла).
   */
  function createMiniCarousel(container, imageList, intervalMs = 3500) {
    if (!container || !imageList.length) return;
    container.innerHTML = `
      <div class="mini-carousel">
        <div class="mini-carousel__track"></div>
        <div class="mini-carousel__dots"></div>
      </div>
    `;
    const track = container.querySelector(".mini-carousel__track");
    const dotsWrap = container.querySelector(".mini-carousel__dots");

    imageList.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      track.appendChild(img);

      const dot = document.createElement("span");
      dot.className = "mini-carousel__dot";
      dot.setAttribute("aria-current", i === 0 ? "true" : "false");
      dotsWrap.appendChild(dot);
    });

    let index = 0;
    const dots = Array.from(dotsWrap.children);

    function goTo(i) {
      index = (i + imageList.length) % imageList.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.setAttribute("aria-current", di === index ? "true" : "false"));
    }

    let timerId = setInterval(() => goTo(index + 1), intervalMs);

    // Пауза при наведении/фокусе — удобнее рассматривать фото
    container.addEventListener("mouseenter", () => clearInterval(timerId));
    container.addEventListener("mouseleave", () => {
      timerId = setInterval(() => goTo(index + 1), intervalMs);
    });

    dots.forEach((dot, i) => {
      dot.style.cursor = "pointer";
      dot.addEventListener("click", () => goTo(i));
    });

    return { goTo, stop: () => clearInterval(timerId) };
  }

  return { open, close, initGrid, createMiniCarousel };
})();
