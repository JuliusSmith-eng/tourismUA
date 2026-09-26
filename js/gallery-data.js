/**
 * gallery-data.js
 * =====================================================================
 * ЄДИНЕ МІСЦЕ, ЯКЕ ПОТРІБНО РЕДАГУВАТИ, ЩОБ ДОДАТИ / ЗМІНИТИ / ПРИБРАТИ
 * КАТЕГОРІЮ ГАЛЕРЕЇ (розділ "Галерея подорожей" на сайті).
 *
 * Кожна категорія — це один об'єкт:
 *   id     — унікальний рядковий ідентифікатор (латиницею, без пробілів).
 *   title  — { ua: "...", en: "..." }   назва категорії (те, що видно на
 *            смужці-перемикачі).
 *   icon   — маленька іконка-бейдж у нижньому лівому куті смужки (видно
 *            завжди, навіть коли смужка стиснута). НАЙПРОСТІШЕ — прапор-
 *            емодзі країни: просто встав символ, наприклад "🇫🇷" чи "🇵🇱"
 *            (гуглиться за запитом "flag emoji [країна]", копіюється як
 *            звичайний текст). Якщо поле не вказати — покажеться дефолтна
 *            крапка-заглушка "📍". Коли-небудь захочеться замінити емодзі
 *            на "справжню" SVG-іконку — заміни у js/render.js рядок
 *            `${cat.icon || "📍"}` на, наприклад, `<img src="${cat.icon}">`
 *            і клади сюди вже шлях до svg/png замість емодзі.
 *   photos — масив шляхів до фотографій. РІВНО ПЕРШЕ фото (photos[0]) —
 *            це обкладинка категорії: саме воно показується великим,
 *            коли смужку розкривають. Решта фото (photos[1..]) показуються
 *            рядком нижче. Зараз по 12 фото на категорію (1 обкладинка +
 *            11 інших, більшість — заглушки) — але це не жорстка вимога,
 *            масив може містити й більше/менше — вёрстка підлаштується
 *            сама.
 *
 * Коли додаєш НОВУ категорію: скопіюй один об'єкт цілком, встав у кінець
 * масиву, познач новий id/назву/іконку, підклади фото в
 * assets/images/gallery/ і пропиши шляхи. Ніде більше в коді нічого міняти
 * не треба — смужки, розкриття і сітка фото під ними рендеряться
 * автоматично з цього масиву (js/render.js, renderGalleryStrips).
 * =====================================================================
 */

const GALLERY_CATEGORIES = [
  {
    id: "london",
    title: { ua: "Лондон", en: "London" },
    icon: "🇬🇧",
    photos: [
      "assets/images/gallery/london-1.webp",
      "assets/images/gallery/london-2.webp",
      "assets/images/gallery/london-3.webp",
      "assets/images/gallery/london-4.webp",
      "assets/images/gallery/london-5.webp",
      "assets/images/gallery/london-6.webp",
      "assets/images/gallery/london-7.webp",
      "assets/images/gallery/london-8.webp",
      "assets/images/gallery/london-9.webp",
      "assets/images/gallery/london-10.webp",
      "assets/images/gallery/london-11.webp",
      "assets/images/gallery/london-12.webp",
    ],
  },
  {
    id: "carpathians-may",
    title: { ua: "Карпати 14.05.2026", en: "Carpathians 05/14/2026" },
    icon: "🇺🇦",
    photos: [
      "assets/images/gallery/carpathians-may-1.webp",
      "assets/images/gallery/carpathians-may-2.webp",
      "assets/images/gallery/carpathians-may-3.webp",
      "assets/images/gallery/carpathians-may-4.webp",
      "assets/images/gallery/carpathians-may-5.webp",
      "assets/images/gallery/carpathians-may-6.webp",
      "assets/images/gallery/carpathians-may-7.webp",
      "assets/images/gallery/carpathians-may-8.webp",
      "assets/images/gallery/carpathians-may-9.webp",
      "assets/images/gallery/carpathians-may-10.webp",
      "assets/images/gallery/carpathians-may-11.webp",
      "assets/images/gallery/carpathians-may-12.webp",
    ],
  },
  {
    id: "france",
    title: { ua: "Франція", en: "France" },
    icon: "🇫🇷",
    photos: [
      "assets/images/gallery/france-1.webp",
      "assets/images/gallery/france-2.webp",
      "assets/images/gallery/france-3.webp",
      "assets/images/gallery/france-4.webp",
      "assets/images/gallery/france-5.webp",
      "assets/images/gallery/france-6.webp",
      "assets/images/gallery/france-7.webp",
      "assets/images/gallery/france-8.webp",
      "assets/images/gallery/france-9.webp",
      "assets/images/gallery/france-10.webp",
      "assets/images/gallery/france-11.webp",
      "assets/images/gallery/france-12.webp",
    ],
  },
  {
    id: "poland",
    title: { ua: "Польща", en: "Poland" },
    icon: "🇵🇱",
    photos: [
      "assets/images/gallery/poland-1.webp",
      "assets/images/gallery/poland-2.webp",
      "assets/images/gallery/poland-3.webp",
      "assets/images/gallery/poland-4.webp",
      "assets/images/gallery/poland-5.webp",
      "assets/images/gallery/poland-6.webp",
      "assets/images/gallery/poland-7.webp",
      "assets/images/gallery/poland-8.webp",
      "assets/images/gallery/poland-9.webp",
      "assets/images/gallery/poland-10.webp",
      "assets/images/gallery/poland-11.webp",
      "assets/images/gallery/poland-12.webp",
    ],
  },
  {
    id: "carpathians-june",
    title: { ua: "Карпати 05.06.2026", en: "Carpathians 06/05/2026" },
    icon: "🇺🇦",
    photos: [
      "assets/images/gallery/carpathians-june-1.webp",
      "assets/images/gallery/carpathians-june-2.webp",
      "assets/images/gallery/carpathians-june-3.webp",
      "assets/images/gallery/carpathians-june-4.webp",
      "assets/images/gallery/carpathians-june-5.webp",
      "assets/images/gallery/carpathians-june-6.webp",
      "assets/images/gallery/carpathians-june-7.webp",
      "assets/images/gallery/carpathians-june-8.webp",
      "assets/images/gallery/carpathians-june-9.webp",
      "assets/images/gallery/carpathians-june-10.webp",
      "assets/images/gallery/carpathians-june-11.webp",
      "assets/images/gallery/carpathians-june-12.webp",
    ],
  },
  {
    id: "turkey",
    title: { ua: "Туреччина", en: "Turkey" },
    icon: "🇹🇷",
    photos: [
      "assets/images/gallery/turkey-1.webp",
      "assets/images/gallery/turkey-2.webp",
      "assets/images/gallery/turkey-3.webp",
      "assets/images/gallery/turkey-4.webp",
      "assets/images/gallery/turkey-5.webp",
      "assets/images/gallery/turkey-6.webp",
      "assets/images/gallery/turkey-7.webp",
      "assets/images/gallery/turkey-8.webp",
      "assets/images/gallery/turkey-9.webp",
      "assets/images/gallery/turkey-10.webp",
      "assets/images/gallery/turkey-11.webp",
      "assets/images/gallery/turkey-12.webp",
    ],
  },
];
