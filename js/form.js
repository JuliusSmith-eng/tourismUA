/**
 * form.js
 * Модальна форма реєстрації на екскурсію: відкриття, валідація,
 * "відправка" заявки.
 *
 * Це статична демо-версія без бекенду (портфоліо-версія проєкту): справжньої
 * мережевої відправки немає. Замість реального Telegram-бота показуємо
 * прев'ю повідомлення так, як воно виглядало б у продакшн-версії з PHP
 * (там: php/send-telegram.php відправляв би це саме повідомлення в
 * Telegram-бот власника і атомарно резервував місце на сервері).
 *
 * Після "успішної відправки":
 *  - локально позначаємо місце зайнятим (SPOTS.markTaken — зберігається в
 *    localStorage, див. js/spots.js), щоб лічильник "залишилось місць"
 *    одразу оновився;
 *  - кидаємо подію "registration:success", на яку підписаний render.js —
 *    він перемальовує картку (раптом місця закінчились).
 */

const REGISTRATION_FORM = (() => {
  let overlay, form, statusEl, submitBtn, titleEl;
  let successPanel, successTextEl, telegramBubbleEl;
  let currentExcursion = null;

  /**
   * Форматує телефон "на льоту" під маску +код (код оператора) ххх-хх-хх,
   * поки користувач друкує (12 цифр: 3 — код країни, 2 — код оператора,
   * 3+2+2 — сам номер) — той самий формат, що й у плейсхолдері поля.
   *
   * Якщо номер починається з "0" (звичний локальний запис на кшталт
   * "067 123 45 67"), нуль прибираємо і підставляємо код країни "380" —
   * так не треба вручну дописувати код країни для українського номера.
   */
  function formatPhoneMask(raw) {
    let digits = raw.replace(/\D/g, "");

    if (digits.startsWith("0")) {
      digits = "380" + digits.slice(1);
    }

    digits = digits.slice(0, 12);
    if (digits === "") return "";

    const country = digits.slice(0, 3);
    const operator = digits.slice(3, 5);
    const part1 = digits.slice(5, 8);
    const part2 = digits.slice(8, 10);
    const part3 = digits.slice(10, 12);

    let out = "+" + country;
    if (operator) out += " (" + operator + (operator.length === 2 ? ")" : "");
    if (part1) out += " " + part1;
    if (part2) out += "-" + part2;
    if (part3) out += "-" + part3;
    return out;
  }

  function buildDom() {
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.setAttribute("data-open", "false");
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="reg-form-title">
        <div class="modal__head">
          <h3 id="reg-form-title" data-form-title></h3>
          <button type="button" class="modal__close" data-form-close aria-label="Close">&times;</button>
        </div>

        <div class="form-status" data-form-status></div>

        <form data-form novalidate>
          <div class="form-field" data-field="name">
            <label for="reg-name" data-i18n="form.name.label">Ім'я</label>
            <input id="reg-name" name="name" type="text" autocomplete="name" required minlength="2" maxlength="100" data-i18n-placeholder="form.name.placeholder" />
            <span class="form-field__error" data-i18n="form.name.error"></span>
          </div>

          <div class="form-field" data-field="phone">
            <label for="reg-phone" data-i18n="form.phone.label">Телефон</label>
            <input id="reg-phone" name="phone" type="tel" autocomplete="tel" required maxlength="30" data-i18n-placeholder="form.phone.placeholder" />
            <span class="form-field__error" data-i18n="form.phone.error"></span>
          </div>

          <div class="form-field" data-field="people">
            <label for="reg-people" data-i18n="form.people.label">Кількість осіб</label>
            <input id="reg-people" name="people" type="number" min="1" max="20" value="1" required />
            <span class="form-field__error" data-i18n="form.people.error"></span>
          </div>

          <div class="form-field" data-field="comment">
            <label for="reg-comment" data-i18n="form.comment.label">Коментар</label>
            <textarea id="reg-comment" name="comment" rows="3" maxlength="500" data-i18n-placeholder="form.comment.placeholder"></textarea>
          </div>

          <input type="hidden" name="excursion_id" />
          <input type="hidden" name="excursion_title" />
          <!-- honeypot anti-spam field, must stay empty -->
          <input type="text" name="website" class="visually-hidden" tabindex="-1" autocomplete="off" />

          <button type="submit" class="btn btn--primary btn--block" data-form-submit>
            <span data-form-submit-text data-i18n="form.submit">Відправити заявку</span>
          </button>
        </form>

        <div class="form-success" data-form-success hidden>
          <p class="form-success__text" data-form-success-text></p>
          <div class="telegram-preview">
            <div class="telegram-preview__label" data-i18n="form.demo.previewLabel">
              Так виглядало б повідомлення в Telegram-боті власника
            </div>
            <div class="telegram-preview__bubble" data-telegram-bubble></div>
          </div>
          <button type="button" class="btn btn--ghost btn--block" data-form-success-close data-i18n="form.close">Закрити</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    form = overlay.querySelector("[data-form]");
    statusEl = overlay.querySelector("[data-form-status]");
    submitBtn = overlay.querySelector("[data-form-submit]");
    titleEl = overlay.querySelector("[data-form-title]");
    successPanel = overlay.querySelector("[data-form-success]");
    successTextEl = overlay.querySelector("[data-form-success-text]");
    telegramBubbleEl = overlay.querySelector("[data-telegram-bubble]");

    overlay.querySelector("[data-form-success-close]").addEventListener("click", close);

    overlay.querySelector("[data-form-close]").addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.getAttribute("data-open") === "true") close();
    });

    form.addEventListener("submit", handleSubmit);

    // Живе очищення поля "на льоту" — символи, які все одно не пройдуть
    // валідацію (цифри в імені, літери в телефоні), просто не з'являються
    // при наборі. Це зручність для користувача: у цій статичній демо-версії
    // немає сервера, який міг би перевірити ще раз, — але в продакшн-версії
    // (php/send-telegram.php) саме сервер був би справжнім захистом, бо
    // клієнтську перевірку завжди можна обійти, надіславши запит напряму.
    const nameInput = form.querySelector('[name="name"]');
    nameInput.addEventListener("input", () => {
      const cursor = nameInput.selectionStart;
      const before = nameInput.value;
      // Спочатку прибираємо все, що не літера/пробіл/дефіс/апостроф, потім
      // робимо велику літеру на початку самого імені й після кожного
      // пробілу/дефіса/апострофа (Марія-Ганна, О'Коннор, де Голль).
      const cleaned = before
        .replace(/[^\p{L}\p{M} '’\-]/gu, "")
        .replace(/(^|[\s'’\-])(\p{L})/gu, (_, sep, letter) => sep + letter.toUpperCase());
      if (cleaned !== before) {
        const diff = cleaned.length - before.length;
        nameInput.value = cleaned;
        const pos = Math.max(0, (cursor ?? cleaned.length) + diff);
        nameInput.setSelectionRange(pos, pos);
      }
    });

    const phoneInput = form.querySelector('[name="phone"]');
    phoneInput.addEventListener("input", () => {
      const formatted = formatPhoneMask(phoneInput.value);
      if (formatted !== phoneInput.value) {
        phoneInput.value = formatted;
        // Маска перебудовує весь рядок при кожному натисканні, тож надійно
        // тримати курсор просто в кінці (набір номера зазвичай іде послідовно,
        // а не з правками посередині).
        phoneInput.setSelectionRange(formatted.length, formatted.length);
      }
    });

    applyTranslations();
  }

  function applyTranslations() {
    if (!overlay) return;
    overlay.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key) el.textContent = I18N.t(key);
    });
    overlay.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) el.setAttribute("placeholder", I18N.t(key));
    });
    if (titleEl) titleEl.textContent = I18N.t("form.title");
  }

  function open(excursion) {
    if (!overlay) buildDom();
    applyTranslations();
    currentExcursion = excursion;
    form.reset();
    form.querySelector('[name="excursion_id"]').value = excursion.id;
    form.querySelector('[name="excursion_title"]').value = excursion.title[I18N.getLang()];

    // "max" на поле "Кількість осіб" завжди має бути реальним залишком місць
    // цієї конкретної екскурсії (а не якимось загальним числом на кшталт 20)
    // — інакше можна ввести більше, ніж насправді лишилось, і форма це
    // мовчки пропустить, хоча сервер (правильно) відхилить запит.
    const remaining = Math.max(1, SPOTS.getRemaining(excursion));
    const peopleInput = form.querySelector('[name="people"]');
    peopleInput.max = String(remaining);
    if (Number(peopleInput.value) > remaining) peopleInput.value = String(remaining);

    clearStatus();
    clearFieldErrors();
    form.hidden = false;
    successPanel.hidden = true;
    overlay.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";
    setTimeout(() => form.querySelector("#reg-name")?.focus(), 50);
  }

  function close() {
    if (!overlay) return;
    overlay.setAttribute("data-open", "false");
    document.body.style.overflow = "";
  }

  function clearStatus() {
    statusEl.className = "form-status";
    statusEl.removeAttribute("data-visible");
    statusEl.textContent = "";
  }

  function showStatus(type, text) {
    statusEl.className = `form-status form-status--${type}`;
    statusEl.setAttribute("data-visible", "true");
    statusEl.textContent = text;
  }

  function clearFieldErrors() {
    form.querySelectorAll(".form-field").forEach((f) => f.classList.remove("form-field--error"));
  }

  // Ім'я: тільки літери (будь-якого алфавіту), пробіли, дефіс, апостроф.
  // Той самий патерн, що й на сервері (php/send-telegram.php) — щоб
  // повідомлення про помилку тут і там збігалися за змістом.
  const NAME_PATTERN = /^[\p{L}\p{M} '’\-]+$/u;
  const PHONE_ALLOWED_PATTERN = /^[\d\s()+\-]+$/;

  function validate() {
    clearFieldErrors();
    let valid = true;

    const name = form.querySelector('[name="name"]').value.trim();
    if (name.length < 2 || !NAME_PATTERN.test(name)) {
      form.querySelector('[data-field="name"]').classList.add("form-field--error");
      valid = false;
    }

    const phone = form.querySelector('[name="phone"]').value.trim();
    const phoneDigits = phone.replace(/[^\d]/g, "");
    if (phone === "" || !PHONE_ALLOWED_PATTERN.test(phone) || phoneDigits.length < 9 || phoneDigits.length > 15) {
      form.querySelector('[data-field="phone"]').classList.add("form-field--error");
      valid = false;
    }

    // Кількість осіб не може перевищувати реальний залишок місць — той самий
    // ліміт, що виставлено в max інпута (open()), але тут перевіряємо явно:
    // атрибут max у браузері не заважає ввести/надіслати більше число вручну.
    const people = Number(form.querySelector('[name="people"]').value);
    const maxPeople = currentExcursion ? Math.max(1, SPOTS.getRemaining(currentExcursion)) : 20;
    if (!Number.isInteger(people) || people < 1 || people > maxPeople) {
      form.querySelector('[data-field="people"]').classList.add("form-field--error");
      valid = false;
    }

    return valid;
  }

  /**
   * Будує текст повідомлення так само, як його формував PHP-бекенд
   * (php/send-telegram.php) у продакшн-версії — щоб прев'ю виглядало
   * максимально правдиво, а не як вигадана заглушка.
   */
  function buildTelegramPreviewText(payload, peopleCount, takenNow, maxSpots) {
    const lines = [
      "🧭 Нова заявка на екскурсію",
      "",
      `Екскурсія: ${payload.excursion_title || payload.excursion_id}`,
      `Ім'я: ${payload.name}`,
      `Телефон: ${payload.phone}`,
      `Кількість осіб: ${peopleCount}`,
    ];
    if (payload.comment) {
      lines.push(`Коментар: ${payload.comment}`);
    }
    lines.push(`Мова сайту: ${String(payload.lang || "ua").toUpperCase()}`);
    lines.push(`Місць зайнято тепер: ${takenNow} / ${maxSpots}`);
    return lines.join("\n");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearStatus();

    // Honeypot: якщо заповнено — це бот, тихо "успішно" завершуємо без відправки.
    if (form.querySelector('[name="website"]').value) {
      close();
      return;
    }

    if (!validate()) return;

    // Якщо місця вже закінчились локально — не "відправляємо".
    if (currentExcursion && SPOTS.isSoldOut(currentExcursion)) {
      showStatus("error", I18N.t("form.error.soldout"));
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.lang = I18N.getLang();
    const peopleCount = Number(payload.people) || 1;

    // Це статична демо-версія без сервера: тут нема справжнього HTTP-запиту —
    // просто невелика штучна затримка, щоб стан кнопки "Відправляємо..."
    // виглядав природно, як при реальній мережевій відправці.
    submitBtn.disabled = true;
    const submitText = submitBtn.querySelector("[data-form-submit-text]");
    const originalText = submitText.textContent;
    submitText.textContent = I18N.t("form.submitting");

    await new Promise((resolve) => setTimeout(resolve, 600));

    const maxSpots = currentExcursion ? currentExcursion.spotsTotal : peopleCount;
    const takenBefore = currentExcursion ? SPOTS.getTaken(currentExcursion.id) : 0;
    const takenNow = takenBefore + peopleCount;

    if (currentExcursion) {
      SPOTS.markTaken(currentExcursion.id, peopleCount);
      document.dispatchEvent(new CustomEvent("registration:success", { detail: { excursionId: currentExcursion.id } }));
    }

    successTextEl.textContent = I18N.t("form.success");
    telegramBubbleEl.textContent = buildTelegramPreviewText(payload, peopleCount, takenNow, maxSpots);
    form.hidden = true;
    successPanel.hidden = false;

    submitBtn.disabled = false;
    submitText.textContent = originalText;
  }

  document.addEventListener("langchange", applyTranslations);

  return { open, close };
})();
