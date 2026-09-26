/**
 * i18n.js
 * Переключение языка интерфейса (UA / EN). По умолчанию — украинский.
 * Тексты экскурсий берутся из data.js (title.ua/en и т.д.), а тексты
 * интерфейса (кнопки, лейблы, заголовки секций) — из словаря ниже.
 */

const I18N = (() => {
  const STORAGE_KEY = "tour-site-lang";
  const DEFAULT_LANG = "ua";

  const dict = {
    ua: {
      "nav.home": "Головна",
      "nav.excursions": "Екскурсії",
      "nav.gallery": "Галерея",
      "nav.contacts": "Контакти",
      "hero.eyebrow": "Подорожі, що запам'ятовуються",
      "hero.title": "Відкривай Україну разом з нами",
      "hero.lead": "Авторські екскурсії малими групами: гори, старовинні міста, море. Місця обмежені — бронюй, поки триває акція.",
      "hero.cta.primary": "Обрати екскурсію",
      "hero.cta.secondary": "Дивитись галерею",
      "section.excursions.title": "Найближчі екскурсії",
      "section.excursions.lead": "Актуальні пропозиції з таймером акції та кількістю вільних місць у реальному часі.",
      "section.gallery.title": "Галерея подорожей",
      "section.gallery.lead": "Атмосфера наших минулих екскурсій — в кадрах наших мандрівників.",
      "card.spots.left": "місць вільно",
      "card.spots.low": "залишились останні місця",
      "card.spots.out": "місць немає",
      "card.timer.title": "До кінця акції:",
      "card.timer.expired": "Акція завершена",
      "card.cta": "Записатися",
      "card.price": "Ціна",
      "card.date": "Дата поїздки",
      "countdown.days": "дні",
      "countdown.hours": "год",
      "countdown.minutes": "хв",
      "countdown.seconds": "сек",
      "closed.soldout.title": "Місця на цю екскурсію закінчились",
      "closed.soldout.text": "Дякуємо за інтерес! Стежте за іншими нашими подорожами — нові місця з'являються регулярно.",
      "closed.expired.title": "Термін акції на цю екскурсію завершено",
      "closed.expired.text": "Ця пропозиція вже неактивна, але попереду ще багато цікавих маршрутів.",
      "closed.badge": "Закрито",
      "closed.cta": "Дивитись інші екскурсії",
      "form.title": "Реєстрація на екскурсію",
      "form.name.label": "Ім'я",
      "form.name.placeholder": "Ваше ім'я",
      "form.name.error": "Ім'я має містити лише літери, мінімум 2 символи",
      "form.phone.label": "Телефон",
      "form.phone.placeholder": "+380 (XX) XXX-XX-XX",
      "form.phone.error": "Телефон має містити лише цифри (9–15 цифр)",
      "form.people.label": "Кількість осіб",
      "form.people.error": "Забагато осіб — перевищено кількість вільних місць",
      "form.comment.label": "Коментар (необов'язково)",
      "form.comment.placeholder": "Побажання, питання...",
      "form.submit": "Відправити заявку",
      "form.submitting": "Відправляємо...",
      "form.success": "Дякуємо! Заявку отримано, ми зв'яжемось з вами найближчим часом.",
      "form.error.generic": "Щось пішло не так. Спробуйте ще раз або напишіть нам напряму.",
      "form.error.soldout": "На жаль, поки ви заповнювали форму, місця закінчились.",
      "form.error.rateLimit": "Забагато спроб. Спробуйте, будь ласка, ще раз через кілька хвилин.",
      "form.error.notEnoughSpots": "Наразі вільно лише {n} місць. Зменшіть, будь ласка, кількість осіб.",
      "form.demo.previewLabel": "Так виглядало б повідомлення в Telegram-боті власника",
      "form.close": "Закрити",
      "footer.rights": "Усі права захищено.",
      "footer.contacts": "Контакти",
      "footer.telegram": "Telegram",
      "footer.social.aria": "Соціальні мережі та контакти",
      "footer.nav.title": "Навігація",
      "theme.toggle": "Перемкнути тему",
      "lang.toggle": "Перемкнути мову"
    },
    en: {
      "nav.home": "Home",
      "nav.excursions": "Excursions",
      "nav.gallery": "Gallery",
      "nav.contacts": "Contacts",
      "hero.eyebrow": "Travel that stays with you",
      "hero.title": "Discover Ukraine with us",
      "hero.lead": "Curated small-group excursions: mountains, old towns, the sea. Spots are limited — book while the offer is live.",
      "hero.cta.primary": "Choose an excursion",
      "hero.cta.secondary": "View gallery",
      "section.excursions.title": "Upcoming excursions",
      "section.excursions.lead": "Live offers with a countdown timer and real-time spots remaining.",
      "section.gallery.title": "Travel gallery",
      "section.gallery.lead": "The mood of our past trips, captured by our travelers.",
      "card.spots.left": "spots left",
      "card.spots.low": "only a few spots left",
      "card.spots.out": "sold out",
      "card.timer.title": "Offer ends in:",
      "card.timer.expired": "Offer has ended",
      "card.cta": "Register",
      "card.price": "Price",
      "card.date": "Trip date",
      "countdown.days": "days",
      "countdown.hours": "hrs",
      "countdown.minutes": "min",
      "countdown.seconds": "sec",
      "closed.soldout.title": "This excursion is sold out",
      "closed.soldout.text": "Thanks for your interest! Check out our other trips — new spots open up regularly.",
      "closed.expired.title": "This offer has expired",
      "closed.expired.text": "This offer is no longer active, but there are plenty more routes ahead.",
      "closed.badge": "Closed",
      "closed.cta": "Browse other excursions",
      "form.title": "Excursion registration",
      "form.name.label": "Name",
      "form.name.placeholder": "Your name",
      "form.name.error": "Name must contain letters only, at least 2 characters",
      "form.phone.label": "Phone",
      "form.phone.placeholder": "+380 (XX) XXX-XX-XX",
      "form.phone.error": "Phone must contain digits only (9–15 digits)",
      "form.people.label": "Number of people",
      "form.people.error": "Too many people — exceeds the number of free spots",
      "form.comment.label": "Comment (optional)",
      "form.comment.placeholder": "Wishes, questions...",
      "form.submit": "Send request",
      "form.submitting": "Sending...",
      "form.success": "Thank you! Your request has been received, we'll contact you soon.",
      "form.error.generic": "Something went wrong. Please try again or message us directly.",
      "form.error.soldout": "Sorry, spots ran out while you were filling the form.",
      "form.error.rateLimit": "Too many attempts. Please try again in a few minutes.",
      "form.error.notEnoughSpots": "Only {n} spots left right now. Please reduce the number of people.",
      "form.demo.previewLabel": "Here's how the message would look in the owner's Telegram bot",
      "form.close": "Close",
      "footer.rights": "All rights reserved.",
      "footer.contacts": "Contacts",
      "footer.telegram": "Telegram",
      "footer.social.aria": "Social media and contacts",
      "footer.nav.title": "Navigation",
      "theme.toggle": "Toggle theme",
      "lang.toggle": "Switch language"
    }
  };

  let currentLang = DEFAULT_LANG;

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    currentLang = saved === "en" || saved === "ua" ? saved : DEFAULT_LANG;
    document.documentElement.setAttribute("lang", currentLang);
    return currentLang;
  }

  function t(key) {
    return (dict[currentLang] && dict[currentLang][key]) || (dict[DEFAULT_LANG][key]) || key;
  }

  function getLang() {
    return currentLang;
  }

  function setLang(lang) {
    if (lang !== "ua" && lang !== "en") return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute("lang", lang);
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  return { init, t, getLang, setLang };
})();
