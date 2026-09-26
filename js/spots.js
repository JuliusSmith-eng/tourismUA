/**
 * spots.js
 * Статична демо-версія (без бекенду): скільки місць вже "зайнято" по
 * кожній екскурсії зберігається лише в браузері (localStorage), а не на
 * сервері. Це нормально для портфоліо/демо-сайту — просто пам'ятай, що
 * "зайняті місця" бачить тільки той самий браузер/пристрій, і скидання
 * localStorage (або приватне вікно) поверне всі місця у вільний стан.
 *
 * У продакшн-версії (з PHP-бекендом) тут був би fetch до php/spots.php,
 * що читає спільний для всіх відвідувачів файл на сервері.
 */

const SPOTS = (() => {
  const STORAGE_KEY = "tour-site-demo-spots";
  let takenMap = {}; // { excursionId: takenCount }
  let loaded = false;

  function readStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (err) {
      // приватний режим / вимкнений localStorage / зіпсований JSON —
      // просто починаємо з чистого стану, сайт не повинен через це падати
      return {};
    }
  }

  function writeStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(takenMap));
    } catch (err) {
      // немає доступу до localStorage — демо все одно працює в межах сесії
    }
  }

  async function load() {
    takenMap = readStorage();
    loaded = true;
    document.dispatchEvent(new CustomEvent("spotsloaded"));
    return takenMap;
  }

  function getTaken(excursionId) {
    return Number(takenMap[excursionId]) || 0;
  }

  function getRemaining(excursion) {
    const taken = getTaken(excursion.id);
    return Math.max(0, excursion.spotsTotal - taken);
  }

  function isSoldOut(excursion) {
    return getRemaining(excursion) <= 0;
  }

  /** Позначаємо місця зайнятими локально (після "відправки" форми). */
  function markTaken(excursionId, count = 1) {
    takenMap[excursionId] = getTaken(excursionId) + count;
    writeStorage();
    document.dispatchEvent(new CustomEvent("spotschange", { detail: { excursionId } }));
  }

  function isLoaded() {
    return loaded;
  }

  return { load, getTaken, getRemaining, isSoldOut, markTaken, isLoaded };
})();
