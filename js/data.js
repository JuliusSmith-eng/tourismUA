/**
 * data.js
 * =====================================================================
 * ЭТОТ ФАЙЛ — ЕДИНСТВЕННОЕ МЕСТО, КОТОРОЕ НУЖНО РЕДАКТИРОВАТЬ,
 * ЧТОБЫ ДОБАВИТЬ / ИЗМЕНИТЬ / УБРАТЬ ЭКСКУРСИЮ.
 *
 * Ничего кроме массива EXCURSIONS ниже трогать не нужно.
 *
 * Поля каждой экскурсии:
 *   id           — уникальный строковый идентификатор (латиницей, без пробелов).
 *                  Используется как ключ для хранения "занятых мест"
 *                  (js/spots.js, localStorage браузера — это статичная
 *                  демо-версия без сервера). Если создаёшь НОВУЮ экскурсию —
 *                  придумай новый уникальный id, для него автоматически
 *                  заведётся запись с 0 занятых мест.
 *
 *   title        — { ua: "...", en: "..." }   заголовок
 *   description  — { ua: "...", en: "..." }   короткое описание (2-3 предложения)
 *   location     — { ua: "...", en: "..." }   место/город/страна
 *
 *   dateEnd      — дата и время окончания АКЦИИ (до которой действует цена/бронь),
 *                  в формате ISO "YYYY-MM-DDTHH:mm:ss" ПО МЕСТНОМУ ВРЕМЕНИ сайта.
 *                  Именно до этой даты/времени тикает таймер на карточке.
 *
 *   tripDate     — { ua: "...", en: "..." }   дата самой поездки для показа гостю
 *                  (просто текст, на логику не влияет)
 *
 *   spotsTotal   — сколько мест всего на эту экскурсию (число).
 *   price        — { amount: 1200, currency: "UAH" }  — цена для показа.
 *   images       — массив путей к фотографиям (минимум 1, желательно 4-8
 *                  для карусели-заглушки, когда места закончатся/акция истечёт).
 *   active       — true/false. Поставь false, чтобы временно СКРЫТЬ экскурсию
 *                  с сайта совсем (не показывать ни карточку, ни заглушку).
 *
 * Когда добавляешь НОВОЕ путешествие: скопируй один объект целиком,
 * вставь в конец массива перед закрывающей "]", поменяй id/тексты/дату/фото.
 * Таймер и счётчик мест появятся автоматически, ничего в коде менять не нужно.
 * =====================================================================
 */

const EXCURSIONS = [
  {
    id: "lviv-old-town-2026",
    title: {
      ua: "Прогулянка старовинним Львовом",
      en: "Old Town Walking Tour of Lviv"
    },
    description: {
      ua: "Атмосферна пішохідна екскурсія бруківкою старого міста: кав'ярні, підземелля, легенди та найкращі краєвиди з оглядових веж.",
      en: "An atmospheric walking tour through the old town's cobbled streets: cafes, underground cellars, legends and the best rooftop views."
    },
    location: { ua: "Львів, Україна", en: "Lviv, Ukraine" },
    dateEnd: "2026-10-05T20:00:00",
    tripDate: { ua: "12 жовтня 2026", en: "October 12, 2026" },
    spotsTotal: 20,
    price: { amount: 950, currency: "UAH" },
    images: ["assets/images/lvivC.jpg"],
    active: true
  },
  {
    id: "carpathians-hike-2026",
    title: {
      ua: "Похід в Карпати: гора Говерла",
      en: "Carpathian Hike: Mount Hoverla"
    },
    description: {
      ua: "Дводенний похід на найвищу вершину України з нічівлею в горах, гарячим чаєм на привалах і незабутнім світанком над хмарами.",
      en: "A two-day hike to Ukraine's highest peak with a night camp in the mountains, hot tea on breaks and an unforgettable sunrise above the clouds."
    },
    location: { ua: "Карпати, Україна", en: "Carpathians, Ukraine" },
    dateEnd: "2026-09-28T18:00:00",
    tripDate: { ua: "3-4 жовтня 2026", en: "October 3-4, 2026" },
    spotsTotal: 15,
    price: { amount: 2400, currency: "UAH" },
    images: ["assets/images/karpaty.webp"],
    active: true
  },
  {
    id: "odesa-sea-2026",
    title: {
      ua: "Одеса: море, гумор і Потьомкінські сходи",
      en: "Odesa: Sea, Humor and the Potemkin Stairs"
    },
    description: {
      ua: "Морська прогулянка, дегустація вина в старовинних катакомбах та вечірня екскурсія найколоритнішими вуличками Одеси.",
      en: "A seaside stroll, wine tasting in historic catacombs and an evening tour through Odesa's most colorful streets."
    },
    location: { ua: "Одеса, Україна", en: "Odesa, Ukraine" },
    dateEnd: "2026-11-15T20:00:00",
    tripDate: { ua: "22 листопада 2026", en: "November 22, 2026" },
    spotsTotal: 25,
    price: { amount: 1350, currency: "UAH" },
    images: ["assets/images/odessa.webp"],
    active: true
  }
];

// Не редактировать ниже этой строки — техническое.
if (typeof module !== "undefined" && module.exports) {
  module.exports = EXCURSIONS;
}
